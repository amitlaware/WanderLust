const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const session = require("express-session");

const flash = require("connect-flash");
const wrapasync = require("../utils/wrapAsync.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { saveRedirectUrl } = require("../middleware.js");


const sessionOptions = {
    secret:"mysecretstring",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
}


router.use(session(sessionOptions));
router.use(passport.initialize());
router.use(passport.session());
router.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


router.use((req, res, next) => {
    res.locals.success = req.flash("success");    
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    console.log("Hallllllllll");
    console.log(res.locals.currUser );
    next();
});

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup",wrapasync( async (req,res)=>{
   try{
    let {username,email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to WanderLust");
        res.redirect("/listings");
    })
    
   }catch(err){
        req.flash("error", err.message);
        console.log(err);
        res.redirect("/signup");
   }
}))

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})


router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local",{
            failureRedirect:"/login",
            failureFlash: true ,
        }),
    async(req,res)=>{
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
})

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You're logged out");
        res.redirect("/listings");
    });
});

module.exports = router;