const NoteModel = require("../models/notes");

async function updateFav(req,res){
    const noteId = req.params.noteId;
    const fav = req.body.favourite;
    await NoteModel.findByIdAndUpdate(noteId,{$set:{favourite:fav}});
    res.status(202).json();
}

module.exports = updateFav;