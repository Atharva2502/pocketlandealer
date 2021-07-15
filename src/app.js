if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// requiring packages

var bodyParser = require("body-parser");
const fs = require("fs");
var multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const ExpressError = require("../utils/ExpressError");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require("passport");
const nodemailer = require("nodemailer");
const MongoStore = require('connect-mongo');
const { lock } = require("../routes/register");
const { cloudinary } = require("../cloudinary/sellerUploads");
const fast2sms = require("fast-two-sms");
const puppeteer = require("puppeteer");
var validator = require('aadhaar-validator')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

require("./db/conn");
const app = express();

// Puppeteer

// async function scrapeProduct(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     const [el] = await page.$x('//*[@id="img1"]');
//     const src = await el.getProperty('src');
//     const srcTxt = await src.jsonValue();

//     const [el2] = await page.$x('//*[@id="ctl00_ContentPlaceHolder1_Panel4"]/p/a/img');
//     const src1 = await el2.getProperty('src');
//     const srcTxt1 = await src1.jsonValue();

//     console.log({ srcTxt, srcTxt1 })

//     await page.$eval('#aspnetForm', form => form.click());

//     browser.close();
// }

// scrapeProduct("https://bhulekh.mahabhumi.gov.in/")

// Session and Flash

const URL = `${process.env.DB_URL}test` || "mongodb://localhost:27017/test"
const SECRET = process.env.SECRET || "notagoodsecret"

const sessionConfig = {
    name: 'session',
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 3
    },
    store: MongoStore.create({
        mongoUrl: URL,
        secret: SECRET,
        touchAfter: 60 * 60 * 24
    })
}
app.use(session(sessionConfig));
app.use(flash());

// setting a port

const port = process.env.PORT || 3000;

// requiring paths

const sellerRegister = require("./models/Seller Register");
const buyerRegister = require("./models/Buyer Register");
const Seller = require("./models/Seller Data");
const Buyer = require("./models/Buyer Data");
const googleSetup = require("../google-setup")

// setting paths

const staticpath = path.join(__dirname, "../");
const templatepath = path.join(__dirname, "../templates/views");
const partialspath = path.join(__dirname, "../templates/partials");

// set view engine and register partials

app.set("view engine", "ejs");
app.set("views", templatepath);
// // ejs.registerPartials(partialspath);

// using staticpath

app.use(express.static(staticpath));

// Data Parsing

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// Mongo Sanitize

app.use(mongoSanitize({
    replaceWith: "_"
}));

// Flash Middleware

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.mongoError = req.flash("mongoError");
    res.locals.loggedIn = req.flash("loggedIn");
    res.locals.updates = req.flash("updates");
    res.locals.updatee = req.flash("updatee");
    res.locals.user = req.session.username;
    next();
})

// isLoggedIn Middleware

const { requireLogin } = require("../isLoggedIn")

// Passport

app.use(passport.initialize());
app.use(passport.session());

// Helmet 

app.use(helmet({ contentSecurityPolicy: false }));

// ROUTING PAGES

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/check", async (req, res) => {
    try {
        const id = req.session.userid
        const user = await buyerRegister.findOne({ _id: id })
        const formFilled = user.formFilled[0];

        if (formFilled === "true") {
            req.flash("updates", "Successfully Logged In !!!")
            res.redirect("/buyer-dashboard");
        }
        else {
            req.flash("updatee", "You need to fill this form before proceeding")
            res.redirect("/buyer-form")
        }
    }
    catch (e) {
        req.flash("loggedIn", e.message)
        res.redirect("/login")
    }
})

// Google Login

app.get("/google-login", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/glogin", passport.authenticate("google", { failureFlash: "Invalid Credentials!!!", failureRedirect: "/login" }), async (req, res) => {
    if (req.session.firsttimeuser === true) {
        const email = req.user.email

        if (req.session.seller === true) {
            const seller = await sellerRegister.findOne({ email: email })

            if (seller) {
                req.session.userid = seller._id
                req.session.username = seller.userName;
                req.session.glogin = true

                req.flash("updates", "Successfully Logged In !!!")
                res.redirect("/seller-form");
                console.log("User logged in")
            }
            else {
                req.flash("loggedIn", "The email id entered is not registered");
                res.status(201).redirect("login");
            }
        }
        else if (req.session.buyer === true) {
            const buyer = await buyerRegister.findOne({ email: email })

            if (buyer) {
                req.session.userid = buyer._id
                req.session.username = buyer.userName;
                req.session.glogin = true

                req.flash("updates", "Successfully Logged In !!!")
                res.redirect("/buyer-form");
                console.log("User logged in")
            }
            else {
                req.flash("loggedIn", "The email id entered is not registered");
                res.status(201).redirect("login");
            }
        }
        else {
            res.redirect("/home")
        }
    }
    else if (!req.session.firsttimeuser) {
        const email = req.user.email

        if (req.session.seller === true) {
            const seller = await sellerRegister.findOne({ email: email })

            if (seller) {
                req.session.userid = seller._id
                req.session.username = seller.userName;
                req.session.glogin = true

                req.flash("updates", "Successfully Logged In !!!")
                res.redirect("/seller-dashboard");
                console.log("User logged in")
            }
            else {
                req.flash("loggedIn", "The email id entered is not registered");
                res.status(201).redirect("login");
            }
        }
        else if (req.session.buyer === true) {
            const buyer = await buyerRegister.findOne({ email: email })

            if (buyer) {
                req.session.userid = buyer._id
                req.session.username = buyer.userName;
                req.session.glogin = true

                req.flash("updates", "Successfully Logged In !!!")
                res.redirect("/check");
                console.log("User logged in")
            }
            else {
                req.flash("loggedIn", "The email id entered is not registered");
                res.status(201).redirect("login");
            }
        }
        else {
            res.redirect("/home")
        }
    }
    else {
        res.redirect("/home")
    }
})

// Mobile Otp

app.get("/checkotp", (req, res) => {
    res.render("clogin")
})

app.get("/about-us", (req, res) => {
    res.render("about-us")
})

app.get("/queries", (req, res) => {
    res.render("queries")
})

app.get("/error", (req, res) => {
    res.render("error")
})

app.get("/seller-form", requireLogin, (req, res) => {
    Seller.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send("an error occured", err)
        }
        else {
            res.render("seller-form", { items: items })
        }
    })
});

app.get("/buyer-form", requireLogin, (req, res) => {
    Buyer.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send("an error occured", err)
        }
        else {
            res.render("buyer-form", { items: items })
        }
    })
});

app.get("/buyer-dashboard", requireLogin, (req, res) => {
    const data = Seller.find({});
    data.exec(function (err, items) {
        if (err) return handleError(err);
        res.render("buyer-dash",
            { items: items }
        );
    })
})

app.get("/seller-dashboard", requireLogin, (req, res) => {
    const id = req.session.userid
    const data = Seller.find({ userid: { id: `${id}` } })
    data.exec(function (err, items) {
        if (err) return handleError(err);
        res.render("seller-dash",
            { items: items }
        );
    })
})

app.get("/useller-dashboard", requireLogin, (req, res) => {
    const id = req.session.userid
    const data = Seller.find({ userid: { id: `${id}` } })
    data.exec(function (err, items) {
        if (err) return handleError(err);
        res.render("useller-dash",
            { items: items }
        );
    })
})

app.get("/updateMob", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        res.render("seller-form")
    }
    else if (req.session.buyer === true) {
        res.render("buyer-form")
    }
    else {
        res.render("home")
    }
})

app.get("/updateEmail", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        res.render("seller-form")
    }
    else if (req.session.buyer === true) {
        res.render("buyer-form")
    }
    else {
        res.render("home")
    }
})

app.get("/updatePassword", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        res.render("seller-form")
    }
    else if (req.session.buyer === true) {
        res.render("buyer-form")
    }
    else {
        res.render("home")
    }
})

app.get("/logout", requireLogin, (req, res) => {
    req.session.userid = null
    req.session.username = null
    req.session.seller = null
    req.session.buyer = null
    req.session.firsttimeuser = null
    req.session.address = null
    req.session.passport = null
    req.session.otp = null
    req.session.glogin = null
    req.flash("success", "Successfully Logged Out !")
    res.redirect("/login");
    console.log("User logged out")
});

app.get("/logoutd", requireLogin, (req, res) => {
    req.session.userid = null
    req.session.username = null
    req.session.seller = null
    req.session.buyer = null
    req.session.firsttimeuser = null
    req.session.address = null
    req.session.passport = null
    req.session.otp = null
    req.session.glogin = null
    req.flash("success", "Successfully Logged Out !")
    res.redirect("/queries");
    console.log("User logged out")
});

app.get("/deleteAcc", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        req.session.username = null
        req.session.userid = null
        res.render("seller-form")
    }
    else if (req.session.buyer === true) {
        req.session.username = null
        req.session.userid = null
        res.render("buyer-form")
    }
    else {
        res.render("home")
    }
})

// For Dashboard

app.get("/dUpdateMob", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        res.render("seller-dash")
    }
    else if (req.session.buyer === true) {
        res.render("buyer-dash")
    }
    else {
        res.render("home")
    }
})

app.get("/dUpdateEmail", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        res.render("seller-dash")
    }
    else if (req.session.buyer === true) {
        res.render("buyer-dash")
    }
    else {
        res.render("home")
    }
})

app.get("/dUpdatePassword", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        res.render("seller-dash")
    }
    else if (req.session.buyer === true) {
        res.render("buyer-dash")
    }
    else {
        res.render("home")
    }
})

app.get("/dDeleteAcc", requireLogin, (req, res) => {
    if (req.session.seller === true) {
        res.render("seller-dash")
    }
    else if (req.session.buyer === true) {
        res.render("buyer-dash")
    }
    else {
        res.render("home")
    }
})

app.get("/reset-password/:id/:token", async (req, res, next) => {
    try {
        const uid = req.params.id;
        const utoken = req.params.token;
        // check if the id exists in the database

        if (req.session.seller === true) {
            const user = await sellerRegister.findOne({ _id: uid });

            if (user) {
                if (user.id === uid) {
                    const JWT_SECRET = process.env.JWT_SECRET
                    // we have valid id and we have a valid user with this id 
                    const secret = JWT_SECRET + user.password
                    const payload = jwt.verify(utoken, secret)
                    res.render("reset-password");
                }
                else {
                    req.flash("error", "No user with this id exits")
                    res.render("reset-password")
                }
            }
            else {
                req.flash("error", "No user with this id exits")
                res.render("reset-password")
            }
        }
        else if (req.session.buyer === true) {
            const user = await buyerRegister.findOne({ _id: uid });

            if (user) {
                if (user.id === uid) {
                    const JWT_SECRET = process.env.JWT_SECRET
                    // we have valid id and we have a valid user with this id 
                    const secret = JWT_SECRET + user.password
                    const payload = jwt.verify(utoken, secret)
                    res.render("reset-password");
                }
                else {
                    req.flash("error", "No user with this id exits")
                    res.render("reset-password")
                }
            }
            else {
                req.flash("error", "No user with this id exits")
                res.render("reset-password")
            }
        }
        else {
            req.flash("isLoggedIn", "Err! An error occured")
            res.redirect("/login")
        }
    } catch (error) {
        req.flash("isLoggedIn", error.message)
        res.redirect("/login")
    }
})

app.get("*", (req, res) => {
    res.render('error')
});

// POSTING PAGES

// Seller or Buyer

app.post("/homes", async (req, res) => {
    req.session.seller = true;
    res.redirect("/login");
})

app.post("/homeb", async (req, res) => {
    req.session.buyer = true;
    res.redirect("/login");
})


//Register

const registerRoutes = require("../routes/register");
app.use('/', registerRoutes);

//Login

const loginRoutes = require("../routes/login");
app.use('/', loginRoutes);

// Seller-Form

const sellerFormRoutes = require("../routes/seller-form");
app.use('/', sellerFormRoutes);

// Buyer-Form

const buyerFormRoutes = require("../routes/buyer-form");
app.use('/', buyerFormRoutes);

// Update Tabs

const updateMobRoutes = require("../routes/update-mob");
app.use('/', updateMobRoutes);

const updateEmailRoutes = require("../routes/update-email");
app.use('/', updateEmailRoutes);

const updatePasswordRoutes = require("../routes/update-pass");
app.use('/', updatePasswordRoutes);

const deleteRoutes = require("../routes/delete");
app.use('/', deleteRoutes);

const dashUpdateMobRoutes = require("../routes/dashupdate-mob");
app.use('/', dashUpdateMobRoutes);

const dashUpdateEmailRoutes = require("../routes/dashupdate-email");
app.use('/', dashUpdateEmailRoutes);

const dashUpdatePasswordRoutes = require("../routes/dashupdate-pass");
app.use('/', dashUpdatePasswordRoutes);

const dashDeleteRoutes = require("../routes/dashdelete");
app.use('/', dashDeleteRoutes);

// OTP Login

app.post("/sendotp", async (req, res) => {
    try {
        const mobile = req.body.mobNo

        if (req.session.seller === true) {
            const seller = await sellerRegister.findOne({ mobile: mobile });

            if (seller) {
                var minm = 100000;
                var maxm = 999999;

                let otp = Math.floor(Math.random() * (maxm - minm + 1)) + minm

                const sms = await fast2sms.sendMessage({ authorization: process.env.FAST2SMS_API_KEY, message: `OTP (One Time Password) For Logging in to pocketlandealer is ${otp}. Do not share it with anyone`, numbers: [req.body.mobNo] })

                req.session.userid = seller._id;
                req.session.username = seller.userName;
                req.session.otp = otp
                console.log(sms)
                res.redirect("/checkotp")
            }
            else {
                req.flash("loggedIn", "The Mobile Number Entered is not registered");
                res.status(201).redirect("login");
            }
        }
        else if (req.session.buyer === true) {
            const buyer = await buyerRegister.findOne({ mobile: mobile });

            if (buyer) {
                var minm = 100000;
                var maxm = 999999;

                let otp = Math.floor(Math.random() * (maxm - minm + 1)) + minm

                const sms = await fast2sms.sendMessage({ authorization: process.env.FAST2SMS_API_KEY, message: `OTP (One Time Password) For Logging in to pocketlandealer is ${otp}. Do not share it with anyone`, numbers: [req.body.mobNo] })

                req.session.userid = buyer._id;
                req.session.username = buyer.userName;
                req.session.otp = otp
                console.log(sms)
                res.redirect("/checkotp")
            }
            else {
                req.flash("loggedIn", "The Mobile Number Entered is not registered");
                res.status(201).redirect("login");
            }
        }
        else {
            res.redirect("/")
        }
    } catch (error) {
        req.flash("error", error.message);
        res.status(201).redirect("login");
    }
})

app.post("/checkotp", async (req, res) => {
    try {
        const uotp = req.body.otp
        const sotp = req.session.otp
        const id = req.session.userid

        const nuotp = parseInt(uotp)

        if (req.session.firsttimeuser === true) {
            if (req.session.seller === true) {
                const seller = await sellerRegister.findOne({ _id: id });

                if (seller) {
                    if (nuotp === sotp) {
                        req.flash("updates", "Successfully Logged In !!!")
                        res.redirect("/seller-form");
                        console.log("User logged in")
                    }
                    else {
                        req.flash("loggedIn", "The Otp entered was incorrect ! Try again");
                        res.status(201).redirect("login");
                    }
                }
                else {
                    req.flash("loggedIn", "User not registered");
                    res.status(201).redirect("login");
                }
            }
            else if (req.session.buyer === true) {
                const buyer = await buyerRegister.findOne({ _id: id });

                if (buyer) {
                    if (nuotp === sotp) {
                        req.flash("updates", "Successfully Logged In !!!")
                        res.redirect("/buyer-form");
                        console.log("User logged in")
                    }
                    else {
                        req.flash("loggedIn", "The Otp entered was incorrect ! Try again");
                        res.status(201).redirect("login");
                    }
                }
                else {
                    req.flash("loggedIn", "User not registered");
                    res.status(201).redirect("login");
                }
            }
            else {
                res.redirect("/")
            }
        }
        else if (!req.session.firsttimeuser) {
            if (req.session.seller === true) {
                const seller = await sellerRegister.findOne({ _id: id });

                if (seller) {
                    if (nuotp === sotp) {
                        req.flash("updates", "Successfully Logged In !!!")
                        res.redirect("/seller-dashboard");
                        console.log("User logged in")
                    }
                    else {
                        req.flash("loggedIn", "The Otp entered was incorrect ! Try again");
                        res.status(201).redirect("login");
                    }
                }
                else {
                    req.flash("loggedIn", "User not registered");
                    res.status(201).redirect("login");
                }
            }
            else if (req.session.buyer === true) {
                const buyer = await buyerRegister.findOne({ _id: id });

                if (buyer) {
                    if (nuotp === sotp) {
                        req.flash("updates", "Successfully Logged In !!!")
                        res.redirect("/check");
                        console.log("User logged in")
                    }
                    else {
                        req.flash("loggedIn", "The Otp entered was incorrect ! Try again");
                        res.status(201).redirect("login");
                    }
                }
                else {
                    req.flash("loggedIn", "User not registered");
                    res.status(201).redirect("login");
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
        res.status(201).redirect("login");
    }
})

// Forgot and Reset password post

app.post("/forgot-password", async (req, res) => {
    try {
        const fmail = req.body.fmail;

        if (req.session.seller === true) {
            const user = await sellerRegister.findOne({ email: fmail });

            // make sure user exists in database
            if (user) {

                if (fmail === user.email) {
                    const JWT_SECRET = process.env.JWT_SECRET
                    const secret = JWT_SECRET + user.password;
                    const payload = {
                        email: user.email,
                        id: user.id
                    }
                    const token = jwt.sign(payload, secret, { expiresIn: "5m" });
                    const link = `https://pocketlandealer.herokuapp.com/reset-password/${user.id}/${token}`

                    // mail sending step 1 --

                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD
                        }
                    });

                    // mail sending step 2 --

                    var mailoptions = {
                        from: "pocketlandealer@gmail.com",
                        to: fmail,
                        subject: "Request for Reset-Password link",
                        html:
                            `
                <div style="background-color: #EDF2FB;" class="container">
                <h1 style="color: #1D3557;font-size: 35px;text-align: center;font-weight: 200;font-family: Roboto;letter-spacing: 10px;margin-bottom: 10px;padding-top: 25px;">RESET PASSWORD</h1>
                <p style="color: #457B9D;font-size: 23px;text-align: center;margin-bottom: 3px">Hello, <i><b>${user.fullName}</b></i> we're sending you this email because ${user.email} is registered to Pocketlandealer.com</p>
                <p style="color: #457B9D;font-size: 23px;text-align: center;">Click on the button below to create a new password</p>
                <div style="margin-top: 40px;margin-bottom: 40px;text-align: center;">
                <a href="${link}" style="text-decoration: none;color: white;font-size: 25px;background-color: black;padding: 15px;border-radius: 20px;font-family: Roboto;">Reset Password</a>
                </div>
                <p style="color: grey;font-size: 17px;text-align: center;">This link will last for 5 minutes</p>
                <p style="color: #457B9D;font-size: 20px;text-align: center;">If, you didn't request a password reset, you can ignore this email your password will not be changed</p>
                <p style="color: #0077b6;font-size: 15px;text-align: center;padding-bottom: 25px;">@pocketlandealer.com</p>
                </div>`
                    };

                    // mail sending step 3

                    transporter.sendMail(mailoptions, function (err, info) {
                        if (err) {
                            console.log("error occured " + err);
                        }
                        else {
                            console.log("email sent");
                        }
                    });
                    req.flash("success", "A Password Reset Link has been sent to your Email");
                    res.redirect("/login");
                }
                else {
                    req.flash("loggedIn", "The Email Id you entered is not Registered !!!")
                    res.redirect("/login")
                }
            }
            else {
                req.flash("loggedIn", "The Email Id you entered is not Registered !!!")
                res.redirect("/login")
            }
        }
        else if (req.session.buyer === true) {
            const user = await buyerRegister.findOne({ email: fmail });

            // make sure user exists in database
            if (user) {

                if (fmail === user.email) {
                    const JWT_SECRET = process.env.JWT_SECRET
                    const secret = JWT_SECRET + user.password;
                    const payload = {
                        email: user.email,
                        id: user.id
                    }
                    const token = jwt.sign(payload, secret, { expiresIn: "5m" });
                    const link = `https://pocketlandealer.herokuapp.com/reset-password/${user.id}/${token}`

                    // mail sending step 1 --

                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD
                        }
                    });

                    // mail sending step 2 --

                    var mailoptions = {
                        from: process.env.EMAIL,
                        to: fmail,
                        subject: "Request for reset-password link",
                        html: `
                <div style="background-color: #EDF2FB;" class="container">
                <h1 style="color: #1D3557;font-size: 35px;text-align: center;font-weight: 200;font-family: Roboto;letter-spacing: 10px;margin-bottom: 10px;">RESET PASSWORD</h1>
                <p style="color: #457B9D;font-size: 23px;text-align: center;margin-bottom: 3px">Hello, <i><b>${user.fullName}</b></i> we're sending you this email because ${user.email} is Registered to Pocketlandealer.com</p>
                <p style="color: #457B9D;font-size: 23px;text-align: center;">Click on this link to create a new password</p>
                <div style="margin-top: 40px;margin-bottom: 40px;text-align: center;">
                <a href="${link}" style="text-decoration: none;color: white;font-size: 25px;background-color: #023047;padding: 15px;border-radius: 20px;font-family: Roboto;">Reset Password</a>
                </div>
                <p style="color: grey;font-size: 17px;text-align: center;">The Link will last for 5 minutes</p>
                <p style="color: #0077b6;font-size: 20px;text-align: center;">If, you didn't request a password reset, you can ignore this email</p>
                <p style="color: #0077b6;font-size: 20px;text-align: center;">Your password will not be changed</p>
                <p style="color: #0077b6;font-size: 15px;text-align: center;">@pocketlandealer.com</p>
                </div>`
                    };

                    // mail sending step 3

                    transporter.sendMail(mailoptions, function (err, info) {
                        if (err) {
                            console.log("error occured " + err);
                        }
                        else {
                            console.log("email sent");
                        }
                    });
                    req.flash("success", "A Password Reset Link has been sent to your Email");
                    res.redirect("/login");
                }
                else {
                    req.flash("loggedIn", "The Email Id you entered is not Registered !!!")
                    res.redirect("/login")
                }
            }
            else {
                req.flash("loggedIn", "The Email Id you entered is not Registered !!!")
                res.redirect("/login")
            }
        }
        else {
            res.redirect("/")
        }
    } catch (error) {
        req.flash("loggedIn", error.message)
        res.redirect("/login")
    }
})

app.post("/reset-password/:id/:token", async (req, res, next) => {
    try {
        const rid = req.params.id;
        const rtoken = req.params.token;

        const { npass, cnpass } = req.body;

        if (req.session.seller === true) {
            // check if this id exists in the database
            const ruser = await sellerRegister.findOne({ _id: rid });

            if (ruser) {
                const JWT_SECRET = process.env.JWT_SECRET
                const secret = JWT_SECRET + ruser.password;
                const payload = jwt.verify(rtoken, secret);

                // validate npass and cnpass should match 

                if (npass === cnpass) {
                    // always hash password before saving
                    let hashpassword = await bcrypt.hash(npass, 10);
                    await sellerRegister.updateOne({ password: ruser.password }, { $set: { password: hashpassword } });
                    req.flash("success", "Password Reset Successfull !!! Proceed To Login");
                    res.redirect("/login");
                }
                else {
                    req.flash("error", "The Passwords you Entered do not Match, Please try again");
                    res.render("reset-password");
                }
            }
            else {
                req.flash("error", "The Passwords you Entered do not Match, Please try again");
                res.render("reset-password");
            }
        }
        else if (req.session.buyer === true) {
            // check if this id exists in the database
            const ruser = await buyerRegister.findOne({ _id: rid });

            if (ruser) {
                const JWT_SECRET = process.env.JWT_SECRET
                const secret = JWT_SECRET + ruser.password;
                const payload = jwt.verify(rtoken, secret);

                // validate npass and cnpass should match 

                if (npass === cnpass) {
                    // always hash password before saving
                    let hashpassword = await bcrypt.hash(npass, 10);
                    await buyerRegister.updateOne({ password: ruser.password }, { $set: { password: hashpassword } });
                    req.flash("success", "Password Reset Successfull !!! Proceed To Login");
                    res.redirect("/login");
                }
                else {
                    req.flash("error", "The Passwords you Entered do not Match, Please try again");
                    res.render("reset-password");
                }
            }
            else {
                req.flash("error", "The Passwords you Entered do not Match, Please try again");
                res.render("reset-password");
            }
        }
        else {
            res.redirect("/")
        }

    } catch (error) {
        req.flash("isLoggedIn", error.message);
        res.redirect("/login");
    }
})

// Send Request

app.post("/send-request", requireLogin, async (req, res) => {
    try {
        const sid = req.body.send
        const tsid = sid.trim();
        const seller = await Seller.findOne({ _id: tsid })
        const fmail = seller.userdata.email

        const bid = req.session.userid
        const buyer = await Buyer.findOne({ userid: { id: `${bid}` } })

        // mail sending step 1 --

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        // mail sending step 2 --

        var mailoptions = {
            from: "pocketlandealer@gmail.com",
            to: fmail,
            subject: "Interested in Buying your Plot",
            html: `
            // <html>
            // <head>
            // <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
            // </head>
            // <body>
            // <div style="background-color: #EDF2FB;padding: 30px;" class="container">
            // <h1 style="text-align: center;font-family: 'Roboto';font-size: 50px;font-weight: 400;margin-top: 0;letter-spacing: 2x;">Hello, ${seller.userdata.firstName}</h1>
            // <p style="text-align: center;font-size: 18px">This mail has been sent to inform you that <span style="padding-left: 5px;padding-right: 5px;padding-top: 5px;padding-bottom: 5px;color: white;background-color: black;border-radius: 5px;"><i>${buyer.userdata.firstName} ${buyer.userdata.middleName} ${buyer.userdata.lastName}</i></span> has shown interest in buying your plot</p>
            // <p style="text-align: center;font-size: 19px;padding-bottom: 30px;">Given below are the contact details of ${buyer.userdata.firstName}</p>
            // <div style="text-align: center; margin-top: 0;">
            // <img src="${buyer.userdata.userDocs.profilepic.url}" style="border-radius: 50%; width: 150px; height: 150px; border-width: 2px; border-style: solid; border-color: #09aacc;">
            // </div>
            // <p style="text-align: center;font-family: 'Roboto';font-size: 21px"><span style="padding-left: 17px;padding-right: 17px;padding-top: 8px;padding-bottom: 8px;color: white;background-color: black;border-radius: 2px;"><i style="font-weight: 200;">Mobile No</i> | ${buyer.userdata.mobNo}</span></p>
            // <p style="text-align: center;font-family: 'Roboto';font-size: 21px"><span style="padding-left: 17px;padding-right: 17px;padding-top: 8px;padding-bottom: 8px;color: white;background-color: black;border-radius: 2px;"><i style="font-weight: 200;">Email Address</i> | ${buyer.userdata.email}</span></p>
            // <form action-xhr="https://pocketlandealer.herokuapp.com/send-docs" method="POST">
            // <div style="text-align: center;">
            // <input type="text" value="${buyer._id}" name="buyerid" style="display: none;">
            // <button type="submit" value="${seller._id}" name="send" style="text-decoration: none;color: white;font-size: 25px;background-color: black;padding: 15px;border-radius: 20px;font-family: Roboto;">Send Docs</button>
            // </div>
            // </form>
            // <p style="text-align: center;font-size: 18px;padding-top: 40px;">Please do contact on the above details as early as possible</p>
            // <p style="text-align: center;font-family: 'Roboto';font-size: 20px">Thank You !</p>
            // <p style="text-align: center;font-size: 15px";>@pocketlandealer.com</p>
            // </div>
            // </body>
            // </html>
            <html ⚡4email data-css-strict>
            <head>
            <meta charset="utf-8">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <style amp4email-boilerplate>body{visibility:hidden}</style>
            <style amp-custom>
            h1 {
            margin: 1rem;
            }   
            </style>
            </head>
            <body>
            <h1>Hello, I am an AMP EMAIL!</h1>
            </body>
            </html>`
        };

        // mail sending step 3

        transporter.sendMail(mailoptions, async (err, info) => {
            if (err) {
                console.log("error occured " + err);
            }
            else {
                let viewcount = seller.viewcount + 1
                await Seller.updateOne({ _id: tsid }, { $set: { viewcount: viewcount } });

                console.log("email sent");

                req.flash("success", "An Email has been sent to the Owner for your Request");
                res.redirect("/buyer-dashboard");
            }
        });

        const message = await fast2sms.sendMessage({ authorization: process.env.FAST2SMS_API_KEY, message: `A buyer is interested in your plot, so check your email for further details`, numbers: [seller.userdata.mobNo] })

    } catch (error) {
        req.flash("updatee", error.message)
        res.redirect("/buyer-dashboard")
    }
})

app.post("/send-docs", async (req, res) => {
    try {
        const sid = req.body.send
        const tsid = sid.trim();
        const seller = await Seller.findOne({ _id: tsid })
        const fmail = seller.userdata.email

        let utara = seller.userdata.userDocs.utara.url
        let mutation = seller.userdata.userDocs.mutation.url
        let searchreport = seller.userdata.userDocs.searchreport.url

        let utaraname = seller.userdata.userDocs.utara.filename
        let mutationname = seller.userdata.userDocs.mutation.filename
        let searchreportname = seller.userdata.userDocs.searchreport.filename

        const buyerid = req.body.buyerid
        const buyerdata = await Buyer.findOne({ _id: `${buyerid}` })
        const buyermail = buyerdata.userdata.email

        // mail sending step 1 --

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        // mail sending step 2 --

        var mailoptions = {
            from: "pocketlandealer@gmail.com",
            to: buyermail,
            subject: "Documents of the plot you requested",
            html: `<div style="background-color: #EDF2FB;padding: 30px;" class="container">
            <h1 style="text-align: center;font-family: 'Roboto';font-size: 50px;font-weight: 400;margin-top: 0;letter-spacing: 2x;">Hello, ${buyerdata.userdata.firstName}</h1>
            <p style="text-align: center;font-size: 18px">This is mail from ${seller.userdata.firstName} ${seller.userdata.middleName} ${seller.userdata.lastName} via pocketlandealer@gmail.com as you have shown interest in the plot so in response to your request, here I have atttached all the necessary documents</p>
            <div style="text-align: center;">
            <p style="text-align: center;font-size: 18px;padding-top: 10px;">So please verify them and let me know about your further plan</p>
            <p style="text-align: center;font-family: 'Roboto';font-size: 20px">Thank You !</p>
            <p style="text-align: center;font-size: 15px";>@pocketlandealer.com</p>
            </div>`,
            attachments: [{
                filename: utaraname.pdf,
                href: utara
            }, {
                filename: mutationname.pdf,
                href: mutation
            }, {
                filename: searchreportname.pdf,
                href: searchreport
            }]
        };

        // mail sending step 3

        transporter.sendMail(mailoptions, async (err, info) => {
            if (err) {
                console.log("error occured " + err);
            }
            else {
                let viewcount = seller.viewcount + 1
                await Seller.updateOne({ _id: tsid }, { $set: { viewcount: viewcount } });

                console.log("email sent");
                res.redirect("/");
            }
        });

    } catch (error) {
        console.log(error.message)
        res.redirect("/login")
    }
})

// Delete Seller Form

app.post("/delete-seller", requireLogin, async (req, res) => {
    try {
        const add = req.body.delete

        const seller = await Seller.findOne({ "userdata.add": add });

        if (seller) {
            const userid = seller._id
            const data = await Seller.findOne({ _id: userid })
            const detaildata = data.userdata.userDocs

            cloudinary.uploader.destroy(detaildata.utara.filename)
            cloudinary.uploader.destroy(detaildata.profilepic.filename)
            cloudinary.uploader.destroy(detaildata.mutation.filename)
            cloudinary.uploader.destroy(detaildata.searchreport.filename)
            cloudinary.uploader.destroy(detaildata.plotimages.plotimage1.filename)
            cloudinary.uploader.destroy(detaildata.plotimages.plotimage2.filename)
            cloudinary.uploader.destroy(detaildata.plotimages.plotimage3.filename)

            Seller.findByIdAndRemove(userid, function (err, docs) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Removed User : ", docs);
                }
            })
            req.flash("updates", "The form was Deleted Successfully !!!")
            res.redirect("/seller-dashboard")
        }
        else {
            req.flash("updatee", "Err! An error occured")
            res.redirect("/seller-dashboard");
        }
    }

    catch (error) {
        req.flash("updatee", "Err! An error occured")
        res.redirect("/seller-dashboard");
    }
})

// Update Seller Form

app.post("/update", requireLogin, (req, res) => {
    const add = req.body.update

    if (req.session.glogin === true) {
        req.session.passport.address = add
        res.redirect("/useller-dashboard")
    }
    else if (!req.session.glogin === true) {
        req.session.address = add
        res.redirect("/useller-dashboard")
    }
    else {
        res.redirect("/seller-dashboard")
    }
})

app.post("/update-seller", requireLogin, async (req, res) => {
    try {
        if (req.session.passport) {
            const padd = req.session.passport.address
            const user = await Seller.findOne({ "userdata.add": padd });

            if (user) {
                const userid = user._id

                const { firstName, middleName, lastName, mobile, email, price } = req.body

                await Seller.updateOne({ _id: userid }, { $set: { "userdata.firstName": firstName } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.middleName": middleName } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.lastName": lastName } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.mobNo": mobile } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.email": email } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.pricePlot": price } });

                req.flash("updates", "Seller Data Updated Successfully !")
                res.redirect("/seller-dashboard")
            }
            else {
                req.flash("updatee", "Err! An error occured")
                res.redirect("/seller-dashboard")
            }

        }
        else if (req.session.address) {
            const add = req.session.address
            const user = await Seller.findOne({ "userdata.add": add });

            if (user) {
                const userid = user._id

                const { firstName, middleName, lastName, mobile, email, price } = req.body

                await Seller.updateOne({ _id: userid }, { $set: { "userdata.firstName": firstName } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.middleName": middleName } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.lastName": lastName } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.mobNo": mobile } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.email": email } });
                await Seller.updateOne({ _id: userid }, { $set: { "userdata.pricePlot": price } });

                req.flash("updates", "Seller Data Updated Successfully !")
                res.redirect("/seller-dashboard")
            }
            else {
                req.flash("updatee", "Err! An error occured")
                res.redirect("/seller-dashboard")
            }

        }
        else {
            req.flash("updatee", "An error occured")
            res.redirect("/seller-dashboard")
        }
    } catch (error) {
        req.flash("updatee", error.message)
        res.redirect("/seller-dashboard")
    }
})

// listening on port

app.listen(port, () => {
    console.log(`Connected to port - ${port}`);
});