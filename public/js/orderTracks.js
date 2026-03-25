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

