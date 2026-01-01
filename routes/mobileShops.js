const express = require('express');
const router = express.Router();
const Restaurant = require('../Models/mobileShops.js');
const passport = require("passport");
const { isLoggedInForMobileshop } = require("../middlewear.js");
const wrapAsync = require("../utils/wrapAsync.js");

// create restaurant (simple)
// router.post('/register', async (req, res) => {
//   console.log("In mongo save");

//  try {
//     const { name, address, mobile, fcmToken } = req.body;
//     if (!name || !address || !mobile) return res.status(400).json({ message: "All fields required" });

//     const restaurant = new Restaurant({ name, address, mobile, fcmToken: fcmToken || null });
//    const restaurantData = await restaurant.save();
//   console.log("Restaurant Registered Successfully!", restaurantData);
//     res.json({ message: "Restaurant Registered Successfully!", restaurant });
//   }catch (e) {
// // res.status(500).json({ error: err.message });
// req.flash("success", e.message);
// }
// });


router.post('/register', async (req, res, next) => {
  console.log("In mongo save");

 try {

  const { name, email, password, phone, address, fcmToken } = req.body;
  
    if (!name ||!email || !address || !phone) return res.status(400).json({ message: "All fields required" });

    const restaurant = new Restaurant({ name, email, address, phone, fcmToken: fcmToken || null });
   const registerMobileShop = await Restaurant.register(restaurant, password);

  console.log("Restaurant Registered Successfully!", registerMobileShop);
    req.login(registerMobileShop, (err) => {
  if (err) {
    return next(err);
  }
  res.status(200).json({
    success: true,
    message: "Welcome to the app!"
  });

  });


    }catch (err) {
  console.error("REGISTER ERROR 👉", err);
  res.status(500).json({
    success: false,
    message: err.message
  });
}
  
  
  }) ;


  router.get(
  "/dashboard",
  isLoggedInForMobileshop,
  (req, res) => {
    
    res.render("listings/mobileShops.ejs", {
    });
  }
);

// router.post(
//   "/login_Shop",
//   passport.authenticate("restaurant-local", {
//     failureRedirect: "/mobileShops",
//     failureFlash: true
//   }),
//   (req, res) => {
//     console.log("login run");
//     res.redirect("/mobileShop/dashboard");
//   }
// );
// router.post(
//   "/login_Shop",

//   // 1️⃣ Before authentication (request check)
//   (req, res, next) => {
//     console.log("POST /login_Shop HIT");
//     console.log("Body:", req.body);
//     next();
//   },

//   // 2️⃣ Passport authentication
//   passport.authenticate("restaurant-local", {
//     failureRedirect: "/mobileShops",
//     failureFlash: true
//   }),

//   // 3️⃣ After successful authentication
//   (req, res) => {
//     console.log("AUTH SUCCESS");
//     console.log("Is Authenticated:", req.isAuthenticated());
//     console.log("Logged in user:", req.user);

//     res.redirect("/mobileShop/dashboard");
//   }
// );
router.post("/login_Shop", (req, res, next) => {
  passport.authenticate("restaurant-local", (err, user, info) => {
    if (err) {                                               //
      console.log("Error:", err);
      return next(err);
    }

    if (!user) {
      console.log("LOGIN FAILED:", info);
      req.flash("success", "Password or username is incorrect");
      return res.redirect("/mobileShops");
    }

    req.login(user, err => {
      if (err) return next(err);

      console.log("LOGIN SUCCESS");
      console.log("User:", req.user);
      req.flash("success", "Your shop now open!");
      res.redirect("/mobileShop/dashboard");
    });
  })(req, res, next);
});



router.get("/yourShop/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    req.flash("success", "Your Shop is now closed, Goodbye!");
    res.redirect("/mobileShops");
  });
});





// update fcm token
router.post('/:id/token', async (req, res) => {
try {
const { token } = req.body;
const rest = await Restaurant.findByIdAndUpdate(req.params.id, { fcmToken: token }, { new: true });

res.json(rest);
} catch(e) {
// res.status(500).json({ error: err.message });
req.flash("success", e.message);
}
});
module.exports = router;