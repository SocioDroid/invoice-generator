# Invoice Generator

A minimal, single-file invoice generator that runs entirely in the browser. Upload an `.xlsx` timesheet, configure your details, preview a professional invoice, and export it as a pixel-perfect PDF. No server, no sign-up, and no data leaves your machine.

**[Live Demo ->](https://your-username.github.io/InvoiceGenerator/)**

---

## Features

- **XLSX Parsing** - Upload a multi-sheet `.xlsx` timesheet; each sheet becomes a selectable month.
- **Google Sheets Import** - Fetch directly from a public Google Spreadsheet by ID or URL.
- **Live Preview** - Instant A4 invoice preview that updates as you type.
- **PDF Export** - High-quality, pixel-perfect PDF export using `html2canvas` and `jsPDF`.
- **6 Colour Themes** - Classic Blue, Charcoal, Teal, Burgundy, Forest, Navy & Gold.
- **Indian Rupee Formatting** - Amounts display in the Indian numbering system.
- **Auto-Fit Rows** - Font size and padding scale to fit all rows on a single page.
- **Persistent Config** - Personal info and theme preference are saved to `localStorage`.
- **Zero Dependencies** - Single HTML file; libraries are loaded from CDNs.
- **Fully Offline-Capable** - No backend; everything runs client-side.
- **Copy Invoice Number** - One-click copy to clipboard.

---

## Getting Started

### Option 1: Open Locally

1. Clone or download this repository.
2. Open `index.html` in any modern browser.
3. No build step or install is required.

### Option 2: Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings -> Pages**.
3. Under **Source**, select the `main` branch and `/ (root)` folder.
4. Click **Save**.
5. Your invoice generator will be live at `https://<username>.github.io/<repo-name>/`.

---

## How to Use

### 1. Prepare Your Timesheet

Create an `.xlsx` file where each sheet represents one month. Expected sheet format:

| Row | Column A | Column B | Column C |
| --- | -------- | -------- | -------- |
| 1 | *(any)* | **Tenure period** (for example `1st Nov, 2025 - 30th Nov, 2025`) | *(any)* |
| 2 | *(any)* | *(any)* | *(any)* |
| 3 | **Date** | **Task Description** | **Time Required [Hours]** |
| 4+ | Date value | Task description | Hours (number) |
| ... | *(empty A)* | `Rate Per Hour` | Rate value (for example `25`) |

Rules:

- Row 1, Column B contains the tenure / period string shown on the invoice.
- Row 3 is the header row and is skipped automatically.
- Data rows start from Row 4 onward.
- A row is skipped if Column A is empty, Column C is `--`, or Column C is not numeric.
- If Column A is empty and Column B is `Rate Per Hour`, Column C is used as the hourly rate.
- Default rate is `20 USD/hr` if none is found in the sheet.

Sheet naming convention:

- Name each sheet as `Month Year` such as `July 2024` or `November 2025`.
- The app uses this format to auto-suggest invoice numbers and build the PDF filename.

### 2. Upload & Configure

1. Click **Upload .xlsx** and select your timesheet.
2. Select a month/sheet from the dropdown.
3. Adjust the invoice date, exchange rate, and billed-to company as needed.
4. Fill in your personal details and bank information. They are saved in your browser for next time.

### 3. Preview & Export

- The live preview updates instantly on every change.
- Click **Export to PDF** to download a high-quality A4 PDF.
- PDF downloads use the format `Invoice_<Month>_<Year>.pdf`.
- Click **Copy Invoice Number** to copy the invoice number to the clipboard.

### 4. Google Sheets (Optional)

1. Click **Load from Google Sheets**.
2. Paste the Spreadsheet ID or full URL.
3. The spreadsheet must be set to **Anyone with the link can view**.
4. Click **Fetch & Load** to download and parse it like a local upload.

---

## Themes

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

## Project Structure

```text
InvoiceGenerator/
|-- index.html
|-- README.md
|-- LICENSE
`-- tests/
    `-- test-comprehensive.js
```

---

## Running Tests

The test suite validates parsing logic, formatting functions, HTML structure, and edge cases.

Prerequisites:

- Node.js
- A sample `.xlsx` timesheet file

```bash
npm install xlsx
node tests/test-comprehensive.js
```

The test suite expects a sample file at `sample/timesheet.xlsx`. It is not included in the repo.

---

## Tech Stack

| Component | Technology |
| --------- | ---------- |
| UI | Vanilla HTML / CSS / JavaScript |
| XLSX Parsing | [SheetJS](https://sheetjs.com/) |
| PDF Generation | [html2canvas](https://html2canvas.hertzen.com/) + [jsPDF](https://github.com/parallax/jsPDF) |
| Storage | `localStorage` |
| Hosting | GitHub Pages |

---

## Privacy

- No server
- No analytics or tracking
- No data transmitted outside the browser flow used to load CDN assets
- Personal info is stored only in the browser's `localStorage`

---

## License

[MIT](LICENSE)
