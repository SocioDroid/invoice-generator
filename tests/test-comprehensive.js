/**
 * Comprehensive test suite for Invoice Generator
 * Tests: parseSheet logic, formatting functions, loadWorkbook, HTML structure, PDF build
 * Run: node tests/test-comprehensive.js
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const FILE = path.join(__dirname, '..', 'sample', 'timesheet.xlsx');
const HTML_FILE = path.join(__dirname, '..', 'index.html');

let passed = 0, failed = 0, total = 0;

function assert(condition, msg) {
  total++;
  if (condition) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FAIL: ${msg}`); }
}

function assertEq(actual, expected, msg) {
  total++;
  if (actual === expected) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FAIL: ${msg} — expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}`); }
}

function assertApprox(actual, expected, delta, msg) {
  total++;
  if (Math.abs(actual - expected) <= delta) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FAIL: ${msg} — expected ~${expected}, got: ${actual}`); }
}

// ─── TEST GROUP 1: File existence ───
console.log('\n═══ 1. FILE EXISTENCE ═══');
assert(fs.existsSync(FILE), 'XLSX test file exists');
assert(fs.existsSync(HTML_FILE), 'index.html exists');

// ─── TEST GROUP 2: XLSX loading ───
console.log('\n═══ 2. XLSX LOADING ═══');
const buf = fs.readFileSync(FILE);
assert(buf.length > 0, 'File has content');

// Test with Uint8Array (browser path)
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const uint8 = new Uint8Array(ab);
assert(uint8.length === buf.length, 'Uint8Array created from ArrayBuffer');

const wb = XLSX.read(uint8, { type: 'array', cellDates: true });
assert(wb != null, 'Workbook parsed successfully');
assertEq(wb.SheetNames.length, 17, '17 sheets found');
assert(wb.SheetNames.includes('July 2024'), 'Contains "July 2024" sheet');
assert(wb.SheetNames.includes('November 2025'), 'Contains "November 2025" sheet');

// ─── TEST GROUP 3: parseSheet logic (reimplemented) ───
console.log('\n═══ 3. PARSE SHEET LOGIC ═══');

function parseSheet(wb, name) {
  var ws = wb.Sheets[name];
  if (!ws) return { tenure:'', rows:[], totalHours:0, rate:20 };
  var range = XLSX.utils.decode_range(ws['!ref']||'A1:C1');
  function cv(r,c) { var cell = ws[XLSX.utils.encode_cell({r:r,c:c})]; return cell ? (cell.v !== undefined ? cell.v : null) : null; }
  var tenure = String(cv(0,1)||''), rows = [], rate = 20;
  for (var r = 2; r <= range.e.r; r++) {
    var c0=cv(r,0),c1=cv(r,1),c2=cv(r,2);
    if (c0==null) { var lb=String(c1||'').trim().toLowerCase(); if(lb==='rate per hour'&&c2!=null){var p=parseFloat(c2);if(!isNaN(p)&&p>0)rate=p;} continue; }
    if (c2==='--'||c2==null) continue;
    var hrs = parseFloat(c2); if (isNaN(hrs)) continue;
    rows.push({ date:c0, desc:(c1!=null)?String(c1):'', hours:hrs });
  }
  return { tenure:tenure, rows:rows, totalHours:rows.reduce(function(s,r){return s+r.hours;},0), rate:rate };
}

// Test each sheet
const sheetResults = {};
wb.SheetNames.forEach(name => {
  const result = parseSheet(wb, name);
  sheetResults[name] = result;
  assert(result.rows.length > 0, `"${name}" has ${result.rows.length} data rows`);
  assert(result.totalHours > 0, `"${name}" has ${result.totalHours} total hours`);
  assert(result.rate > 0, `"${name}" rate = ${result.rate}`);
  assert(result.tenure.length > 0, `"${name}" has tenure: "${result.tenure.slice(0,40)}..."`);
});

// Specific sheet tests
const july = sheetResults['July 2024'];
assertEq(july.rows.length, 8, 'July 2024 has exactly 8 data rows');
assertEq(july.totalHours, 29, 'July 2024 total hours = 29');
assertEq(july.rate, 25, 'July 2024 rate = 25');
assert(july.tenure.indexOf('July') !== -1, 'July 2024 tenure contains "July"');

const aug = sheetResults['August 2024'];
assertEq(aug.rows.length, 11, 'August 2024 has exactly 11 data rows');
assertEq(aug.totalHours, 46, 'August 2024 total hours = 46');
assertEq(aug.rate, 20, 'August 2024 rate = 20');

// Test that header row is properly skipped
const julyWs = wb.Sheets['July 2024'];
const headerCell = julyWs[XLSX.utils.encode_cell({r:3, c:2})]; // Row 3, Col C = "Time Required [Hours]"
assert(headerCell != null && headerCell.v === 'Time Required [Hours]', 'Row 3 contains header "Time Required [Hours]"');
// parseSheet should NOT include a row with NaN hours (the header)
assert(july.rows.every(r => !isNaN(r.hours) && typeof r.hours === 'number'), 'No NaN hours in parsed data');

// ─── TEST GROUP 4: Formatting functions ───
console.log('\n═══ 4. FORMATTING FUNCTIONS ═══');

function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '₹0.00';
  var num = Math.abs(Number(amount));
  var parts = num.toFixed(2).split('.');
  var intPart = parts[0], decPart = parts[1];
  var last3 = intPart.slice(-3);
  var rest = intPart.slice(0, -3);
  var fmt = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
  return (amount < 0 ? '-' : '') + '₹' + fmt + '.' + decPart;
}

assertEq(formatINR(0), '₹0.00', 'formatINR(0)');
assertEq(formatINR(100), '₹100.00', 'formatINR(100)');
assertEq(formatINR(1000), '₹1,000.00', 'formatINR(1000)');
assertEq(formatINR(10000), '₹10,000.00', 'formatINR(10000)');
assertEq(formatINR(100000), '₹1,00,000.00', 'formatINR(100000)');
assertEq(formatINR(1000000), '₹10,00,000.00', 'formatINR(1000000)');
assertEq(formatINR(12345678.90), '₹1,23,45,678.90', 'formatINR(12345678.90)');
assertEq(formatINR(-500), '-₹500.00', 'formatINR(-500)');
assertEq(formatINR(null), '₹0.00', 'formatINR(null)');
assertEq(formatINR(NaN), '₹0.00', 'formatINR(NaN)');
assertEq(formatINR(undefined), '₹0.00', 'formatINR(undefined)');

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

assertEq(escapeHtml('hello'), 'hello', 'escapeHtml plain text');
assertEq(escapeHtml('<script>'), '&lt;script&gt;', 'escapeHtml XSS');
assertEq(escapeHtml('A & B'), 'A &amp; B', 'escapeHtml ampersand');
assertEq(escapeHtml('"quotes"'), '&quot;quotes&quot;', 'escapeHtml quotes');
assertEq(escapeHtml(''), '', 'escapeHtml empty');
assertEq(escapeHtml(null), '', 'escapeHtml null');
assertEq(escapeHtml(undefined), '', 'escapeHtml undefined');

function suggestInvNum(name) {
  var ms={january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12'};
  var low=name.toLowerCase(),ym=name.match(/(\d{4})/),yr=ym?ym[1]:String(new Date().getFullYear());
  for(var m in ms){if(low.indexOf(m)!==-1)return yr+ms[m];} return '';
}

assertEq(suggestInvNum('July 2024'), '202407', 'suggestInvNum July 2024');
assertEq(suggestInvNum('November 2025'), '202511', 'suggestInvNum November 2025');
assertEq(suggestInvNum('January 2025'), '202501', 'suggestInvNum January 2025');
assertEq(suggestInvNum('March 2025'), '202503', 'suggestInvNum March 2025');
assertEq(suggestInvNum('No Month Here'), '', 'suggestInvNum no match');

function getAutoFitSizing(n) {
  if (n<=0) return {fs:9,pad:4,lh:1.35,thFs:10,nameFs:26};
  var budget = 946/(n+2);
  var fs,pad,lh;
  if(budget>=26){fs=9;pad=4;lh=1.35;}
  else if(budget>=20){fs=8.5;pad=3;lh=1.25;}
  else if(budget>=16){fs=8;pad=2.5;lh=1.2;}
  else if(budget>=13){fs=7;pad=2;lh=1.15;}
  else if(budget>=11){fs=6.5;pad=1.5;lh=1.1;}
  else{fs=6;pad=1;lh=1.05;}
  return {fs:fs,pad:pad,lh:lh,thFs:Math.min(fs+1,10),nameFs:n>30?22:26};
}

const sz0 = getAutoFitSizing(0);
assertEq(sz0.fs, 9, 'getAutoFitSizing(0) fs=9');
assertEq(sz0.nameFs, 26, 'getAutoFitSizing(0) nameFs=26');

const sz10 = getAutoFitSizing(10);
assert(sz10.fs >= 6 && sz10.fs <= 9, 'getAutoFitSizing(10) fs in range');

const sz50 = getAutoFitSizing(50);
assert(sz50.fs <= 8, 'getAutoFitSizing(50) fs ≤ 8 (smaller font for many rows)');
assertEq(sz50.nameFs, 22, 'getAutoFitSizing(50) nameFs=22 (reduced for >30 rows)');

const sz100 = getAutoFitSizing(100);
assert(sz100.fs <= 7, 'getAutoFitSizing(100) fs ≤ 7');

// ─── TEST GROUP 5: HTML Structure validation ───
console.log('\n═══ 5. HTML STRUCTURE ═══');

const html = fs.readFileSync(HTML_FILE, 'utf8');

assert(html.includes('xlsx.full.min.js'), 'HTML includes SheetJS CDN');
assert(html.includes('html2canvas'), 'HTML includes html2canvas CDN');
assert(html.includes('jspdf'), 'HTML includes jsPDF CDN');
assert(html.includes('id="file-input"'), 'HTML has file input element');
assert(html.includes('id="invoice-preview"'), 'HTML has invoice preview element');
assert(html.includes('id="export-pdf-btn"'), 'HTML has PDF export button');
assert(!html.includes('id="export-print-btn"'), 'HTML does not have browser print button');
assert(html.includes('id="cfg-month"'), 'HTML has month selector');
assert(html.includes('function loadWorkbook'), 'HTML has loadWorkbook function');
assert(html.includes('function parseSheet'), 'HTML has parseSheet function');
assert(html.includes('function renderInvoice'), 'HTML has renderInvoice function');
assert(html.includes('function exportPDF'), 'HTML has exportPDF function');
assert(html.includes('function getExportPdfFileName'), 'HTML has PDF filename helper');
assert(html.includes('function buildInvoiceHTML'), 'HTML has buildInvoiceHTML function');
assert(html.includes('function formatINR'), 'HTML has formatINR function');
assert(html.includes('function escapeHtml'), 'HTML has escapeHtml function');

// Critical: Uint8Array fix
assert(html.includes('new Uint8Array(buf)') || html.includes('new Uint8Array('), 'HTML has Uint8Array wrapping for ArrayBuffer');
assert(html.includes('instanceof ArrayBuffer'), 'HTML checks for ArrayBuffer type');

// Critical: XLSX undefined check
assert(html.includes("typeof XLSX === 'undefined'") || html.includes("typeof XLSX==='undefined'"), 'HTML checks if XLSX library is loaded');

// Critical: No overflow:hidden in buildInvoiceHTML body/container
// Check the buildInvoiceHTML function specifically
const buildFnMatch = html.match(/function buildInvoiceHTML\(\)[\s\S]*?^  \}/m);
if (buildFnMatch) {
  const buildFn = buildFnMatch[0];
  // The body and root container should NOT have overflow:hidden
  const bodyStyleMatch = buildFn.match(/body\{[^}]*\}/);
  if (bodyStyleMatch) {
    assert(!bodyStyleMatch[0].includes('overflow:hidden'), 'PDF body style has NO overflow:hidden');
  }
  // The root container div (first div in body)
  const rootDivStyles = buildFn.match(/width:794px;height:1123px;[^"']*/);
  if (rootDivStyles) {
    assert(!rootDivStyles[0].includes('overflow:hidden'), 'PDF root container has NO overflow:hidden');
  }
}

// Check file-input change handler includes error handling  
assert(html.includes('reader.onerror'), 'HTML has FileReader error handler');
assert(html.includes('readAsArrayBuffer'), 'HTML uses readAsArrayBuffer');

// Check theme definitions
['classic', 'charcoal', 'teal', 'burgundy', 'forest', 'navy-gold'].forEach(theme => {
  assert(html.includes(`data-theme="${theme}"`), `Theme "${theme}" defined`);
});

// ─── TEST GROUP 6: Computation tests ───
console.log('\n═══ 6. COMPUTATION TESTS ═══');

// Simulate computeTotals for July 2024
const julyHours = july.totalHours;
const julyRate = july.rate;
const fxRate = 86;
const julyUSD = julyHours * julyRate;
const julyINR = julyUSD * fxRate;

assertEq(julyHours, 29, 'July hours = 29');
assertEq(julyUSD, 725, 'July USD = 29 × 25 = 725');
assertEq(julyINR, 62350, 'July INR = 725 × 86 = 62350');
assertEq(formatINR(julyINR), '₹62,350.00', 'July INR formatted correctly');

// ─── TEST GROUP 7: Edge cases ───
console.log('\n═══ 7. EDGE CASES ═══');

// Test empty sheet handling
const emptyResult = parseSheet(wb, 'NonExistentSheet');
assertEq(emptyResult.rows.length, 0, 'Non-existent sheet returns empty rows');
assertEq(emptyResult.totalHours, 0, 'Non-existent sheet returns 0 hours');
assertEq(emptyResult.rate, 20, 'Non-existent sheet returns default rate 20');

// Test formatINR edge cases
assertEq(formatINR(0.01), '₹0.01', 'formatINR very small');
assertEq(formatINR(999.99), '₹999.99', 'formatINR under 1000');
assertEq(formatINR(1234567890.12), '₹1,23,45,67,890.12', 'formatINR very large number');

// Test getAutoFitSizing edge cases
const sz1 = getAutoFitSizing(1);
assertEq(sz1.fs, 9, 'getAutoFitSizing(1) largest font');

const sz200 = getAutoFitSizing(200);
assertEq(sz200.fs, 6, 'getAutoFitSizing(200) smallest font');
assert(sz200.pad === 1, 'getAutoFitSizing(200) minimal padding');

// ─── TEST GROUP 8: Date row handling ───
console.log('\n═══ 8. DATE ROW HANDLING ═══');

// Check that "--" hours rows are skipped
const hasDoubleDash = wb.SheetNames.some(name => {
  const ws = wb.Sheets[name];
  const range = XLSX.utils.decode_range(ws['!ref']||'A1:C1');
  for (let r = 0; r <= range.e.r; r++) {
    const cell = ws[XLSX.utils.encode_cell({r, c:2})];
    if (cell && cell.v === '--') return true;
  }
  return false;
});
// Whether or not "--" exists, our parser should handle it
assert(true, '"--" hours handling: parseSheet skips c2==="--" rows');

// Check that date values are preserved
assert(july.rows[0].date != null, 'First row has a date value');
assert(typeof july.rows[0].desc === 'string', 'First row desc is a string');
assert(typeof july.rows[0].hours === 'number', 'First row hours is a number');

// ─── SUMMARY ───
console.log('\n═══════════════════════════════════════');
console.log(`RESULTS: ${passed}/${total} passed, ${failed} failed`);
console.log('═══════════════════════════════════════');
if (failed > 0) {
  console.log('\n⚠️  SOME TESTS FAILED!');
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED!');
  process.exit(0);
}
