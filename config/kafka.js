const { Kafka } = require("kafkajs");

// const kafka = new Kafka({
//     clientId: "repairnow",
//     // brokers: ["localhost:9092"],
//     brokers: [process.env.KAFKA_BROKER],
//         ssl: true,

//     sasl: {
//         mechanism: "plain",
//         username: process.env.KAFKA_USERNAME,
//         password: process.env.KAFKA_PASSWORD,
//     },
// });

const kafkaConfig = {
    clientId: "repairnow",
    brokers: [process.env.KAFKA_BROKER],
};

if (process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD) {
    kafkaConfig.ssl = true;
    kafkaConfig.sasl = {
        mechanism: "plain",
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    };
}

const kafka = new Kafka(kafkaConfig);

const producer = kafka.producer();
const consumer = kafka.consumer({
    groupId: "repairnow-group",
});

// async function connectKafka() {
//     await producer.connect();
//     console.log("✅ Kafka Producer Connected");
// }
async function connectKafka() {
    while (true) {
        try {
            console.log("Connecting to Kafka...");
            await producer.connect();
            console.log("✅ Kafka Producer Connected");
            return;
        } catch (err) {
            console.log("❌ Kafka not ready.");
            console.log(err.message);

            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}

module.exports = {
    producer,
    consumer,
    connectKafka,
};