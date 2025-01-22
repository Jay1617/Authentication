import { User } from "../models/user.model.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";

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
      const fullPhoneRegex = /^\+91[6-9][0-9]{9}$/;

      if (fullPhoneRegex.test(phone)) {
        return phone;
      } else if (phoneRegex.test(phone)) {
        return `+91${phone}`;
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
    const MAX_ATTEMPTS = 100;
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
              "You have exceeded the maximum number of registration attempts. Please try again later.",
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
