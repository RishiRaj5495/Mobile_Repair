// routes/fcm.js
const express = require("express");
const router = express.Router();
const Restaurant = require("../Models/mobileShops.js");

// Save a token for an existing restaurant
router.post("/restaurants/:id/token", async (req, res) => {
  try {
    const { id } = req.params;
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ error: "Missing token" });

    const rest = await Restaurant.findByIdAndUpdate(id, { fcmToken }, { new: true });
    if (!rest) return res.status(404).json({ error: "Restaurant not found" });

    res.json({ message: "Token saved", rest });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Test send to token
router.post("/send-test", async (req, res) => {
  try {
    const { token, title = "Test", body = "Hello", click_action = "/" } = req.body;
    if (!token) return res.status(400).json({ error: "Missing token" });

    const admin = req.app.locals.admin;
    const message = {
      token,
      notification: { title, body },
      webpush: { fcmOptions: { link: click_action } }
    };

    const result = await admin.messaging().send(message);
    res.json({ message: "Sent", result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;