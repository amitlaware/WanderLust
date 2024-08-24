const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const WrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErr.js")
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main().then(()=>{
    console.log("Connection Successful")
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/WanderLust");
}

app.get("/", (req,res)=>{
    res.send("root working properly");
})

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(401,result.error)
    }else{
        next()
    }
    
}

app.get("/listings", WrapAsync( async(req, res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs",{allListing});
    }));
    
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})                                      

app.post("/listings", validateListing,WrapAsync( async(req,res,next)=>{   
        let result = listingSchema.validate(req.body);
        // console.log(result);
        if(result.err){
            throw new ExpressError(401,result.error)
        }
        const newListing = new Listing(req.body.listing);     
        await newListing.save();
        // res.redirect("/listings");  

}))

app.get("/listings/:id", WrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    // console.log(id);
    res.render("listings/show.ejs",{ listing });
}))
    

app.get("/listings/:id/edit",WrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{ listing });
}))

app.put("/listings/:id",validateListing,WrapAsync( async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
}))

app.delete("/listings/:id",WrapAsync(async(req,res)=>{
    let {id} = req.params;
    const deleteList = await Listing.findByIdAndDelete(id);
    // console.log(deleteList);
    res.redirect("/listings")
}))

// POST REVIWES
app.post("/listings/:id/reviews", async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    // console.log("New review saved");
    // res.send("new review saved");
})

// app.get("/testlisting", async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"New Vill",
//         description:"BytheBeach",
//         price:1200,
//         location:"Mumbai",
//         country:"India",
//     })
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("SampleTesting");
// })

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not found!"));
});
app.use((err,req,res,next)=>{
    // let {statusCode=500, message='Something went wrong'} = err;
    res.render("error.ejs",{err})
    // res.status(statusCode).send(message);
})

app.listen(8080,()=>{
    console.log("Listening on port 8080...");
})