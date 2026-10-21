const NoteModel = require("../models/notes");
const userModel = require("../models/usermodel");

async function profile(req,res){
    const user = await userModel.findById(req.userId);
    const favNumber = (await NoteModel.find({userId:req.userId , favourite:true , recentlyDeleted:false})).length;
    const totalNumber = (await NoteModel.find({userId:req.userId , recentlyDeleted:false})).length;
    const pinnedNumber = (await NoteModel.find({userId:req.userId , pinned:true , recentlyDeleted:false})).length;
    res.render("profile",{
        signedIn : req.signedIn,
        title:"Profile",
        email:user.email,
        name:user.name,
        favNumber,
        totalNumber,
        pinnedNumber,
        createdAt:user.createdAt,
        userId:req.userId
    })
}

module.exports = profile;