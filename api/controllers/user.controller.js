import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs'
import User from '../models/user.model.js'

export const test = (req, res)=>{
  res.json({
    message: 'Api route is working',
  });
}


export const updateUser = async (req, res, next) => {
  try {
    // Authorization: user can update only their account
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, "You can only update your own account!"));

    // Hash password if present
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    // Remove password before sending response
    const { password, ...rest } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: rest,
    });
  } catch (err) {
    next(err); // send to global error handler
  }
};

export const deleteUser = async (req, res, next) => {
  if(req.user.id !== req.params.id) return next(errorHandler(401, 'you can only delete your own account'))
    try {
     await User.findByIdAndDelete(req.params.id);
     res.clearCookie('access_token');
     res.status(200).json('User has been deleted');
    } catch (error) {
      next(error);
    }
};