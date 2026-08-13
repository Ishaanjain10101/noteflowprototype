const NoteModel = require("../models/notes");

async function checkUserNote(req,res,next){
    const userId = req.userId;
    const noteId = req.params.noteId;
    const response = await NoteModel.findOne({userId:userId,_id:noteId});
    if(response){
        next();
    }
    else{
        res.redirect("/");
    }
}

module.exports = checkUserNote;