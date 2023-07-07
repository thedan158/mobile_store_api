import { userInfo } from "os";
import ErrorHander from "../utils/errorhander.js";
import catchAsynError from "./catchAsynError.js";
import pkg from 'jsonwebtoken';
const { verify } = pkg;
import User from "../models/userModel.js";

export const isAuthenticatedUser = catchAsynError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHander("Vui lòng đăng nhập để truy cập!"), 401)
    }
    const decodedData = verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
})
export function authorieRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHander(`Role: ${req.user.role} không được phép truy cập! `), 403)
        }
        next();
    }
}

