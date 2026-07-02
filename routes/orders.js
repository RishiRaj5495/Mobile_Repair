

// module.exports = router;
 if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
    }
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
const  crypto  = require("crypto");
const express = require("express");
const router = express.Router();
const Order = require("../Models/orders.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js"); // path of your cloudinary file
const upload = multer({ storage });
const Restaurant = require("../Models/mobileShops.js");

// const { admin, io } = require("../app"); // import firebase admin + sockets


// router.post("/:id/accept", async (req, res) => {

//   await Order.findByIdAndUpdate(req.params.id, {
//     status: "accepted"
//   });
//   res.sendStatus(200);
// });



const technician_TO_Customer = (booking,io) => {
const customerId = booking.customer._id// Assuming booking has a customerId field
console.log("Notifying customer:", customerId, "about booking:", booking._id);
    if (io && io.emitToCustomer) {
      io.emitToCustomer(customerId, "customer:booking_updated", booking);
      }
}


router.post("/:id/accept", async (req, res) => {
    const io = req.app.locals.io;
  
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true, runValidators: true }
    );
    console.log("Accepting order:", order);
  technician_TO_Customer(
    order,
    io
   
  );
    console.log("AccNow",order);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/reject", async (req, res) => {
  const io = req.app.locals.io;
  console.log("Rejecting order:", req.params.id);
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true, runValidators: true }
    );

 
  console.log("RejNow",order);
technician_TO_Customer(order,io);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// router.post("/:id/reject", async (req, res) => {
  
//   await Order.findByIdAndUpdate(req.params.id, {
//     status: "rejected"
//   });
//   res.sendStatus(200);
// });

// Create a new order
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
router.post("/verify-payment",upload.single("video"), async (req, res) => {
  console.log("Payment verification request received with body:", req.body);
  try {
//     const { customerFirstName, customerLastName,customerPhone, customerEmail, customerAddress, customerCity,  customerState, customerPincode, customerCountry, restaurantId,lat,lng} = req.body;
   
//     const restaurant = await Restaurant.findById(restaurantId);

// let ticketId;
// let exists = true;

// while (exists) {
//   ticketId = "RN-" + Math.floor(100000 + Math.random() * 900000);
//   exists = await Order.exists({ ticketId });
// }
//     let order = await Order.create({
//         ticketId,
//       customerFirstName,
//       customerLastName,
//       customerPhone,
//       customerEmail,
//       customerAddress,
//       customerCity,
//       customerState,
//       customerPincode,
//       customerCountry,
//       restaurant:restaurantId,
//    customerLocation: {
//         lat: lat ? Number(lat) : null,
//         lng: lng ? Number(lng) : null
//       },
//         video: {
//     url: req.file?.path || null,
//     filename: req.file?.filename || null
//   }
//     });

 
// order = await Order.findById(order._id).populate("restaurant").sort({ createdAt: -1 });



/////////////////////////////////////////////////////////////////////////////////////

 const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

let expectedSignature;

try {

  console.log("Before signature generation");

  expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      razorpay_order_id + "|" + razorpay_payment_id
    )
    .digest("hex");

  console.log("Expected Signature:", expectedSignature);
  console.log("Received Signature:", razorpay_signature);

  if (expectedSignature !== razorpay_signature) {

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature"
    });

  }

  console.log("✅ Signature verified");

} catch (err) {

  console.error("SIGNATURE ERROR:", err);

  return res.status(500).json({
    success: false,
    message: "Signature verification failed"
  });

}
console.log("✅ Signature verified");
    // 2️⃣ Get pending order from session
    const pendingOrder = req.session.pendingOrder;

    if (!pendingOrder) {

      return res.status(400).json({
        success: false,
        message: "Pending order not found"
      });

    }
console.log("Creating order...");
console.log("Pending Order:", pendingOrder);
let order;
    // 3️⃣ Create final order
try {

  console.log("Before Order.create()");

     order = await Order.create({

    ...pendingOrder,

    status: "pending_technician",

    paymentStatus: "paid",

    razorpayOrderId: razorpay_order_id,

    razorpayPaymentId: razorpay_payment_id

  });

  // console.log("After Order.create()");
  // console.log("Created order ID:", order._id);

  order = await Order.findById(order._id)
    .populate("restaurant");


  console.log("After populate()");
  console.log("Order created with Razorpay details:", order);

} catch (err) {

  console.error("❌ ORDER ERROR:");
  console.error(err);
  console.error(err.message);
  console.error(err.stack);

  return res.status(500).json({
    success: false,
    error: err.message
  });

}

    // Clear pending order from session
    // delete req.session.pendingOrder;




////////////////////////////////////////////////////////////////////////////////////////////



 const restaurantId = pendingOrder.restaurant;
 console.log("Restaurant ID for notifications:", restaurantId);
    // 🔥 REAL-TIME UPDATE (Socket.io)
    const io = req.app.locals.io;
    if (io && io.emitToRestaurant) {
      console.log("Emitting new_order event to restaurant:", restaurantId, "for order:", order._id);
      io.emitToRestaurant(restaurantId, "new_order", order);
      console.log("✅ Event emitted to restaurant:", restaurantId);
    }



    // 🔥 PUSH NOTIFICATION (FCM)   && !connectedRestaurants.has(restaurantId)
    const rest = await Restaurant.findById(restaurantId);
    console.log("Restaurant details for FCM:", rest);
     const admin = req.app.locals.admin;      
    if (rest?.fcmToken && admin) {   
      const message = {
        token: rest.fcmToken,
        notification: {
          title: "New  Request",
          body: `Order ${order._id}`,
        },
        data: { orderId: String(order._id) },
        webpush: { fcmOptions: { link: `/delivery/${order._id}` } }
      };

      admin.messaging().send(message)
      .then(resp => console.log("FCM sent:", resp))
      .catch((err) => {
        console.error("❌ FCM Error:", err);
      });
    }

  res.json({
  success: true,
  redirectUrl: `/api/orders/${order._id}/track`,
  message: "Issue Forwarded",
  order
});


  } catch (e) {
 
    res.status(500).json({ error: e.message });
  }

   
});



// Update order status (Accept / Decline)
router.post("/:id/status", async (req, res) => {
  console.log("Status update request for order:", req.params.id, "with body:", req.body);
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("restaurant");


    console.log("Found order:", order);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (io.emitToRestaurant) {
      io.emitToRestaurant(order.restaurant._id, "order_status_changed", order);
    }

    res.json({ message: "Status updated", order });

  } catch (e) {
    console.error("Status update error:", e);
    res.status(500).json({ error: e.message });
  }
});



router.get("/:orderId/track", async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate("restaurant");
  if (!order) return res.send("Order not found");

  res.render("listings/orderTracs.ejs", { order });
});


//////////
//hm ye route is liye garha h kyuki mobile shop dashboard pr live orders dikhane h to jb wo apna id dega to uske hisab se orders fetch kr lenge
router.get("/mobileDashboard/:restaurantId", async (req, res) => {

  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ["pending_technician", "accepted"] }
    })
      .populate("restaurant")
      .sort({ createdAt: -1 });

    res.json(orders);
  console.log("Fetched orders for restaurant:", restaurantId, "Orders:", orders);
  } catch (err) {
    
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;


