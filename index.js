import express, { json } from 'express';
const app = express();
import cookieParser from "cookie-parser";
import pkg from 'body-parser';
const { urlencoded } = pkg;
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import { config as _config } from "cloudinary";

dotenv.config();

import { errorMiddleware } from "./middleware/error.js";
app.use(json())
app.use(cookieParser())
app.use(urlencoded({ extended: true }));
app.use(fileUpload());

import product from "./routers/productRoute.js";
import user from "./routers/userRoute.js";
import order from "./routers/orderRoute.js";
import payment from "./routers/paymentRoute.js";
import connectDatabase from './config/database.js';

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

//Middleware for Error
app.use(errorMiddleware)
connectDatabase()
_config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.listen(process.env.PORT, () => {
    console.log(`Sever is running PORT ${process.env.PORT}`)
})


