// sockets.js — sets up namespaces/rooms and helpers
module.exports = function(io) {
// We'll use a simple rooms approach: each restaurant joins a room named by restaurantId


io.on('connection', (socket) => {
console.log('socket connected', socket.id);


socket.on('restaurant:join', (restaurantId) => {
console.log('restaurant join', restaurantId);
socket.join(`restaurant_${restaurantId}`);
});


socket.on('disconnect', () => {
console.log('socket disconnected', socket.id);
});
});


// expose helper function to emit from other modules
io.emitToRestaurant = (restaurantId, event, payload) => {
io.to(`restaurant_${restaurantId}`).emit(event, payload);
};


// also expose io for broadcast if needed
module.exports.io = io;
};