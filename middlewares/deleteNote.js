const NoteModel = require("../models/notes");
async function deleteNote(req,res,next){
    const userId = req.userId;
    await NoteModel.deleteMany({userId:userId,recentlyDeleted:true,updatedAt:{$lt:new Date(Date.now()-  30 * 24 * 60 * 60 * 1000) }});
    next();
}

module.exports = deleteNote