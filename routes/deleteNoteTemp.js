const checkUserNote = require("../middlewares/checkUserNote");
const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");
const trashNote = require("../controllers/trashNote");

router.patch("/note/trash/:noteId",auth,authR,checkUserNote,trashNote);

module.exports = router;