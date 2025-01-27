import { User } from "../models/user.model.js";
import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import twilio from "twilio";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { log } from "console";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password, phone, verificationMethod } = req.body;

    // console.log(req.body);

    if (!name || !email || !password || !phone || !verificationMethod) {
      return next(new ErrorHandler("Please fill in all fields", 400));
    }

    if (password.length > 32) {
      return next(
        new ErrorHandler("Password must be at most 32 characters long", 400)
      );
    }

    function validateAndFormatPhone(phone) {
      const phoneRegex = /^[6-9][0-9]{9}$/;

      if (phoneRegex.test(phone)) {
        return phone;
      } else {
        return null;
      }
    }

    const formattedPhone = validateAndFormatPhone(phone);

    if (!formattedPhone) {
      return next(new ErrorHandler("Please enter a valid phone number", 400));
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          phone,
          accountVerified: true,
        },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("Phone or Email already exists", 400));
    }

    const attemptTracker = {};
    const MAX_ATTEMPTS = 3;
    const ATTEMPT_RESET_TIME = 60 * 60 * 1000;

    const key = email || phone;

    if (!attemptTracker[key]) {
      attemptTracker[key] = { count: 1, lastAttempt: new Date() };
    } else {
      const { count, lastAttempt } = attemptTracker[key];
      const currentTime = new Date();

      if (currentTime - lastAttempt > ATTEMPT_RESET_TIME) {
        attemptTracker[key] = { count: 1, lastAttempt: currentTime };
      } else {
        if (count >= MAX_ATTEMPTS) {
          return next(
            new ErrorHandler(
              "You have exceeded the maximum number of registration attempts. Please try again 30 minutes.",
              400
            )
          );
        } else {
          attemptTracker[key].count += 1;
          attemptTracker[key].lastAttempt = currentTime;
        }
      }
    }

    const userData = {
      name,
      email,
      phone,
      password,
    };

    const user = await User.create(userData);

    const verificationCode = await user.getVerificationCode();

    await user.save();

    sendVerificationCode(
      verificationMethod,
      verificationCode,
      email,
      phone,
      res
    );
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  email,
  phone,
  res
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);

      await sendEmail(email, "Account Verification Code", message);

      res.status(201).json({
        success: true,
        message: `Verification code sent successfully to ${email}`,
      });
    } else if (verificationMethod === "phone") {
      try {
        await client.messages
          .create({
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER,
            body: `Your verification code is: ${verificationCode}`,
          })
          .then((message) => console.log(message.sid));
      } catch (error) {
        console.log("Failed to send SMS:", error.message);
      }

      res.status(201).json({
        success: true,
        message: `Verification code sent successfully to ${phone}`,
      });
    } else {
      throw new ErrorHandler("Invalid verification method", 400);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
}

const generateEmailTemplate = (verificationCode) => {
  return `
    <div style="background-color: #000; color: #fff; font-family: Arial, sans-serif; padding: 20px; text-align: center; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
      <h2 style="color: #fff; font-size: 24px;">Verification Code</h2>
      <p style="font-size: 16px; color: #ccc; line-height: 1.5;">
        Thank you for using our service! Please use the verification code below to proceed with your request:
      </p>
      <div style="background-color: #222; padding: 15px; border-radius: 5px; margin: 20px auto; max-width: 300px;">
        <p style="font-size: 24px; font-weight: bold; margin: 0; color: #fff;">
          ${verificationCode}
        </p>
      </div>
      <p style="font-size: 14px; color: #bbb; line-height: 1.5;">
        If you did not request this code, please ignore this email or contact support.
      </p>
      <div style="margin-top: 20px; font-size: 12px; color: #555; border-top: 1px solid #444; padding-top: 10px;">
        <p>© 2025 Jay@1617tech. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const verifyAccount = catchAsyncError(async (req, res, next) => {
  try {
    const { email, phone, verificationCode } = req.body;

    if (!verificationCode || !email || !phone) {
      return next(new ErrorHandler("Please enter verification code", 400));
    }

    function validateAndFormatPhone(phone) {
      const phoneRegex = /^[6-9][0-9]{9}$/;

      if (phoneRegex.test(phone)) {
        return phone;
      } else {
        return null;
      }
    }

    const formattedPhone = validateAndFormatPhone(phone);

    if (!formattedPhone) {
      return next(new ErrorHandler("Please enter a valid phone number", 400));
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          phone: formattedPhone,
          accountVerified: true,
        },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("User already verified", 400));
    }

    console.log(email, formattedPhone, verificationCode);

    const formattedCode = parseInt(verificationCode, 10);
    if (isNaN(formattedCode)) {
      return next(new ErrorHandler("Invalid verification code format", 400));
    }

    const user = await User.findOne({
      email,
      phone: formattedPhone,
      verificationCode : formattedCode,
    });

    console.log(user);

    if (!user) {
      return next(new ErrorHandler("Invalid verification code", 400));
    }

    const currentTime = Date.now();
    const codeExpires = new Date(user.verificationCodeExpires).getTime();

    if (currentTime > codeExpires) {
      return next(new ErrorHandler("Verification code has expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save({ validateModifiedOnly: true });

    sendToken(user, "Account Verified", 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const login = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await User.findOne({ email, accountVerified: true }).select(
      "+password"
    );

    if (!user) {
      return next(
        new ErrorHandler("Email not found...please register your email", 400)
      );
    }

    if (!(await user.comparePassword(password))) {
      return next(new ErrorHandler("Invalid password...", 400));
    }

    sendToken(user, "Logged in successfully", 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>Please go to this link to reset your password:</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  `;

  try {
    await sendEmail(user.email, "Password Reset Request", message);

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid reset token", 400));
  }

  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  if (password.length > 32) {
    return next(
      new ErrorHandler("Password must be at most 32 characters long", 400)
    );
  }

  const isSamePassword = await bcrypt.compare(password, user.password);
  if (isSamePassword) {
    return next(new ErrorHandler("Please enter a new password", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  sendToken(user, "Password Reset Successfully", 200, res);
});
