const express = require('express');
const router = express.Router();
const Restaurant = require('../Models/mobileShops.js');


// create restaurant (simple)
router.post('/register', async (req, res) => {
  console.log("In mongo save");

 try {
    const { name, address, mobile, fcmToken } = req.body;
    if (!name || !address || !mobile) return res.status(400).json({ message: "All fields required" });

    const restaurant = new Restaurant({ name, address, mobile, fcmToken: fcmToken || null });
   const restaurantData = await restaurant.save();
  console.log("Restaurant Registered Successfully!", restaurantData);
    res.json({ message: "Restaurant Registered Successfully!", restaurant });
  }catch (e) {
// res.status(500).json({ error: err.message });
req.flash("success", e.message);
}
});


// update fcm token
router.post('/:id/token', async (req, res) => {
try {
const { token } = req.body;
const rest = await Restaurant.findByIdAndUpdate(req.params.id, { fcmToken: token }, { new: true });

res.json(rest);
} catch (e) {
// res.status(500).json({ error: err.message });
req.flash("success", e.message);
}
});
module.exports = router;