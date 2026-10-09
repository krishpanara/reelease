// Renames the app and sets the contact details in an already-seeded database. Safe to run repeatedly:
// it only touches the default app name, text that still says "Reelease AI", and placeholder contacts.
require('dotenv').config();
const mongoose = require('mongoose');

const NAME = process.env.APP_NAME || 'Social Ominfinitive';
const OLD_NAME = /(ReelEase|Reelease) AI/g;
const EMAIL = 'info@omfinitive.com';
const PHONE = '+91 99794 57999';
const LOCATIONS = 'Africa • Qatar • USA';
const OLD_CONTACTS = ['+1 (234) 567-890', 'support@example.ai', 'hello@example.ai', '123 AI Street, Tech City, TC 12345'];

const replaceStrings = (value) => {
  if (typeof value === 'string') return value.replace(OLD_NAME, NAME);
  if (Array.isArray(value)) return value.map(replaceStrings);
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceStrings(v)]));
  }
  return value;
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const settings = await db.collection('settings').updateMany(
    { $or: [{ app_name: 'My Application' }, { app_name: OLD_NAME }] },
    { $set: { app_name: NAME } }
  );

  let landing = 0;
  for (const doc of await db.collection('landing_page').find().toArray()) {
    const { _id, ...rest } = doc;
    const updated = replaceStrings(rest);
    if (JSON.stringify(updated) !== JSON.stringify(rest)) {
      await db.collection('landing_page').updateOne({ _id }, { $set: updated });
      landing++;
    }
  }

  // Contact details: replace only the old template placeholders, keep anything set in the admin panel
  const contactSet = { 'footer.email': EMAIL, 'contact.email': EMAIL, 'footer.phone': PHONE, 'contact.phone': PHONE, 'footer.address': LOCATIONS };
  for (const [field, value] of Object.entries(contactSet)) {
    const result = await db.collection('landing_page').updateMany(
      { $or: [{ [field]: null }, { [field]: '' }, { [field]: { $in: OLD_CONTACTS } }, { [field]: /@reelease\.ai$/ }] },
      { $set: { [field]: value } }
    );
    landing += result.modifiedCount;
  }

  console.log(`Rebrand to "${NAME}": ${settings.modifiedCount} settings, ${landing} landing page update(s)`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Rebrand failed:', err);
  process.exit(1);
});
