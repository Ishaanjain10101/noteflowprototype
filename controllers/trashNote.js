const NoteModel = require("../models/notes");
module.exports = async (req,res)=>{
    const noteId = req.params.noteId;
    const userId = req.userId;
    await NoteModel.updateOne({_id:noteId,userId:userId},{$set:{recentlyDeleted:true}});
    res.status(200).json("Done");
}
