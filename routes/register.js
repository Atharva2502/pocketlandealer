const express = require("express");
const router = express.Router();
const sellerRegister = require("../src/models/Seller Register");
const buyerRegister = require("../src/models/Buyer Register");
const catchAsync = require("../utils/catchAsync");

// Post

router.post("/register", catchAsync(async (req, res) => {
    try {
        if (req.session.seller === true) {
            const registerSeller = new sellerRegister({
                fullName: req.body.fullName,
                email: req.body.email,
                mobile: req.body.mobile,
                userName: req.body.userName,
                password: req.body.password
            });

            const registered = await registerSeller.save()
            req.session.firsttimeuser = true;

            req.flash("success", "Account created successfully !!! Proceed to login")
            res.redirect("/login");
            console.log("New user registered")
        }
        else if (req.session.buyer === true) {
            const registerBuyer = new buyerRegister({
                fullName: req.body.fullName,
                email: req.body.email,
                mobile: req.body.mobile,
                userName: req.body.userName,
                password: req.body.password,
                formFilled: []
            });

            const registered = await registerBuyer.save()
            req.session.firsttimeuser = true;
            req.flash("success", "Account created successfully !!! Proceed to login")
            res.redirect("/login");
            console.log("New user registered")
        }
        else {
            req.flash("error", "Err! An error occured")
            res.redirect("/login");
        }
    } catch (e) {
        if (req.session.seller === true) {
            if (e.message === `E11000 duplicate key error collection: Database.sellerregisters index: email_1 dup key: { email: "${req.body.email}" }`) {
                req.flash("mongoError", e.message = "The email id entered is already registered");
                res.redirect("login");
            }
            else if (e.message === `E11000 duplicate key error collection: Database.sellerregisters index: mobile_1 dup key: { mobile: ${req.body.mobile}.0 }`) {
                req.flash("mongoError", e.message = "The mobile number entered is already registered");
                res.redirect("login");
            }
            else if (e.message === `E11000 duplicate key error collection: Database.sellerregisters index: userName_1 dup key: { userName: "${req.body.userName}" }`) {
                req.flash("mongoError", e.message = "The username entered is already taken");
                res.redirect("login");
            }
            else {
                req.flash("mongoError", e.message);
                res.redirect("login");
            }
        }
        else if (req.session.buyer === true) {
            if (e.message === `E11000 duplicate key error collection: Database.sellerregisters index: email_1 dup key: { email: "${req.body.email}" }`) {
                req.flash("mongoError", e.message = "The email id entered is already registered");
                res.redirect("login");
            }
            else if (e.message === `E11000 duplicate key error collection: Database.sellerregisters index: mobile_1 dup key: { mobile: ${req.body.mobile}.0 }`) {
                req.flash("mongoError", e.message = "The mobile number entered is already registered");
                res.redirect("login");
            }
            else if (e.message === `E11000 duplicate key error collection: Database.sellerregisters index: userName_1 dup key: { userName: "${req.body.userName}" }`) {
                req.flash("mongoError", e.message = "The username entered is already taken");
                res.redirect("login");
            }
            else {
                req.flash("mongoError", e.message);
                res.redirect("login");
            }
        }
    }

}));

module.exports = router;