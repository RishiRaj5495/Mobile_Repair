let socket;
let map, deliveryMarker, customerMarker, routingControl;
let alerted = false;

// CUSTOMER LOCATION (from backend / EJS)
const customerLatLng = [CUSTOMER_LAT, CUSTOMER_LNG];

// SOCKET
if (!window.socket) {
  window.socket = io();
}
socket = window.socket;

socket.on("connect", () => {
  console.log("Customer connected:", socket.id);
  socket.emit("join_order", ORDER_ID);
});

// MAP INIT
initMap();

function initMap() {
  map = L.map("map").setView(customerLatLng, 14);

  // OSM tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // Customer marker
  customerMarker = L.marker(customerLatLng).addTo(map)
    .bindPopup("🏠 Customer")
    .openPopup();
}

// RECEIVE DELIVERY LOCATION
socket.on("delivery:location", ({ lat, lng }) => {
  updateDeliveryMarker(lat, lng);
});

// UPDATE DELIVERY
// function updateDeliveryMarker(lat, lng) {
//   const deliveryLatLng = [lat, lng];

//   if (!deliveryMarker) {
//     deliveryMarker = L.marker(deliveryLatLng).addTo(map)
//       .bindPopup("🛵 Delivery");
//   } else {
//     deliveryMarker.setLatLng(deliveryLatLng);
//   }

//    drawRoute(deliveryLatLng);
//   calculateDistanceAndETA(deliveryLatLng);
// }

let lastPosition = null;

function shouldFetchETA(lat, lng) {
  if (!lastPosition) {
    lastPosition = [lat, lng];
    return true;
  }

  const moved =
    Math.abs(lat - lastPosition[0]) +
    Math.abs(lng - lastPosition[1]);

  if (moved > 0.0005) {
    lastPosition = [lat, lng];
    return true;
  }

  return false;
}

function updateDeliveryMarker(lat, lng) {
  const newLatLng = L.latLng(lat, lng);

  if (!deliveryMarker) {
    deliveryMarker = L.marker(newLatLng).addTo(map)
      .bindPopup("🛵 Delivery");
  } else {
    deliveryMarker.slideTo(newLatLng, {
      duration: 1000
    });
  }
if (shouldFetchETA(lat, lng)) {
  calculateDistanceAndETA([lat, lng]);
}

}

// ROUTE DRAW
// function drawRoute(deliveryLatLng) {
//   if (routingControl) {
//     map.removeControl(routingControl);
//   }

//   routingControl = L.Routing.control({
//     waypoints: [
//       L.latLng(deliveryLatLng),
//       L.latLng(customerLatLng)
//     ],
//     addWaypoints: false,
//     draggableWaypoints: false,
//     show: false
//   }).addTo(map);
// }

// DISTANCE + ETA
// function calculateDistanceAndETA(deliveryLatLng) {
//   const distanceKm = haversine(deliveryLatLng, customerLatLng);
//   const avgSpeed = 30; // km/h (assumed)
//   const etaMin = Math.round((distanceKm / avgSpeed) * 60);

//   document.getElementById("distance").innerText =
//     distanceKm.toFixed(2) + " km";

//   document.getElementById("eta").innerText =
//     etaMin + " mins";

//   checkNearbyAlert(distanceKm * 1000);
// }

// HAVERSINE FORMULA
// function haversine([lat1, lon1], [lat2, lon2]) {
//   const R = 6371;
//   const dLat = deg2rad(lat2 - lat1);
//   const dLon = deg2rad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(deg2rad(lat1)) *
//       Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) ** 2;

//   return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
// }

// function deg2rad(deg) {
//   return deg * (Math.PI / 180);
// }

// NEARBY ALERT

// async function calculateDistanceAndETA(deliveryLatLng) {
//   const [dLat, dLng] = deliveryLatLng;
//   const [cLat, cLng] = customerLatLng;

//   const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // replace with your key

//   const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${dLat},${dLng}&destinations=${cLat},${cLng}&key=${apiKey}`;

//   try {
//     const res = await fetch(url);
//     const data = await res.json();

//     const element = data.rows[0].elements[0];

//     if (element.status === "OK") {
//       const distanceText = element.distance.text;
//       const durationText = element.duration.text;

//       document.getElementById("distance").innerText = distanceText;
//       document.getElementById("eta").innerText = durationText;

//       checkNearbyAlert(element.distance.value);
//     }
//   } catch (err) {
//     console.error("ETA API error:", err);
//   }
// }


let lastEtaFetch = 0;

async function calculateDistanceAndETA(deliveryLatLng) {
  
   const now = Date.now();
  if (now - lastEtaFetch < 15000) return; // 15 sec throttle
  lastEtaFetch = now;
  const [dLat, dLng] = deliveryLatLng;
  const [cLat, cLng] = customerLatLng;

  try {
    const res = await fetch(
      `${window.location.origin}/get-eta?dLat=${dLat}&dLng=${dLng}&cLat=${cLat}&cLng=${cLng}`
    );

    const data = await res.json();

    if (data.success) {
      document.getElementById("distance").innerText = data.distance;
      document.getElementById("eta").innerText = data.duration;

      checkNearbyAlert(data.meters);
    }
  } catch (err) {
    console.error("ETA fetch error:", err);
  }
}









function checkNearbyAlert(distanceMeters) {
  if (distanceMeters < 500 && !alerted) {
    alerted = true;
    alert("🚨 Delivery partner is nearby!");
  }
}

