export type ClientTransactionType =
  | 'INVOICE_DEBIT'
  | 'PAYMENT_CREDIT'
  | 'OPENING_BALANCE'
  | 'CREDIT_NOTE'
  | 'ADJUSTMENT';

export interface ClientLedgerEntry {
  id: string;
  customerId: string;
  timestamp: string; // e.g. 2026-10-05 10:30 AM
  date: string; // YYYY-MM-DD
  transaction_type: ClientTransactionType;
  reference_no: string; // POS invoice ID (e.g. INV-2026-9035) or payment receipt ID (e.g. RCP-2026-095)
  particulars: string;
  debit: number; // Invoiced charge (increases outstanding balance)
  credit: number; // Payment received (reduces outstanding balance)
  amount: number; // Net transaction magnitude
  ending_balance: number; // Balance after this entry
  available_credit: number; // Remaining credit limit (Credit Limit - ending_balance)
  credit_limit: number; // Base credit limit (e.g. 50,000)
  payment_method?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'bKash / MFS' | 'Credit Memo';
  operator_id: string; // e.g. 'Forhad (Branch Manager)'
  notes?: string;
}

export interface ClientLedgerSummary {
  customerId: string;
  customerName: string;
  creditLimit: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  availableCredit: number;
  utilizationPercent: number;
  lastPaymentDate?: string;
  status: 'Good Standing' | 'Near Limit' | 'Over Limit';
}
