const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressErr.js");
const { listingSchema } = require("../schema.js");
const { isLoggedin } = require("../middleware.js");
const Review = require("../models/review.js");
const User = require('../models/user.js'); // Assuming you have a User model for authentication

const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Session Configuration
const sessionOptions = {
    secret: "mysecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// Middleware
router.use(session(sessionOptions));
router.use(passport.initialize());
router.use(passport.session());
router.use(flash());

// Flash Messages and User Data Middleware
router.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.currUser); // Debugging: check if user is set
    next();
});

// Validate Listing Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(401, errMsg);
    } else {
        next();
    }
};



// Route to Get All Listings
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}));

// Route to Create New Listing (Form)
router.get("/new",  (req, res) => {
    if(!req.isAuthenticated()){
        req.flash("error","user must be logged in");
        res.redirect("/login");
    }
    console.log(req.user);
    res.render("listings/new.ejs");
});

// Route to Submit New Listing
router.post("/", isLoggedin, validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing is created!");
    res.redirect("/listings");
}));

// Route to Show a Specific Listing
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    console.log(id);
    console.log(listing); // Debugging: check the id
    if(!listing){
        req.flash("error", "Listing you requested does not exist");
        return redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

// Route to Edit a Listing (Form)
router.get("/:id/edit", isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Route to Update a Listing
router.put("/:id", isLoggedin, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing is updated successfully")
    res.redirect("/listings");
}));

// Route to Delete a Listing
router.delete("/:id", isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deleteList = await Listing.findByIdAndDelete(id);
    console.log(deleteList);
    req.flash("success", "Listing is deleted successfully") // similary can do for reviews
    res.redirect("/listings");
}));


// POST REVIWES
// router.post("/:id/reviews", async(req,res)=>{
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     // listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();

    //// console.log("New review saved");
   // // res.send("new review saved");
// })


module.exports = router;


