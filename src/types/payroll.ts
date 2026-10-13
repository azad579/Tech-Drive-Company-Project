import { CashDrawerState } from './pos';

export type SalaryDeductionType = 'Late' | 'Absence' | 'Loan' | 'Other';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type PayrollPaymentMethod = 'Cash' | 'Bank Transfer' | 'MFS / bKash' | 'Cheque';

export interface SalaryDeduction {
  id: string;
  salaryLedgerId: string;
  type: SalaryDeductionType;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  salaryLedgerId: string;
  expenseId: string;
  paymentDate: string; // Controls Cash/Bank Ledger
  payingMonth: string; // YYYY-MM controls Staff Salary Ledger
  amount: number;
  paymentMethod: PayrollPaymentMethod;
  bankAccountId?: string;
  bankAccountName?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string;
  isDeleted?: boolean;
}

export interface StaffAdvance {
  id: string;
  staffId: string;
  expenseId: string;
  advanceDate: string; // Date cash actually exited
  amount: number;
  note?: string;
  adjustedAmount: number; // Sum of all advance adjustments across months
  createdAt: string;
  createdBy: string;
}

export interface AdvanceAdjustment {
  id: string;
  staffAdvanceId: string;
  salaryLedgerId: string;
  amount: number;
  month: string; // YYYY-MM
  createdAt: string;
}

export interface SalaryLedger {
  id: string;
  staffId: string;
  salaryMonth: string; // YYYY-MM
  basicSalarySnapshot: number; // Snapshot of basic at time month was initialized
  bonus: number;
  overtime: number;
  advanceAdjustment: number;
  deductions: SalaryDeduction[];
  notes?: string;
}

export interface StaffMember {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  basicSalary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  bankAccountNumber?: string;
  bankName?: string;
}

export interface PayrollPermissions {
  viewStaffSalary: boolean;
  viewSalaryDetails: boolean;
  addEditDeletePayment: boolean;
  viewPayrollReport: boolean;
  manageBonusDeductionAdvance: boolean;
  allowOverpayment: boolean;
  allowFutureMonthPayment: boolean;
  printPaySlip: boolean;
}

export interface AuditLogEntry {
  id: string;
  entityType: 'payment' | 'ledger' | 'advance' | 'deduction';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OVERPAYMENT_OVERRIDE';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface CalculatedSalaryMonth {
  ledger: SalaryLedger;
  staff: StaffMember;
  gross: number;
  totalDeductions: number;
  advanceAdjustment: number;
  net: number;
  paid: number;
  due: number;
  status: PaymentStatus;
  payments: SalaryPayment[];
}
