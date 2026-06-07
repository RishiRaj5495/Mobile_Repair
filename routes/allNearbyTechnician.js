const express = require('express');
const router = express.Router();
const Restaurant = require('../Models/mobileShops.js');
router.post("/nearest-technicians", async (req, res) => {

   try {

      const { lat, lng } = req.body;

      const technicians = await Restaurant.find({

         location: {
            $near: {
               $geometry: {
                  type: "Point",
                  coordinates: [lng, lat]
               },

               $maxDistance: 5000
            }
         }

      });

      res.json({
         success: true,
         technicians
      });

   } catch(err) {

      console.log(err);

      res.status(500).json({
         success: false
      });

   }

});



module.exports = router;