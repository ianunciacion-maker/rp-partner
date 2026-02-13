import { Platform } from 'react-native';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import type { CashflowEntry, Property } from '@/types/database';
import type { OccupancyData } from '@/services/analytics';

interface ReportData {
  entries: CashflowEntry[];
  properties: Property[];
  occupancy: OccupancyData[];
  fromMonth: string;
  toMonth: string;
  propertyName?: string;
}

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateReportHTML(data: ReportData): string {
  const { entries, occupancy, fromMonth, toMonth, propertyName } = data;

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((s, e) => s + (e.amount || 0), 0);
  const totalExpense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + (e.amount || 0), 0);
  const net = totalIncome - totalExpense;

  const categoryTotals: Record<string, { type: string; total: number }> = {};
  for (const e of entries) {
    const key = `${e.type}-${e.category}`;
    if (!categoryTotals[key]) categoryTotals[key] = { type: e.type, total: 0 };
    categoryTotals[key].total += e.amount || 0;
  }

  const incomeCategories = Object.entries(categoryTotals)
    .filter(([, v]) => v.type === 'income')
    .sort(([, a], [, b]) => b.total - a.total);
  const expenseCategories = Object.entries(categoryTotals)
    .filter(([, v]) => v.type === 'expense')
    .sort(([, a], [, b]) => b.total - a.total);

  const dateRange = fromMonth === toMonth
    ? formatMonthLabel(fromMonth)
    : `${formatMonthLabel(fromMonth)} - ${formatMonthLabel(toMonth)}`;

  const subtitle = propertyName ? `${propertyName} | ${dateRange}` : dateRange;

  const occupancyRows = occupancy.length > 0
    ? occupancy.map((o) => `
        <tr>
          <td>${o.propertyName}</td>
          <td style="text-align:center">${o.occupancyRate}%</td>
          <td style="text-align:center">${o.bookedNights}</td>
          <td style="text-align:center">${o.totalDays - o.lockedDays}</td>
        </tr>
      `).join('')
    : '';

  const categoryRows = (cats: [string, { type: string; total: number }][]) =>
    cats.map(([key, val]) => {
      const category = key.split('-').slice(1).join('-');
      return `<tr><td style="text-transform:capitalize">${category.replace(/_/g, ' ')}</td><td style="text-align:right">${formatCurrency(val.total)}</td></tr>`;
    }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; padding: 40px; font-size: 13px; }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #14b8a6; padding-bottom: 16px; }
  .header h1 { font-size: 24px; color: #14b8a6; margin-bottom: 4px; }
  .header p { color: #6b7280; font-size: 14px; }
  .generated { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .summary { display: flex; gap: 16px; margin-bottom: 32px; }
  .summary-card { flex: 1; padding: 16px; border-radius: 8px; text-align: center; }
  .income-card { background: #ecfdf5; }
  .expense-card { background: #fef2f2; }
  .net-card { background: #f0f9ff; }
  .summary-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
  .summary-value { font-size: 20px; font-weight: 700; }
  .income-value { color: #059669; }
  .expense-value { color: #dc2626; }
  .net-positive { color: #059669; }
  .net-negative { color: #dc2626; }
  h2 { font-size: 16px; margin: 24px 0 12px; color: #374151; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }
  .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Tuknang Financial Report</h1>
    <p>${subtitle}</p>
    <p class="generated">Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>

  <div class="summary">
    <div class="summary-card income-card">
      <div class="summary-label">Total Income</div>
      <div class="summary-value income-value">${formatCurrency(totalIncome)}</div>
    </div>
    <div class="summary-card expense-card">
      <div class="summary-label">Total Expenses</div>
      <div class="summary-value expense-value">${formatCurrency(totalExpense)}</div>
    </div>
    <div class="summary-card net-card">
      <div class="summary-label">Net Profit</div>
      <div class="summary-value ${net >= 0 ? 'net-positive' : 'net-negative'}">${net >= 0 ? '+' : ''}${formatCurrency(net)}</div>
    </div>
  </div>

  ${occupancyRows ? `
  <h2>Occupancy Rates</h2>
  <table>
    <tr><th>Property</th><th style="text-align:center">Rate</th><th style="text-align:center">Booked</th><th style="text-align:center">Available</th></tr>
    ${occupancyRows}
  </table>` : ''}

  ${incomeCategories.length > 0 ? `
  <h2>Income by Category</h2>
  <table>
    <tr><th>Category</th><th style="text-align:right">Amount</th></tr>
    ${categoryRows(incomeCategories)}
    <tr style="font-weight:700;border-top:2px solid #e5e7eb"><td>Total</td><td style="text-align:right">${formatCurrency(totalIncome)}</td></tr>
  </table>` : ''}

  ${expenseCategories.length > 0 ? `
  <h2>Expenses by Category</h2>
  <table>
    <tr><th>Category</th><th style="text-align:right">Amount</th></tr>
    ${categoryRows(expenseCategories)}
    <tr style="font-weight:700;border-top:2px solid #e5e7eb"><td>Total</td><td style="text-align:right">${formatCurrency(totalExpense)}</td></tr>
  </table>` : ''}

  <h2>All Transactions</h2>
  <table>
    <tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th style="text-align:right">Amount</th></tr>
    ${entries
      .sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
      .map((e) => `
        <tr>
          <td>${e.transaction_date}</td>
          <td style="text-transform:capitalize">${e.type}</td>
          <td style="text-transform:capitalize">${(e.category || '').replace(/_/g, ' ')}</td>
          <td>${e.description}</td>
          <td style="text-align:right;color:${e.type === 'income' ? '#059669' : '#dc2626'}">${e.type === 'income' ? '+' : '-'}${formatCurrency(e.amount || 0)}</td>
        </tr>
      `).join('')}
  </table>

  <div class="footer">Tuknang — Rental Property Management</div>
</body>
</html>`;
}

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export async function exportPDFReport(data: ReportData, filename: string): Promise<void> {
  const html = generateReportHTML(data);

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.alert('Please allow popups to export the PDF report.');
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    const { uri } = await printToFileAsync({ html });
    await shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Export Financial Report',
      UTI: 'com.adobe.pdf',
    });
  }
}
