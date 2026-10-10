require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");

const signup = require("./routes/signup");
const login = require("./routes/login");
const add  = require("./routes/add");
const viewNote = require("./routes/viewNote");
const viewNoteTrash = require("./routes/viewNoteTrash");
const update = require("./routes/update");
const deleteNoteTemp = require("./routes/deleteNoteTemp");
const deleteNoteForever = require("./routes/deleteNoteForever");
const recover = require("./routes/recover");
const signout = require("./routes/signout");
const emailVerify = require("./routes/emailVerification");

const NoteModel = require("./models/notes");
const cookieParser = require("cookie-parser");
const deleteNote = require("./middlewares/deleteNote");
const { auth } = require("./middlewares/auth");
const { connectDB } = require("./config/db");
connectDB();
app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");

app.use(emailVerify);
app.use(signout);
app.use(viewNote);
app.use(viewNoteTrash);
app.use(update);
app.use(login);
app.use(signup);
app.use(add);
app.use(deleteNoteTemp);
app.use(deleteNoteForever);
app.use(recover);

app.get("/",auth,async (req,res)=>{
    const notes = await NoteModel.find({userId:req.userId , recentlyDeleted:false});
    res.render("index",{
        signedIn : req.signedIn,
        title:"All Notes",
        notes:notes,
        userId:req.userId
    })
});
app.get("/fav",auth,async(req,res)=>{
    const notes = await NoteModel.find({userId:req.userId , favourite:true , recentlyDeleted:false});
    res.render("index",{
        signedIn : req.signedIn,
        title:"Favourites",
        notes:notes,
        userId:req.userId
    })
})

app.get("/pinned",auth,async(req,res)=>{
    const notes = await NoteModel.find({userId:req.userId , pinned:true , recentlyDeleted:false});
    res.render("index",{
        signedIn : req.signedIn,
        title:"Pinned",
        notes:notes,
        userId:req.userId
    })
})

app.get("/trash",auth,deleteNote,async(req,res)=>{
    const notes = await NoteModel.find({userId:req.userId , recentlyDeleted:true});
    res.render("trash",{
        signedIn : req.signedIn,
        title:"Trash",
        notes:notes,
        userId:req.userId
    })
})

app.get("/profile",auth,async(req,res)=>{
    res.render("profile",{
        signedIn : req.signedIn,
        title:"Profile",
        userId:req.userId
    })
})

app.get("/settings",auth,async(req,res)=>{
    res.render("settings",{
        signedIn : req.signedIn,
        title:"Settings",
        userId:req.userId
    })
})

if (process.env.NODE_ENV !== 'production') {
    app.listen(4000,()=>{
        console.log("Server Started");
    });
}

module.exports = app;
