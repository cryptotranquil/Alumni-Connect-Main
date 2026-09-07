// scripts/reset-test-password.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../src/config/firestore");

const EMAIL = "invitedadmin@example.com";
const NEW_PASSWORD = "Exploits123";

async function run() {
  const snap = await db
    .collection("users")
    .where("email", "==", EMAIL.toLowerCase())
    .limit(1)
    .get();

  if (snap.empty) {
    console.log(`No user found with email ${EMAIL}`);
    process.exit(1);
  }

  const doc = snap.docs[0];
  const hash = await bcrypt.hash(NEW_PASSWORD, 12); // 12 rounds — matches User.js
  await doc.ref.update({ password: hash });

  console.log(`ok: users/${doc.id} (${EMAIL}) — password reset to "${NEW_PASSWORD}"`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});