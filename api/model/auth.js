const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const authSchema = new Schema (
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      default: 'user',
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model ('auth', authSchema);
