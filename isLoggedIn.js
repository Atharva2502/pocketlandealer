module.exports.requireLogin = (req, res, next) => {
    if (!req.session.userid) {
        req.flash("loggedIn", "You must be Logged in first");
        return res.redirect("/login");
    }
    next();
}