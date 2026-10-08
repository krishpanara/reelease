require('dotenv').config();

const path = require('path');
const fs = require('fs');

const seedLanguage = async (dbConnection, mongoose) => {
  try {
    const Language = dbConnection.db.Language;
    const Setting = dbConnection.db.Setting;

    console.log('Seeding default language...');

    const existing = await Language.findOne({ locale: 'en', deleted_at: null });

    if (!existing) {
      const frontFile = path.join('locales', 'en', 'front.json');
      const appFile   = path.join('locales', 'en', 'app.json');

      const uploadsDir = path.join(process.cwd(), 'uploads', 'languages', 'en');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      await Language.create({
        name: 'English',
        locale: 'en',
        flag: null,
        front_translation_file: frontFile,
        app_translation_file: appFile,
        is_rtl: false,
        is_active: true,
        is_default: true,
        sort_order: 0,
      });

      const setting = await Setting.findOne();
      if (setting && !setting.default_language) {
        setting.default_language = 'en';
        await setting.save();
      }

      console.log('Default English language seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding language:', error);
    throw error;
  }
};

module.exports = { up: seedLanguage };
