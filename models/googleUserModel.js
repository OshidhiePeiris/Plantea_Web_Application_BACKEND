import mongoose, { Schema } from "mongoose";

const GoogleUserSchema = new Schema(
  {
    googleId: { type: String, required: true },
    gmail: { type: String, required: true },
    displayName: { type: String, required: true },
    image: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const GoogleUser = mongoose.model("googleusers", GoogleUserSchema);

export default GoogleUser;