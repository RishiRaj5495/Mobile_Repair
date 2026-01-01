
const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
// const restaurantSchema = new mongoose.Schema({
//  name: { type: String, required: true },
//   address: { type: String, required: true },
//   mobile: { type: String, required: true },

// fcmToken: { type: String, default: null }
// });
// module.exports = mongoose.model('Restaurant', restaurantSchema);

const restaurantSchema = new mongoose.Schema({
name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  fcmToken: {
    type: String,
    default: null
  }
});

restaurantSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});
module.exports = mongoose.model('Restaurant', restaurantSchema);