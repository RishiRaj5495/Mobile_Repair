const express = require("express");
const router = express.Router();
const axios = require("axios");
 


router.get("/get-eta", async (req, res) => {
  const { dLat, dLng, cLat, cLng } = req.query;
  console.log("Query parameters:", { dLat, dLng, cLat, cLng });
  
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;


 


  if (!dLat || !dLng || !cLat || !cLng) {
    return res.status(400).json({ success: false });
  }




  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${dLat},${dLng}&destinations=${cLat},${cLng}&mode=driving&key=${GOOGLE_API_KEY}`;


 

  try {
    const response = await axios.get(url);
    console.log("Google response:", response.data);
    const element = response.data.rows[0].elements[0];

    if (element.status !== "OK") {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      distance: element.distance.text,
      duration: element.duration.text,
      meters: element.distance.value
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
