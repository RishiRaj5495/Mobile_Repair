let socket;
let map, technicianMarker, customerMarker;
let alerted = false;

const customerLatLng = [CUSTOMER_LAT, CUSTOMER_LNG];

// SOCKET
if (!window.socket) {
  window.socket = io();
}
socket = window.socket;

socket.on("connect", () => {
  console.log("Technician connected:", socket.id);
  socket.emit("join_order", ORDER_ID);
});

// MAP INIT
initMap();

function initMap() {
  map = L.map("map").setView(customerLatLng, 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // Customer marker (destination)
  customerMarker = L.marker(customerLatLng)
    .addTo(map)
    .bindPopup("🏠 Customer")
    .openPopup();
}

// LIVE LOCATION (TECHNICIAN)
navigator.geolocation.watchPosition(
  pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    updateTechnicianMarker(lat, lng);

    socket.emit("delivery:location", {
      orderId: ORDER_ID,
      lat,
      lng
    });
  },
  err => console.error("GPS error", err),
  { enableHighAccuracy: true }
);

// UPDATE TECHNICIAN MARKER
function updateTechnicianMarker(lat, lng) {
  const newLatLng = L.latLng(lat, lng);

  if (!technicianMarker) {
    technicianMarker = L.marker(newLatLng)
      .addTo(map)
      .bindPopup("🛵 You");
  } else {
    technicianMarker.slideTo(newLatLng, { duration: 1000 });
  }

 calculateDistanceAndETA([lat, lng]);
}

// ETA + DISTANCE
let lastEtaFetch = 0;

async function calculateDistanceAndETA(techLatLng) {
  const now = Date.now();
  if (now - lastEtaFetch < 15000) return;
  lastEtaFetch = now;

  const [dLat, dLng] = techLatLng;
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

// ARRIVAL ALERT
function checkNearbyAlert(distanceMeters) {
  if (distanceMeters < 100 && !alerted) {
    alerted = true;
    alert("✅ You have arrived at the customer location!");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("navigateBtn");

  if (btn) {
    btn.onclick = () => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${CUSTOMER_LAT},${CUSTOMER_LNG}&travelmode=driving`,
        "_blank"
      );
    };
  }
});
