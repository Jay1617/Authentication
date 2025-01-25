import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Name must contain at least 3 characters!"],
      maxLength: [16, "Name cannot exceed 32 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: false,
      validate: [validator.isEmail, "Please provide a valid email!"],
    },
    // avatar: {
    //   public_id: {
    //     type: String,
    //     required: true,
    //   },
    //   url: {
    //     type: String,
    //     required: true,
    //   },
    // },
    password: {
      type: String,
      required: true,
      minLength: [8, "Password must contain at least 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
      minLength: [10, "Phone number must contain at least 10 characters!"],
      maxLength: [13, "Phone number cannot exceed 13 characters"],
    },
    // verificationMethod: {
    //   type: String,
    //   required: true,
    //   enum: {
    //     values: ["email", "phone"],
    //     message: "Please select a verification method",
    //   },
    // },
    verificationCode: Number,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    accountVerified: {
      type: Boolean,
      default: false,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getVerificationCode = async function () {  
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  return verificationCode;
};

userSchema.methods.generateToken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

userSchema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

  return resetToken;

};

export const User = mongoose.model("User", userSchema);
