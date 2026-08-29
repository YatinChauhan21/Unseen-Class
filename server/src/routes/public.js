import { Router } from "express";
import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Resource from "../models/Resource.js";

const router = Router();

router.get("/subjects", async (_req, res) => {
  const subjects = await Subject.find().sort({ order: 1, name: 1 }).lean();
  res.json(subjects);
});


router.get("/pyqs", async (_req, res) => {
  const subjects = await Subject.find().sort({ order: 1, name: 1 }).lean();
  res.json(subjects);
});

router.get("/pyqs/:slug", async (req, res) => {
  const subject = await Subject.findOne({ slug: req.params.slug }).lean();
  if (!subject) return res.status(404).json({ message: "Subject not found" });

  const resources = await Resource.find({
    subject: subject._id,
    type: "PYQ",
    scope: "subject",
    published: true,
    fileUrl: { $ne: "" }
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ subject, resources });
});

router.get("/subjects/:slug", async (req, res) => {
  const subject = await Subject.findOne({ slug: req.params.slug }).lean();
  if (!subject) return res.status(404).json({ message: "Subject not found" });

  const chapters = await Chapter.find({ subject: subject._id })
    .sort({ order: 1, name: 1 })
    .lean();

  res.json({ subject, chapters });
});

router.get("/chapters/:id", async (req, res) => {
  const chapter = await Chapter.findById(req.params.id)
    .populate("subject")
    .lean();

  if (!chapter) return res.status(404).json({ message: "Chapter not found" });

  const resources = await Resource.find({
    chapter: chapter._id,
    published: true
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ chapter, resources });
});

router.post("/resources/:id/download", async (req, res) => {
  const resource = await Resource.findOneAndUpdate(
    { _id: req.params.id, published: true },
    { $inc: { downloads: 1 } },
    { new: true }
  ).lean();

  if (!resource) return res.status(404).json({ message: "Resource not found" });
  res.json({ fileUrl: resource.fileUrl });
});

export default router;
