const NoteModel = require("../models/notes");

async function addNote(req,res){
    const body = req.body;
    if(!body || !body.title || !body.content){
        res.status(400).json();
    }
    
    const userId = req.userId;
    const note = new NoteModel({
        userId:userId,
        title:body.title,
        content:body.content,
        favourite:body.favourite
    });
    await note.save();
    res.status(200).json();
}

module.exports = addNote;