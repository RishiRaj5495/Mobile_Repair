const express = require('express');
const router = express.Router();
const Restaurant = require('../Models/mobileShops.js');
const passport = require("passport");
const { isLoggedInForMobileshop } = require("../middlewear.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Rating = require("../Models/ratings.js");
const { isLogged } = require("../middlewear.js");

router.post('/register', async (req, res, next) => {
  console.log("In mongo save");

 try {

  const { name, email, password, phone, address, fcmToken } = req.body;
  
    if (!name ||!email || !address || !phone) return res.status(400).json({ message: "All fields required" });

    const restaurant = new Restaurant({ name, email, address, phone, fcmToken: fcmToken || null });
   const registerMobileShop = await Restaurant.register(restaurant, password);
const io = req.app.locals.io;
  io.emit("new_shop", registerMobileShop);
  
  console.log("Restaurant Registered Successfully!", registerMobileShop);
    req.login(registerMobileShop, (err) => {
  if (err) {
    return next(err);
  }
  res.status(200).json({
    success: true,
     redirectUrl: "/mobileShops",
    message: "Welcome to the app!",
  });
  });
    }catch (err) {
  console.error("REGISTER ERROR 👉", err);
  res.status(500).json({
    success: false,
    message: err.message,
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

router.post("/login_Shop", (req, res, next) => {
  passport.authenticate("restaurant-local", (err, user, info) => {
    if (err) {                                               //
      return next(err);
    }

    if (!user) {
      
      req.flash("success", "Password or username is incorrect");
      return res.redirect("/mobileShops");
    }

    req.login(user, err => {
      if (err) return next(err);

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





router.post("/:id/rate", isLogged, async (req, res) => {
  try {
    const value = Number(req.body.value);
    const comment = req.body.comment;
console.log("Comment:", comment);
    if (value < 1 || value > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let existingRating = await Rating.findOne({
      restaurant: req.params.id,
      user: req.user._id
    });

    if (existingRating) {
      const oldValue = existingRating.value;

      if (restaurant.ratingBreakdown[oldValue] > 0) {
        restaurant.ratingBreakdown[oldValue] -= 1;
      }

      restaurant.ratingBreakdown[value] += 1;

      existingRating.value = value;
      existingRating.comment = comment;
      await existingRating.save();

    } else {
      await Rating.create({
        restaurant: req.params.id,
        user: req.user._id,
        value,
        comment
      });

      restaurant.ratingBreakdown[value] += 1;
    }

    const stats = await Rating.aggregate([
      { $match: { restaurant: restaurant._id } },
      {
        $group: {
          _id: "$restaurant",
          avg: { $avg: "$value" },
          count: { $sum: 1 }
        }
      }
    ]);

    restaurant.averageRating = stats[0]?.avg || 0;
    restaurant.totalRatings = stats[0]?.count || 0;

    await restaurant.save();

    req.app.locals.io
      // .to(`shop_${restaurant._id}`)
      .to(`shop_${restaurant._id.toString()}`)
      .emit("ratingUpdated", {
        restaurantId: restaurant._id.toString(),
        averageRating: restaurant.averageRating.toFixed(1),
        totalRatings: restaurant.totalRatings
      });

    res.json({
      success: true,
      averageRating: restaurant.averageRating.toFixed(1),
      totalRatings: restaurant.totalRatings
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;