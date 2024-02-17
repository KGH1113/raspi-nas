"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "build")));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    var _a, _b, _c;
    console.log("file uploaded: ", (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname, req.body.location);
    fs_1.default.rename(path_1.default.join("uploads", (_b = req.file) === null || _b === void 0 ? void 0 : _b.originalname), path_1.default.join("files", req.body.location, (_c = req.file) === null || _c === void 0 ? void 0 : _c.originalname), (err) => {
        if (err)
            throw err;
    });
    res
        .status(200)
        .json({ status: "success", message: "File uploaded successfully" });
});
app.post("/api/new-folder", (req, res) => {
    const { location } = req.body;
    fs_1.default.mkdirSync(path_1.default.join("files", location));
    res
        .status(200)
        .json({ status: "success", message: "Folder created successfully" });
});
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname + "/build/index.html"));
});
app.get("/api/get-filelist", (req, res) => {
    const dirName = path_1.default.join(__dirname, "files", req.query.dirname);
    const statsObj = fs_1.default.statSync(dirName);
    if (statsObj.isFile()) {
        return res
            .status(500)
            .json({ status: "failed", message: "Not a directory" });
    }
    const files = fs_1.default.readdirSync(dirName);
    let filelist = [];
    files.forEach((file) => {
        let fileType;
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
        const statsObj = fs_1.default.statSync(path_1.default.join(dirName, file));
        const isDir = statsObj.isDirectory();
        filelist.push({
            fileName: file,
            ContentType: isDir ? "folder" : "file",
            fileType,
        });
    });
    return res.status(200).json(filelist);
});
app.get("/api/download-file", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "files", req.query.filepath));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
