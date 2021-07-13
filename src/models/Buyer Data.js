const mongoose = require("mongoose");

const newBuyer = new mongoose.Schema({
    Title: {
        type: String
    },
    userid: {
        id: {
            type: String
        }
    },
    userdata: {
        firstName: {
            type: String,
            trim: true
        },
        middleName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        gender: {
            type: String,
            trim: true
        },
        dob: {
            type: Date,
            trim: true
        },
        mobNo: {
            type: Number,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true
        },
        aadharNo: {
            type: Number,
            unique: true,
            trim: true
        },
        voterId: {
            type: String,
            unique: true,
            trim: true
        },
        corAdd: {
            type: String,
            trim: true
        },
        userDocs: {
            profilepic: {
                url: String,
                filename: String
            }
        }
    }
})

const Buyer = new mongoose.model("Buyer", newBuyer);

module.exports = Buyer;