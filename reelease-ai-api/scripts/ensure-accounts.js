// Makes the admin and default user logins match .env (ADMIN_* and DEFAULT_USER_*).
// Run on every deploy, so those credentials always work. An existing seeded
// account is renamed rather than replaced, so its data, plan and credits are kept.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Accounts created by the original seed data, adopted if the new email doesn't exist yet
const PREVIOUS_EMAILS = { super_admin: ['admin@reeleaseai.com'], user: ['john@reeleaseai.com'] };

async function ensureAccount(db, { label, roleName, email, name, password }) {
  if (!email || !password) {
    console.log(`  ${label}: email or password not set in .env, skipped`);
    return;
  }
  email = email.toLowerCase().trim();
  const users = db.collection('users');
  const role = await db.collection('roles').findOne({ name: roleName });
  if (!role) throw new Error(`Role "${roleName}" not found. Run the seeder first.`);

  const account =
    (await users.findOne({ email })) ||
    (await users.findOne({ email: { $in: PREVIOUS_EMAILS[roleName] } }));

  const fields = {
    email,
    name: name || label,
    password: await bcrypt.hash(password, 10),
    roleId: role._id,
    isVerified: true,
    isActive: true,
    updated_at: new Date(),
  };

  if (account) {
    await users.updateOne({ _id: account._id }, { $set: fields });
    console.log(`  ${label}: ${account.email === email ? 'updated' : `renamed ${account.email} ->`} ${email}`);
  } else {
    await users.insertOne({ ...fields, created_at: new Date() });
    console.log(`  ${label}: created ${email}`);
  }
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log('Login accounts:');
  await ensureAccount(db, {
    label: 'Admin',
    roleName: 'super_admin',
    email: process.env.ADMIN_EMAIL,
    name: process.env.ADMIN_NAME,
    password: process.env.ADMIN_PASSWORD,
  });
  await ensureAccount(db, {
    label: 'User',
    roleName: 'user',
    email: process.env.DEFAULT_USER_EMAIL,
    name: process.env.DEFAULT_USER_NAME,
    password: process.env.DEFAULT_USER_PASSWORD,
  });
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Account setup failed:', err);
  process.exit(1);
});
