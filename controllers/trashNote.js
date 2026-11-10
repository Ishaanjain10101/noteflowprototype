const NoteModel = require("../models/notes");

const NOTE_EXPIRATION = 1000 * 60 * 60 * 24 * 30;

module.exports = async (req,res)=>{
    const noteId = req.params.noteId;
    const userId = req.userId;
    await NoteModel.updateOne({_id:noteId,userId:userId},{$set:{recentlyDeleted:true,noteExpires:NOTE_EXPIRATION}});
    res.status(200).json("Done");
}
