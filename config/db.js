const mongoose = require("mongoose");

exports.connectDB = ()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB Connected")
    }).catch(err=>{
        console.error("Error: ",err);
    })   
}
