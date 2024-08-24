const initData = require("./data.js");
const mongoose = require("mongoose");
const listings = require("../models/listing.js");

main().
    then((res)=>
        {
            console.log(res);
        }).
            catch((err)=>
            {
            console.log(err);
            });

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/WanderLust");    
}

const initDB = async ()=>{
    await listings.deleteMany({});
    await listings.insertMany(initData.data)
    console.log("Database initialised");
}

initDB();

