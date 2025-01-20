import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            minLength: [3,"Name must contain at least 3 characters!"],
            maxLength: [16, "Name cannot exceed 32 characters"],
        },
        email: {
            type: String,
            required: true,
            validate: [validator.isEmail, "Please provide a valid email!"],
        },
        avatar:{
            public_id:{
                type: String,
                required: true
            },
            url:{
                type: String,
                required: true
            },
        },
        password: {
            type: String,
            required: true,
            minLength: [8,"Password must contain at least 8 characters!"],
            maxLength: [32, "Password cannot exceed 32 characters"],
            select: false,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        verifyEmailToken: String,
        verifyEmailTokenExpire: Date,
        isEmailVerified: {
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

usderSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME,
    });
}

export const User =  mongoose.model("User", userSchema);