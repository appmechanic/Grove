import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
export default User;
