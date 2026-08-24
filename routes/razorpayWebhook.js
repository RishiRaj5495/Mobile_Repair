const express = require("express");
const crypto = require("crypto");

const Order = require("../Models/orders.js");
const Restaurant = require("../Models/mobileShops.js");

const router = express.Router();

router.post(
    "/razorpay",
    express.raw({ type: "application/json" }),
    async (req, res) => {

        try {

            const webhookSignature =
                req.headers["x-razorpay-signature"];

            const webhookSecret =
                process.env.RAZORPAY_WEBHOOK_SECRET;

            // Verify Razorpay webhook
            const expectedSignature = crypto
                .createHmac(
                    "sha256",
                    webhookSecret
                )
                .update(req.body)
                .digest("hex");

            if (
                expectedSignature !==
                webhookSignature
            ) {

                console.log(
                    "❌ Invalid Razorpay webhook signature"
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid webhook signature"
                });
            }

            console.log(
                "✅ Webhook signature verified"
            );

            // Convert raw body to JSON
            const event =
                JSON.parse(
                    req.body.toString()
                );

            console.log(
                "Razorpay event:",
                event.event
            );

            // ------------------------------------
            // PAYMENT CAPTURED
            // ------------------------------------

            if (
                event.event ===
                "payment.captured"
            ) {

                const payment =
                    event.payload.payment.entity;

                const paymentId =
                    payment.id;

                const razorpayOrderId =
                    payment.order_id;

                console.log(
                    "Payment ID:",
                    paymentId
                );

                console.log(
                    "Razorpay Order ID:",
                    razorpayOrderId
                );

                // Find our pending order
                const order =
                    await Order.findOne({
                        razorpayOrderId:
                            razorpayOrderId
                    });

                if (!order) {

                    console.log(
                        "❌ Order not found:",
                        razorpayOrderId
                    );

                    // Still return 200 so Razorpay
                    // doesn't keep retrying
                    return res.status(200).json({
                        success: true,
                        message:
                            "Order not found"
                    });
                }

                // Prevent duplicate processing
                if (
                    order.paymentStatus ===
                    "paid"
                ) {

                    console.log(
                        "Payment already processed"
                    );

                    return res.status(200).json({
                        success: true,
                        message:
                            "Already processed"
                    });
                }

                // --------------------------------
                // UPDATE ORDER
                // --------------------------------

                order.paymentStatus = "paid";

                order.status =
                    "pending_technician";

                order.razorpayPaymentId =
                    paymentId;

                await order.save();

             

                // --------------------------------
                // SOCKET.IO
                // --------------------------------

                const io =
                    req.app.locals.io;

                if (
                    io &&
                    io.emitToRestaurant
                ) {

                    io.emitToRestaurant(
                        order.restaurant,
                        "new_order",
                        order
                    );

                    
                }

                // --------------------------------
                // FCM
                // --------------------------------

                const rest =
                    await Restaurant.findById(
                        order.restaurant
                    );

                const admin =
                    req.app.locals.admin;

                if (
                    rest?.fcmToken &&
                    admin
                ) {

                    const message = {

                        token:
                            rest.fcmToken,

                        notification: {

                            title:
                                "New Request",

                            body:
                                `Order ${order._id}`
                        },

                        data: {

                            orderId:
                                String(
                                    order._id
                                )
                        },

                        webpush: {

                            fcmOptions: {

                                link:
                                    `/delivery/${order._id}`
                            }
                        }
                    };

                    try {

                        const response =
                            await admin
                                .messaging()
                                .send(message);

                      

                    } catch (error) {

                        console.error(
                            "❌ FCM failed:",
                            error
                        );
                    }
                }
            }

            return res.status(200).json({
                success: true
            });

        } catch (error) {

            console.error(
                "❌ WEBHOOK ERROR:",
                error
            );

            return res.status(500).json({
                success: false
            });
        }
    }
);

module.exports = router;