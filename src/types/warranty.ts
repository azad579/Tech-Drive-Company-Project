export interface WarrantyPolicySettings {
  guaranteeDays: number; // default 30 days
  isGuaranteeComponentsFree: boolean; // all components are free for customer
  isGuaranteeAddToExpense: boolean; // add in expense
  guaranteeExpenseCategory: string; // e.g. 'Warranty & Replacement Expense'
  serviceWarrantyYears: number; // default 5 years
  isServiceLaborFree: boolean; // no repair fee
  isServiceComponentPaidByCustomer: boolean; // components cost will pay by customer
  policyTermsNote: string;
  lastUpdated?: string;
}

export const DEFAULT_WARRANTY_POLICY: WarrantyPolicySettings = {
  guaranteeDays: 30,
  isGuaranteeComponentsFree: true,
  isGuaranteeAddToExpense: true,
  guaranteeExpenseCategory: 'Warranty & Replacement Expense',
  serviceWarrantyYears: 5,
  isServiceLaborFree: true,
  isServiceComponentPaidByCustomer: true,
  policyTermsNote:
    '30-Day Guarantee: 100% Free replacement components (booked under Company Expense) & Free labor. 5-Year Service Warranty: 0 ৳ repair/labor fee; replacement hardware components paid by customer.',
  lastUpdated: '2026-10-04',
};

export interface WarrantyClaimLog {
  id: string;
  warrantyId: string;
  claimDate: string;
  daysSincePurchase: number;
  componentName: string;
  componentCost: number;
  repairLaborFee: number;
  isComponentFreeForCustomer: boolean;
  isRepairFeeFreeForCustomer: boolean;
  addedToCompanyExpense: boolean;
  customerPayable: number;
  companyExpenseAmount: number;
  technicianNotes: string;
  status: 'Approved' | 'In Service' | 'Resolved';
}

export interface WarrantyRecord {
  id: string;
  serialNumber: string;
  productName: string;
  sku: string;
  customerName: string;
  customerPhone?: string;
  invoiceNumber: string;
  purchaseDate: string;
  guaranteeDays: number; // default 30 days
  serviceWarrantyYears: number; // default 5 years
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Claimed';
  claimCount: number;
  notes?: string;
  claimsHistory?: WarrantyClaimLog[];
}
