// ======================================================
// METASCOPE
// SCRIPT.JS
// PART 1
// Setup, Upload, Preview & File Information
// ======================================================

// -----------------------------
// DOM ELEMENTS
// -----------------------------

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");

const previewArea = document.getElementById("previewArea");

const fileInfo = document.getElementById("fileInfo");
const imageInfo = document.getElementById("imageInfo");
const exifInfo = document.getElementById("exifInfo");
const pdfInfo = document.getElementById("pdfInfo");
const hashInfo = document.getElementById("hashInfo");
const colorInfo = document.getElementById("colorInfo");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");


const toast = document.getElementById("toast");

// -----------------------------
// GLOBAL VARIABLES
// -----------------------------

let currentFile = null;

let metadata = {
    file: {},
    image: {},
    exif: {},
    pdf: {},
    colors: [],
    sha256: ""
};

// -----------------------------
// BROWSE BUTTON
// -----------------------------

browseBtn.addEventListener("click", () => {

    fileInput.click();

});

// -----------------------------
// FILE INPUT
// -----------------------------

fileInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (file) {

        processFile(file);

    }

});

// -----------------------------
// DRAG EVENTS
// -----------------------------

["dragenter", "dragover"].forEach(event => {

    dropZone.addEventListener(event, e => {

        e.preventDefault();

        dropZone.style.borderColor = "#00E5FF";

        dropZone.style.transform = "scale(1.02)";

    });

});

["dragleave", "drop"].forEach(event => {

    dropZone.addEventListener(event, e => {

        e.preventDefault();

        dropZone.style.borderColor = "rgba(255,255,255,.2)";

        dropZone.style.transform = "scale(1)";

    });

});

// -----------------------------
// DROP
// -----------------------------

dropZone.addEventListener("drop", e => {

    const file = e.dataTransfer.files[0];

    if (file) {

        processFile(file);

    }

});

// -----------------------------
// PROCESS FILE
// -----------------------------

function processFile(file) {

    currentFile = file;

    metadata = {
        file: {},
        image: {},
        exif: {},
        pdf: {},
        colors: [],
        sha256: ""
    };

    showPreview(file);

    showFileInformation(file);

    // Functions added in later parts

    generateHash(file);

    if (file.type.startsWith("image/")) {

        getImageInformation(file);

    }

    if (file.type === "application/pdf") {

        analyzePDF(file);

    }

}

// -----------------------------
// PREVIEW
// -----------------------------

function showPreview(file) {

    previewArea.innerHTML = "";

    if (file.type.startsWith("image/")) {

        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.alt = file.name;

        previewArea.appendChild(img);

    }

    else if (file.type === "application/pdf") {

        previewArea.innerHTML = `

        <div style="text-align:center">

            <i class="fa-solid fa-file-pdf"
            style="
            font-size:90px;
            color:#ff4d4d;
            margin-bottom:20px;
            "></i>

            <h2>${file.name}</h2>

            <p>PDF Document Loaded Successfully</p>

        </div>

        `;

    }

    else {

        previewArea.innerHTML = `

        <h2>Unsupported File Type</h2>

        `;

    }

}

// -----------------------------
// FILE INFORMATION
// -----------------------------

function showFileInformation(file) {

    const size = (file.size / 1024 / 1024).toFixed(2);

    metadata.file = {

        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toLocaleString()

    };

    fileInfo.innerHTML = `

<div class="meta-row">
<span class="meta-label">File Name</span>
<span class="meta-value">${file.name}</span>
</div>

<div class="meta-row">
<span class="meta-label">File Type</span>
<span class="badge">${file.type}</span>
</div>

<div class="meta-row">
<span class="meta-label">File Size</span>
<span class="meta-value">${size} MB</span>
</div>

<div class="meta-row">
<span class="meta-label">Modified</span>
<span class="meta-value">
${new Date(file.lastModified).toLocaleString()}
</span>
</div>

`;

    imageInfo.innerHTML = "📷 Upload an image to inspect dimensions.";

    exifInfo.innerHTML = "📍 EXIF metadata will appear here.";

    pdfInfo.innerHTML = "📄 Upload a PDF to inspect metadata.";

    hashInfo.innerHTML = "🔒 SHA-256 fingerprint will appear here.";

    colorInfo.innerHTML = "🎨 Upload an image to generate a color palette.";

}
// ======================================================
// METASCOPE
// SCRIPT.JS
// PART 2
// Image Information & EXIF Metadata
// ======================================================

// -----------------------------
// IMAGE INFORMATION
// -----------------------------

function getImageInformation(file) {

    const img = new Image();

    img.onload = function () {

        const aspectRatio = (img.width / img.height).toFixed(2);

        const orientation = img.width > img.height
            ? "Landscape"
            : img.width < img.height
            ? "Portrait"
            : "Square";

        metadata.image = {
            width: img.width,
            height: img.height,
            aspectRatio: aspectRatio,
            resolution: img.width * img.height,
            orientation: orientation
        };

        imageInfo.innerHTML = `

<div class="meta-row">
<span class="meta-label">Width</span>
<span class="meta-value">${img.width}px</span>
</div>

<div class="meta-row">
<span class="meta-label">Height</span>
<span class="meta-value">${img.height}px</span>
</div>

<div class="meta-row">
<span class="meta-label">Aspect Ratio</span>
<span class="meta-value">${aspectRatio}</span>
</div>

<div class="meta-row">
<span class="meta-label">Resolution</span>
<span class="meta-value">${(img.width * img.height).toLocaleString()} px</span>
</div>

<div class="meta-row">
<span class="meta-label">Orientation</span>
<span class="meta-value">${orientation}</span>
</div>

`;

        getExifData(img);

        extractColors(img);

    };

    img.src = URL.createObjectURL(file);

}

// -----------------------------
// EXIF DATA
// -----------------------------

function getExifData(image) {

    EXIF.getData(image, function () {

        const make = EXIF.getTag(this, "Make") || "Unknown";

        const model = EXIF.getTag(this, "Model") || "Unknown";

        const dateTaken =
            EXIF.getTag(this, "DateTimeOriginal") ||
            "Not Available";

        const iso =
            EXIF.getTag(this, "ISOSpeedRatings") ||
            "Unknown";

        const flash =
            EXIF.getTag(this, "Flash");

        const focal =
            EXIF.getTag(this, "FocalLength");

        const gpsLat =
            EXIF.getTag(this, "GPSLatitude");

        const gpsLon =
            EXIF.getTag(this, "GPSLongitude");

        metadata.exif = {

            manufacturer: make,
            camera: model,
            dateTaken: dateTaken,
            iso: iso,
            flash: flash ?? "Unknown",
            focalLength: focal ?? "Unknown"

        };

        let gpsHTML = "Not Available";

        if (gpsLat && gpsLon) {

            const lat = gpsToDecimal(gpsLat);

            const lon = gpsToDecimal(gpsLon);

            metadata.exif.latitude = lat;
            metadata.exif.longitude = lon;

            gpsHTML = `

<a
href="https://www.google.com/maps?q=${lat},${lon}"
target="_blank"
style="
color:#00E5FF;
text-decoration:none;
font-weight:600;
">

Open in Google Maps

</a>

`;

        }

        exifInfo.innerHTML = `

<div class="meta-row">
<span class="meta-label">Manufacturer</span>
<span class="meta-value">${make}</span>
</div>

<div class="meta-row">
<span class="meta-label">Camera</span>
<span class="meta-value">${model}</span>
</div>

<div class="meta-row">
<span class="meta-label">Date Taken</span>
<span class="meta-value">${dateTaken}</span>
</div>

<div class="meta-row">
<span class="meta-label">ISO</span>
<span class="meta-value">${iso}</span>
</div>

<div class="meta-row">
<span class="meta-label">Flash</span>
<span class="meta-value">${flash ?? "Unknown"}</span>
</div>

<div class="meta-row">
<span class="meta-label">Focal Length</span>
<span class="meta-value">${focal ?? "Unknown"}</span>
</div>

<div class="meta-row">
<span class="meta-label">GPS</span>
<span class="meta-value">${gpsHTML}</span>
</div>

`;

    });

}

// -----------------------------
// GPS TO DECIMAL
// -----------------------------

function gpsToDecimal(gpsArray) {

    return (

        gpsArray[0] +

        gpsArray[1] / 60 +

        gpsArray[2] / 3600

    ).toFixed(6);

}
// ======================================================
// METASCOPE
// SCRIPT.JS
// PART 3
// PDF Metadata, SHA-256 & Color Palette
// ======================================================

// -----------------------------
// SHA-256 HASH
// -----------------------------

async function generateHash(file) {

    const buffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        buffer
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    const hash = hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    metadata.sha256 = hash;

    hashInfo.innerHTML = `

<div class="meta-row">
<span class="meta-label">SHA-256</span>
<span class="meta-value"
style="
font-size:.75rem;
word-break:break-all;
">
${hash}
</span>
</div>

`;

}

// -----------------------------
// PDF METADATA
// -----------------------------

async function analyzePDF(file) {

    try {

        const buffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
            data: buffer
        }).promise;

        const meta = await pdf.getMetadata();

        metadata.pdf = {

            pages: pdf.numPages,

            title: meta.info.Title || "Unknown",

            author: meta.info.Author || "Unknown",

            creator: meta.info.Creator || "Unknown",

            producer: meta.info.Producer || "Unknown"

        };

        pdfInfo.innerHTML = `

<div class="meta-row">
<span class="meta-label">Pages</span>
<span class="meta-value">${pdf.numPages}</span>
</div>

<div class="meta-row">
<span class="meta-label">Title</span>
<span class="meta-value">${meta.info.Title || "Unknown"}</span>
</div>

<div class="meta-row">
<span class="meta-label">Author</span>
<span class="meta-value">${meta.info.Author || "Unknown"}</span>
</div>

<div class="meta-row">
<span class="meta-label">Creator</span>
<span class="meta-value">${meta.info.Creator || "Unknown"}</span>
</div>

<div class="meta-row">
<span class="meta-label">Producer</span>
<span class="meta-value">${meta.info.Producer || "Unknown"}</span>
</div>

`;

    }

    catch (error) {

        console.error(error);

        pdfInfo.innerHTML = `

<p style="color:#ff7777">

Unable to extract PDF metadata.

</p>

`;

    }

}

// -----------------------------
// COLOR PALETTE
// -----------------------------

function extractColors(img) {

    const colorThief = new ColorThief();

    if (!img.complete) {

        img.onload = () => extractColors(img);

        return;

    }

    try {

        const palette = colorThief.getPalette(img, 5);

        metadata.colors = [];

        colorInfo.innerHTML = "";

        palette.forEach(color => {

            const hex = rgbToHex(
                color[0],
                color[1],
                color[2]
            );

            metadata.colors.push(hex);

            const row = document.createElement("div");

            row.className = "meta-row";

            row.innerHTML = `

<div
style="
display:flex;
align-items:center;
gap:10px;
">

<div
style="
width:22px;
height:22px;
border-radius:6px;
background:${hex};
border:1px solid rgba(255,255,255,.3);
">
</div>

<span class="meta-label">${hex}</span>

</div>

`;

            colorInfo.appendChild(row);

        });

    }

    catch {

        colorInfo.innerHTML = `

<p>

Unable to generate color palette.

</p>

`;

    }

}

// -----------------------------
// RGB TO HEX
// -----------------------------

function rgbToHex(r, g, b) {

    return "#" +

        [r, g, b]

        .map(value => {

            const hex = value.toString(16);

            return hex.length === 1

                ? "0" + hex

                : hex;

        })

        .join("");

}
// ======================================================
// METASCOPE
// SCRIPT.JS
// PART 4
// Copy, Download, Theme & Toast
// ======================================================

// -----------------------------
// TOAST NOTIFICATION
// -----------------------------

function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

// -----------------------------
// COPY METADATA
// -----------------------------

copyBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(

            JSON.stringify(metadata, null, 2)

        );

        showToast("Metadata copied successfully!");

    }

    catch {

        showToast("Unable to copy metadata.");

    }

});

// -----------------------------
// DOWNLOAD JSON
// -----------------------------

downloadBtn.addEventListener("click", () => {

    const blob = new Blob(

        [JSON.stringify(metadata, null, 2)],

        {

            type: "application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "metadata.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("metadata.json downloaded");

});




// -----------------------------
// KEYBOARD SHORTCUTS
// -----------------------------

document.addEventListener("keydown", (e) => {

    // Ctrl/Cmd + O

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {

        e.preventDefault();

        fileInput.click();

    }

});

// -----------------------------
// DRAG VISUAL FEEDBACK
// -----------------------------

dropZone.addEventListener("dragenter", () => {

    dropZone.style.boxShadow =
        "0 0 40px rgba(0,229,255,.45)";

});

dropZone.addEventListener("dragleave", () => {

    dropZone.style.boxShadow = "";

});

dropZone.addEventListener("drop", () => {

    dropZone.style.boxShadow = "";

});

// -----------------------------
// CONSOLE BANNER
// -----------------------------

console.log(
`
=========================================
          MetaScope v1.0
  Professional File Metadata Inspector
=========================================
`
);