const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingSchema = new mongoose.Schema({
    title: {type:String},
    description: {type:String},
    image:{       
        filename:{type:String},
        url:{ type: String }
    },
    price: {type:Number},
    location: {type:String},
    country: {type:String},
    reviews:[
       {
        type:Schema.Types.ObjectId,
        ref:"Review",
       }
    ]
});

module.exports = mongoose.model("Listing", listingSchema);
