import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["mum", "business"],
      
    },
    avatar: {
      type: String,
    },

    // Business-only details
    businessDetails: {
      businessName: { type: String },
      businessDescription: { type: String },
      businessPlan: {
        type: String,
        enum: ["free", "monthly", "yearly"],
      },
      businessPlanPrice: { type: Number },
    },

    // Mum-only details
    mumDetails: {
      stage: { type: String },
      mumPlan: {
        type: String,
        enum: ["free", "monthly", "yearly"],
      },
      mumPlanPrice: { type: Number },
    },
    refreshToken: { type: String },
    bio: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
export default User;
