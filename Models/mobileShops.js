const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const restaurantSchema = new mongoose.Schema({
name: {
    type: String,
    required: true, },
  email: {
    type: String,
    required: true, },
  phone: {
    type: Number,
    required: true,},
  address: {
    type: String,
    required: true },
  averageRating: {
    type: Number,
    default: 0 },
 totalRatings: {
    type: Number,
    default: 0},
  fcmToken: {
    type: String,
    default: null
  },

  location: {

    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },

    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0]
    }
  },


ratingBreakdown: {
  type: Map,
  of: Number,
  default: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  }
},
},{ timestamps: true });


restaurantSchema.index({ location: "2dsphere" });
restaurantSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});module.exports = mongoose.model('Restaurant', restaurantSchema);

