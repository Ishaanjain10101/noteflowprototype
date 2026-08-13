const express = require("express");
const { auth } = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");
const addNote = require("../controllers/addNote");
const router = express.Router();

router.get("/add",auth,authR,(req,res)=>{
    res.render("add",{
        signedIn : req.signedIn,
        title:"Add",
    });
})

router.post("/add",auth,authR,addNote)

module.exports = router;