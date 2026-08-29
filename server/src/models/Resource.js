import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },

    // Existing chapter-wise resources use scope: "chapter".
    // Subject-wise PYQs use scope: "subject" and do not need a chapter.
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: false
    },
    scope: {
      type: String,
      enum: ["chapter", "subject"],
      default: "chapter"
    },

    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Notes", "Important Questions", "MCQ", "PYQ", "Formula Sheet", "Other"],
      default: "Notes"
    },
    description: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    originalName: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    published: { type: Boolean, default: true },
    downloads: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
