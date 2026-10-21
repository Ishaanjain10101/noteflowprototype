const express = require("express");
const auth = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");
const router = express.Router();
const profile = require("../controllers/profile");

router.get("/profile" , auth , authR , profile);

module.exports = router;