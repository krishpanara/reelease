const path = require('path');
const fs = require('fs');
const axios = require('axios');

const downloadAudioIfNeeded = async (audioUrl) => {
  if (!audioUrl) return { source: '', tempPath: null };
  if (audioUrl.startsWith('http')) {
    try {
      const tempMusicName = `temp_music_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp3`;
      const tempMusicPath = path.join(process.cwd(), 'uploads', 'ai', tempMusicName);
      const dir = path.dirname(tempMusicPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const response = await axios({ method: 'get', url: audioUrl, responseType: 'stream' });
      const contentType = (response.headers['content-type'] || '').toLowerCase();
      if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
        throw new Error('Audio URL returned HTML instead of an audio file.');
      }

      const writer = fs.createWriteStream(tempMusicPath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      return { source: tempMusicPath, tempPath: tempMusicPath };
    } catch (dlErr) {
      throw new Error(`Failed to download audio: ${dlErr.message}`);
    }
  }

  const cleanAudioPath = audioUrl.replace(/^\/api\//, '').replace(/^\//, '');
  const localPath = path.isAbsolute(cleanAudioPath)
    ? cleanAudioPath
    : path.join(process.cwd(), cleanAudioPath);
  return { source: localPath, tempPath: null };
};

const cleanupTempAudio = (tempPath) => {
  if (tempPath && fs.existsSync(tempPath)) {
    try {
      fs.unlinkSync(tempPath);
    } catch (e) {
      console.error('Failed to clean up temp audio:', e.message);
    }
  }
};

module.exports = { downloadAudioIfNeeded, cleanupTempAudio };
