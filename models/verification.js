const mongoose = require("mongoose");

const verificationSchema = mongoose.Schema({
    verificationCode:{
        type:String,
        required:true,
    },
    verificationExpires:{
        type:Date,
        required:true,
        default:Date.now()
    },
    verificationAttempts:{
        type:Number,
        default:0
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
    },
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
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:600
    }
});


module.exports = mongoose.model("VerificationCode",verificationSchema);
