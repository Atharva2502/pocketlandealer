const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const registerBuyer = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: Number,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    formFilled: {
        type: Array
    }
})

registerBuyer.pre("save", async function (next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})


const buyerRegister = new mongoose.model("buyerRegister", registerBuyer);

module.exports = buyerRegister;