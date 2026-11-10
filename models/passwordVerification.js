const mongoose = require("mongoose");

const verificationSchema = mongoose.Schema({
    verificationCode:{
        type:String,
        required:true,
    },
    verificationExpires:{
        type:Date,
        required:true
    },
    verificationAttempts:{
        type:Number,
        default:0
    },
    lastSentAt:{
        type:Date,
        required:true
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
    verified:{
        type:Boolean,
        default:false
    },
},{timestamps:true});

verificationSchema.index({ verificationExpires: 1 }, { expireAfterSeconds: 0 });


module.exports = mongoose.model("PasswordVerificationCode",verificationSchema);
