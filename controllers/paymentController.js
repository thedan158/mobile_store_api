import catchAsynError from "../middleware/catchAsynError.js";

import stripePackage from "stripe";
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
export const processPayment = catchAsynError(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "usd",
        metadata: {
            company: "Mobile Store",
        },
    });

    res
        .status(200)
        .json({ success: true, client_secret: myPayment.client_secret });
});

export const sendStripeApiKey = catchAsynError(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});