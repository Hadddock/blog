const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Post = require("./../models/post");
const Comment = require("./../models/comment");

exports.post_detail_get = asyncHandler(async (req, res, next) => {
  if (req.params.id) {
    const post = await Post.findOne({ _id: req.params.id }).exec();
    const comments = await Comment.find({ post: req.params.id })
      .populate("user")
      .exec();
    const currentDate = new Date();
    if (post.publish_date === null || post.publish_date <= currentDate) {
      res.render("post-detail", { post: post, comments: comments });
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);
  }
});

exports.post_detail_post = [
  body("message")
    .trim()
    .isLength({ min: 1, max: 60000 })
    .withMessage("Comment must be 1-60000 characters long")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!req.user || !req.user._id) {
      res.sendStatus(401);
      return;
    }
    if (req.params.id) {
      const comment = new Comment({
        message: req.body.message,
        post: req.params.id,
        user: req.user._id,
        date_created: new Date(),
      });

      if (!errors.isEmpty()) {
        res.render("post-detail", {
          post: post,
          comment: comment,
          errors: errors.array(),
        });
        return;
      } else {
        await comment.save();
      }

      res.redirect("/post/" + req.params.id);
    } else {
      res.sendStatus(404);
    }
  }),
];
