const express = require("express");
const router = express.Router();
const Buyer = require("../src/models/Buyer Data");
const buyerRegister = require("../src/models/Buyer Register");
var multer = require("multer");
var validator = require('aadhaar-validator')

// Cloudinary Storage

const { storage } = require("../cloudinary/buyerUploads")
const upload = multer({ storage });

// isLoggedIn Middleware

const { requireLogin } = require("../isLoggedIn");

// Post

const pupload = upload.single("photo")
router.post("/buyer-form", requireLogin, pupload, (req, res, next) => {
    var buyerObj = {
        Title: "Buyer Form",
        userid: {
            id: req.session.userid
        },
        userdata: {
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            gender: req.body.gender,
            dob: req.body.dob,
            mobNo: req.body.mobNo,
            email: req.body.email,
            aadharNo: req.body.aadharNo,
            voterId: req.body.voterId,
            corAdd: req.body.corAdd,
            userDocs: {
                profilepic: {
                    url: req.file.path,
                    filename: req.file.filename
                }
            }
        }
    }
    const aadharNo = req.body.aadharNo
    if (validator.isValidNumber(`${aadharNo}`) === true) {
        Buyer.create(buyerObj, async (err, item) => {
            if (err) {
                req.flash("mongoError", err.message = "A buyer is already registered with the given details");
                res.redirect("/buyer-form");
            }
            else {
                const id = req.session.userid
                const buyer = await buyerRegister.update({ _id: id }, { $push: { "formFilled": "true" } })
                res.redirect("/buyer-dashboard")
            }
        })
    }
    else {
        req.flash("mongoError", "Invalid Aadhar Number");
        res.redirect("/buyer-form");
    }
})

module.exports = router;