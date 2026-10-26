import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Supplier,
  SalesInvoice,
  PurchaseInvoice,
  ExpenseRecord,
  ChequeRecord,
  BankAccount,
  BankMaster,
  MobileAccount,
  BankTransaction,
  Department,
  Designation,
  Employee,
  LeaveType,
  LeaveRecord,
  AttendanceRecord,
  PayslipItem,
  PersonalNote,
  TodoTask,
  UserSession,
  RoleItem,
  UserItem,
  HistoryLogItem
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASES,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_CHEQUES,
  INITIAL_BANKS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_MOBILE_ACCOUNTS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_RECORDS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PAYSLIPS,
  INITIAL_PERSONAL_NOTES,
  INITIAL_TODOS,
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_HISTORY_LOGS
} from '../data/mockData';

interface AppContextType {
  user: UserSession;
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  // Routing
  currentRoute: string;
  setCurrentRoute: (route: string, title?: string) => void;
  navigateToRoute: (route: string, title?: string) => void;
  activeModuleTitle: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Data
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: PurchaseInvoice[];
  sales: SalesInvoice[];
  expenses: ExpenseRecord[];
  cheques: ChequeRecord[];
  bankAccounts: BankAccount[];
  banks: BankMaster[];
  mobileAccounts: MobileAccount[];
  bankTransactions: BankTransaction[];
  departments: Department[];
  designations: Designation[];
  employees: Employee[];
  leaveTypes: LeaveType[];
  leaveRecords: LeaveRecord[];
  attendanceRecords: AttendanceRecord[];
  payslips: PayslipItem[];
  personalNotes: PersonalNote[];
  todos: TodoTask[];

  // Bank Mutators
  addBank: (bank: Omit<BankMaster, 'id' | 'sn'>) => BankMaster;
  updateBank: (id: string, bank: Partial<BankMaster>) => void;
  deleteBank: (id: string) => void;
  addBankAccount: (account: Omit<BankAccount, 'id' | 'sn'>) => BankAccount;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  addMobileAccount: (m: Omit<MobileAccount, 'id' | 'sn'>) => MobileAccount;
  updateMobileAccount: (id: string, m: Partial<MobileAccount>) => void;
  deleteMobileAccount: (id: string) => void;
  addBankTransaction: (t: Omit<BankTransaction, 'id' | 'sn'>) => BankTransaction;

  // Payroll Mutators
  addDepartment: (dept: Omit<Department, 'id' | 'sn'>) => Department;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addDesignation: (desig: Omit<Designation, 'id' | 'sn'>) => Designation;
  updateDesignation: (id: string, desig: Partial<Designation>) => void;
  deleteDesignation: (id: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addLeaveType: (lt: Omit<LeaveType, 'id' | 'sn'>) => LeaveType;
  deleteLeaveType: (id: string) => void;
  addLeaveRecord: (lr: Omit<LeaveRecord, 'id' | 'sn'>) => LeaveRecord;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Pending' | 'Rejected') => void;
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void;
  generatePayslips: (month: string) => void;
  payPayslip: (id: string) => void;

  // Personal Mutators
  addPersonalNote: (n: Omit<PersonalNote, 'id' | 'date' | 'time'>) => PersonalNote;
  updatePersonalNote: (id: string, n: Partial<PersonalNote>) => void;
  deletePersonalNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  addTodoTask: (t: Omit<TodoTask, 'id' | 'createdAt'>) => TodoTask;
  toggleTodoTask: (id: string) => void;
  deleteTodoTask: (id: string) => void;
  roles: RoleItem[];
  users: UserItem[];
  historyLogs: HistoryLogItem[];

  // User & Role Mutators
  addRole: (role: Omit<RoleItem, 'id' | 'sn'>) => RoleItem;
  updateRole: (id: string, role: Partial<RoleItem>) => void;
  deleteRole: (id: string) => void;
  addUser: (user: Omit<UserItem, 'id' | 'sn'>) => UserItem;
  updateUser: (id: string, user: Partial<UserItem>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string, newPass: string) => void;
  addHistoryLog: (action: string, details: string) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean | ((p: boolean) => boolean)) => void;
  editingRole: RoleItem | null;
  setEditingRole: (r: RoleItem | null) => void;
  editingUser: UserItem | null;
  setEditingUser: (u: UserItem | null) => void;

  // Mutators
  addSalesInvoice: (invoice: Omit<SalesInvoice, 'id' | 'invoiceNo'>) => SalesInvoice;
  collectSalesPayment: (invoiceId: string, amount: number) => void;
  addPurchaseInvoice: (purchase: Omit<PurchaseInvoice, 'id' | 'invoiceNo'>) => PurchaseInvoice;
  payPurchaseDue: (purchaseId: string, amount: number) => void;
  addProduct: (product: Omit<Product, 'id' | 'sn'>) => Product;
  updateProductPrice: (id: string, newPrice: number, warrantyDays?: number) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'code'>) => Customer;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => ExpenseRecord;
  updateChequeStatus: (id: string, status: 'Pending' | 'Cleared' | 'Bounced') => void;

  // Print & Modals
  invoiceToPrint: SalesInvoice | null;
  setInvoiceToPrint: (inv: SalesInvoice | null) => void;
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (p: Product | null) => void;
  isQuickSearchOpen: boolean;
  setIsQuickSearchOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Calculator
  calculatorInput: string;
  setCalculatorInput: (val: string) => void;
  calculatorResult: string;
  evaluateCalculator: (val?: string) => void;

  // Floating drawers
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean | ((p: boolean) => boolean)) => void;
  isProductDrawerOpen: boolean;
  setIsProductDrawerOpen: (open: boolean | ((p: boolean) => boolean)) => void;
  isQuickMenuOpen: boolean;
  setIsQuickMenuOpen: (open: boolean | ((p: boolean) => boolean)) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem('techdrive_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      email: 'alehsantradinglimited@gmail.com',
      name: 'Saymon',
      role: 'Administrator',
      branch: 'Main Branch (Dhaka)',
      avatar: '/img/techdrive_fav.png',
      isLoggedIn: true
    };
  });

  const [currentRoute, setCurrentRouteState] = useState<string>('home.php');
  const [activeModuleTitle, setActiveModuleTitle] = useState<string>('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const setCurrentRoute = (route: string, title?: string) => {
    setCurrentRouteState(route);
    if (title) {
      setActiveModuleTitle(title);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToRoute = (route: string, title?: string) => {
    setCurrentRoute(route, title);
  };

  // Entities
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('techdrive_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('techdrive_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('techdrive_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [sales, setSales] = useState<SalesInvoice[]>(() => {
    const saved = localStorage.getItem('techdrive_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('techdrive_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [cheques, setCheques] = useState<ChequeRecord[]>(() => {
    const saved = localStorage.getItem('techdrive_cheques');
    return saved ? JSON.parse(saved) : INITIAL_CHEQUES;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('techdrive_bank_accounts');
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [banks, setBanks] = useState<BankMaster[]>(() => {
    const saved = localStorage.getItem('techdrive_banks');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  const [mobileAccounts, setMobileAccounts] = useState<MobileAccount[]>(() => {
    const saved = localStorage.getItem('techdrive_mobile_accounts');
    return saved ? JSON.parse(saved) : INITIAL_MOBILE_ACCOUNTS;
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    const saved = localStorage.getItem('techdrive_bank_transactions');
    return saved ? JSON.parse(saved) : INITIAL_BANK_TRANSACTIONS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('techdrive_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [designations, setDesignations] = useState<Designation[]>(() => {
    const saved = localStorage.getItem('techdrive_designations');
    return saved ? JSON.parse(saved) : INITIAL_DESIGNATIONS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('techdrive_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() => {
    const saved = localStorage.getItem('techdrive_leave_types');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_TYPES;
  });

  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(() => {
    const saved = localStorage.getItem('techdrive_leave_records');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_RECORDS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('techdrive_attendance_records');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_RECORDS;
  });

  const [payslips, setPayslips] = useState<PayslipItem[]>(() => {
    const saved = localStorage.getItem('techdrive_payslips');
    return saved ? JSON.parse(saved) : INITIAL_PAYSLIPS;
  });

  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(() => {
    const saved = localStorage.getItem('techdrive_personal_notes');
    return saved ? JSON.parse(saved) : INITIAL_PERSONAL_NOTES;
  });

  const [todos, setTodos] = useState<TodoTask[]>(() => {
    const saved = localStorage.getItem('techdrive_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  // User & Role & History
  const [roles, setRoles] = useState<RoleItem[]>(() => {
    const saved = localStorage.getItem('techdrive_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [users, setUsers] = useState<UserItem[]>(() => {
    const saved = localStorage.getItem('techdrive_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLogItem[]>(() => {
    const saved = localStorage.getItem('techdrive_history_logs');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY_LOGS;
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Modals & Floating UI
  const [invoiceToPrint, setInvoiceToPrint] = useState<SalesInvoice | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState<boolean>(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState<boolean>(false);

  // Calculator
  const [calculatorInput, setCalculatorInput] = useState<string>('');
  const [calculatorResult, setCalculatorResult] = useState<string>('');

  const evaluateCalculator = (val?: string) => {
    const expr = (val !== undefined ? val : calculatorInput).trim();
    if (!expr) {
      setCalculatorResult('');
      return;
    }
    try {
      const sanitized = expr.replace(/[^0-9+\-*/().% ]/g, '');
      if (!sanitized) return;
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const res = Function(`"use strict"; return (${sanitized})`)();
      if (typeof res === 'number' && !isNaN(res)) {
        setCalculatorResult(Number.isInteger(res) ? res.toString() : res.toFixed(2));
      }
    } catch {
      setCalculatorResult('Error');
    }
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('techdrive_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('techdrive_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('techdrive_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('techdrive_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('techdrive_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('techdrive_cheques', JSON.stringify(cheques));
  }, [cheques]);

  useEffect(() => {
    localStorage.setItem('techdrive_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('techdrive_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('techdrive_history_logs', JSON.stringify(historyLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem('techdrive_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('techdrive_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('techdrive_mobile_accounts', JSON.stringify(mobileAccounts));
  }, [mobileAccounts]);

  useEffect(() => {
    localStorage.setItem('techdrive_bank_transactions', JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem('techdrive_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('techdrive_designations', JSON.stringify(designations));
  }, [designations]);

  useEffect(() => {
    localStorage.setItem('techdrive_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('techdrive_leave_types', JSON.stringify(leaveTypes));
  }, [leaveTypes]);

  useEffect(() => {
    localStorage.setItem('techdrive_leave_records', JSON.stringify(leaveRecords));
  }, [leaveRecords]);

  useEffect(() => {
    localStorage.setItem('techdrive_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('techdrive_payslips', JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    localStorage.setItem('techdrive_personal_notes', JSON.stringify(personalNotes));
  }, [personalNotes]);

  useEffect(() => {
    localStorage.setItem('techdrive_todos', JSON.stringify(todos));
  }, [todos]);

  const login = (email: string, pass: string): boolean => {
    if (
      (email === 'alehsantradinglimited@gmail.com' && pass === '123456789') ||
      (email && pass.length >= 4)
    ) {
      setUser({
        email: email.trim(),
        name: email.split('@')[0] === 'alehsantradinglimited' ? 'Saymon' : email.split('@')[0],
        role: 'Administrator',
        branch: 'Main Branch (Dhaka)',
        avatar: '/img/techdrive_fav.png',
        isLoggedIn: true
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(prev => ({ ...prev, isLoggedIn: false }));
  };

  const addSalesInvoice = (invData: Omit<SalesInvoice, 'id' | 'invoiceNo'>): SalesInvoice => {
    const now = new Date();
    const dateCode = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;
    const invoiceNo = `SEL${dateCode}${100 + sales.length + 1}`;
    const newInvoice: SalesInvoice = {
      ...invData,
      id: `sel-${Date.now()}`,
      invoiceNo
    };

    setSales(prev => [newInvoice, ...prev]);

    setProducts(prev =>
      prev.map(p => {
        const item = invData.items.find(i => i.productId === p.id);
        if (item) {
          return {
            ...p,
            stock: Math.max(0, p.stock - item.qty)
          };
        }
        return p;
      })
    );

    if (invData.dueAmount > 0) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === invData.customerId
            ? { ...c, balance: c.balance + invData.dueAmount }
            : c
        )
      );
    }

    return newInvoice;
  };

  const collectSalesPayment = (invoiceId: string, amount: number) => {
    setSales(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          const newDue = Math.max(0, inv.grandTotal - newPaid);
          const newStatus = newDue <= 0 ? 'Paid' : 'Partial';

          setCustomers(cList =>
            cList.map(c =>
              c.id === inv.customerId
                ? { ...c, balance: Math.max(0, c.balance - amount) }
                : c
            )
          );

          return {
            ...inv,
            paidAmount: newPaid,
            dueAmount: newDue,
            status: newStatus
          };
        }
        return inv;
      })
    );
  };

  const addPurchaseInvoice = (purData: Omit<PurchaseInvoice, 'id' | 'invoiceNo'>): PurchaseInvoice => {
    const now = new Date();
    const dateCode = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;
    const invoiceNo = `PUR${dateCode}${100 + purchases.length + 1}`;
    const newPurchase: PurchaseInvoice = {
      ...purData,
      id: `pur-${Date.now()}`,
      invoiceNo
    };

    setPurchases(prev => [newPurchase, ...prev]);
    return newPurchase;
  };

  const payPurchaseDue = (purchaseId: string, amount: number) => {
    setPurchases(prev =>
      prev.map(p => {
        if (p.id === purchaseId) {
          const newPaid = p.paid + amount;
          const newDue = Math.max(0, p.total - newPaid);
          return {
            ...p,
            paid: newPaid,
            due: newDue,
            status: newDue <= 0 ? 'Paid' : 'Partial'
          };
        }
        return p;
      })
    );
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'sn'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      sn: products.length + 1
    };
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProductPrice = (id: string, newPrice: number, warrantyDays?: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const old = p.currentPrice || p.salePrice || 0;
          return {
            ...p,
            oldPrice: old,
            salePrice: newPrice,
            currentPrice: newPrice,
            warrantyDays: warrantyDays !== undefined ? warrantyDays : p.warrantyDays,
            warranty: warrantyDays ? `${warrantyDays} Days` : p.warranty,
            lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          };
        }
        return p;
      })
    );
  };

  const addCustomer = (cusData: Omit<Customer, 'id' | 'code'>): Customer => {
    const newCus: Customer = {
      ...cusData,
      id: `cus-${Date.now()}`,
      code: `CUS-${100 + customers.length + 1}`
    };
    setCustomers(prev => [...prev, newCus]);
    return newCus;
  };

  const addExpense = (expData: Omit<ExpenseRecord, 'id'>): ExpenseRecord => {
    const newExp: ExpenseRecord = {
      ...expData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
    return newExp;
  };

  const updateChequeStatus = (id: string, status: 'Pending' | 'Cleared' | 'Bounced') => {
    setCheques(prev =>
      prev.map(c => (c.id === id ? { ...c, status } : c))
    );
  };

  const addHistoryLog = (action: string, details: string) => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const newLog: HistoryLogItem = {
      id: `hist-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      actor: user.name || 'Tech Drive',
      action,
      details
    };
    setHistoryLogs(prev => [newLog, ...prev]);
  };

  const addRole = (roleData: Omit<RoleItem, 'id' | 'sn'>): RoleItem => {
    const newRole: RoleItem = {
      ...roleData,
      id: `role-${Date.now()}`,
      sn: roles.length + 1
    };
    setRoles(prev => [...prev, newRole]);
    addHistoryLog('Role has been created', `New Role Add: ${newRole.name}`);
    return newRole;
  };

  const updateRole = (id: string, updated: Partial<RoleItem>) => {
    setRoles(prev =>
      prev.map(r => {
        if (r.id === id) {
          const merged = { ...r, ...updated };
          addHistoryLog('Role has been updated', `Role Name: ${merged.name}`);
          return merged;
        }
        return r;
      })
    );
  };

  const deleteRole = (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (roleToDelete) {
      setRoles(prev => prev.filter(r => r.id !== id));
      addHistoryLog('User Role has been deleted', `Role name: ${roleToDelete.name}`);
    }
  };

  const addUser = (userData: Omit<UserItem, 'id' | 'sn'>): UserItem => {
    const newUser: UserItem = {
      ...userData,
      id: `usr-${Date.now()}`,
      sn: users.length + 1
    };
    setUsers(prev => [...prev, newUser]);
    addHistoryLog('User has been Added', `New User Add: ${newUser.name}`);
    return newUser;
  };

  const updateUser = (id: string, updated: Partial<UserItem>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const merged = { ...u, ...updated };
          addHistoryLog('User has been updated', `User name: ${merged.name}`);
          return merged;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== id));
      addHistoryLog('User has been deleted', `User name: ${userToDelete.name}`);
    }
  };

  const resetUserPassword = (id: string, _newPass: string) => {
    const u = users.find(usr => usr.id === id);
    if (u) {
      addHistoryLog('Password has been changed', `User name: ${u.name}`);
    }
  };

  // Bank Mutators
  const addBank = (bankData: Omit<BankMaster, 'id' | 'sn'>): BankMaster => {
    const newBank: BankMaster = {
      ...bankData,
      id: `bm-${Date.now()}`,
      sn: banks.length + 1
    };
    setBanks(prev => [...prev, newBank]);
    addHistoryLog('Bank has been Added', `New Bank: ${newBank.name} (${newBank.sortName})`);
    return newBank;
  };

  const updateBank = (id: string, updated: Partial<BankMaster>) => {
    setBanks(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
    addHistoryLog('Bank has been updated', `Bank ID: ${id}`);
  };

  const deleteBank = (id: string) => {
    const b = banks.find(x => x.id === id);
    if (b) {
      setBanks(prev => prev.filter(x => x.id !== id));
      addHistoryLog('Bank has been deleted', `Bank name: ${b.name}`);
    }
  };

  const addBankAccount = (accData: Omit<BankAccount, 'id' | 'sn'>): BankAccount => {
    const newAcc: BankAccount = {
      ...accData,
      id: `bank-${Date.now()}`,
      sn: bankAccounts.length + 1
    };
    setBankAccounts(prev => [...prev, newAcc]);
    addHistoryLog('Bank Account has been Added', `A/C: ${newAcc.accountNo} (${newAcc.bankName})`);
    return newAcc;
  };

  const updateBankAccount = (id: string, updated: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    addHistoryLog('Bank Account has been updated', `A/C ID: ${id}`);
  };

  const deleteBankAccount = (id: string) => {
    const a = bankAccounts.find(x => x.id === id);
    if (a) {
      setBankAccounts(prev => prev.filter(x => x.id !== id));
      addHistoryLog('Bank Account has been deleted', `A/C No: ${a.accountNo}`);
    }
  };

  const addMobileAccount = (mData: Omit<MobileAccount, 'id' | 'sn'>): MobileAccount => {
    const newM: MobileAccount = {
      ...mData,
      id: `mob-${Date.now()}`,
      sn: mobileAccounts.length + 1
    };
    setMobileAccounts(prev => [...prev, newM]);
    addHistoryLog('Mobile Account has been Added', `Name: ${newM.name} - ${newM.mobile}`);
    return newM;
  };

  const updateMobileAccount = (id: string, updated: Partial<MobileAccount>) => {
    setMobileAccounts(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    addHistoryLog('Mobile Account has been updated', `ID: ${id}`);
  };

  const deleteMobileAccount = (id: string) => {
    const m = mobileAccounts.find(x => x.id === id);
    if (m) {
      setMobileAccounts(prev => prev.filter(x => x.id !== id));
      addHistoryLog('Mobile Account has been deleted', `Mobile: ${m.mobile}`);
    }
  };

  const addBankTransaction = (tData: Omit<BankTransaction, 'id' | 'sn'>): BankTransaction => {
    const newT: BankTransaction = {
      ...tData,
      id: `bt-${Date.now()}`,
      sn: bankTransactions.length + 1
    };
    setBankTransactions(prev => [newT, ...prev]);
    addHistoryLog('Bank Transaction has been Added', `Tra No: ${newT.traNo} - ৳${newT.amount}`);
    return newT;
  };

  // Payroll Mutators
  const addDepartment = (deptData: Omit<Department, 'id' | 'sn'>): Department => {
    const newD: Department = {
      ...deptData,
      id: `dep-${Date.now()}`,
      sn: departments.length + 1
    };
    setDepartments(prev => [...prev, newD]);
    addHistoryLog('Department has been Added', `Dept: ${newD.name}`);
    return newD;
  };

  const updateDepartment = (id: string, updated: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    addHistoryLog('Department has been updated', `ID: ${id}`);
  };

  const deleteDepartment = (id: string) => {
    const d = departments.find(x => x.id === id);
    if (d) {
      setDepartments(prev => prev.filter(x => x.id !== id));
      addHistoryLog('Department has been deleted', `Dept: ${d.name}`);
    }
  };

  const addDesignation = (desigData: Omit<Designation, 'id' | 'sn'>): Designation => {
    const newDes: Designation = {
      ...desigData,
      id: `des-${Date.now()}`,
      sn: designations.length + 1
    };
    setDesignations(prev => [...prev, newDes]);
    addHistoryLog('Designation has been Added', `Designation: ${newDes.name}`);
    return newDes;
  };

  const updateDesignation = (id: string, updated: Partial<Designation>) => {
    setDesignations(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    addHistoryLog('Designation has been updated', `ID: ${id}`);
  };

  const deleteDesignation = (id: string) => {
    const d = designations.find(x => x.id === id);
    if (d) {
      setDesignations(prev => prev.filter(x => x.id !== id));
      addHistoryLog('Designation has been deleted', `Designation: ${d.name}`);
    }
  };

  const addEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [...prev, newEmp]);
    addHistoryLog('Employee has been Added', `ID: ${newEmp.employeeId} - ${newEmp.name}`);
    return newEmp;
  };

  const updateEmployee = (id: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    addHistoryLog('Employee record updated', `Employee ID: ${id}`);
  };

  const deleteEmployee = (id: string) => {
    const e = employees.find(x => x.id === id);
    if (e) {
      setEmployees(prev => prev.filter(x => x.id !== id));
      addHistoryLog('Employee has been deleted', `Name: ${e.name}`);
    }
  };

  const addLeaveType = (ltData: Omit<LeaveType, 'id' | 'sn'>): LeaveType => {
    const newLt: LeaveType = {
      ...ltData,
      id: `lt-${Date.now()}`,
      sn: leaveTypes.length + 1
    };
    setLeaveTypes(prev => [...prev, newLt]);
    addHistoryLog('Leave Type has been Added', `Type: ${newLt.name}`);
    return newLt;
  };

  const deleteLeaveType = (id: string) => {
    setLeaveTypes(prev => prev.filter(x => x.id !== id));
  };

  const addLeaveRecord = (lrData: Omit<LeaveRecord, 'id' | 'sn'>): LeaveRecord => {
    const newLr: LeaveRecord = {
      ...lrData,
      id: `lr-${Date.now()}`,
      sn: leaveRecords.length + 1
    };
    setLeaveRecords(prev => [newLr, ...prev]);
    addHistoryLog('Leave Application submitted', `Employee: ${newLr.employeeName}`);
    return newLr;
  };

  const updateLeaveStatus = (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    setLeaveRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    addHistoryLog('Leave Application status updated', `Status: ${status}`);
  };

  const updateAttendanceRecord = (id: string, record: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(a => a.id === id ? { ...a, ...record } : a));
    addHistoryLog('Attendance record updated', `Employee Record: ${id}`);
  };

  const generatePayslips = (month: string) => {
    const newSlips: PayslipItem[] = employees.map(emp => {
      const basic = emp.basicSalary || Math.round(emp.salary * 0.65);
      const allow = emp.salary - basic;
      return {
        id: `ps-${emp.id}-${Date.now()}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        designation: emp.designation,
        salaryMonth: month,
        basicSalary: basic,
        allowance: allow,
        grossSalary: emp.salary,
        deduction: 0,
        netPayable: emp.salary,
        status: 'Unpaid' as const
      };
    });
    setPayslips(newSlips);
    addHistoryLog('Payslip generated for month', `Month: ${month}`);
  };

  const payPayslip = (id: string) => {
    setPayslips(prev => prev.map(p => p.id === id ? { ...p, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] } : p));
    addHistoryLog('Salary paid for employee', `Payslip ID: ${id}`);
  };

  // Personal Mutators
  const addPersonalNote = (nData: Omit<PersonalNote, 'id' | 'date' | 'time'>): PersonalNote => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const newNote: PersonalNote = {
      ...nData,
      id: `note-${Date.now()}`,
      date: dateStr,
      time: timeStr
    };
    setPersonalNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updatePersonalNote = (id: string, updated: Partial<PersonalNote>) => {
    setPersonalNotes(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n));
  };

  const deletePersonalNote = (id: string) => {
    setPersonalNotes(prev => prev.filter(n => n.id !== id));
  };

  const toggleFavoriteNote = (id: string) => {
    setPersonalNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const addTodoTask = (tData: Omit<TodoTask, 'id' | 'createdAt'>): TodoTask => {
    const newTask: TodoTask = {
      ...tData,
      id: `td-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTodos(prev => [newTask, ...prev]);
    return newTask;
  };

  const toggleTodoTask = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodoTask = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        currentRoute,
        setCurrentRoute,
        navigateToRoute,
        activeModuleTitle,
        sidebarCollapsed,
        setSidebarCollapsed,
        products,
        customers,
        suppliers,
        purchases,
        sales,
        expenses,
        cheques,
        bankAccounts,
        banks,
        mobileAccounts,
        bankTransactions,
        departments,
        designations,
        employees,
        leaveTypes,
        leaveRecords,
        attendanceRecords,
        payslips,
        personalNotes,
        todos,
        addBank,
        updateBank,
        deleteBank,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addMobileAccount,
        updateMobileAccount,
        deleteMobileAccount,
        addBankTransaction,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addDesignation,
        updateDesignation,
        deleteDesignation,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addLeaveType,
        deleteLeaveType,
        addLeaveRecord,
        updateLeaveStatus,
        updateAttendanceRecord,
        generatePayslips,
        payPayslip,
        addPersonalNote,
        updatePersonalNote,
        deletePersonalNote,
        toggleFavoriteNote,
        addTodoTask,
        toggleTodoTask,
        deleteTodoTask,
        roles,
        users,
        historyLogs,
        addRole,
        updateRole,
        deleteRole,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        addHistoryLog,
        isHistoryOpen,
        setIsHistoryOpen,
        editingRole,
        setEditingRole,
        editingUser,
        setEditingUser,
        addSalesInvoice,
        collectSalesPayment,
        addPurchaseInvoice,
        payPurchaseDue,
        addProduct,
        updateProductPrice,
        addCustomer,
        addExpense,
        updateChequeStatus,
        invoiceToPrint,
        setInvoiceToPrint,
        selectedProductForDetail,
        setSelectedProductForDetail,
        isQuickSearchOpen,
        setIsQuickSearchOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        calculatorInput,
        setCalculatorInput,
        calculatorResult,
        evaluateCalculator,
        isChatOpen,
        setIsChatOpen,
        isProductDrawerOpen,
        setIsProductDrawerOpen,
        isQuickMenuOpen,
        setIsQuickMenuOpen
      }}
    >
      {children}
    </AppContext.Provider>

  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
