module.exports.isLoggedin = (req, res, next) => {    
    console.log(req.path, "..", req.originalUrl);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Save the requested URL
        console.log("middlewaare");
        console.log("Redirect URL set to:", req.session.redirectUrl);
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();   
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {    
        res.locals.redirectUrl = req.session.redirectUrl; // Set redirect URL for later use
    } 
    next();
};
