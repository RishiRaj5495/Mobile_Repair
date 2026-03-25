
const mongoose = require('mongoose');
const ratingSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  value: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// 🔥 VERY IMPORTANT
ratingSchema.index(
  { restaurant: 1, user: 1 },
  { unique: true }
);

module.exports = mongoose.model('Rating', ratingSchema);