// ============================================================================
// COMPANY LETTERHEAD & BRANDING SERVICE
// Provides persistent configuration, styles, and templates for official
// Company Letterhead stationery used on Quotations, Invoices, and Vouchers.
// ============================================================================

export type LetterheadTemplate =
  | 'corporate'   // Navy/Slate bold executive header with dual-column contact & crest
  | 'modern'      // Vibrant gradient accent bar, centered emblem, modern contact pills
  | 'minimal'     // Sleek monochrome high-fashion typography with ultra-clean fine rules
  | 'bordered'    // Formal corporate boxed border frame with official corner brackets
  | 'preprinted'; // Blank header spacing for physical pre-printed stationery paper sheets

export interface LetterheadBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface LetterheadConfig {
  companyName: string;
  companyNameBn?: string;
  tagline: string;
  binVatReg: string;
  tradeLicense: string;
  tinNumber?: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  logoType: 'badge' | 'custom' | 'minimal';
  logoText: string;
  logoUrl?: string;
  template: LetterheadTemplate;
  primaryColor: string; // e.g. '#1e40af' or '#0f172a'
  accentColor: string;  // e.g. '#3b82f6'
  showWatermark: boolean;
  watermarkText: string;
  watermarkOpacity: number; // 0.03 to 0.12
  topMarginPreprintedMm: number; // For pre-printed stationery (default ~55mm)
  footerText: string;
  termsConditions: string[];
  signatoryName: string;
  signatoryTitle: string;
  showAuthorizedSeal: boolean;
  bankDetails: LetterheadBankDetails;
}

export const DEFAULT_LETTERHEAD_CONFIG: LetterheadConfig = {
  companyName: 'NextGen IT Systems Ltd.',
  companyNameBn: 'নেক্সটজেন আইটি সিস্টেমস লিমিটেড',
  tagline: 'Premier Computer, Laptop & Enterprise IT Hardware Solutions',
  binVatReg: 'BIN: 003928192-0101',
  tradeLicense: 'TRAD/DNCC/049182/2024',
  tinNumber: 'TIN: 481920491820',
  addressLine1: 'Level 5, Computer City Centre (Multiplan)',
  addressLine2: '69-71 New Elephant Road, Dhaka-1205, Bangladesh',
  phone: '+880 1711-000000',
  whatsapp: '+880 1823-456789',
  email: 'sales@nextgenit.com.bd',
  website: 'www.nextgenit.com.bd',
  logoType: 'badge',
  logoText: 'N',
  template: 'corporate',
  primaryColor: '#1e3a8a',
  accentColor: '#2563eb',
  showWatermark: true,
  watermarkText: 'NEXTGEN IT',
  watermarkOpacity: 0.04,
  topMarginPreprintedMm: 55,
  footerText: 'Thank you for your business. Certified authentic IT products with warranty support.',
  termsConditions: [
    'Quotation is valid for 15 days from the issue date.',
    'Delivery: Within 24-48 business hours upon purchase order confirmation.',
    'Payment terms: 50% advance with work order, remaining 50% upon delivery/inspection.',
    'Official manufacturer warranty applicable as indicated on invoice with serial numbers.',
    'Prices are inclusive of standard local VAT/tax unless stated otherwise.'
  ],
  signatoryName: 'Forhad Hossaen',
  signatoryTitle: 'Head of Corporate Sales & Procurement',
  showAuthorizedSeal: true,
  bankDetails: {
    bankName: 'City Bank PLC',
    accountName: 'NextGen IT Systems Ltd.',
    accountNumber: '1102938475001',
    branch: 'Elephant Road Branch, Dhaka',
    routingNumber: '225271890',
    swiftCode: 'CIBLBDDH',
  },
};

const STORAGE_KEY = 'erp_company_letterhead_v1';

export function getStoredLetterheadConfig(): LetterheadConfig {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_LETTERHEAD_CONFIG, ...parsed };
    } catch {
      // Fallback
    }
  }
  return DEFAULT_LETTERHEAD_CONFIG;
}

export function saveStoredLetterheadConfig(config: LetterheadConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event('erp_letterhead_updated'));
}

export function resetToDefaultLetterheadConfig(): LetterheadConfig {
  saveStoredLetterheadConfig(DEFAULT_LETTERHEAD_CONFIG);
  return DEFAULT_LETTERHEAD_CONFIG;
}
