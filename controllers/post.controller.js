const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Post = require("../models/post.model");
// middleware must be destructured otherwise error occurs
const { isLoggedIn } = require("../middleware/isLoggedIn");

let regex = /<>\$\/\|\[\]~`/;
/*
// post schema setup 
author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  textContent: {
    type: String,
    required: true,
  },
 */

exports.postsAll__get = async (req, res) => {
  try {
    const posts = await Post.find({});
    //console.log(posts);
    return res.json({ posts });
  } catch (err) {
    console.log(err);
  }
};

exports.posts__post = [
  isLoggedIn,
  body("postContent").trim().blacklist(regex).notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.mapped() });
      return;
    }
    try {
      const post = new Post({
        postContent: req.body.postContent,
        author: req.user._id,
      });
      try {
        post.save();
        res
          .status(201)
          .json({ status: "ok", message: "post creation success", post });
      } catch (err) {
        res.status(400).json({ status: "error", err });
      }
    } catch (err) {
      res.json({ status: "error", error: err.message });
    }
  },
];
