const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId
    },
    title:{
        type:String,
        trim:true,
        required:true
    },
    content:{
        type:String,
        trim:true,
        required:true
    },
    projects:{
        type:String,
        trim:true,
        default:null
    },
    favourite:{
        type:Boolean,
        default:false
    },
    pinned:{
        type:Boolean,
        default:false,
    },
    recentlyDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

module.exports = mongoose.model("Note",noteSchema);