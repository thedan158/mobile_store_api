import User from "../models/userModel.js";
import ErrorHander from "../utils/errorhander.js";
import catchAsynError from "../middleware/catchAsynError.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import { createHash } from "crypto";
import { v2 } from "cloudinary";

export const registerUser = catchAsynError(async (req, res, next) => {
    const myCloud = await v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });
    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    })
    sendToken(user, 201, res);
})

export const loginUser = catchAsynError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHander("Vui lòng Email & Mật khẩu", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHander("Email hoặc Mật khẩu không hợp lệ", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHander("Email hoặc Mật khẩu không hợp lệ", 401));
    }
    sendToken(user, 200, res);
});

export const logout = catchAsynError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Đăng xuất thành công"
    })
})

export const forgotPassword = catchAsynError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHander("Không tìm thấy người dùng", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = `Đây là liên kết đễ lấy lại mật khẩu của bạn: \n\n ${resetPasswordUrl} \n\nVui lòng truy cập để cập nhật lại mật khẩu mới.`;
    try {
        await sendEmail({
            email: user.email,
            subject: `Khôi phục mật khẩu Mobile Store`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email đã gửi đến ${user.email}`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHander(error.message, 500));
    }
})

export const resetPassword = catchAsynError(async (req, res, next) => {
    const resetPasswordToken = createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHander(
                "Liên kết không hợp lệ hoặc đã hết hạng",
                400
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Mật khẩu không giống nhau", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});
export const getUserDetail = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user,
    })
})
export const updatePassword = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = user.comparePassword(req.body.oldpassword);
    if (!isPasswordMatched) {
        return next(new ErrorHander("Mật khẩu củ không đúng!"), 400)
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("Mật khẩu không giống nhau"), 400)
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res)
})
export const updateProfile = catchAsynError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    // if (req.body.avatar !== undefined) {
    //     const user = await User.findById(req.user.id);

    //     const imageId = user.avatar.public_id;

    //     await cloudinary.v2.uploader.destroy(imageId);

    //     const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    //         folder: "avatars",
    //         width: 150,
    //         crop: "scale",
    //     });

    //     newUserData.avatar = {
    //         public_id: myCloud.public_id,
    //         url: myCloud.secure_url,
    //     };
    // }

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        for (let i = 0; i < product.images.length; i++) {
            await v2.uploader.destroy(user.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await v2.uploader.upload(images[i], {
                folder: "avatars",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    }


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});


export const getAllUser = catchAsynError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users,
    })
})
export const getSingleUser = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHander(`ID người dùng không tồn tại: ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user,
    })
})
export const updateUserRole = catchAsynError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
    res.status(200).json({
        success: true,
    })
})
export const deleteUser = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(
            new ErrorHander(`ID người dùng không tồn tại: ${req.params.id}`, 400)
        );
    }
    const imageId = user.avatar.public_id;
    await v2.uploader.destroy(imageId);
    await user.remove();
    res.status(200).json({
        success: true,
        message: "Xóa người dùng thành công",
    });
});