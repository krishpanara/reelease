const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../models').db;

const extractNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  const properties = path.split('.');
  return properties.reduce((prev, curr) => {
    if (prev === undefined || prev === null) return undefined;

    const arrayMatch = curr.match(/([^\[]+)\[(\d+)\]/);
    if (arrayMatch) {
      const prop = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);
      let value = prev[prop];
      if (typeof value === 'string' && value.startsWith('{')) {
         try { value = JSON.parse(value); } catch(e) {}
      }
      return value && value[index] !== undefined ? value[index] : undefined;
    }

    let value = prev[curr];
    if (typeof value === 'string' && value.startsWith('{')) {
      try { value = JSON.parse(value); } catch(e) {}
    }
    return value;
  }, obj);
};

const processPendingAITasks = async () => {
  console.log(`[CRON] Polling pending AI Tasks...`);
  try {
    const AITask = db.AITask;

    const pendingTasks = await AITask.find({ status: 'pending' }).limit(10);
    if (!pendingTasks || pendingTasks.length === 0) return;

    for (const task of pendingTasks) {
      const config = task.provider_config;
      if (!config || !config.poll_job_status) continue;

      const { base_url, poll_job_status, auth_type, api_key } = config;

      const pollUrl = `${base_url.replace(/\/$/, '')}/${poll_job_status.endpoint.replace(/^\//, '').replace('{{taskId}}', task.task_id)}`;

      const headers = {};
      if (auth_type && auth_type.includes('Bearer')) {
        headers['Authorization'] = `Bearer ${api_key}`;
      } else if (auth_type === 'Header Key') {
        headers['x-api-key'] = api_key;
      } else if (api_key) {
        headers['Authorization'] = api_key;
      }

      try {
        const response = await axios.get(pollUrl, { headers });
        const currentState = extractNestedValue(response.data, poll_job_status.state_path);

        if (currentState == poll_job_status.success_state_value) {
          const finalMediaUrl = extractNestedValue(response.data, poll_job_status.result_media_url_path);
          if (finalMediaUrl) {
            console.log(`[CRON] Downloading finished media for task ${task.task_id}`);
            const mediaResponse = await axios({
              method: 'GET',
              url: finalMediaUrl,
              responseType: 'stream'
            });

            const extension = finalMediaUrl.split('.').pop().split('?')[0] || 'jpg';
            const fileName = `ai-generated-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
            const uploadDir = path.join(__dirname, '../uploads/ai');

            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            const writer = fs.createWriteStream(filePath);
            mediaResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            const localUrl = `/uploads/ai/${fileName}`;

            task.status = 'completed';
            task.result_url = localUrl;
            await task.save();
            console.log(`[CRON] Task ${task.task_id} completed and saved locally at ${localUrl}`);
          }
        } else if (currentState == poll_job_status.failed_state_value) {
          task.status = 'failed';
          task.error_message = JSON.stringify(response.data);
          await task.save();
          console.log(`[CRON] Task ${task.task_id} failed.`);
        }
      } catch (err) {
        console.error(`[CRON] Error polling task ${task.task_id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[CRON] Error processing AI tasks:', err.message);
  }
};

// Generations are polled in-process by ai.controller for up to ~20 minutes. If the API
// restarts during that window the task stays 'running' forever, so pick those up here.
const ORPHAN_AFTER_MS = 25 * 60 * 1000;
const GIVE_UP_AFTER_MS = 24 * 60 * 60 * 1000;

const failAndRefund = async (task, message) => {
  task.status = 'failed';
  task.error_message = message;
  await task.save();
  if (task.credits_used) {
    await db.User.findByIdAndUpdate(task.user_id, { $inc: { used_credits: -task.credits_used } }).catch(() => {});
  }
  if (appRef?.get('io')) appRef.get('io').emit(`ai-task-${task.user_id}`, { taskId: task.task_id, status: 'failed', message });
};

const recoverOrphanedAITasks = async () => {
  try {
    const { downloadAndProcessMedia } = require('../utils/watermark-helper');
    const tasks = await db.AITask.find({
      status: 'running',
      updated_at: { $lt: new Date(Date.now() - ORPHAN_AFTER_MS) },
    }).limit(10);

    for (const task of tasks) {
      const config = task.provider_config;
      if (!config?.poll_job_status?.endpoint) continue;
      const { base_url, poll_job_status, auth_type, api_key } = config;
      const pollUrl = `${base_url.replace(/\/$/, '')}/${poll_job_status.endpoint.replace(/^\//, '').replace('{{taskId}}', task.task_id)}`;
      const headers = {};
      if (auth_type && auth_type.includes('Bearer')) headers['Authorization'] = `Bearer ${(api_key || '').trim()}`;
      else if (auth_type === 'Header Key') headers['x-api-key'] = api_key;
      else if (api_key) headers['Authorization'] = api_key;

      try {
        const response = await axios.get(pollUrl, { headers, timeout: 30000 });
        const state = extractNestedValue(response.data, poll_job_status.state_path);
        if (state == poll_job_status.success_state_value) {
          const url = extractNestedValue(response.data, poll_job_status.result_media_url_path);
          if (url && appRef) {
            console.log(`[CRON] Recovering finished AI task ${task.task_id}`);
            await downloadAndProcessMedia(task.task_id, url, task.user_id, { app: appRef });
          }
        } else if (state == poll_job_status.failed_state_value) {
          await failAndRefund(task, response.data?.data?.failMsg || 'Provider reported failure');
        } else if (Date.now() - new Date(task.created_at).getTime() > GIVE_UP_AFTER_MS) {
          await failAndRefund(task, 'Generation did not finish within 24 hours');
        }
      } catch (err) {
        console.error(`[CRON] Error recovering AI task ${task.task_id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[CRON] Error recovering AI tasks:', err.message);
  }
};

let appRef = null;

const initAITaskCron = (app) => {
  appRef = app || null;
  cron.schedule('* * * * *', async () => {
    await processPendingAITasks();
    await recoverOrphanedAITasks();
  }, {
    scheduled: true,
    timezone: 'UTC'
  });
  console.log('[CRON] AI Task polling scheduler initialized.');
};

module.exports = { initAITaskCron, processPendingAITasks };
