

// module.exports = router;
 if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
    }
const Razorpay = require("razorpay");


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



const express = require("express");
const router = express.Router();
const Order = require("../Models/orders.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js"); // path of your cloudinary file
const upload = multer({ storage });
const Restaurant = require("../Models/mobileShops.js");


router.post(
  "/prepare", upload.none(),
  async (req, res) => {
  


    try {

      const {
        customerFirstName,
        customerLastName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerCity,
        customerState,
        customerPincode,
        customerCountry,
        restaurantId,
        lat,
        lng
      } = req.body;

      const restaurant = await Restaurant.findById(restaurantId);

if (!restaurant) {
  return res.status(404).json({
    success: false,
    message: "Technician not found"
  });
}

if (!req.body.videoUrl) {
  return res.status(400).json({
    success: false,
    message: "Issue video is required"
  });
}

      let ticketId;
      let exists = true;

      while (exists) {
        ticketId = "RN-" + Math.floor(100000 + Math.random() * 900000);

        exists = await Order.exists({ ticketId });
      }

      req.session.pendingOrder = {

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

        restaurant: restaurantId,

        customerLocation: {
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null
        },

        video: {
          url: req.body.videoUrl || null
        },
          advanceAmount: 100

      };

      await req.session.save();

      res.json({
        success: true,
        message: "Order prepared successfully"
      });

    } catch (err) {
  console.error("PREPARE ERROR:", err);

  return res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
}

  }
);



router.post("/create-order", async (req, res) => {

    try {

        if (!req.session.pendingOrder) {
            return res.status(400).json({
                success: false,
                message: "No pending order found"
            });
        }

        const amount = req.session.pendingOrder.advanceAmount;

        const razorpayOrder = await razorpay.orders.create({

            amount: amount * 100, // paise

            currency: "INR",

            receipt: req.session.pendingOrder.ticketId

        });
        console.log("Razorpay order created:", razorpayOrder);

        res.json({

            success: true,

            key: process.env.RAZORPAY_KEY_ID,

            razorpayOrder

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Failed to create Razorpay order"

        });

    }

});





module.exports = router;