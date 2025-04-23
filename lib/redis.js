import { createClient } from "redis";

const redisOption = {
    url: "redis://127.0.0.1:6379",
};

const client = createClient(redisOption);

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

if (!client.isOpen) {
    await client.connect();
}

export default client;