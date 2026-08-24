

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
const { producer } = require("../config/kafka");
const { client } = require("../config/redis");





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
   
  technician_TO_Customer(
    order,
    io
   
  );
    

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/reject", async (req, res) => {
  const io = req.app.locals.io;
  
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true, runValidators: true }
    );

 

technician_TO_Customer(order,io);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Create a new order

router.post("/verify-payment",upload.single("video"), async (req, res) => {
  
  try {

 const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

let expectedSignature;

try {

 

  expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      razorpay_order_id + "|" + razorpay_payment_id
    )
    .digest("hex");



  if (expectedSignature !== razorpay_signature) {

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature"
    });

  }

 

} catch (err) {

  console.error("SIGNATURE ERROR:", err);

  return res.status(500).json({
    success: false,
    message: "Signature verification failed"
  });

}

    // 2️⃣ Get pending order from session
    // const pendingOrder = req.session.pendingOrder;
    const pendingOrderId = req.session.pendingOrderId;
   let order =
    await Order.findOne({
        razorpayOrderId:
            razorpay_order_id
    });

    if (!pendingOrderId) {

      return res.status(400).json({
        success: false,
        message: "Pending order not found"
      });

    }



    // 3️⃣ Create final order
try {

  order = await Order.findOne({
    razorpayOrderId: razorpay_order_id
});

if (!order) {

    return res.status(404).json({
        success: false,
        message: "Order not found"
    });

}

order.paymentStatus = "paid";

order.status =
    "pending_technician";

order.razorpayPaymentId =
    razorpay_payment_id;

await order.save();

order = await Order.findById(order._id)
    .populate("restaurant")
    .populate("customer");



//   await producer.send({
//     topic: "booking-created",
//     messages: [
//         {
//             value: JSON.stringify({
//                 orderId: order._id,
//                 technicianId: order.restaurant._id,
                
//             }),
//         },
//     ],
// });

} catch (err) {

  
  console.error(err);
  

  return res.status(500).json({
    success: false,
    error: err.message
  });

}

   


  // const restaurantId = pendingOrderId.restaurant;
  const restaurantId = order.restaurant?._id || order.restaurant;
 
    // 🔥 REAL-TIME UPDATE (Socket.io)
    let io = req.app.locals.io;
    if (io && io.emitToRestaurant) {
      console.log("Emitting new_order event to restaurant:", restaurantId, "for order:", order._id);
      io.emitToRestaurant(restaurantId, "new_order", order);
      console.log("✅ Event emitted to restaurant:", restaurantId);
    }



    // 🔥 PUSH NOTIFICATION (FCM)   
    const rest = await Restaurant.findById(restaurantId);
  
     const admin = req.app.locals.admin;    
  
    if (rest?.fcmToken && admin) {
       console.log("Inside FCM if");   
      const message = {
        token: rest.fcmToken,
        notification: {
          title: "New  Request",
          body: `Order ${order._id}`,
        },
        data: { orderId: String(order._id) },
        webpush: { fcmOptions: { link: `/delivery/${order._id}` } }
      };

     try {
    
      
    const resp = await admin.messaging().send(message);

    
} catch (err) {
    console.error("❌ FCM send failed:", err);
}
    }else {
  console.log("FCM Skipped: =======================================", { tokenExists: !!rest?.fcmToken, adminExists: !!admin });
}

  res.json({
    success: true,
    redirectUrl: `/api/orders/${order._id}/track`,
    message: "Issue Forwarded",
    order
  });

  // the outer try/catch above handles errors
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
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


    
    if (!order) return res.status(404).json({ error: "Order not found" });

    const restaurantId = order.restaurant?._id || order.restaurant;
    let io = req.app.locals.io;
    if (restaurantId && io && io.emitToRestaurant) {
      io.emitToRestaurant(restaurantId, "order_status_changed", order);
    } else if (!restaurantId) {
      console.warn("Cannot emit order status update: restaurant ID missing on order", order._id);
    }

    res.json({ success: true, message: "Status updated", order });

  } catch (e) {
    console.error("Status update error:", e);
    res.status(500).json({ error: e.message });
  }
});






router.get("/:orderId/track", async (req, res) => {
    const { orderId } = req.params;

    let order;

    const cacheKey = `order:${orderId}`;

    const cachedOrder = await client.get(cacheKey);

    if (cachedOrder) {

        console.log("✅ Data served from Redis");

        order = JSON.parse(cachedOrder);

    } else {

        console.log("📦 Data served from MongoDB");

        order = await Order.findById(orderId).populate("restaurant");

        if (!order) {
            return res.send("Order not found");
        }

        await client.setEx(
            cacheKey,
            600,
            JSON.stringify(order)
        );
    }

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

  } catch (err) {
    
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;


