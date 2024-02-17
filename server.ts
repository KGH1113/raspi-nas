import express, { Express, Request, Response } from "express";
import multer, { Multer } from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post(
  "/api/upload",
  upload.single("file"),
  (req: Request, res: Response) => {
    console.log("file uploaded: ", req.file?.originalname, req.body.location);
    fs.rename(
      path.join("uploads", req.file?.originalname as string),
      path.join("files", req.body.location, req.file?.originalname as string),
      (err) => {
        if (err) throw err;
      }
    );
    res
      .status(200)
      .json({ status: "success", message: "File uploaded successfully" });
  }
);

app.post("/api/new-folder", (req: Request, res: Response) => {
  const { location } = req.body;
  fs.mkdirSync(path.join("files", location));
  res
    .status(200)
    .json({ status: "success", message: "Folder created successfully" });
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.get("/api/get-filelist", (req: Request, res: Response) => {
  const dirName: string = path.join(
    __dirname,
    "files",
    req.query.dirname as string
  );

  const statsObj = fs.statSync(dirName);
  if (statsObj.isFile()) {
    return res
      .status(500)
      .json({ status: "failed", message: "Not a directory" });
  }

  const files = fs.readdirSync(dirName);

  let filelist: {
    fileName: string;
    ContentType: "file" | "folder";
    fileType: "source_code" | "text_document" | "image" | "unknown";
  }[] = [];

  files.forEach((file) => {
    let fileType: "source_code" | "text_document" | "image" | "unknown";
    switch (file.split(".").pop()) {
      case "c":
      case "cc":
      case "cpp":
      case "cxx":
      case "cs":
      case "php":
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "class":
      case "pl":
      case "py":
      case "ipynb":
      case "rb":
      case "h":
        fileType = "source_code";
        break;
      case "pdf":
      case "doc":
      case "docx":
      case "hwp":
      case "html":
      case "csv":
      case "xml":
        fileType = "text_document";
        break;
      case "jpeg":
      case "jpg":
      case "png":
      case "doc":
      case "tiff":
      case "gif":
      case "hevc":
      case "webp":
      case "mkv":
      case "mp4":
        fileType = "image";
        break;
      default:
        fileType = "unknown";
    }

    const statsObj = fs.statSync(path.join(dirName, file));
    const isDir = statsObj.isDirectory();

    filelist.push({
      fileName: file,
      ContentType: isDir ? "folder" : "file",
      fileType,
    });
  });
  return res.status(200).json(filelist);
});

app.get("/api/download-file", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "files", req.query.filepath as string));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
