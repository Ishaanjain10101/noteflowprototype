const express = require("express");
const { auth } = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");
const router = express.Router();
const NoteModel = require("../models/notes");
const checkUserNote = require("../middlewares/checkUserNote");

router.delete("/note/trash/:noteId",auth,authR,checkUserNote,async (req,res)=>{
    const id = req.params.noteId;
    await NoteModel.deleteOne({
        _id : id,
        userId : req.userId
    });
    res.status(200).json();
})

module.exports = router;