let socket;

if (!window.socket) {
  window.socket = io();
}
socket = window.socket;

socket.on("connect", () => {
  console.log("Delivery connected:", socket.id);

  socket.emit("join_order", ORDER_ID);
  console.log("Delivery joined order room:", ORDER_ID);
});

navigator.geolocation.watchPosition(
  (pos) => {
    socket.emit("delivery:location", {
      orderId: ORDER_ID,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });
  },
  (err) => console.error(err),
  { enableHighAccuracy: true }
);
