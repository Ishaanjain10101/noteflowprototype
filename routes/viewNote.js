const express = require("express");
const { auth } = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");
const router = express.Router();
const NoteModel = require("../models/notes");
const checkUserNote = require("../middlewares/checkUserNote");

router.get("/note/:noteId",auth,authR,checkUserNote,async (req,res)=>{
    const id = req.params.noteId;
    const note = await NoteModel.findOne({
        _id : id,
        userId : req.userId
    });
    res.render("viewMore",{
        title:note.title,
        content:note.content,
        noteId:note._id
    });
});

module.exports = router;