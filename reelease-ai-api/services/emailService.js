const nodemailer = require('nodemailer');

class EmailService {
  constructor(userSettings) {
    this.provider = userSettings.emailProvider || 'nodemailer';
    this.config = userSettings.config || {};
    this.fromName = userSettings.fromName || 'User';
    this.fromEmail = userSettings.fromEmail || 'no-reply@yourapp.com';

    if (this.provider === 'nodemailer' && !this.config.smtp_host) {
      throw new Error('nodemailer selected but smtp_host is missing in config');
    }
  }

  async sendEmail(to, subject, html) {
    try {
      switch (this.provider) {
        case 'nodemailer':
          return await this.sendViaNodemailer(to, subject, html);
        case 'sendgrid':
          return await this.sendViaSendGrid(to, subject, html);
        case 'mailgun':
          return await this.sendViaMailgun(to, subject, html);
        default:
          throw new Error(`Unsupported email provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Email send error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async sendViaNodemailer(to, subject, html) {
    const transporterOptions = {
      host: this.config.smtp_host,
      port: this.config.smtp_port || 587,
      secure: this.config.mail_encryption === 'ssl',
      tls: { 
        rejectUnauthorized: true
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      dns: { family: 4 },
      debug: false,
      logger: false
    };

    transporterOptions.auth = {
      user: this.config.smtp_user || undefined,
      pass: this.config.smtp_pass || undefined
    };

    const transporter = nodemailer.createTransport(transporterOptions);

    const info = await transporter.sendMail({
      from: `'${this.fromName}' <${this.fromEmail}>`,
      to,
      subject,
      html
    });

    return { success: true, messageId: info.messageId };
  }

  async sendViaSendGrid(to, subject, html) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.config.sendgrid_api_key);

    const msg = {
      to,
      from: { email: this.fromEmail, name: this.fromName },
      subject,
      html
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0]?.headers?.['x-message-id'] };
  }

  async sendViaMailgun(to, subject, html) {
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    const mailgun = new Mailgun(formData);
    
    const mg = mailgun.client({
      username: 'api',
      key: this.config.mailgun_api_key
    });

    const response = await mg.messages.create(this.config.mailgun_domain, {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: [to],
      subject,
      html
    });

    return { success: true, messageId: response.id };
  }
}

module.exports = EmailService;