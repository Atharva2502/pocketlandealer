const express = require("express");
const router = express.Router();
const Seller = require("../src/models/Seller Data");
const sellerRegister = require("../src/models/Seller Register");
var multer = require("multer");
var validator = require('aadhaar-validator')

// Cloudinary Storage

const { storage } = require("../cloudinary/sellerUploads");
const upload = multer({ storage });

// isLoggedIn Middleware

const { requireLogin } = require("../isLoggedIn")

// Post

const fupload = upload.fields([{ name: "utara", maxCount: 1 }, { name: "profilephoto", maxCount: 1 }, { name: "mutation", maxCount: 1 }, { name: "searchreport", maxCount: 1 }, { name: "plotimages", maxCount: 3 }])
router.post("/seller-form", requireLogin, fupload, (req, res, next) => {
    var SellerObj = {
        viewcount: 0,
        Title: "Seller Form",
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
            corAdd: req.body.corrAdd,
            add: req.body.add,
            div: req.body.division,
            district: req.body.district,
            taluka: req.body.taluka,
            village: req.body.village,
            surveyNo: req.body.surveyNo,
            groupNo: req.body.groupNo,
            areaPlot: req.body.areaPlot,
            pricePlot: req.body.pricePlot,
            userDocs: {
                utara: {
                    url: req.files.utara[0].path,
                    filename: req.files.utara[0].filename
                },
                profilepic: {
                    url: req.files.profilephoto[0].path,
                    filename: req.files.profilephoto[0].filename
                },
                mutation: {
                    url: req.files.mutation[0].path,
                    filename: req.files.mutation[0].filename
                },
                searchreport: {
                    url: req.files.searchreport[0].path,
                    filename: req.files.searchreport[0].filename
                },
                plotimages: {
                    plotimage1: {
                        url: req.files.plotimages[0].path,
                        filename: req.files.plotimages[0].filename
                    },
                    plotimage2: {
                        url: req.files.plotimages[1].path,
                        filename: req.files.plotimages[1].filename
                    },
                    plotimage3: {
                        url: req.files.plotimages[2].path,
                        filename: req.files.plotimages[2].filename
                    }
                }
            }

        }
    }
    const aadharNo = req.body.aadharNo
    if (validator.isValidNumber(`${aadharNo}`) === true) {
        Seller.create(SellerObj, async (err, item) => {
            if (err) {
                req.flash("mongoError", err.message = "The plot address entered is already posted");
                res.redirect("/seller-form");
            }
            else {
                res.redirect("/seller-dashboard");
            }
        })
    }
    else {
        req.flash("mongoError", "Invalid Aadhar Number");
        res.redirect("/seller-form");
    }
})

module.exports = router;