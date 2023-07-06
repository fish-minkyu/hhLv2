const express = require("express");
const router = express.Router();
const comments = require("./comments");
const posts = require("./posts");
const users = require("./users.js")
const auth = require("./auth.js")


router.use("", [posts, comments, users, auth]); 


module.exports = router;