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
function updateDeliveryMarker(lat, lng) {
  const deliveryLatLng = [lat, lng];

  if (!deliveryMarker) {
    deliveryMarker = L.marker(deliveryLatLng).addTo(map)
      .bindPopup("🛵 Delivery");
  } else {
    deliveryMarker.setLatLng(deliveryLatLng);
  }

  drawRoute(deliveryLatLng);
  calculateDistanceAndETA(deliveryLatLng);
}

// ROUTE DRAW
function drawRoute(deliveryLatLng) {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(deliveryLatLng),
      L.latLng(customerLatLng)
    ],
    addWaypoints: false,
    draggableWaypoints: false,
    show: false
  }).addTo(map);
}

// DISTANCE + ETA
function calculateDistanceAndETA(deliveryLatLng) {
  const distanceKm = haversine(deliveryLatLng, customerLatLng);
  const avgSpeed = 30; // km/h (assumed)
  const etaMin = Math.round((distanceKm / avgSpeed) * 60);

  document.getElementById("distance").innerText =
    distanceKm.toFixed(2) + " km";

  document.getElementById("eta").innerText =
    etaMin + " mins";

  checkNearbyAlert(distanceKm * 1000);
}

// HAVERSINE FORMULA
function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// NEARBY ALERT
function checkNearbyAlert(distanceMeters) {
  if (distanceMeters < 500 && !alerted) {
    alerted = true;
    alert("🚨 Delivery partner is nearby!");
  }
}

