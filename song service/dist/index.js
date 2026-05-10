import express from "express";
import dotenv from "dotenv";
import songRoutes from "./route.js";
import redis from "redis";
import cors from 'cors';
dotenv.config();
const redisPassword = process.env.REDIS_PASSWORD;
if (!redisPassword) {
    throw new Error("REDIS_PASSWORD is not defined in .env");
}
export const redisClient = redis.createClient({
    password: redisPassword,
    socket: {
        host: "redis-13040.c301.ap-south-1-1.ec2.cloud.redislabs.com",
        port: 13040,
    },
});
redisClient
    .connect()
    .then(() => console.log("Connected to redis"))
    .catch(console.error);
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", songRoutes);
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map