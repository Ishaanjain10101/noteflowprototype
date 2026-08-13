const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:[3,"Name is too short"],
        maxlength:[50,"Name is too long"],
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
})

module.exports = mongoose.model("users",userSchema);