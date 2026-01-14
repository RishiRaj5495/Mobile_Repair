// sockets.js — sets up namespaces/rooms and helpers
const Order = require("./Models/orders"); 


module.exports = function(io) {


io.emitToRestaurant = (restaurantId, event, payload) => {
io.to(`restaurant_${restaurantId}`).emit(event, payload);
};


io.on('connection', (socket) => {
console.log('socket connected', socket.id);


socket.on('restaurant:join', (restaurantId) => {
console.log('restaurant join', restaurantId);
socket.join(`restaurant_${restaurantId}`);
});


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

 socket.on("order:updateStatus", async ({ orderId, status }) => {
      try {
        const order = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true }
        ).populate("restaurant");

        if (!order) return;

        // notify restaurant
        io.emitToRestaurant(
          order.restaurant._id,
          "order_status_changed",
          order
        );

        // notify customer/order room
        io.to(orderId).emit("order_status_changed", order);

      } catch (err) {
        console.error("order:updateStatus error:", err);
      }
    });



///////////



});


// expose helper function to emit from other modules



module.exports.io = io;
};