import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Resource from "../models/Resource.js";
import { requireAdmin } from "../middleware/auth.js";
import { slugify } from "../utils/slugify.js";

const router = Router();
router.use(requireAdmin);

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  }
});

router.get("/stats", async (_req, res) => {
  const [subjects, chapters, resources, downloads] = await Promise.all([
    Subject.countDocuments(),
    Chapter.countDocuments(),
    Resource.countDocuments(),
    Resource.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }])
  ]);

  res.json({
    subjects,
    chapters,
    resources,
    downloads: downloads[0]?.total || 0
  });
});

router.get("/subjects", async (_req, res) => {
  res.json(await Subject.find().sort({ order: 1, name: 1 }));
});

router.post("/subjects", async (req, res) => {
  const { name, description, icon, order } = req.body;
  if (!name) return res.status(400).json({ message: "Subject name is required" });

  const subject = await Subject.create({
    name,
    slug: slugify(name),
    description,
    icon: icon || "📚",
    order: Number(order) || 0
  });

  res.status(201).json(subject);
});

router.put("/subjects/:id", async (req, res) => {
  const { name, description, icon, order } = req.body;
  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { name, slug: slugify(name), description, icon, order: Number(order) || 0 },
    { new: true, runValidators: true }
  );
  res.json(subject);
});

router.delete("/subjects/:id", async (req, res) => {
  const chapters = await Chapter.find({ subject: req.params.id });
  const chapterIds = chapters.map(c => c._id);

  await Resource.deleteMany({
    $or: [
      { subject: req.params.id },
      { chapter: { $in: chapterIds } }
    ]
  });
  await Chapter.deleteMany({ subject: req.params.id });
  await Subject.findByIdAndDelete(req.params.id);

  res.json({ message: "Subject and its chapters/resources deleted" });
});

router.get("/chapters", async (_req, res) => {
  const chapters = await Chapter.find().populate("subject", "name").sort({ order: 1, name: 1 });
  res.json(chapters);
});

router.post("/chapters", async (req, res) => {
  const { subject, name, description, order } = req.body;
  if (!subject || !name) {
    return res.status(400).json({ message: "Subject and chapter name are required" });
  }

  const chapter = await Chapter.create({
    subject,
    name,
    slug: slugify(name),
    description,
    order: Number(order) || 0
  });

  res.status(201).json(chapter);
});

router.put("/chapters/:id", async (req, res) => {
  const { subject, name, description, order } = req.body;
  const chapter = await Chapter.findByIdAndUpdate(
    req.params.id,
    { subject, name, slug: slugify(name), description, order: Number(order) || 0 },
    { new: true, runValidators: true }
  );
  res.json(chapter);
});

router.delete("/chapters/:id", async (req, res) => {
  await Resource.deleteMany({ chapter: req.params.id });
  await Chapter.findByIdAndDelete(req.params.id);
  res.json({ message: "Chapter and resources deleted" });
});

router.get("/resources", async (_req, res) => {
  const resources = await Resource.find()
    .populate("subject", "name")
    .populate("chapter", "name")
    .sort({ createdAt: -1 });
  res.json(resources);
});

router.post("/resources", upload.single("file"), async (req, res) => {
  const {
    subject,
    chapter,
    title,
    type,
    description,
    youtubeUrl,
    published
  } = req.body;

  if (!subject || !chapter || !title) {
    return res.status(400).json({ message: "Subject, chapter and title are required" });
  }

  const resource = await Resource.create({
    subject,
    chapter,
    title,
    type: type || "Notes",
    description: description || "",
    youtubeUrl: youtubeUrl || "",
    published: published !== "false",
    fileUrl: req.file ? `/uploads/${req.file.filename}` : "",
    originalName: req.file?.originalname || ""
  });

  res.status(201).json(resource);
});

// Upload a PYQ directly under a subject (no chapter required).
router.post("/pyqs", upload.single("file"), async (req, res) => {
  const { subject, title, description, published } = req.body;

  if (!subject || !title) {
    return res.status(400).json({ message: "Subject and title are required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  const pyq = await Resource.create({
    subject,
    chapter: undefined,
    scope: "subject",
    title,
    type: "PYQ",
    description: description || "",
    published: published !== "false",
    fileUrl: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname
  });

  const populated = await Resource.findById(pyq._id)
    .populate("subject", "name")
    .lean();

  res.status(201).json(populated);
});

router.put("/resources/:id", async (req, res) => {
  const { title, type, description, youtubeUrl, published } = req.body;
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { title, type, description, youtubeUrl, published: published !== "false" },
    { new: true, runValidators: true }
  );
  res.json(resource);
});

router.delete("/resources/:id", async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found" });

  if (resource.fileUrl) {
    const filename = path.basename(resource.fileUrl);
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await resource.deleteOne();
  res.json({ message: "Resource deleted" });
});

export default router;
