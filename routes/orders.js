// const express = require('express');
// const router = express.Router();
// const Order = require('../Models/orders.js');
// const Restaurant = require('../Models/mobileShops.js');
// const admin = require('firebase-admin');
// const sockets = require('../sockets'); // our sockets module patched earlier

// const { admin, io } = require("../app"); 
// // initialize firebase admin
// if (!admin.apps.length) {
// const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH|| './firebase-admin.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// }


// // Create a new order (admin or customer)
// router.post('/', async (req, res) => {
// try {
// const { customerName, customerPhone, restaurantId, items } = req.body;
// const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);


// const order = await Order.create({ customerName, customerPhone, restaurant: restaurantId, items, total });


// // Notify restaurant in real-time via socket
// sockets.io && sockets.io.emitToRestaurant(restaurantId, 'new_order', order);


// // Also send FCM push to restaurant device if token exists
// const rest = await Restaurant.findById(restaurantId);
// if (rest && rest.fcmToken) {
// const message = {
// token: rest.fcmToken,
// notification: { title: 'New Order Received', body: `Order ${order._id} - ${order.total}` },
// data: { orderId: String(order._id) }
// };


// admin.messaging().send(message).catch(err => console.error('FCM send error', err));
// }


// res.json({ message: 'Order created', order });
// } catch (e) {
// console.error(err);
// // res.status(500).json({ error: err.message });
// req.flash("success", e.message);
// }
// });


// // Update order status (restaurant accepts/declines)
// router.post('/:id/status', async (req, res) => {
// try {
// const { status } = req.body;
// const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('restaurant');


// // notify customer (here we'll emit an event - your customer app can listen via socket too)
// if (order) {
// // Notify restaurant room and possibly customer room
// sockets.io && sockets.io.emitToRestaurant(order.restaurant._id, 'order_status_changed', order);


// // For demo: you could also send an FCM to customer if you have their token
// res.json({ message: 'Status updated', order });
// } else {
// res.status(404).json({ error: 'Order not found' });
// }
// } catch (e) {
// // res.status(500).json({ error: err.message });
// req.flash("success", e.message);
// }
// });


// module.exports = router;
 if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
    }

const express = require("express");
const router = express.Router();
const Order = require("../Models/orders.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js"); // path of your cloudinary file
const upload = multer({ storage });
const Restaurant = require("../Models/mobileShops.js");
const { admin, io } = require("../app"); // import firebase admin + sockets

// Create a new order

router.post("/",upload.single("video"), async (req, res) => {
  try {
    const { customerName, customerPhone, restaurantId} = req.body;
    console.log("Creating order for restaurant:", req.body);
  

    // const total = items.reduce(
    //   (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    //   0
    // );
 
 console.log("Received video file:", req.file);
 // cloudinary video URL
    let order = await Order.create({
      customerName,
      customerPhone,
      restaurant: restaurantId,
        video: {
    url: req.file?.path || null,
    filename: req.file?.filename || null
  }
    });

 
order = await Order.findById(order._id).populate("restaurant");

console.log("Order with populated restaurant:", order);


    // 🔥 REAL-TIME UPDATE (Socket.io)
    const io = req.app.locals.io;
    if (io && io.emitToRestaurant) {
      io.emitToRestaurant(restaurantId, "new_order", order);
    }

    // 🔥 PUSH NOTIFICATION (FCM)
    const rest = await Restaurant.findById(restaurantId);
     const admin = req.app.locals.admin;
    if (rest?.fcmToken && admin) {
      const message = {
        token: rest.fcmToken,
        notification: {
          title: "New Order Received",
          body: `Order ${order._id}`,
        },
        data: { orderId: String(order._id) },
        webpush: { fcmOptions: { link: `/orders/${order._id}` } }
      };

      admin.messaging().send(message)
      .then(resp => console.log("FCM sent:", resp))
      .catch((err) => {
        console.error("❌ FCM Error:", err);
      });
    }

    res.json({ message: "Order created", order });

  } catch (e) {
    console.error("Order error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Update order status (Accept / Decline)
router.post("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("restaurant");

    if (!order) return res.status(404).json({ error: "Order not found" });

    // 🔥 Notify restaurant dashboard
    if (io.emitToRestaurant) {
      io.emitToRestaurant(order.restaurant._id, "order_status_changed", order);
    }

    res.json({ message: "Status updated", order });

  } catch (e) {
    console.error("Status update error:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
