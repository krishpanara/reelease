const EmailTemplate = require('../models/email-template.model');
const Setting = require('../models/setting.model');
const EmailService = require('./emailService');
const emailEventsConfig = require('../config/email-events.json');

class EmailDispatcher {
  static async dispatch(to, slug, data = {}) {
    try {
      const dbTemplate = await EmailTemplate.findOne({ slug });
      const eventConfig = emailEventsConfig[slug];

      if (!eventConfig) {
        return { success: false, message: 'Unknown event slug' };
      }
      
      if (dbTemplate && !dbTemplate.status) {
        return { success: false, message: 'Template inactive' };
      }

      const settings = await Setting.findOne().lean();
      
      const templateData = {
        app_name: settings?.app_name || 'My Application',
        ...data
      };

      let subject = dbTemplate?.subject || eventConfig.default_subject;
      let content = dbTemplate?.content || eventConfig.default_content;

      if (!subject || !content) {
         return { success: false, message: 'Missing subject or content for template' };
      }

      for (const [key, value] of Object.entries(templateData)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value || '');
        content = content.replace(regex, value || '');
      }

      const emailSettings = {
        emailProvider: 'nodemailer',
        config: {
          smtp_host: settings?.smtp_host,
          smtp_port: settings?.smtp_port,
          smtp_user: settings?.smtp_user,
          smtp_pass: settings?.smtp_pass,
          mail_encryption: settings?.mail_encryption
        },
        fromName: settings?.mail_from_name || templateData.app_name,
        fromEmail: settings?.mail_from_email || 'noreply@example.com'
      };

      const emailService = new EmailService(emailSettings);
      
      console.log(`[EmailDispatcher] Sending '${slug}' to ${to}`);
      const result = await emailService.sendEmail(to, subject, content);
      return result;

    } catch (error) {
      console.error(`[EmailDispatcher] Error dispatching email '${slug}':`, error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = EmailDispatcher;