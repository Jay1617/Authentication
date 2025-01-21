import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password, phone, verificationMethod } = req.body;

    if (!name || !email || !password || !phone || !verificationMethod) {
      return next(new ErrorHandler("Please fill in all fields", 400));
    }

    function validatePhone(phone) {
      const phoneRegex = /^(?:\+91)?[6-9][0-9]{9}$/;
      return phoneRegex.test(phone);
    }

    if (!validatePhone(phone)) {
      return next(new ErrorHandler("Please enter a valid phone number", 400));
    }

    const existingUser = await User.findOne({
      $or: [
        { email, accountVerified: true },
        { phone, accountVerified: true },
      ],
    });

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "avatars/no-avatar.jpg",
        url: "https://res.cloudinary.com/df9jsefb9/image/upload/v1627314537/avatars/no-avatar.jpg",
      },
    });

    const token = user.getJwtToken();

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {}
});
