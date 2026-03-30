/**
 * Excel export utility using xlsx-js-style
 * Produces formatted workbooks with bold headers, column widths, and number formatting.
 */
import * as XLSX from 'xlsx-js-style';

// ─── Shared style tokens ────────────────────────────────────────────────────

const HEADER_FILL  = { fgColor: { rgb: '1E40AF' } }; // blue-800
const HEADER_FONT  = { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 };
const HEADER_ALIGN = { horizontal: 'center', vertical: 'center', wrapText: true };
const HEADER_BORDER = border();

const ALT_FILL = { fgColor: { rgb: 'EFF6FF' } }; // blue-50
const DEF_FONT = { sz: 10 };
const DEF_BORDER = border();

function border() {
  const side = { style: 'thin', color: { rgb: 'D1D5DB' } };
  return { top: side, bottom: side, left: side, right: side };
}

function headerStyle() {
  return { fill: HEADER_FILL, font: HEADER_FONT, alignment: HEADER_ALIGN, border: HEADER_BORDER };
}

function cellStyle(rowIdx, numFmt) {
  const fill = rowIdx % 2 === 0 ? undefined : ALT_FILL;
  const s = { font: DEF_FONT, border: DEF_BORDER, alignment: { vertical: 'center' } };
  if (fill) s.fill = fill;
  if (numFmt) s.numFmt = numFmt;
  return s;
}

function dateStyle(rowIdx) {
  return cellStyle(rowIdx, 'DD-MMM-YYYY');
}

function currencyStyle(rowIdx) {
  return cellStyle(rowIdx, '#,##0.00');
}

function intStyle(rowIdx) {
  return cellStyle(rowIdx, '#,##0');
}

// ─── Core sheet builder ─────────────────────────────────────────────────────

/**
 * Build a worksheet from headers + rows arrays.
 * @param {string[]} headers  - Column labels
 * @param {number[]} widths   - Column widths in characters
 * @param {Array[]}  rows     - Array of row arrays; each cell may be { v, t, s } or raw value
 * @param {string[]} [colTypes] - 'date'|'num'|'str' per column for default style lookup
 */
function buildSheet(headers, widths, rows) {
  const ws = {};
  const R = rows.length + 1; // +1 for header
  const C = headers.length;

  // Headers
  headers.forEach((h, ci) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: ci });
    ws[addr] = { v: h, t: 's', s: headerStyle() };
  });

  // Data rows
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const addr = XLSX.utils.encode_cell({ r: ri + 1, c: ci });
      if (cell !== null && typeof cell === 'object' && 'v' in cell) {
        ws[addr] = cell;
      } else {
        ws[addr] = { v: cell ?? '', t: typeof cell === 'number' ? 'n' : 's', s: cellStyle(ri) };
      }
    });
  });

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: R, c: C - 1 } });
  ws['!cols'] = widths.map(w => ({ wch: w }));
  ws['!rows'] = [{ hpx: 28 }]; // taller header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }; // freeze top row

  // AutoFilter across header row
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: C - 1 } }) };

  return ws;
}

function saveWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}

// ─── Date helper ────────────────────────────────────────────────────────────

function excelDate(dateStr) {
  if (!dateStr) return { v: '', t: 's', s: cellStyle(0) };
  const d = new Date(dateStr);
  if (isNaN(d)) return { v: dateStr, t: 's', s: cellStyle(0) };
  // Excel serial date: days since 1899-12-31
  const serial = 25569 + d.getTime() / 86400000;
  return serial;
}

// ─── Export functions ────────────────────────────────────────────────────────

export function exportPurchases(data) {
  const headers = [
    'Sr.', 'Item Description', 'Vendor', 'Date', 'Qty',
    'Price', 'Currency', 'Price (AED)', 'Total', 'Total (AED)',
    'Medium', 'Status', 'Order By', 'Category', 'Payment Account',
  ];
  const widths = [5, 30, 20, 13, 7, 10, 10, 13, 10, 13, 12, 12, 14, 14, 18];

  const rows = data.map((p, i) => {
    const ri = i;
    return [
      { v: i + 1,                                   t: 'n', s: intStyle(ri) },
      { v: p.itemDescription || '',                  t: 's', s: cellStyle(ri) },
      { v: p.vendorName || '',                       t: 's', s: cellStyle(ri) },
      { v: p.purchaseDate ? excelDate(p.purchaseDate) : '', t: 'n', s: dateStyle(ri) },
      { v: p.quantity ?? 0,                          t: 'n', s: intStyle(ri) },
      { v: p.price ?? 0,                             t: 'n', s: currencyStyle(ri) },
      { v: p.currency || '',                         t: 's', s: cellStyle(ri) },
      { v: p.priceInAED ?? 0,                        t: 'n', s: currencyStyle(ri) },
      { v: p.total ?? 0,                             t: 'n', s: currencyStyle(ri) },
      { v: p.totalInAED ?? 0,                        t: 'n', s: currencyStyle(ri) },
      { v: p.medium || '',                           t: 's', s: cellStyle(ri) },
      { v: p.status || '',                           t: 's', s: cellStyle(ri) },
      { v: p.orderBy || '',                          t: 's', s: cellStyle(ri) },
      { v: p.category || '',                         t: 's', s: cellStyle(ri) },
      { v: p.paymentAccount || '',                   t: 's', s: cellStyle(ri) },
    ];
  });

  const ws = buildSheet(headers, widths, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Purchases');
  saveWorkbook(wb, `Purchase_Tracker_${today()}.xlsx`);
}

export function exportImports(data) {
  // Sheet 1 — Shipments
  const shipHeaders = [
    'Sr.', 'Vendor', 'Country', 'Invoice No.', 'Tracking No.',
    'Shipping Date', 'Receiving Date', 'Duty Paid (AED)', 'Payment Mode', 'Status',
  ];
  const shipWidths = [5, 20, 14, 16, 20, 14, 14, 16, 14, 12];

  const shipRows = data.map((imp, i) => {
    const ri = i;
    return [
      { v: i + 1,                               t: 'n', s: intStyle(ri) },
      { v: imp.vendorName || '',                t: 's', s: cellStyle(ri) },
      { v: imp.country || '',                   t: 's', s: cellStyle(ri) },
      { v: imp.invoiceNumber || '',             t: 's', s: cellStyle(ri) },
      { v: imp.trackingNumber || '',            t: 's', s: cellStyle(ri) },
      { v: imp.shippingDate ? excelDate(imp.shippingDate) : '', t: 'n', s: dateStyle(ri) },
      { v: imp.receivingDate ? excelDate(imp.receivingDate) : '', t: 'n', s: dateStyle(ri) },
      { v: imp.dutyPaid ?? 0,                   t: 'n', s: currencyStyle(ri) },
      { v: imp.paymentMode || '',               t: 's', s: cellStyle(ri) },
      { v: imp.status || '',                    t: 's', s: cellStyle(ri) },
    ];
  });

  // Sheet 2 — Items
  const itemHeaders = ['Shipment Sr.', 'Invoice No.', 'Item Description', 'Quantity'];
  const itemWidths  = [13, 16, 36, 10];
  const itemRows = [];
  data.forEach((imp, si) => {
    (imp.items || []).forEach((item, ii) => {
      const ri = itemRows.length;
      itemRows.push([
        { v: si + 1,                            t: 'n', s: intStyle(ri) },
        { v: imp.invoiceNumber || '',           t: 's', s: cellStyle(ri) },
        { v: item.itemDescription || '',        t: 's', s: cellStyle(ri) },
        { v: item.quantity ?? 0,               t: 'n', s: intStyle(ri) },
      ]);
    });
  });

  const ws1 = buildSheet(shipHeaders, shipWidths, shipRows);
  const ws2 = buildSheet(itemHeaders, itemWidths, itemRows);
  const wb  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Shipments');
  XLSX.utils.book_append_sheet(wb, ws2, 'Items');
  saveWorkbook(wb, `Import_Tracker_${today()}.xlsx`);
}

export function exportShipping(data) {
  const headers = [
    'Sr.', 'Item Description', 'Vendor',
    'Total Qty', 'Qty Shipped', 'Qty Remaining', 'Status',
  ];
  const widths = [5, 36, 20, 10, 12, 14, 12];

  const rows = data.map((s, i) => {
    const ri = i;
    return [
      { v: s.srNo ?? (i + 1),                  t: 'n', s: intStyle(ri) },
      { v: s.itemDescription || '',             t: 's', s: cellStyle(ri) },
      { v: s.vendorName || '',                  t: 's', s: cellStyle(ri) },
      { v: s.totalQuantity ?? 0,               t: 'n', s: intStyle(ri) },
      { v: s.quantityShipped ?? 0,             t: 'n', s: intStyle(ri) },
      { v: s.quantityRemaining ?? 0,           t: 'n', s: intStyle(ri) },
      { v: s.status || '',                      t: 's', s: cellStyle(ri) },
    ];
  });

  const ws = buildSheet(headers, widths, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shipping');
  saveWorkbook(wb, `Shipping_Tracker_${today()}.xlsx`);
}

export function exportPending(data) {
  const headers = [
    'Sr.', 'Item Description', 'Qty Pending', 'Shipment', 'Priority',
  ];
  const widths = [5, 36, 12, 20, 12];

  const rows = data.map((p, i) => {
    const ri = i;
    return [
      { v: p.srNo ?? (i + 1),                  t: 'n', s: intStyle(ri) },
      { v: p.itemDescription || '',             t: 's', s: cellStyle(ri) },
      { v: p.qtyPending ?? 0,                  t: 'n', s: intStyle(ri) },
      { v: p.shipment || '',                   t: 's', s: cellStyle(ri) },
      { v: p.priority || '',                    t: 's', s: cellStyle(ri) },
    ];
  });

  const ws = buildSheet(headers, widths, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pending');
  saveWorkbook(wb, `Pending_Tracker_${today()}.xlsx`);
}

export function exportExpenses(data) {
  const headers = [
    'Date', 'Type', 'Category', 'Account', 'Amount (AED)', 'Remark',
  ];
  const widths = [13, 12, 18, 18, 14, 36];

  const rows = data.map((e, i) => {
    const ri = i;
    const amount = e.amount || e.creditAmount || e.debitAmount || 0;
    return [
      { v: (e.date || e.createdAt) ? excelDate(e.date || e.createdAt) : '', t: 'n', s: dateStyle(ri) },
      { v: formatType(e.type),                                                t: 's', s: cellStyle(ri) },
      { v: e.category || e.sourceExpense || '',                               t: 's', s: cellStyle(ri) },
      { v: e.account || '',                                                   t: 's', s: cellStyle(ri) },
      { v: amount,                                                            t: 'n', s: currencyStyle(ri) },
      { v: e.remark || e.comment || '',                                       t: 's', s: cellStyle(ri) },
    ];
  });

  const ws = buildSheet(headers, widths, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Accounts');
  saveWorkbook(wb, `Accounts_${today()}.xlsx`);
}

export function exportVendors(data) {
  const headers = [
    'Sr.', 'Company Name', 'Salesperson', 'Contact No.', 'Email', 'Address',
  ];
  const widths = [5, 28, 20, 16, 28, 36];

  const rows = data.map((v, i) => {
    const ri = i;
    return [
      { v: i + 1,                t: 'n', s: intStyle(ri) },
      { v: v.companyName || '',  t: 's', s: cellStyle(ri) },
      { v: v.salesperson || '',  t: 's', s: cellStyle(ri) },
      { v: v.contactNo || '',    t: 's', s: cellStyle(ri) },
      { v: v.email || '',        t: 's', s: cellStyle(ri) },
      { v: v.address || '',      t: 's', s: cellStyle(ri) },
    ];
  });

  const ws = buildSheet(headers, widths, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
  saveWorkbook(wb, `Vendors_${today()}.xlsx`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatType(type) {
  const map = {
    income: 'Income',
    expense: 'Expense',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    adjustment: 'Adjustment',
  };
  return map[type] || type || '';
}
