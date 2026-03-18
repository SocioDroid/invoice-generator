# 🧾 Invoice Generator

A minimal, single-file invoice generator that runs entirely in the browser. Upload an `.xlsx` timesheet, configure your details, preview a professional invoice, and export it as a pixel-perfect PDF — no server, no sign-up, no data leaves your machine.

**[Live Demo →](https://your-username.github.io/InvoiceGenerator/)**

---

## ✨ Features

- **XLSX Parsing** — Upload a multi-sheet `.xlsx` timesheet; each sheet becomes a selectable month
- **Google Sheets Import** — Fetch directly from a public Google Spreadsheet by ID or URL
- **Live Preview** — Instant A4 invoice preview that updates as you type
- **PDF Export** — High-quality, pixel-perfect PDF export (html2canvas + jsPDF)
- **Print Support** — Browser-native print with optimised print styles
- **6 Colour Themes** — Classic Blue, Charcoal, Teal, Burgundy, Forest, Navy & Gold
- **Indian ₹ Formatting** — Amounts displayed in the Indian numbering system (lakhs / crores)
- **Auto-Fit Rows** — Font size and padding auto-scale to fit all rows on a single page
- **Persistent Config** — Your personal info and theme preference are saved to `localStorage`
- **Zero Dependencies** — Single HTML file; all libraries loaded from CDNs
- **Fully Offline-Capable** — No backend; everything runs client-side
- **Copy Invoice Number** — One-click copy to clipboard

---

## 🚀 Getting Started

### Option 1: Open Locally

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. That's it — no build step, no install

### Option 2: Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select `main` branch and `/ (root)` folder
4. Click **Save**
5. Your invoice generator will be live at `https://<username>.github.io/<repo-name>/`

---

## 📖 How to Use

### 1. Prepare Your Timesheet

Create an `.xlsx` file where **each sheet represents one month**. The expected sheet format:

| Row | Column A | Column B | Column C |
| --- | -------- | -------- | -------- |
| 1 | *(any)* | **Tenure period** (e.g. `1st Nov, 2025 – 30th Nov, 2025`) | *(any)* |
| 2 | *(any)* | *(any)* | *(any)* |
| 3 | **Date** | **Task Description** | **Time Required [Hours]** |
| 4+ | Date value | Task description | Hours (number) |
| … | *(empty A)* | `Rate Per Hour` | Rate value (e.g. `25`) |

**Rules:**

- Row 1, Column B = tenure / period string (shown on the invoice)
- Row 3 = header row (skipped automatically)
- Data rows start from Row 4 onward
- A row is **skipped** if Column A is empty, Column C is `--`, or Column C is not a number
- If a row has empty Column A and Column B reads `Rate Per Hour`, Column C is used as the hourly rate
- Default rate is `20 USD/hr` if none is found in the sheet

**Sheet naming convention:** Name each sheet as `Month Year` (e.g. `July 2024`, `November 2025`). The app uses this to auto-suggest invoice numbers.

### 2. Upload & Configure

1. Click **📂 Upload .xlsx** and select your timesheet
2. Select a month/sheet from the dropdown
3. Adjust the invoice date, exchange rate, and billed-to company as needed
4. Fill in your personal details (name, address, bank info) — these are saved to your browser for next time

### 3. Preview & Export

- The live preview updates instantly on every change
- Click **📄 Export to PDF** to download a high-quality A4 PDF
- Click **🖨️ Print** for browser-native printing
- Click **📋 Copy Invoice Number** to copy to clipboard

### 4. Google Sheets (Optional)

1. Click **📊 Load from Google Sheets**
2. Paste the Spreadsheet ID or full URL
3. The spreadsheet must be set to **"Anyone with the link can view"**
4. Click **Fetch & Load** — the app downloads the file and parses it like a local upload

---

## 🎨 Themes

Switch themes using the colour swatches in the config panel:

| Theme | Style |
| ----- | ----- |
| **Classic** | Professional blue |
| **Charcoal** | Neutral grey tones |
| **Teal** | Fresh teal/green |
| **Burgundy** | Warm wine/rose |
| **Forest** | Deep green |
| **Navy & Gold** | Dark navy with gold accents |

Your theme choice is persisted across sessions.

---

## 🏗️ Project Structure

```text
InvoiceGenerator/
├── index.html          # Complete app (single-file, no build needed)
├── README.md           # This file
├── LICENSE             # MIT License
├── .gitignore          # Git ignore rules
└── tests/
    └── test-comprehensive.js   # Node.js test suite (158 assertions)
```

---

## 🧪 Running Tests

The test suite validates parsing logic, formatting functions, HTML structure, and edge cases.

**Prerequisites:** Node.js and a sample `.xlsx` timesheet file.

```bash
# Install SheetJS (only dependency for tests)
npm install xlsx

# Place your sample timesheet at sample/timesheet.xlsx, then:
node tests/test-comprehensive.js
```

> **Note:** Tests require a sample `.xlsx` file matching the expected format. The sample file is not included in the repo (it may contain private data). Create one following the format described above.

---

## 🔧 Tech Stack

| Component | Technology |
| --------- | ---------- |
| **UI** | Vanilla HTML / CSS / JavaScript (single file) |
| **XLSX Parsing** | [SheetJS](https://sheetjs.com/) (CDN) |
| **PDF Generation** | [html2canvas](https://html2canvas.hertzen.com/) 1.4.1 + [jsPDF](https://github.com/parallax/jsPDF) 2.5.1 (CDN) |
| **Storage** | `localStorage` for personal info & theme |
| **Hosting** | GitHub Pages (static) |

---

## 🔒 Privacy

- **No server** — everything runs in your browser
- **No analytics or tracking**
- **No data transmitted** — your timesheet and personal details never leave your machine
- Personal info is stored only in your browser's `localStorage` and can be cleared at any time

---

## 📄 License

[MIT](LICENSE)
