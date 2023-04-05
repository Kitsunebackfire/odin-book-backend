const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller.js");
// test route to ensure post router is functioning properly
router.get("/test", (req, res) => {
  res.status(200).json({ test: "post router working" });
});

//get posts
//router.get("/posts", postController.postsAll__get);
router.post("/", postController.posts__post);
/* router.post("/create-post", (req, res) => {
  res.send("hi");
}); */
//login

module.exports = router;
