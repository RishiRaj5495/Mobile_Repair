

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
// const { admin, io } = require("../app"); // import firebase admin + sockets


router.post("/:id/accept", async (req, res) => {
  console.log("Accepting order:", req.params.id);
  await Order.findByIdAndUpdate(req.params.id, {
    status: "accepted"
  });
  res.sendStatus(200);
});


router.post("/:id/reject", async (req, res) => {
  console.log("Rejecting order:", req.params.id);
  await Order.findByIdAndUpdate(req.params.id, {
    status: "rejected"
  });
  res.sendStatus(200);
});

// Create a new order
router.post("/",upload.single("video"), async (req, res) => {
  try {
    const { customerFirstName, customerLastName,customerPhone, customerEmail, customerAddress, customerCity,  customerState, customerPincode, customerCountry, restaurantId,lat,lng} = req.body;
    console.log("Creating order for restaurant:", req.body.restaurantId);
    const restaurant = await Restaurant.findById(restaurantId);
console.log("Restaurant found:", restaurant);
 
 console.log("Received video file:", req.file);
 // cloudinary video URL
let ticketId;
let exists = true;

while (exists) {
  ticketId = "RN-" + Math.floor(100000 + Math.random() * 900000);
  exists = await Order.exists({ ticketId });
}
    let order = await Order.create({
        ticketId,
      customerFirstName,
      customerLastName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity,
      customerState,
      customerPincode,
      customerCountry,
      restaurant:restaurantId,
   customerLocation: {
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null
      },
        video: {
    url: req.file?.path || null,
    filename: req.file?.filename || null
  }
    });

 
order = await Order.findById(order._id).populate("restaurant").sort({ createdAt: -1 });

console.log("Order with populated restaurant:", order);


    // 🔥 REAL-TIME UPDATE (Socket.io)
    const io = req.app.locals.io;
    if (io && io.emitToRestaurant) {
      io.emitToRestaurant(restaurantId, "new_order", order);
    }

    // 🔥 PUSH NOTIFICATION (FCM)   && !connectedRestaurants.has(restaurantId)
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
    console.error("Forwarding error:", e);
    res.status(500).json({ error: e.message });
  }

   
});



// Update order status (Accept / Decline)
// router.post("/:id/status", async (req, res) => {
//   try {
//     const { status } = req.body;

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     ).populate("restaurant");

//     if (!order) return res.status(404).json({ error: "Order not found" });
//     if (io.emitToRestaurant) {
//       io.emitToRestaurant(order.restaurant._id, "order_status_changed", order);
//     }

//     res.json({ message: "Status updated", order });

//   } catch (e) {
//     console.error("Status update error:", e);
//     res.status(500).json({ error: e.message });
//   }
// });



router.get("/:orderId/track", async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
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
      status: { $in: ["pending", "accepted"] }
    })
      .populate("restaurant")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});









///////////////////////
module.exports = router;


