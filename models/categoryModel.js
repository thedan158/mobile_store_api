import { Schema, model } from "mongoose";

const categorySchema = Schema({
    name: {
        type: String,
        required: [true, "Vui lòng nhập tên hãng"],
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default model("Category", categorySchema);