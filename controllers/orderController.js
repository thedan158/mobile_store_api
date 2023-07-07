import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import ErrorHander from "../utils/errorhander.js";
import catchAsynError from "../middleware/catchAsynError.js";

export const newOrder = catchAsynError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});
export const getSingleOrder = catchAsynError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
    if (!order) {
        return next(new ErrorHander("ID đơn hàng không hợp lệ", 404));
    }
    res.status(200).json({
        success: true,
        order,
    });
});
export const myOrders = catchAsynError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json({
        success: true,
        orders,
    });
});
export const getAllOrders = catchAsynError(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});

export const updateOrder = catchAsynError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("Không tìm thấy đơn hàng", 404));
    }

    if (order.orderStatus === "Đã vận chuyển") {
        return next(new ErrorHander("Đơn hàng của bạn đã vận chuyển", 400));
    }

    if (req.body.status === "Đang vận chuyển") {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Đã giao") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});
async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}
export const deleteOrder = catchAsynError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("ID đơn hàng không tìm thấy", 404));
    }
    await order.remove();
    res.status(200).json({
        success: true,
    });
});