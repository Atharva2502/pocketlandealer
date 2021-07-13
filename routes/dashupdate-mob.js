const express = require("express");
const router = express.Router();
const sellerRegister = require("../src/models/Seller Register");
const buyerRegister = require("../src/models/Buyer Register");

// isLoggedIn Middleware

const { requireLogin } = require("../isLoggedIn");

// Post

router.post("/dUpdateMob", requireLogin, async (req, res) => {
    try {
        let current_mob = req.body.currentMob;
        let new_mob = req.body.newMob;

        if (req.session.seller === true) {
            const seller = await sellerRegister.findOne({ mobile: current_mob });

            if (seller) {

                var dmobile = seller.mobile;
                var ncurrent_mob = parseInt(current_mob)
                var nnew_mob = parseInt(new_mob)

                if (dmobile === ncurrent_mob) {
                    await sellerRegister.updateOne({ mobile: dmobile }, { $set: { mobile: nnew_mob } });
                    req.flash("updates", "Mobile number updated successfully !!!")
                    res.redirect("/seller-dashboard");
                }
            }
            else {
                req.flash("updatee", "The mobile number entered is not registered")
                res.redirect("/seller-dashboard");
            }
        }

        else if (req.session.buyer === true) {
            const buyer = await buyerRegister.findOne({ mobile: current_mob });
            console.log(buyer)

            if (buyer) {

                var dmobile = buyer.mobile;
                var ncurrent_mob = parseInt(current_mob)
                var nnew_mob = parseInt(new_mob)

                if (dmobile === ncurrent_mob) {
                    await buyerRegister.updateOne({ mobile: dmobile }, { $set: { mobile: nnew_mob } });
                    req.flash("updates", "Mobile number updated successfully !!!")
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