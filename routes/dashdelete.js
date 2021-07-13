const express = require("express");
const router = express.Router();
const sellerRegister = require("../src/models/Seller Register");
const buyerRegister = require("../src/models/Buyer Register");
const Seller = require("../src/models/Seller Data");
const Buyer = require("../src/models/Buyer Data");
const { cloudinary } = require("../cloudinary/sellerUploads");

// isLoggedIn Middleware

const { requireLogin } = require("../isLoggedIn");

// Post

router.post("/dDeleteAcc", requireLogin, async (req, res) => {
    try {
        let mobNo = req.body.mobileNo;

        if (req.session.seller === true) {
            let mobileUser = await sellerRegister.findOne({ mobile: mobNo });

            if (mobileUser) {
                let mobileSave = mobileUser.mobile;
                let nmobNo = parseInt(mobNo);
                let mobid = mobileUser.id;

                if (mobileSave === nmobNo) {
                    const sellerdata = await Seller.find({ userid: { id: mobid } })
                    const num = sellerdata.length
                    if (num > 0) {
                        for (let i = 0; i < num; i++) {
                            const sid = sellerdata[i]._id

                            cloudinary.uploader.destroy(sellerdata[i].userdata.userDocs.utara.filename)
                            cloudinary.uploader.destroy(sellerdata[i].userdata.userDocs.profilepic.filename)
                            cloudinary.uploader.destroy(sellerdata[i].userdata.userDocs.mutation.filename)
                            cloudinary.uploader.destroy(sellerdata[i].userdata.userDocs.searchreport.filename)
                            cloudinary.uploader.destroy(sellerdata[i].userdata.userDocs.plotimages.plotimage1.filename)
                            cloudinary.uploader.destroy(sellerdata[i].userdata.userDocs.plotimages.plotimage2.filename)
                            cloudinary.uploader.destroy(sellerdata[i].userdata.userDocs.plotimages.plotimage3.filename)

                            Seller.findByIdAndRemove(sid, function (err, docs) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("Removed User : ", docs);
                                }
                            })
                        }
                    }
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
                req.flash("updatee", "The mobile number you entered is not registered.")
                res.redirect("/seller-dashboard");
            }
        }

        else if (req.session.buyer === true) {
            let mobileUser = await buyerRegister.findOne({ mobile: mobNo });

            if (mobileUser) {
                let mobileSave = mobileUser.mobile;
                let nmobNo = parseInt(mobNo);
                let mobid = mobileUser.id;

                if (mobileSave === nmobNo) {
                    const buyerdata = await Buyer.findOne({ userid: { id: mobid } })
                    const bid = buyerdata._id

                    cloudinary.uploader.destroy(buyerdata.userdata.userDocs.profilepic.filename)

                    Buyer.findByIdAndRemove(bid, function (err, docs) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Removed User : ", docs);
                        }
                    })

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
                req.flash("updatee", "The mobile number you entered is not registered.")
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