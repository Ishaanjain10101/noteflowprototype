const mongoose = require("mongoose");

const verificationSchema = mongoose.Schema({
    verificationCode:{
        type:String,
        required:true,
    },
    verificationExpires:{
        type:Date,
        required:true,
        default:Date.now()+(60*10*1000)
    },
    verificationAttempts:{
        type:Number,
        default:0
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
},{timestamps:true});


module.exports = mongoose.model("PasswordVerificationCode",verificationSchema);
