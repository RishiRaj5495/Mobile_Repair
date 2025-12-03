
const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
customerName: String,
customerPhone: String,
restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
 video: {
      url : String,
      filename : String,
    },
total: Number,
status: { type: String, enum: ['pending','accepted','declined','preparing','picked','delivered','cancelled'], default: 'pending' },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Order', orderSchema);