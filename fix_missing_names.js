// Run this script ONCE to update all users missing a 'name' field in your MongoDB.
// Usage: node fix_missing_names.js

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sriveerababu:suggusriveerababu@cluster0.nvtgb5j.mongodb.net/Auth';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  resetToken: String,
  resetTokenExpiry: Date
});

const User = mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  const result = await User.updateMany(
    { name: { $exists: false } },
    { $set: { name: 'Unknown' } }
  );
  console.log('Users updated:', result.modifiedCount);
  await mongoose.disconnect();
}

main().catch(console.error);
