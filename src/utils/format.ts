export function formatCurrency(amount: number): string {
  // Format with Bangladeshi Taka symbol ৳ as in screenshot
  return '৳' + Math.round(amount).toLocaleString('en-US');
}

export function formatDateTime(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} ${month} ${day}`;
}

export function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
}
