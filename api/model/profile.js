const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema ({
  fullName: {
    type: String,
  },
  mobileNumber: {
    type: String,
  },
  shippingAddress: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  lastlogin: {
    type: String,
  },
  devices: {
    type: String,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'auth',
  },
});

module.exports = mongoose.model ('profile', profileSchema);
