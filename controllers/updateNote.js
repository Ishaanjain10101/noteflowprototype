const NoteModel = require("../models/notes");
async function updateNote(req,res) {
    const noteId = req.params.noteId;
    const oldNote = await NoteModel.findOne({_id:noteId});
    const title = req.body.title;
    const content = req.body.content;
    if(!(title === oldNote.title && content === oldNote.content)){
        await NoteModel.updateOne({_id:noteId},{title:title,content:content});
    }
    res.status(200).json({});
}
module.exports = updateNote;