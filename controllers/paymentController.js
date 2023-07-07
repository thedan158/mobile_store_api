import axios from "axios";
import catchAsynError from "../middleware/catchAsynError.js";

import stripePackage from "stripe";
import QueryString from "qs";


const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
export const processPayment = catchAsynError(async (req, res, next) => {
    const { amount } = req.body;

    const data = QueryString.stringify({
        amount: amount,
        currency: 'usd',
    });

    const config = {
        method: 'post',
        url: 'https://api.stripe.com/v1/payment_intents',
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
    };
    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data));
        res.status(200).json({
            success: true,
            client_secret: response.data.client_secret,
        });
    } catch (error) {
        // Handle error
        res.status(500).json({ success: false, message: error });
    }

});

export const sendStripeApiKey = catchAsynError(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});