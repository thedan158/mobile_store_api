import { Schema, model } from "mongoose";
import pkg1 from 'validator';
const { isEmail } = pkg1;
import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import pkg3 from 'jsonwebtoken';
const { sign } = pkg3;
import { randomBytes, createHash } from "crypto";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Vui lòng nhập tên của bạn!"],
        maxLength: [30, "Tên của bạn không vượt quá 30 ký tự"],
        minLength: [4, "Tên của bạn phải ít có 4 ký tự "]
    },
    email: {
        type: String,
        required: [true, "Vui lòng nhập Email của bạn!"],
        unique: true,
        validator: [isEmail, "Vui lòng nhập Email hợp lệ!"]
    },
    password: {
        type: String,
        required: [true, "Vui lòng nhập Mật khẩu của bạn"],
        minLength: [8, "Mật khẩu của bạn phải ít nhất có 8 ký tự"],
        select: false,
    },
    avatar: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    role: {
        type: String,
        default: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

})

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }

    this.password = await hash(this.password, 10)
})

userSchema.methods.getJWTToken = function () {
    return sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

userSchema.methods.comparePassword = async function (password) {
    return await compare(password, this.password);
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = randomBytes(20).toString("hex");
    this.resetPasswordToken = createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}
export default model("User", userSchema);