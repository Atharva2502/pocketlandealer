const express = require("express");
const router = express.Router();
const sellerRegister = require("../src/models/Seller Register");
const buyerRegister = require("../src/models/Buyer Register");
const bcrypt = require("bcryptjs");

// isLoggedIn Middleware

const { requireLogin } = require("../isLoggedIn");

// Post

router.post("/dUpdatePassword", requireLogin, async (req, res) => {
    try {
        let current_mob = req.body.currentMob;
        let current_password = req.body.currPass;
        let new_password = req.body.newPass;
        let cnew_password = req.body.checkNewPass;

        if (req.session.seller === true) {
            let userPassword = await sellerRegister.findOne({ mobile: current_mob });

            if (userPassword) {
                let checkPass = bcrypt.compareSync(current_password, userPassword.password);

                if (checkPass === true) {
                    if (new_password === cnew_password) {
                        let hashcpassword = await bcrypt.hash(cnew_password, 10);
                        await sellerRegister.updateOne({ password: userPassword.password }, { $set: { password: hashcpassword } });
                        req.flash("updates", "Password updated successfully !!!")
                        res.redirect("/seller-dashboard");
                    }
                    else {
                        req.flash("updatee", "The passwords entered do not match, Please try again")
                        res.redirect("/seller-dashboard");
                    }
                }
                else {
                    req.flash("updatee", "The password entered was not found")
                    res.redirect("/seller-dashboard");
                }
            }
            else {
                req.flash("updatee", "The mobile number entered is not registered")
                res.redirect("/seller-dashboard");
            }
        }

        else if (req.session.buyer === true) {
            let userPassword = await buyerRegister.findOne({ mobile: current_mob });

            if (userPassword) {
                let checkPass = bcrypt.compareSync(current_password, userPassword.password);

                if (checkPass === true) {
                    if (new_password === cnew_password) {
                        let hashcpassword = await bcrypt.hash(cnew_password, 10);
                        await buyerRegister.updateOne({ password: userPassword.password }, { $set: { password: hashcpassword } });
                        req.flash("updates", "Password updated successfully !!!")
                        res.redirect("/buyer-dashboard");
                    }
                    else {
                        req.flash("updatee", "The passwords entered do not match, Please try again")
                        res.redirect("/buyer-dashboard");
                    }
                }
                else {
                    req.flash("updatee", "The password entered was not found")
                    res.redirect("/buyer-dashboard");
                }
            }
            else {
                req.flash("updatee", "The mobile number entered is not registered")
                res.redirect("/buyer-dashboard");
            }
        }

        else {
            if (req.session.seller === true) {
                req.flash("updatee", "Err! An error occured")
                res.redirect("/seller-dashboard")
            }
            else if (req.session.buyer === true) {
                req.flash("updatee", "Err! An error occured")
                res.redirect("/buyer-dashboard")
            }
        }

    } catch (error) {
        if (req.session.seller === true) {
            req.flash("updatee", error.message)
            res.redirect("/seller-dashboard");
        } else if (req.session.buyer === true) {
            req.flash("updatee", error.message)
            res.redirect("/buyer-dashboard");
        }
    }
})

module.exports = router;