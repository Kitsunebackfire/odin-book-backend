const { isLoggedIn } = require("../middleware/isLoggedIn");
const { check } = require("express-validator");

const User = require("../models/user.model");

exports.specificUser__get = [
  isLoggedIn,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("_id username friends friendRequests profilePicUrl")
        .populate("friendRequests");

      if (!user) {
        return res
          .status(404)
          .json({ status: "error", error: "Unable to find user" });
      }

      res.json({ user });
    } catch (error) {
      res.status(400).json({ status: "error", error });
    }
  },
];

/*
allows friend request to be sent and retracted by person requesting friendship
*/
exports.FriendRequest__put = [
  isLoggedIn,
  async (req, res) => {
    try {
      const currentUser = req.user._id;
      const userToBefriend = await User.findById(req.params.id);

      if (!userToBefriend) {
        return res.status(404).json({
          status: "error",
          error: "User does not exist",
        });
      }
      // stops friend requesting yourself
      if (currentUser.equals(userToBefriend._id)) {
        return res.status(400).json({
          status: "error",
          error: "You can't be friends with yourself",
        });
      }
      // retract friend request
      if (userToBefriend.friendRequests.includes(currentUser)) {
        await userToBefriend.updateOne({
          $pull: { friendRequests: currentUser },
        });
        return res.status(201).json({
          status: "success",
          message: "Friendship unrequested",
        });
      }
      // if not currently friends, sends request
      await userToBefriend.updateOne({
        $push: { friendRequests: currentUser },
      });

      return res.status(201).json({
        status: "success",
        message: "Friendship requested",
        userToBefriend,
      });
    } catch (err) {
      return res.status(400).json({
        status: "error",
        error: err.message,
      });
    }
  },
];

exports.FriendRequestResponse__put = [
  isLoggedIn,
  check("response")
    .isIn(["accept", "deny"])
    .withMessage("Invalid friend request response"),

  async (req, res) => {
    try {
      const currentUser = req.user._id;
      const friendRequestId = req.body.requesterId;
      const response = req.body.response;

      const validResponses = ["accept", "deny"];
      if (!validResponses.includes(response)) {
        return res.status(400).json({
          status: "error",
          error: "Invalid friend request response",
        });
      }

      const user = await User.findById(currentUser);
      if (!user) {
        return res.status(404).json({
          status: "error",
          error: "User does not exist",
        });
      }

      if (response === "accept") {
        // Accept friend request
        const friendRequestIndex = user.friendRequests.indexOf(friendRequestId);
        if (friendRequestIndex === -1) {
          return res.status(400).json({
            status: "error",
            error: "Friend request not found",
          });
        }
        await user.updateOne({
          $pull: { friendRequests: friendRequestId },
          $push: { friends: friendRequestId },
        });

        // Add current user as friend for the requester
        const requester = await User.findByIdAndUpdate(friendRequestId, {
          $push: { friends: currentUser },
        });

        return res.status(200).json({
          status: "success",
          message: "Friend request accepted",
          requester,
        });
      } else if (response === "deny") {
        // Deny friend request
        const friendRequestIndex = user.friendRequests.indexOf(friendRequestId);
        if (friendRequestIndex === -1) {
          return res.status(400).json({
            status: "error",
            error: "Friend request not found",
          });
        }
        await user.updateOne({
          $pull: { friendRequests: friendRequestId },
        });
        // Remove friend request for the requester

        return res.status(200).json({
          status: "success",
          message: "Friend request denied",
        });
      }
    } catch (err) {
      return res.status(400).json({
        status: "error",
        error: err.message,
      });
    }
  },
];
