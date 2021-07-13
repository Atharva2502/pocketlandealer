const express = require("express");
const router = express.Router();
const sellerRegister = require("../src/models/Seller Register");
const buyerRegister = require("../src/models/Buyer Register");
const Seller = require("../src/models/Seller Data");
const Buyer = require("../src/models/Buyer Data");

// isLoggedIn Middleware

const { requireLogin } = require("../isLoggedIn");

// Post

router.post("/deleteAcc", requireLogin, async (req, res) => {
    try {
        let mobNo = req.body.mobileNo;

        if (req.session.seller === true) {
            let mobileUser = await sellerRegister.findOne({ mobile: mobNo });

            if (mobileUser) {
                let mobileSave = mobileUser.mobile;
                let nmobNo = parseInt(mobNo);
                let mobid = mobileUser.id;

                if (mobileSave === nmobNo) {
                    sellerRegister.findByIdAndRemove(mobid, function (err, docs) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Removed User : ", docs);
                        }
                    })
                    req.flash("success", "Your account was deleted successfully !!!")
                    res.redirect("/login");
                }
            } else {
                req.flash("updatee", "The mobile number entered is not registered")
                res.redirect("/seller-form");
            }
        }

        else if (req.session.buyer === true) {
            let mobileUser = await buyerRegister.findOne({ mobile: mobNo });

            if (mobileUser) {
                let mobileSave = mobileUser.mobile;
                let nmobNo = parseInt(mobNo);
                let mobid = mobileUser.id;

                if (mobileSave === nmobNo) {
                    buyerRegister.findByIdAndRemove(mobid, function (err, docs) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Removed User : ", docs);
                        }
                    })
                    req.flash("success", "Your account was deleted successfully !!!")
                    res.redirect("/login");
                }
            } else {
                req.flash("updatee", "The mobile number entered is not registered")
                res.redirect("/buyer-form");
            }
        }

        else {
            if (req.session.seller === true) {
                req.flash("updatee", "Err! An error occured")
                res.redirect("/seller-form")
            }
            else if (req.session.buyer === true) {
                req.flash("updatee", "Err! An error occured")
                res.redirect("/buyer-form")
            }
        }

    } catch (error) {
        if (req.session.seller === true) {
            req.flash("updatee", error.message)
            res.redirect("/seller-form");
        } else if (req.session.buyer === true) {
            req.flash("updatee", error.message)
            res.redirect("/buyer-form");
        }
    }
})

module.exports = router;