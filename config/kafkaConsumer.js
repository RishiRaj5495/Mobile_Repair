const { consumer } = require("./kafka");
const Order = require("../Models/orders");
const Technician = require("../Models/mobileShops");

async function startConsumer(io, admin) {

    await consumer.connect();

    console.log("✅ Kafka Consumer Connected");

    await consumer.subscribe({
        topic: "booking-created",
        fromBeginning: false,
    });

    await consumer.run({

        eachMessage: async ({ topic, partition, message }) => {

            
            try {

                const booking = JSON.parse(message.value.toString());

                console.log("📩 Booking Event Received:", booking);
                 
                const order = await Order.findById(booking.orderId)
                    .populate("restaurant")
                    .populate("customer");

                if (!order) {
                    console.log("❌ Order not found");
                    return;
                }

                // ==========================
                // Socket.io Notification
                // ==========================

                if (io && io.emitToRestaurant) {

                    console.log("📡 Sending Socket Event");

                    io.emitToRestaurant(
                        order.restaurant._id.toString(),
                        "new_order",
                        order
                    );

                    console.log("✅ Socket Event Sent");
                }

                // ==========================
                // Firebase Push Notification
                // ==========================
console.log("Reached Firebase Section");
const restaurant = order.restaurant;

console.log("Restaurant:", restaurant);
console.log("FCM Token:", restaurant?.fcmToken);
console.log("Admin:", !!admin);
                // const restaurant = order.restaurant;
                console.log("Restaurant details for FCM================================:", restaurant);

                if (restaurant?.fcmToken && admin) {

                    const notification = {
                        token: restaurant.fcmToken,

                        notification: {
                            title: "New Request",
                            body: `Order ${order._id}`,
                        },

                        data: {
                            orderId: String(order._id),
                        },

                        webpush: {
                            fcmOptions: {
                                link: `/delivery/${order._id}`,
                            },
                        },
                    };

                    await admin.messaging().send(notification);

                    console.log("✅ Firebase Notification Sent");
                }

            } catch (err) {

                console.error("❌ Kafka Consumer Error");

                console.error(err);

            }




        },

    });

}

module.exports = startConsumer;