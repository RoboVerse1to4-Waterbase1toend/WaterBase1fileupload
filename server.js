// -------------------------------
// WaterBase Backend (Render‑Ready)
// -------------------------------

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// -------------------------------
// Middleware
// -------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------
// Folder Setup
// -------------------------------
const uploadFolder = path.join(__dirname, "uploads");
const sitesFolder = path.join(__dirname, "sites");

if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);
if (!fs.existsSync(sitesFolder)) fs.mkdirSync(sitesFolder);

// -------------------------------
// Multer Upload Handler
// -------------------------------
const upload = multer({ dest: uploadFolder });

// -------------------------------
// In‑Memory Metadata Store
// -------------------------------
let files = []; 
// Structure: { id, baseName, index, owner, password, storedName, originalName }

// Generate unique site names
function getNextName(baseName) {
    const same = files.filter(f => f.baseName === baseName);
    return same.length === 0 ? baseName : baseName + (same.length + 1);
}

// -------------------------------
// Upload Route
// -------------------------------
app.post("/upload", upload.single("file"), (req, res) => {
    const { owner, password } = req.body;

    if (!req.file || !owner || !password) {
        return res.status(400).send("File, owner and password required");
    }

    const original = req.file.originalname;
    const baseName = path.parse(original).name;

    const siteName = `waterbaseleadershipwithroboverse-${getNextName(baseName)}-${owner}-shauryawaterbase`;

    const id = Date.now().toString();
    const meta = {
        id,
        baseName,
        index: siteName,
        owner,
        password,
        storedName: req.file.filename,
        originalName: original
    };

    files.push(meta);

    res.json({
        message: "Site created",
        sitePath: `/sites/${siteName}`,
        siteName,
        owner
    });
});

// -------------------------------
// Password Check Route
// -------------------------------
app.post("/check-password", (req, res) => {
    const { siteName, password } = req.body;
    const meta = files.find(f => f.index === siteName);

    if (!meta) return res.status(404).send("Site not found");

    if (password === meta.password) {
        return res.json({
            ok: true,
            downloadUrl: `/download/${meta.storedName}`,
            originalName: meta.originalName
        });
    }

    res.json({ ok: false });
});

// -------------------------------
// Download Route
// -------------------------------
app.get("/download/:stored", (req, res) => {
    const stored = req.params.stored;
    const meta = files.find(f => f.storedName === stored);

    if (!meta) return res.status(404).send("File not found");

    const filePath = path.join(uploadFolder, stored);
    res.download(filePath, meta.originalName);
});

// -------------------------------
// Serve Frontend
// -------------------------------
app.use("/", express.static(path.join(__dirname, "frontend")));

// -------------------------------
// Start Server
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`WaterBase running on port ${PORT}`);
});

