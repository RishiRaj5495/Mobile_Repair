
const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
const restaurantSchema = new mongoose.Schema({
 name: { type: String, required: true },
  address: { type: String, required: true },
  mobile: { type: String, required: true },
// store device token (FCM) for restaurant app/device to receive push notifications
fcmToken: { type: String, default: null }
});
module.exports = mongoose.model('Restaurant', restaurantSchema);