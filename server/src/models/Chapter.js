import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

chapterSchema.index({ subject: 1, slug: 1 }, { unique: true });

export default mongoose.model("Chapter", chapterSchema);
