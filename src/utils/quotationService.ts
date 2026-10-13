// ============================================================================
// QUOTATIONS & ESTIMATES SERVICE
// Manages quotations, pro-forma estimates, WhatsApp link generation,
// and conversions to active sales invoices.
// ============================================================================

import { LetterheadConfig } from './letterheadService';
import { ERPTransactionRecord, saveStoredSalesInvoices, getStoredSalesInvoices } from '../data/mockTransactions';
import { formatCurrency } from './format';

export interface QuotationItem {
  id: string;
  name: string;
  sku?: string;
  specs?: string;
  warranty?: string;
  qty: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Expired' | 'Converted to Invoice';

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g. QT-2026-0042
  date: string;        // e.g. 2026-10-07
  validUntil: string;  // e.g. 2026-10-22
  partyName: string;   // Client contact person
  partyCompany?: string; // B2B Organization name
  partyPhone?: string;
  partyEmail?: string;
  partyAddress?: string;
  attention?: string;  // e.g. "Attn: Head of IT / Procurement"
  subject?: string;    // e.g. "Quotation for 5x Core i7 Workstations & Monitors"
  itemsList: QuotationItem[];
  grossAmount: number;
  discountAmount: number;
  vatRate: number;
  taxAmount: number;
  grandTotal: number;
  status: QuotationStatus;
  paymentTerms: string;
  deliveryLeadTime: string;
  warrantyTerms: string;
  notes?: string;
  createdBy: string;
  sentViaWhatsAppAt?: string;
  whatsappPhoneUsed?: string;
  convertedInvoiceRef?: string;
}

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quote-2026-0042',
    quoteNumber: 'QT-2026-0042',
    date: '07/10/2026',
    validUntil: '22/10/2026',
    partyName: 'Tanvir Ahmed',
    partyCompany: 'Apex Software & Solutions Ltd.',
    partyPhone: '+880 1711-456789',
    partyEmail: 'procurement@apexsoft.com.bd',
    partyAddress: 'House 42, Road 11, Banani, Dhaka-1213',
    attention: 'Attn: Mr. Tanvir Ahmed (IT Procurement Lead)',
    subject: 'Quotation for Intel Core i7 14th Gen Developer Workstations & 4K Displays',
    itemsList: [
      {
        id: 'q-item-1',
        name: 'NextGen Pro Workstation (Core i7-14700K, 32GB DDR5, 1TB NVMe, RTX 4060)',
        sku: 'WS-147K-01',
        specs: '14th Gen 20-Core, Corsair 32GB 6000MHz, Kingston KC3000 Gen4, Antec 750W Gold',
        warranty: '3 Years Official Warranty',
        qty: 3,
        unitPrice: 125000,
        discount: 3000,
        total: 366000,
      },
      {
        id: 'q-item-2',
        name: 'Dell UltraSharp 27" 4K UHD USB-C IPS Monitor (U2723QE)',
        sku: 'MON-DELL-U27',
        specs: 'IPS Black Technology, 98% DCI-P3, 90W Power Delivery, Height Adjustable',
        warranty: '3 Years Replacement Warranty',
        qty: 3,
        unitPrice: 58500,
        discount: 1500,
        total: 171000,
      },
      {
        id: 'q-item-3',
        name: 'Logitech MX Keys S Combo (Wireless Keyboard & MX Master 3S Mouse)',
        sku: 'ACC-LOGI-MXS',
        specs: 'Silent Touch, Quiet Click, Smart Backlit, Multi-OS Flow Supported',
        warranty: '1 Year Warranty',
        qty: 3,
        unitPrice: 18500,
        discount: 0,
        total: 55500,
      },
    ],
    grossAmount: 597000,
    discountAmount: 4500,
    vatRate: 5,
    taxAmount: 29625,
    grandTotal: 622125,
    status: 'Sent',
    paymentTerms: '50% Advance with Purchase Order, 50% upon delivery & inspection',
    deliveryLeadTime: 'Within 24 to 48 business hours from confirmed PO',
    warrantyTerms: 'Full 3-Year comprehensive parts warranty with next-day on-site support in Dhaka',
    notes: 'Free installation, cable management, and OS deployment included at Banani office.',
    createdBy: 'Forhad (Corporate Sales)',
    sentViaWhatsAppAt: '07/10/2026, 11:30 AM',
    whatsappPhoneUsed: '+880 1711-456789',
  },
  {
    id: 'quote-2026-0041',
    quoteNumber: 'QT-2026-0041',
    date: '06/10/2026',
    validUntil: '21/10/2026',
    partyName: 'Rahim Khan',
    partyCompany: 'Dhaka FinTech Innovations',
    partyPhone: '+880 1819-234567',
    partyEmail: 'rahim@dhakafintech.io',
    partyAddress: 'Level 8, Tower 71, Motijheel C/A, Dhaka-1000',
    attention: 'Attn: Rahim Khan (Chief Technology Officer)',
    subject: 'Pro-Forma Price Estimate for High-Throughput Rack Server & UPS Backup',
    itemsList: [
      {
        id: 'q-item-4',
        name: 'Dell PowerEdge R660 1U Rack Server',
        sku: 'SRV-R660-01',
        specs: 'Dual Intel Xeon Silver 4410Y, 64GB DDR5 ECC, 2x 960GB Enterprise SAS SSD RAID 1',
        warranty: '3 Years Dell ProSupport Next Business Day',
        qty: 1,
        unitPrice: 485000,
        discount: 10000,
        total: 475000,
      },
      {
        id: 'q-item-5',
        name: 'APC Smart-UPS On-Line 3kVA 230V Rackmount (SRT3000XLI)',
        sku: 'UPS-APC-3K',
        specs: 'Pure Sine Wave, Double Conversion, Network Management Card Pre-installed',
        warranty: '2 Years Full Replacement Warranty',
        qty: 1,
        unitPrice: 165000,
        discount: 5000,
        total: 160000,
      },
    ],
    grossAmount: 650000,
    discountAmount: 15000,
    vatRate: 5,
    taxAmount: 31750,
    grandTotal: 666750,
    status: 'Accepted',
    paymentTerms: '100% against Bank Pay Order or Account Payee Cheque on Delivery',
    deliveryLeadTime: 'Ready in stock for same-day delivery',
    warrantyTerms: 'Dell Enterprise ProSupport 24x7 Mission Critical Service',
    notes: 'Server rack rails and power distribution unit cables included complimentary.',
    createdBy: 'Forhad (Corporate Sales)',
  },
  {
    id: 'quote-2026-0038',
    quoteNumber: 'QT-2026-0038',
    date: '04/10/2026',
    validUntil: '19/10/2026',
    partyName: 'Shahriar Kabir',
    partyCompany: 'Kabir & Associates Law Chambers',
    partyPhone: '+880 1912-887766',
    partyEmail: 'info@kabirlaw.com.bd',
    partyAddress: 'Suite 302, Concord Tower, Kakrail, Dhaka',
    attention: 'Attn: Adv. Shahriar Kabir',
    subject: 'Price Quotation for Office Laptops & Heavy-Duty Laser Network Printer',
    itemsList: [
      {
        id: 'q-item-6',
        name: 'Lenovo ThinkPad E14 Gen 5 (Intel Core i5-1335U, 16GB, 512GB SSD)',
        sku: 'LAP-TP-E14',
        specs: '14" FHD IPS Anti-glare, Aluminum chassis, Fingerprint reader, Backlit KB',
        warranty: '2 Years Lenovo Premier Support',
        qty: 2,
        unitPrice: 84500,
        discount: 2000,
        total: 165000,
      },
      {
        id: 'q-item-7',
        name: 'HP LaserJet Pro MFP 4103fdw Wireless All-in-One Duplex Printer',
        sku: 'PRN-HP-4103',
        specs: 'Auto duplex printing, 42 ppm, Dual-band Wi-Fi, Ethernet, 50-sheet ADF scanner',
        warranty: '1 Year HP Official Warranty',
        qty: 1,
        unitPrice: 62000,
        discount: 1000,
        total: 61000,
      },
    ],
    grossAmount: 231000,
    discountAmount: 5000,
    vatRate: 5,
    taxAmount: 11300,
    grandTotal: 237300,
    status: 'Draft',
    paymentTerms: 'Cash or bKash / Card upon delivery at Kakrail premises',
    deliveryLeadTime: 'Within 24 hours of confirmation',
    warrantyTerms: 'Standard manufacturer warranty with local service center assistance',
    notes: 'Free carrying bags, mousepads, and surge protectors included.',
    createdBy: 'Cashier Forhad',
  },
];

const STORAGE_KEY = 'erp_quotations_v1';

export function getStoredQuotations(): Quotation[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed: Quotation[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return INITIAL_QUOTATIONS;
}

export function saveStoredQuotations(quotes: Quotation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  window.dispatchEvent(new Event('erp_quotations_updated'));
}

export function generateQuoteNumber(): string {
  const existing = getStoredQuotations();
  const nextNum = existing.length + 43;
  return `QT-2026-${String(nextNum).padStart(4, '0')}`;
}

export function createQuotation(data: Partial<Quotation>): Quotation {
  const existing = getStoredQuotations();
  const quoteNumber = data.quoteNumber || generateQuoteNumber();
  const today = new Date();
  const validDate = new Date();
  validDate.setDate(today.getDate() + 15);

  const newQuote: Quotation = {
    id: `quote-${Date.now()}`,
    quoteNumber,
    date: data.date || today.toLocaleDateString('en-GB'),
    validUntil: data.validUntil || validDate.toLocaleDateString('en-GB'),
    partyName: data.partyName || 'Valued Customer',
    partyCompany: data.partyCompany || '',
    partyPhone: data.partyPhone || '',
    partyEmail: data.partyEmail || '',
    partyAddress: data.partyAddress || '',
    attention: data.attention || `Attn: ${data.partyName || 'Purchasing Department'}`,
    subject: data.subject || `Quotation for IT Equipment & Accessories`,
    itemsList: data.itemsList || [],
    grossAmount: data.grossAmount || 0,
    discountAmount: data.discountAmount || 0,
    vatRate: data.vatRate ?? 5,
    taxAmount: data.taxAmount || 0,
    grandTotal: data.grandTotal || 0,
    status: data.status || 'Draft',
    paymentTerms: data.paymentTerms || '50% Advance with PO, 50% on Delivery',
    deliveryLeadTime: data.deliveryLeadTime || 'Within 24 to 48 business hours',
    warrantyTerms: data.warrantyTerms || 'Official manufacturer warranty included',
    notes: data.notes || '',
    createdBy: data.createdBy || 'Sales Department',
    ...data,
  };

  const updated = [newQuote, ...existing];
  saveStoredQuotations(updated);
  return newQuote;
}

export function updateQuotation(quote: Quotation): void {
  const existing = getStoredQuotations();
  const updated = existing.map((q) => (q.id === quote.id ? quote : q));
  saveStoredQuotations(updated);
}

export function deleteQuotation(id: string): void {
  const existing = getStoredQuotations();
  const updated = existing.filter((q) => q.id !== id);
  saveStoredQuotations(updated);
}

/**
 * Converts a Quotation into an official Sales Invoice in ERPTransactionRecord
 */
export function convertQuotationToInvoice(quote: Quotation): ERPTransactionRecord {
  const salesInvoices = getStoredSalesInvoices();
  const invoiceRef = `SAL${String(salesInvoices.length + 16).padStart(4, '0')}`;
  const now = new Date();
  const formattedDateTime = `${now.toLocaleDateString('en-GB')}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newInvoice: ERPTransactionRecord = {
    id: `rec-sal-${Date.now()}`,
    type: 'sales_invoice',
    refNo: invoiceRef,
    dateTime: formattedDateTime,
    partyName: quote.partyName,
    partyPhone: quote.partyPhone,
    partyType: 'Customer',
    itemsCount: quote.itemsList.reduce((sum, it) => sum + (it.qty || 1), 0),
    itemsList: quote.itemsList.map((it) => ({
      name: it.name,
      qty: it.qty,
      unitPrice: it.unitPrice,
      total: it.total,
      sku: it.sku,
    })),
    grossAmount: quote.grossAmount,
    discountAmount: quote.discountAmount,
    taxAmount: quote.taxAmount,
    grandTotal: quote.grandTotal,
    paidAmount: 0,
    dueAmount: quote.grandTotal,
    status: 'Unpaid',
    paymentMethod: 'Bank Wire / Credit',
    notes: `Generated from Quotation ${quote.quoteNumber}. Subject: ${quote.subject || 'N/A'}`,
    createdBy: quote.createdBy,
  };

  // Update sales invoices
  const updatedInvoices = [newInvoice, ...salesInvoices];
  saveStoredSalesInvoices(updatedInvoices);

  // Update quote status
  updateQuotation({
    ...quote,
    status: 'Converted to Invoice',
    convertedInvoiceRef: invoiceRef,
  });

  window.dispatchEvent(new Event('erp_transactions_updated'));
  return newInvoice;
}

// ============================================================================
// WHATSAPP LINK GENERATOR
// Implements direct WhatsApp click-to-chat link with professional Markdown format
// ============================================================================

/**
 * Sanitizes phone number for WhatsApp wa.me API
 * Strips '+' and dashes and spaces.
 * If number starts with 01... (Bangladesh national prefix), prepends 880.
 */
export function sanitizeWhatsAppPhone(phone: string, defaultCountryCode: string = '880'): string {
  if (!phone) return '';
  // Remove spaces, hyphens, parentheses, plus
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('01') && defaultCountryCode === '880') {
    // Bangladesh mobile number like 01711... -> 8801711...
    cleaned = '880' + cleaned.substring(1);
  } else if (!cleaned.startsWith(defaultCountryCode) && cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned;
  }

  return cleaned;
}

/**
 * Builds the professional WhatsApp text message for the Quotation
 */
export function buildWhatsAppQuotationMessage(
  quote: Quotation,
  letterhead: LetterheadConfig,
  customGreeting?: string
): string {
  const greeting = customGreeting || `Dear ${quote.partyName || 'Customer'},`;
  const company = letterhead.companyName;

  // Build items list in WhatsApp format
  const itemsText = quote.itemsList
    .map((item, idx) => {
      const warrantyInfo = item.warranty ? `\n   🛡️ _${item.warranty}_` : '';
      return `${idx + 1}. *${item.name}*\n   Qty: ${item.qty} × ${formatCurrency(item.unitPrice)} = *${formatCurrency(item.total)}*${warrantyInfo}`;
    })
    .join('\n\n');

  const message = [
    `📄 *OFFICIAL PRICE QUOTATION*`,
    `🏢 *${company}*`,
    `_${letterhead.tagline}_`,
    `📍 ${letterhead.addressLine1}, ${letterhead.addressLine2}`,
    `📞 Phone: ${letterhead.phone} | ✉️ ${letterhead.email}`,
    `──────────────────────`,
    greeting,
    `Please find below our official quotation for your requirement:`,
    ``,
    `📋 *Quote Ref:* ${quote.quoteNumber}`,
    `📅 *Date:* ${quote.date} (Valid until ${quote.validUntil})`,
    quote.partyCompany ? `🏢 *Client Organization:* ${quote.partyCompany}` : '',
    quote.attention ? `👤 *Attention:* ${quote.attention}` : '',
    quote.subject ? `🎯 *Subject:* ${quote.subject}` : '',
    `──────────────────────`,
    `📦 *PROPOSED ITEMS & SPECIFICATIONS:*`,
    itemsText,
    `──────────────────────`,
    `Subtotal: ${formatCurrency(quote.grossAmount)}`,
    quote.discountAmount > 0 ? `Special Discount: -${formatCurrency(quote.discountAmount)}` : '',
    quote.taxAmount > 0 ? `VAT / Tax (${quote.vatRate}%): ${formatCurrency(quote.taxAmount)}` : '',
    `💰 *NET GRAND TOTAL:* *${formatCurrency(quote.grandTotal)}*`,
    `──────────────────────`,
    `📝 *TERMS & CONDITIONS:*`,
    `• *Validity:* Valid until ${quote.validUntil}.`,
    `• *Delivery:* ${quote.deliveryLeadTime}.`,
    `• *Payment:* ${quote.paymentTerms}.`,
    `• *Warranty:* ${quote.warrantyTerms}.`,
    quote.notes ? `• *Note:* ${quote.notes}` : '',
    ``,
    `🏦 *Bank Account for Payment:*`,
    `• Bank: ${letterhead.bankDetails.bankName}`,
    `• Account Name: ${letterhead.bankDetails.accountName}`,
    `• A/C No: ${letterhead.bankDetails.accountNumber}`,
    `• Branch: ${letterhead.bankDetails.branch}`,
    `──────────────────────`,
    `💬 To accept this quotation or confirm order, please reply to this WhatsApp message or call *${letterhead.phone}*.`,
    ``,
    `Thank you for choosing *${company}*! ✨`,
  ]
    .filter(Boolean)
    .join('\n');

  return message;
}

/**
 * Builds WhatsApp Click-to-Chat URLs
 */
export function buildWhatsAppQuoteUrl(
  quote: Quotation,
  letterhead: LetterheadConfig,
  targetPhone?: string,
  customGreeting?: string
): {
  cleanPhone: string;
  waMeUrl: string;
  waWebUrl: string;
  message: string;
} {
  const phoneToUse = targetPhone || quote.partyPhone || '';
  const cleanPhone = sanitizeWhatsAppPhone(phoneToUse);
  const message = buildWhatsAppQuotationMessage(quote, letterhead, customGreeting);
  const encodedText = encodeURIComponent(message);

  const waMeUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  const waWebUrl = cleanPhone
    ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://web.whatsapp.com/send?text=${encodedText}`;

  return {
    cleanPhone,
    waMeUrl,
    waWebUrl,
    message,
  };
}

/**
 * Simple English number to words helper for Bangladeshi Taka / general currency
 */
export function numberToWords(amount: number): string {
  if (amount <= 0) return 'Zero Taka Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      str += teens[n - 10] + ' ';
    } else if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      if (n % 10 > 0) str += units[n % 10] + ' ';
    } else if (n > 0) {
      str += units[n] + ' ';
    }
    return str;
  }

  const intPart = Math.floor(amount);
  const crore = Math.floor(intPart / 10000000);
  const lakh = Math.floor((intPart % 10000000) / 100000);
  const thousand = Math.floor((intPart % 100000) / 1000);
  const hundred = Math.floor(intPart % 1000);

  let result = '';
  if (crore > 0) result += convertChunk(crore) + 'Crore ';
  if (lakh > 0) result += convertChunk(lakh) + 'Lakh ';
  if (thousand > 0) result += convertChunk(thousand) + 'Thousand ';
  if (hundred > 0) result += convertChunk(hundred);

  return (result.trim() || 'Zero') + ' Taka Only';
}
