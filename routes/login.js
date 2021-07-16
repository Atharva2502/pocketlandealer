const express = require("express");
const router = express.Router();
const sellerRegister = require("../src/models/Seller Register");
const buyerRegister = require("../src/models/Buyer Register");
const bcrypt = require("bcryptjs");
const Buyer = require("../src/models/Buyer Data");

// Post

router.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const pass = req.body.pass;

        if (req.session.firsttimeuser === true) {
            if (req.session.seller === true) {
                const seller = await sellerRegister.findOne({ userName: username });

                if (seller) {
                    const isSeller = await bcrypt.compare(pass, seller.password);
                    if (isSeller === true) {
                        req.session.userid = seller._id;
                        req.session.username = seller.userName;

                        console.log("User logged in")
                        req.flash("updates", "Successfully logged in !!!")
                        res.redirect("/seller-form");
                    }
                    else {
                        req.flash("error", "The password entered was incorrect");
                        res.redirect("/login");
                    }
                }
                else {
                    req.flash("error", "The username entered was incorrect");
                    res.redirect("/login");
                }
            }
            else if (req.session.buyer === true) {
                const buyer = await buyerRegister.findOne({ userName: username });

                if (buyer) {
                    const isBuyer = await bcrypt.compare(pass, buyer.password);
                    if (isBuyer === true) {
                        req.session.userid = buyer._id;
                        req.session.username = buyer.userName;

                        console.log("User logged in")
                        req.flash("updates", "Successfully logged in !!!")
                        res.redirect("/buyer-form");
                    }
                    else {
                        req.flash("error", "The password entered was incorrect");
                        res.redirect("/login");
                    }
                }
                else {
                    req.flash("error", "The username entered was incorrect");
                    res.redirect("/login");
                }
            }
            else {
                res.redirect("/")
            }
        }
        else if (!req.session.firsttimeuser) {
            if (req.session.seller === true) {
                const seller = await sellerRegister.findOne({ userName: username });

                if (seller) {
                    const isSeller = await bcrypt.compare(pass, seller.password);
                    if (isSeller === true) {
                        req.session.userid = seller._id;
                        req.session.username = seller.userName;

                        console.log("User logged in")
                        req.flash("updates", "Successfully logged in !!!")
                        res.redirect("/seller-dashboard");
                    }
                    else if (isSeller === false) {
                        req.flash("error", "The password entered was incorrect");
                        res.redirect("/login");
                    }
                    else {
                        req.flash("error", "Err! An error occured");
                        res.redirect("/login");
                    }
                }
                else if (!seller) {
                    req.flash("error", "The username entered was incorrect");
                    res.redirect("/login");
                }
                else {
                    req.flash("error", "Err! An error occured");
                    res.redirect("/login");
                }
            }
            else if (req.session.buyer === true) {
                const buyer = await buyerRegister.findOne({ userName: username });

                if (buyer) {
                    const isBuyer = await bcrypt.compare(pass, buyer.password);
                    if (isBuyer === true) {
                        req.session.userid = buyer._id;
                        req.session.username = buyer.userName;

                        console.log("User logged in")
                        res.redirect("/check");
                    }
                    else {
                        req.flash("error", "The password entered was incorrect");
                        res.redirect("/login");
                    }
                }
                else {
                    req.flash("error", "The username entered was incorrect");
                    res.redirect("/login");
                }
            }
            else {
                res.redirect("/")
            }
        }
        else {
            res.redirect("/")
        }

    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/login");
    }
});

module.exports = router;