const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");
const updateFav = require("../controllers/updatefav");
const checkUserNote = require("../middlewares/checkUserNote");
const updateNote = require("../controllers/updateNote");
const NoteModel = require("../models/notes");

router.patch("/note/:noteId",auth,authR,checkUserNote,updateFav);

router.patch("/note/updateData/:noteId",auth,authR,checkUserNote,updateNote);

router.patch("/note/pin/:noteId",auth,authR,checkUserNote,async (req,res)=>{
    const noteId = req.params.noteId;
    await NoteModel.findOneAndUpdate({
        _id:noteId,
        userId:req.userId
    },{$set:{
        pinned:req.body.pinned
    }});
    res.status(202).json();
});


module.exports = router;