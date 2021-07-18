const mongoose = require("mongoose");

const newSeller = new mongoose.Schema({
    viewcount: {
        type: Number
    },
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
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        aadharNo: {
            type: Number,
            trim: true
        },
        voterId: {
            type: String,
            trim: true
        },
        corAdd: {
            type: String,
            trim: true
        },
        add: {
            type: String,
            unique: true,
            trim: true
        },
        div: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        taluka: {
            type: String,
            trim: true
        },
        village: {
            type: String,
            trim: true
        },
        surveyNo: {
            type: Number,
            trim: true
        },
        groupNo: {
            type: Number,
            trim: true
        },
        areaPlot: {
            type: Number,
            trim: true
        },
        pricePlot: {
            type: Number,
            trim: true
        },
        userDocs: {
            utara: {
                url: String,
                filename: String
            },
            profilepic: {
                url: String,
                filename: String
            },
            mutation: {
                url: String,
                filename: String
            },
            searchreport: {
                url: String,
                filename: String
            },
            plotimages: {
                plotimage1: {
                    url: String,
                    filename: String
                },
                plotimage2: {
                    url: String,
                    filename: String
                },
                plotimage3: {
                    url: String,
                    filename: String
                }
            }
        }
    }
})

const Seller = new mongoose.model("Seller", newSeller);

module.exports = Seller;
