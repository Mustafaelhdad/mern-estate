import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user-model.js";
import Listing from "../models/listing.modal.js";

export const test = (req, res) => {
  res.json({
    message: "API route is working",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));

  if (req.body.password) {
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...rest } = updatedUser?._doc;

    res.status(200).json(rest);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "An error occurred while updating the user"));
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler((401, "You can only delete your account!")));

  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).clearCookie("access_token").json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler((401, "You can only see your listings!")));

  try {
    const listings = await Listing.find({ userRef: req.params.id });

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
