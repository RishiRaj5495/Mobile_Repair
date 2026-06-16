
const { custom } = require('joi');
const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
// customerName: String,
// customerPhone: String,
customerFirstName: { type: String, required: true },
customerLastName: { type: String, required: true },
customerCity: { type: String, required: true },
customerAddress: { type: String, required: true },
customerPincode: { type: String, required: true },
customerEmail: { type: String, required: true },
customerState: { type: String, required: true },
customerCountry: { type: String, required: true },
customerPhone: { type: String, required: true },
restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
/////////////
  customerLocation: { lat: { type: Number },lng: { type: Number }},

////////////////
 video: {
      url : String,
      filename : String,
    },
total: Number,
status: { type: String, enum:
  [
 'pending_technician',
 'accepted',
 'travelling',
 'arrived',
 'repairing',
 'completed',
 'cancelled'
]
  , default: 'pending_technician' },

ticketId: {
  type: String,
  required: true,
  unique: true
},

paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending"
},

razorpayOrderId: String,

razorpayPaymentId: String,





},{ timestamps: true }) ;


module.exports = mongoose.model('Order', orderSchema);





