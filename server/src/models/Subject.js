import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "📚" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
