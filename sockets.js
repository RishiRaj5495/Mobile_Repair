// sockets.js — sets up namespaces/rooms and helpers
const Order = require("./Models/orders"); 


module.exports = function(io) {

///new

  io.use((socket, next) => {
    const session = socket.request.session;

    if (
      session &&
      session.passport &&
      session.passport.user
    ) {
      socket.user = session.passport.user;
      return next();
    }

    next(new Error("Unauthorized Socket"));
  });

///new
io.emitToRestaurant = (restaurantId, event, payload) => {
io.to(`restaurant_${restaurantId}`).emit(event, payload);
};


io.on('connection', (socket) => {
console.log('socket connected', socket.id);


// socket.on('restaurant:join', (restaurantId) => {
// console.log('restaurant join', restaurantId);
// socket.join(`restaurant_${restaurantId}`);
// });old-------
//////new
socket.on('restaurant:join', (restaurantId) => {
  const user = socket.user;

  if (user.type === "Restaurant" && user.id === restaurantId) {
    socket.join(`restaurant_${restaurantId}`);
    console.log("Restaurant joined its room");
  } else {
    console.log("Unauthorized restaurant join attempt");
  }
});
//////new
socket.on('disconnect', () => {
console.log('socket disconnected', socket.id);
});

/////////////////
   socket.on("join_order", (orderId) => {
      socket.join(orderId);
      console.log(`Socket ${socket.id} joined order ${orderId}`);
    });

      socket.on("delivery:location", ({ orderId, lat, lng }) => {
      socket.to(orderId).emit("delivery:location", { lat, lng });
    });

//  socket.on("order:updateStatus", async ({ orderId, status }) => {
//       try {
//         const order = await Order.findByIdAndUpdate(
//           orderId,
//           { status },
//           { new: true }
//         ).populate("restaurant");

//         if (!order) return;

//         // notify restaurant
//         io.emitToRestaurant(
//           order.restaurant._id,
//           "order_status_changed",
//           order
//         );

//         io.to(orderId).emit("order_status_changed", order);

//       } catch (err) {
//         console.error("order:updateStatus error:", err);
//       }
//     });
///new
socket.on("order:updateStatus", async ({ orderId, status }) => {
  try {
    const user = socket.user;

    if (user.type !== "Restaurant") {
      console.log("Unauthorized status update attempt");
      return;
    }

    const order = await Order.findById(orderId).populate("restaurant");

    if (!order) return;

    if (order.restaurant._id.toString() !== user.id) {
      console.log("Restaurant trying to update чуж order");
      return;
    }

    order.status = status;
    await order.save();

    io.emitToRestaurant(
      order.restaurant._id,
      "order_status_changed",
      order
    );

    io.to(orderId).emit("order_status_changed", order);

  } catch (err) {
    console.error("order:updateStatus error:", err);
  }
});
//new

});







};