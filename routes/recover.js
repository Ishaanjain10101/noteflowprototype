const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");
const checkUserNote = require("../middlewares/checkUserNote");
const NoteModel = require("../models/notes");

router.patch("/note/trash/recover/:noteId",auth,authR,checkUserNote,async (req,res)=>{
    const id = req.params.noteId;
    const note = await NoteModel.findOneAndUpdate({
        _id : id,
        userId : req.userId
    },{$set:{recentlyDeleted:false}});
    res.status(200).json();
})


module.exports = router;
