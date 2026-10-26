import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

interface AccountTreeNode {
  id: string;
  code?: string;
  title: string;
  debit?: number;
  credit?: number;
  balance?: number;
  children?: AccountTreeNode[];
}

export const FinancialsModuleView: React.FC = () => {
  const { currentRoute, setCurrentRoute, sales, purchases, expenses } = useApp();

  // Filters for P&L, Trial Balance, Balance Sheet
  const [fromDate, setFromDate] = useState('2026-09-25');
  const [toDate, setToDate] = useState('2026-10-24');

  // Tree expanded state for Chart of Accounts
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'assets': true,
    'current-assets': true,
    'cash-bank': true,
    'receivables': true,
    'liabilities': true,
    'current-liabilities': true,
    'payables': true,
    'equity': true,
    'revenue': true,
    'service-income': true,
    'expenses': true,
    'direct-exp': true,
    'indirect-exp': true
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {
      'assets': true,
      'non-current-assets': true,
      'fixed-assets': true,
      'investments': true,
      'advances': true,
      'customer-prev-bal': true,
      'current-assets': true,
      'cash-bank': true,
      'cash-bank-details': true,
      'receivables': true,
      'inventory': true,
      'liabilities': true,
      'current-liabilities': true,
      'payables': true,
      'equity': true,
      'direct-exp': true,
      'indirect-exp': true,
      'revenue': true,
      'service-income': true,
      'sales-revenue': true
    };
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Chart of Account Tree Hierarchy matching image_141aa8f6.png - image_ca90e005.png
  const accountTree: AccountTreeNode[] = [
    {
      id: 'assets',
      title: 'Assets',
      debit: 92450120.50,
      credit: 75120300.20,
      balance: 17329820.30,
      children: [
        {
          id: 'non-current-assets',
          title: 'Non Current Assets',
          children: [
            {
              id: 'fixed-assets',
              title: 'Fixed Assets',
              debit: 3858941.58,
              credit: 243372.00,
              balance: 3615569.58,
              children: [
                { id: 'fa-1', code: '1001', title: 'Computer & IT Equipment', debit: 1850000, credit: 120000, balance: 1730000 },
                { id: 'fa-2', code: '1002', title: 'Furniture & Fixtures', debit: 980000, credit: 65000, balance: 915000 },
                { id: 'fa-3', code: '1003', title: 'Office Decoration', debit: 620000, credit: 38372, balance: 581628 },
                { id: 'fa-4', code: '1004', title: 'Electrical & Air Condition Equipment', debit: 408941.58, credit: 20000, balance: 388941.58 }
              ]
            },
            {
              id: 'investments',
              title: 'Investments',
              debit: 0,
              credit: 0,
              balance: 0
            },
            {
              id: 'advances',
              title: 'Advances Deposits & Prepayment',
              debit: 500000,
              credit: 0,
              balance: 500000
            }
          ]
        },
        {
          id: 'customer-prev-bal',
          title: 'Customer Previous Balance',
          debit: 1245000,
          credit: 1245000,
          balance: 0
        },
        {
          id: 'current-assets',
          title: 'Current Assets',
          debit: 88591178.92,
          credit: 74876928.20,
          balance: 13714250.72,
          children: [
            {
              id: 'cash-bank',
              title: 'Cash & Bank Balance',
              debit: 48920150.00,
              credit: 46210000.00,
              balance: 2710150.00,
              children: [
                { id: 'cb-1', code: '1101', title: 'Cash In Hand', balance: 45200.00 },
                { id: 'cb-2', code: '1102', title: 'DUTCH BANGLA BANK - 0987654321', balance: 240000.00 },
                { id: 'cb-3', code: '1103', title: 'BRAC BANK - 1501204892001', balance: 385400.00 },
                { id: 'cb-4', code: '1104', title: 'CITY BANK - 21098457201', balance: 195000.00 },
                { id: 'cb-5', code: '1105', title: 'bKash Merchant Account - 01616170071', balance: 64800.00 },
                { id: 'cb-6', code: '1106', title: 'Nagad Commercial Account - 01751871072', balance: 32500.00 },
                { id: 'cb-7', code: '1107', title: 'Rocket Corporate Account - 01911223344', balance: 18200.00 }
              ]
            },
            {
              id: 'receivables',
              title: 'Account Receivables (Customers)',
              debit: 28500000.00,
              credit: 21300000.00,
              balance: 7200000.00,
              children: [
                { id: 'ar-1', code: 'CUS-102', title: 'Al-Amin Computers', balance: 75000.00 },
                { id: 'ar-2', code: 'CUS-103', title: 'Tech Park BD', balance: 19000.00 },
                { id: 'ar-3', code: 'CUS-104', title: 'Silicon Tech Systems', balance: 31000.00 },
                { id: 'ar-4', code: 'CUS-105', title: 'Apex Solutions Ltd', balance: 49000.00 },
                { id: 'ar-5', code: 'CUS-106', title: 'Rafiqul Islam (Personal)', balance: 96500.00 }
              ]
            },
            {
              id: 'inventory',
              title: 'Merchandise Stock In Hand',
              balance: 3804100.72
            }
          ]
        }
      ]
    },
    {
      id: 'liabilities',
      title: 'Liabilities',
      children: [
        {
          id: 'current-liabilities',
          title: 'Current Liabilities',
          children: [
            {
              id: 'payables',
              title: 'Account Payable (Suppliers)',
              children: [
                { id: 'ap-1', code: 'SUP-002', title: 'Best Laptop Gallery', balance: 439000.00 },
                { id: 'ap-2', code: 'SUP-005', title: 'BD TECH', balance: 185000.00 },
                { id: 'ap-3', code: 'SUP-006', title: 'AS MS', balance: 94000.00 },
                { id: 'ap-4', code: 'SUP-007', title: 'A 1 COMPUTER', balance: 142000.00 },
                { id: 'ap-5', code: 'SUP-008', title: 'Dubai-Sajid', balance: 310000.00 },
                { id: 'ap-6', code: 'SUP-009', title: 'Abdul Ahad Enterprise', balance: 125000.00 },
                { id: 'ap-7', code: 'SUP-001', title: 'City Laptop Zone', balance: 22000.00 },
                { id: 'ap-8', code: 'SUP-010', title: 'Map Computer', balance: 48000.00 },
                { id: 'ap-9', code: 'SUP-011', title: 'Bag Supplier', balance: 18500.00 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'equity',
      title: "Owner's Equity",
      balance: 10000000.00,
      children: [
        { id: 'eq-1', code: '3001', title: 'Capital Account', balance: 8000000.00 },
        { id: 'eq-2', code: '3002', title: 'Retained Earnings', balance: 2000000.00 }
      ]
    },
    {
      id: 'direct-exp',
      title: 'Direct Expense',
      balance: 542226.00,
      children: [
        { id: 'de-1', code: '5001', title: 'Cost of Goods Sold (COGS)', balance: 382500.00 },
        { id: 'de-2', code: '5002', title: 'Import & Customs Clearing', balance: 112000.00 },
        { id: 'de-3', code: '5003', title: 'Freight & Courier Inward', balance: 47726.00 }
      ]
    },
    {
      id: 'indirect-exp',
      title: 'Indirect Expenses',
      children: [
        { id: 'ie-1', code: '6001', title: 'Showroom Rent', balance: 45000.00 },
        { id: 'ie-2', code: '6002', title: 'Staff Salary & Allowances', balance: 96500.00 },
        { id: 'ie-3', code: '6003', title: 'Showroom Electricity & DESCO Bill', balance: 12726.00 },
        { id: 'ie-4', code: '6004', title: 'Staff Snacks & Entertainment', balance: 6400.00 },
        { id: 'ie-5', code: '6005', title: 'Conveyance & Transport', balance: 10000.00 }
      ]
    },
    {
      id: 'revenue',
      title: 'Revenue',
      balance: 21617673.00,
      children: [
        { id: 'rev-1', code: '4001', title: 'Sales Revenue', balance: 21577773.00 },
        {
          id: 'service-income',
          title: 'Service Income',
          balance: 39900.00,
          children: [
            { id: 'si-1', code: '4101', title: 'Dell Latitude 3189', balance: 500.00 },
            { id: 'si-2', code: '4102', title: 'Bios Lock', balance: 1500.00 },
            { id: 'si-3', code: '4103', title: 'Laptop Service', balance: 15900.00 },
            { id: 'si-4', code: '4104', title: 'Lock Broken', balance: 800.00 },
            { id: 'si-5', code: '4105', title: 'Mother Board Repair', balance: 19200.00 },
            { id: 'si-6', code: '4106', title: 'Battery Service', balance: 1200.00 },
            { id: 'si-7', code: '4107', title: 'Keyboard Replacement', balance: 800.00 }
          ]
        }
      ]
    }
  ];

  // Recursive Tree Node Renderer matching image_141aa8f6.png - image_ca90e005.png
  const renderTreeNode = (node: AccountTreeNode, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="text-xs">
        <div
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`flex items-center justify-between py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer select-none border-b border-gray-100 ${
            depth === 0 ? 'font-bold text-[#00305d] bg-gray-50' : depth === 1 ? 'font-semibold text-gray-800' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          <div className="flex items-center space-x-2">
            {hasChildren ? (
              <span className="w-4 h-4 bg-gray-200 text-gray-600 rounded flex items-center justify-center text-[10px] font-bold">
                {isExpanded ? '−' : '+'}
              </span>
            ) : (
              <span className="w-4 h-4 text-gray-400 flex items-center justify-center text-[9px]">
                <i className="fa fa-file-text-o"></i>
              </span>
            )}

            {node.code && (
              <span className="font-mono text-gray-400 text-[10px]">[{node.code}]</span>
            )}

            <span className="hover:underline">{node.title}</span>
          </div>

          <div className="flex items-center space-x-4 text-right font-mono text-[11px]">
            {node.debit !== undefined && (
              <span className="text-gray-600 w-24">Dr: {formatBDT(node.debit)}</span>
            )}
            {node.credit !== undefined && (
              <span className="text-gray-600 w-24">Cr: {formatBDT(node.credit)}</span>
            )}
            {node.balance !== undefined && (
              <span className={`w-28 font-bold ${node.balance >= 0 ? 'text-gray-900' : 'text-rose-700'}`}>
                {formatBDT(node.balance)}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-3">
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 1. Chart of Account View (fin_chartofacc.php) matching screenshot image_141aa8f6.png
  const renderChartOfAccounts = () => (
    <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden">
      {/* Header banner matching screenshot "TRIAL BALANCH" / "CHART OF ACCOUNT" */}
      <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
        <h2 className="font-bold text-xs uppercase tracking-wider">CHART OF ACCOUNT</h2>
        <div className="space-x-2">
          <button
            onClick={expandAll}
            className="bg-[#504c98] hover:bg-[#403c88] text-white text-[11px] font-bold px-3 py-1 rounded-xs uppercase transition shadow-xs"
          >
            EXPAND ALL
          </button>
          <button
            onClick={collapseAll}
            className="bg-[#504c98] hover:bg-[#403c88] text-white text-[11px] font-bold px-3 py-1 rounded-xs uppercase transition shadow-xs"
          >
            COLLAPSED ALL
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-[11px] text-gray-500 pb-2 border-b border-gray-200 flex justify-between items-center">
          <span>Click folder plus/minus icons to expand general ledger hierarchy and balances.</span>
          <span className="font-mono text-gray-400">Currency: BDT (৳)</span>
        </div>

        <div className="space-y-0.5">
          {accountTree.map(node => renderTreeNode(node))}
        </div>
      </div>
    </div>
  );

  // 2. Profit & Loss View (fin_proandlos.php) matching screenshot image_5f4046b1.png & image_07dcfd2f.png
  const renderProfitAndLoss = () => (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      {/* Main Income Statement Paper Panel */}
      <div className="flex-1 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden w-full">
        {/* Banner matching image_5f4046b1.png "PROFIT & LOSS STATEMENT" */}
        <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
          <h2 className="font-bold text-xs uppercase tracking-wider">PROFIT &amp; LOSS STATEMENT</h2>
          <button
            onClick={() => window.print()}
            className="bg-[#504c98] hover:bg-[#403c88] text-white text-[11px] font-bold px-3 py-0.5 rounded-xs uppercase transition shadow-xs"
          >
            <i className="fa fa-print mr-1"></i> Print
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-gray-800">
          <div className="text-center pb-2 border-b border-gray-200">
            <h1 className="text-lg font-black text-[#00284d] uppercase tracking-wide">TECH DRIVE</h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              INCOME STATEMENT FROM: {fromDate} To: {toDate}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200">
              <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 border-r border-gray-200">REVENUE</th>
                  <th className="py-2.5 px-3 text-right border-r border-gray-200 w-32">Opening</th>
                  <th className="py-2.5 px-3 text-right border-r border-gray-200 w-32">During Time</th>
                  <th className="py-2.5 px-3 text-right w-36">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px]">
                {/* Service Income Group matching image_07dcfd2f.png */}
                <tr className="bg-sky-50/50 font-bold text-sky-900">
                  <td colSpan={4} className="py-1.5 px-3 uppercase text-[10px] tracking-wider">
                    Service Income
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Dell Latitude 3189</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">0.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">500.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">500.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Bios Lock</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">0.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">1,500.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">1,500.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Laptop Service</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">12,400.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">3,500.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">15,900.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Lock Broken</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">0.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">800.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">800.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Mother Board Repair</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">15,000.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">4,200.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">19,200.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-gray-800 font-semibold border-r border-gray-200">Sales Revenue</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">2,022,086.73</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">282,048.99</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">2,304,135.72</td>
                </tr>
                {/* Total Revenue Row matching image_5f4046b1.png */}
                <tr className="bg-emerald-50 font-bold text-emerald-900 border-t border-b border-emerald-300">
                  <td className="py-2 px-3 border-r border-emerald-200 uppercase">TOTAL REVENUE</td>
                  <td className="py-2 px-3 text-right font-mono border-r border-emerald-200">2,049,486.73</td>
                  <td className="py-2 px-3 text-right font-mono border-r border-emerald-200">292,548.99</td>
                  <td className="py-2 px-3 text-right font-mono">2,342,035.72</td>
                </tr>

                {/* Expenses Group matching image_5f4046b1.png */}
                <tr className="bg-rose-50/50 font-bold text-rose-900">
                  <td colSpan={4} className="py-1.5 px-3 uppercase text-[10px] tracking-wider">
                    EXPENSES
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Direct Expenses (Cost of Goods Sold)</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">324,500.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">58,000.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">382,500.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Office Rent</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">45,000.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">0.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">45,000.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Salary &amp; Allowances</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">78,000.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">18,500.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">96,500.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Showroom Electricity &amp; Utilities</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">9,528.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">3,198.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">12,726.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 pl-6 text-gray-700 border-r border-gray-200">Conveyance &amp; Transport</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">7,300.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">2,700.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r border-gray-200">10,000.00</td>
                </tr>
                {/* Total Expenses Row */}
                <tr className="bg-rose-50 font-bold text-rose-900 border-t border-b border-rose-300">
                  <td className="py-2 px-3 border-r border-rose-200 uppercase">TOTAL EXPENSES</td>
                  <td className="py-2 px-3 text-right font-mono border-r border-rose-200">464,328.00</td>
                  <td className="py-2 px-3 text-right font-mono border-r border-rose-200">82,398.00</td>
                  <td className="py-2 px-3 text-right font-mono">546,726.00</td>
                </tr>

                {/* Net Income Row matching image_5f4046b1.png */}
                <tr className="bg-[#605ca8] text-white font-black text-xs">
                  <td className="py-3 px-3 uppercase tracking-wider">NET INCOME</td>
                  <td className="py-3 px-3 text-right font-mono border-r border-[#706cb8]">1,585,158.73</td>
                  <td className="py-3 px-3 text-right font-mono border-r border-[#706cb8]">210,150.99</td>
                  <td className="py-3 px-3 text-right font-mono text-[#ffd166]">1,795,309.72</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Filter Panel matching image_5f4046b1.png */}
      <div className="w-full lg:w-72 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden flex-shrink-0">
        <div className="bg-[#605ca8] text-white px-4 py-2">
          <h3 className="font-bold text-xs uppercase tracking-wider">FILTER</h3>
        </div>

        <div className="p-4 space-y-3 text-xs text-gray-800">
          <div>
            <label className="block text-gray-600 mb-1 font-semibold">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 focus:border-[#605ca8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-semibold">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 focus:border-[#605ca8] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="w-full bg-[#605ca8] hover:bg-[#504c98] text-white font-bold py-1.5 rounded-xs text-xs uppercase transition shadow-xs text-center"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Trial Balance View (fin_trialbal.php) matching screenshot image_0119b92c.png
  const renderTrialBalance = () => (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <div className="flex-1 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden w-full">
        {/* Banner matching image_0119b92c.png "TRIAL BALANCH" */}
        <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
          <h2 className="font-bold text-xs uppercase tracking-wider">TRIAL BALANCH</h2>
          <button
            onClick={() => window.print()}
            className="bg-[#504c98] hover:bg-[#403c88] text-white text-[11px] font-bold px-3 py-0.5 rounded-xs uppercase transition shadow-xs"
          >
            <i className="fa fa-print mr-1"></i> Print
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200">
              <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-28 border-r border-gray-200">Account Code</th>
                  <th className="py-2.5 px-3 border-r border-gray-200">Account Title</th>
                  <th className="py-2.5 px-3 text-right border-r border-gray-200 w-36">Debit (BDT)</th>
                  <th className="py-2.5 px-3 text-right w-36">Credit (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">1001</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Computer &amp; IT Equipment</td>
                  <td className="py-2 px-3 text-right font-mono border-r">1,730,000.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">1002</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Furniture &amp; Fixtures</td>
                  <td className="py-2 px-3 text-right font-mono border-r">915,000.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">1101</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Cash In Hand</td>
                  <td className="py-2 px-3 text-right font-mono border-r">45,200.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">1102</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">DUTCH BANGLA BANK - 0987654321</td>
                  <td className="py-2 px-3 text-right font-mono border-r">240,000.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">1103</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">BRAC BANK - 1501204892001</td>
                  <td className="py-2 px-3 text-right font-mono border-r">385,400.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">1201</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Account Receivables (Debtors)</td>
                  <td className="py-2 px-3 text-right font-mono border-r">7,200,000.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">2001</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Account Payable (Suppliers)</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400 border-r">0.00</td>
                  <td className="py-2 px-3 text-right font-mono">1,383,500.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">3001</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Owner's Capital Account</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400 border-r">0.00</td>
                  <td className="py-2 px-3 text-right font-mono">10,000,000.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">4001</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Sales &amp; Service Turnover</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400 border-r">0.00</td>
                  <td className="py-2 px-3 text-right font-mono">2,342,035.72</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">5001</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Cost of Goods Sold &amp; Direct Expenses</td>
                  <td className="py-2 px-3 text-right font-mono border-r">382,500.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-600 border-r">6001</td>
                  <td className="py-2 px-3 font-medium text-gray-900 border-r">Operating Overheads &amp; Administrative</td>
                  <td className="py-2 px-3 text-right font-mono border-r">164,226.00</td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">0.00</td>
                </tr>

                {/* Total Row */}
                <tr className="bg-[#605ca8] text-white font-bold text-xs">
                  <td colSpan={2} className="py-2.5 px-3 uppercase tracking-wider text-right">
                    TOTAL TRIAL BALANCE
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">13,725,535.72</td>
                  <td className="py-2.5 px-3 text-right font-mono">13,725,535.72</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Filter Panel */}
      <div className="w-full lg:w-72 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden flex-shrink-0">
        <div className="bg-[#605ca8] text-white px-4 py-2">
          <h3 className="font-bold text-xs uppercase tracking-wider">FILTER</h3>
        </div>

        <div className="p-4 space-y-3 text-xs text-gray-800">
          <div>
            <label className="block text-gray-600 mb-1 font-semibold">From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 focus:border-[#605ca8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-semibold">To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 focus:border-[#605ca8] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              className="flex-1 bg-[#dd4b39] hover:bg-[#c9302c] text-white font-bold py-1.5 rounded-xs text-xs uppercase transition shadow-xs text-center"
            >
              RESET
            </button>
            <button
              type="button"
              className="flex-1 bg-[#605ca8] hover:bg-[#504c98] text-white font-bold py-1.5 rounded-xs text-xs uppercase transition shadow-xs text-center"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Expandable sections state for Balance Sheet matching image_bb63b659.png - image_034c1fd4.png
  const [bsExpanded, setBsExpanded] = useState<Record<string, boolean>>({
    'current-assets': true,
    'cash-in-hand': true,
    'cash-at-bank': true,
    'inventory': true,
    'receivables': true,
    'mobile-account': true,
    'current-liabilities': true,
    'payables': true,
    'owners-equity': true,
    'share-capital': true,
    'retained-earnings': true,
    'financial-ratios': true
  });

  const toggleBs = (key: string) => {
    setBsExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 4. Authentic 1:1 Balance Sheet View (fin_blasheet.php & fin_balancesheet.php) matching screenshots image_bb63b659.png - image_034c1fd4.png
  const renderBalanceSheet = () => (
    <div className="flex flex-col lg:flex-row gap-4 items-start select-none">
      {/* Main Balance Sheet Statement */}
      <div className="flex-1 bg-white rounded-none shadow-2xs border border-gray-300 overflow-hidden w-full">
        <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <span>BALANCE SHEET</span>
          <button
            onClick={() => window.print()}
            className="bg-[#0073a8] hover:bg-[#005e8a] text-white text-[11px] font-bold px-3 py-0.5 rounded uppercase transition shadow-xs"
          >
            <i className="fa fa-print mr-1"></i> Print
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Centered Statement Header */}
          <div className="text-center py-2">
            <h2 className="text-lg font-bold text-gray-800 tracking-wider">BALANCE SHEET</h2>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-700 px-1 font-medium border-b border-gray-200 pb-2">
            <div>
              <span className="font-semibold text-gray-500">FROM:</span> {fromDate || '26-Sep-2026'}
            </div>
            <div>
              <span className="font-semibold text-gray-500">To:</span> {toDate || '25-Oct-2026'}
            </div>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-[#f4f7f9] text-gray-800 font-bold text-[11px] border-b border-gray-300">
                <tr>
                  <th className="py-2 px-3 border-r border-gray-200 uppercase">ASSETS</th>
                  <th className="py-2 px-3 text-right border-r border-gray-200 w-32 uppercase">Opening</th>
                  <th className="py-2 px-3 text-right border-r border-gray-200 w-32 uppercase">During Time</th>
                  <th className="py-2 px-3 text-right w-36 uppercase">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px] text-gray-800">
                {/* Current Assets */}
                <tr className="bg-gray-50/70 font-bold hover:bg-sky-50/30 cursor-pointer" onClick={() => toggleBs('current-assets')}>
                  <td className="py-1.5 px-3 border-r">
                    <span className="mr-1.5 text-gray-500 text-[10px]">{bsExpanded['current-assets'] ? '▼' : '▶'}</span>
                    Current Assets
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">12,216,884.62</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">1,506,747.10</td>
                  <td className="py-1.5 px-3 text-right font-mono">13,723,631.72</td>
                </tr>

                {bsExpanded['current-assets'] && (
                  <>
                    {/* Cash In Hand */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBs('cash-in-hand')}>
                      <td className="py-1.5 px-3 pl-7 border-r font-semibold text-gray-700">
                        <span className="mr-1.5 text-gray-400 text-[9px]">{bsExpanded['cash-in-hand'] ? '▼' : '▶'}</span>
                        Cash In Hand
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">9,529,868.00</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">947,554.00</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">10,477,422.00</td>
                    </tr>
                    {bsExpanded['cash-in-hand'] && (
                      <>
                        <tr className="text-gray-600 bg-white hover:bg-sky-50/20">
                          <td className="py-1 px-3 pl-12 border-r">: Showroom Petty Cash</td>
                          <td className="py-1 px-3 text-right font-mono border-r">89,510.00</td>
                          <td className="py-1 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                          <td className="py-1 px-3 text-right font-mono">89,510.00</td>
                        </tr>
                        <tr className="text-gray-600 bg-white hover:bg-sky-50/20">
                          <td className="py-1 px-3 pl-12 border-r">: Main Vault Cash</td>
                          <td className="py-1 px-3 text-right font-mono border-r">9,440,358.00</td>
                          <td className="py-1 px-3 text-right font-mono border-r">947,554.00</td>
                          <td className="py-1 px-3 text-right font-mono">10,387,912.00</td>
                        </tr>
                      </>
                    )}

                    {/* Cash At Bank */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBs('cash-at-bank')}>
                      <td className="py-1.5 px-3 pl-7 border-r font-semibold text-gray-700">
                        <span className="mr-1.5 text-gray-400 text-[9px]">{bsExpanded['cash-at-bank'] ? '▼' : '▶'}</span>
                        Cash At Bank
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">82,925.00</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">82,925.00</td>
                    </tr>
                    {bsExpanded['cash-at-bank'] && (
                      <>
                        <tr className="text-gray-600 bg-white hover:bg-sky-50/20">
                          <td className="py-1 px-3 pl-12 border-r">: BRAC/123456789</td>
                          <td className="py-1 px-3 text-right font-mono border-r">25.00</td>
                          <td className="py-1 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                          <td className="py-1 px-3 text-right font-mono">25.00</td>
                        </tr>
                        <tr className="text-gray-600 bg-white hover:bg-sky-50/20">
                          <td className="py-1 px-3 pl-12 border-r">: DBBL/0987654321</td>
                          <td className="py-1 px-3 text-right font-mono border-r">82,900.00</td>
                          <td className="py-1 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                          <td className="py-1 px-3 text-right font-mono">82,900.00</td>
                        </tr>
                      </>
                    )}

                    {/* Inventory */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBs('inventory')}>
                      <td className="py-1.5 px-3 pl-7 border-r font-semibold text-gray-700">
                        <span className="mr-1.5 text-gray-400 text-[9px]">{bsExpanded['inventory'] ? '▼' : '▶'}</span>
                        Inventory
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">1,439,176.62</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">469,483.10</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">1,908,659.72</td>
                    </tr>
                    {bsExpanded['inventory'] && (
                      <>
                        {[
                          { name: 'ABA282P: HP EliteBook 840 G5 Intel Core i7 8th Gen | 8GB RAM | 256GB SSD | 14" FHD Display | Intel UHD Graphics 620', op: 0.0, du: 29500.0, cl: 29500.0 },
                          { name: 'ABA283P: Sony VAIO VJPK13C11N | Intel Core i5 10th Gen | 8GB RAM | 256GB SSD | 14" FHD (1920×1080) Anti-Glare Display | Intel UHD Graphics', op: 0.0, du: 25000.0, cl: 25000.0 },
                          { name: 'ABA284P: ThinkPad T495 AMD Ryzen 5 PRO 3500U | 8GB RAM | 256GB SSD | 14" FHD (1920×1080) IPS Display | AMD Radeon Vega 8 Graphics', op: 0.0, du: 22000.0, cl: 22000.0 },
                          { name: 'ABA009P: Lenovo Laptop ThinkPad T495 AMD RYZEN 5 PRO 3500U 8th Gen RAM 16 GB SSD 256 GB 14" Full HD LED Backlit Anti-Glare IPS Display', op: 1481.90, du: 0.0, cl: 1481.90 },
                          { name: 'ABA010P: HP EliteBook 845 G9 AMD Ryzen 5 PRO 6650U | 16GB RAM | 512GB SSD | 14" WUXGA IPS Anti-Glare Display (1920×1200) | AMD Radeon Graphics', op: 46500.0, du: -45237.15, cl: 1262.85 },
                          { name: 'ABA022P: HP EliteBook 840 G8 Intel Core i7 11th Gen | 8GB RAM | 256GB SSD | 14" Full HD Anti-Glare IPS Display (1920×1080) | Intel Iris Xe Graphics', op: 0.0, du: 81000.0, cl: 81000.0 },
                          { name: 'ABA023P: HP | EliteBook | 840 G8 | Intel Core i5 | 11th Gen | 8GB | 256GB SSD | Full HD | IPS | 14" | 1920 X 1080 | Intel Iris Xe Graphics', op: 69850.60, du: -66272.54, cl: 3578.06 },
                          { name: 'ABA026P: Dell Laptop Latitude 7320 Intel Core i7 11th Gen RAM 16 GB SSD 256 GB 13.5" FHD IPS Met Touch Display', op: -320.0, du: 0.0, cl: -320.0 },
                          { name: 'ABA027P: Dell Laptop Latitude 7420 2-in-1 Core i5 11th Gen RAM 16 GB SSD 512 GB 14" 2-in1 FHD Touchscreen X360 Display', op: 40500.0, du: 0.0, cl: 40500.0 },
                          { name: 'ABA031P: HP Laptop Elitebook 840 G7 Core i5 10th Gen RAM 16 GB SSD 512 GB 14" FHD IPS Touch Display', op: -2000.0, du: 0.0, cl: -2000.0 },
                          { name: 'ABA032P: HP EliteBook 845 G7 | AMD Ryzen 7 PRO 4750U | 16GB RAM | 256GB SSD | 14-inch FHD Display (1920 x 1080) | AMD Radeon Graphics', op: -3000.0, du: 46500.0, cl: 43500.0 },
                          { name: 'Gift-002: Tech Drive Laptop Backpack Standard- Gift', op: 12780.0, du: 2610.0, cl: 15390.0 },
                          { name: 'Gift-003: Power Cable- Gift', op: 2663.35, du: -1936.35, cl: 727.0 },
                          { name: 'Gift-004: Premium Mouse Pad- Gift', op: 897.95, du: -392.0, cl: 505.95 },
                          { name: 'Gift-001: MOUSE- USB OPTICAL WIRED- Gift', op: 546.15, du: 315.0, cl: 861.15 }
                        ].map((item, idx) => (
                          <tr key={idx} className="text-gray-600 bg-white hover:bg-sky-50/20 text-[10.5px]">
                            <td className="py-1 px-3 pl-12 border-r truncate max-w-md" title={item.name}>{item.name}</td>
                            <td className="py-1 px-3 text-right font-mono border-r">{formatBDT(item.op)}</td>
                            <td className="py-1 px-3 text-right font-mono border-r">{formatBDT(item.du)}</td>
                            <td className="py-1 px-3 text-right font-mono">{formatBDT(item.cl)}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    {/* Account Receivables */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBs('receivables')}>
                      <td className="py-1.5 px-3 pl-7 border-r font-semibold text-gray-700">
                        <span className="mr-1.5 text-gray-400 text-[9px]">{bsExpanded['receivables'] ? '▼' : '▶'}</span>
                        Account Receivables
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">1,163,915.00</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">89,710.00</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">1,253,625.00</td>
                    </tr>
                    {bsExpanded['receivables'] && (
                      <>
                        {[
                          { name: 'ABA/CU/168: Mr. Sajid', op: 37000.0, du: 0.0, cl: 37000.0 },
                          { name: 'ABA/CU/175: Mr. Bishnu Prashad', op: 17000.0, du: 0.0, cl: 17000.0 },
                          { name: 'ABA/CU/180: Khairul Islam', op: -34500.0, du: 0.0, cl: -34500.0 },
                          { name: 'ABA/CU/181: Mr. Majharul', op: 11000.0, du: 0.0, cl: 11000.0 },
                          { name: 'ABA/CU/182: Al Ehsan Trading', op: 45200.0, du: 0.0, cl: 45200.0 },
                          { name: 'ABA/CU/198: SAYMA SARMIN', op: 36500.0, du: 0.0, cl: 36500.0 },
                          { name: 'ABA/CU/203: Tareq Islam', op: 52000.0, du: 0.0, cl: 52000.0 },
                          { name: 'ABA/CU/205: MS-TELECOM', op: -1000.0, du: 0.0, cl: -1000.0 },
                          { name: 'ABA/CU/213: Mr . Rokibul Islam', op: 0.0, du: 10.0, cl: 10.0 },
                          { name: 'ABA/CU/222: Infosystem Technology Limited', op: 289000.0, du: 0.0, cl: 289000.0 },
                          { name: 'ABA/CU/228: Mr. Nahian', op: 36000.0, du: 0.0, cl: 36000.0 },
                          { name: 'ABA/CU/229: Mr. Dipok', op: 37000.0, du: 0.0, cl: 37000.0 },
                          { name: 'ABA/CU/237: MD.Amir Hosen', op: 1000.0, du: 0.0, cl: 1000.0 },
                          { name: 'ABA/CU/241: Ontor Hawlader', op: 31000.0, du: 0.0, cl: 31000.0 },
                          { name: 'ABA/CU/255: Mahmud Sikder', op: 35000.0, du: 0.0, cl: 35000.0 },
                          { name: 'ABA/CU/257: Rohan', op: 33000.0, du: 0.0, cl: 33000.0 },
                          { name: 'ABA/CU/266: SADMAN SAKIB', op: 35000.0, du: 0.0, cl: 35000.0 },
                          { name: 'ABA/CU/289: এস এম সাফি কল্লোল', op: 27250.0, du: 0.0, cl: 27250.0 },
                          { name: 'ABA/CU/290: Mahedi', op: -1000.0, du: 0.0, cl: -1000.0 }
                        ].map((c, idx) => (
                          <tr key={idx} className="text-gray-600 bg-white hover:bg-sky-50/20 text-[10.5px]">
                            <td className="py-1 px-3 pl-12 border-r">{c.name}</td>
                            <td className="py-1 px-3 text-right font-mono border-r">{formatBDT(c.op)}</td>
                            <td className="py-1 px-3 text-right font-mono border-r">{formatBDT(c.du)}</td>
                            <td className="py-1 px-3 text-right font-mono">{formatBDT(c.cl)}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    {/* Cash At Mobile Account */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBs('mobile-account')}>
                      <td className="py-1.5 px-3 pl-7 border-r font-semibold text-gray-700">
                        <span className="mr-1.5 text-gray-400 text-[9px]">{bsExpanded['mobile-account'] ? '▼' : '▶'}</span>
                        Cash At Mobile Account
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">1,000.00</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">1,000.00</td>
                    </tr>
                    {bsExpanded['mobile-account'] && (
                      <tr className="text-gray-600 bg-white hover:bg-sky-50/20">
                        <td className="py-1 px-3 pl-12 border-r">: Forhad - 01751871072</td>
                        <td className="py-1 px-3 text-right font-mono border-r">1,000.00</td>
                        <td className="py-1 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                        <td className="py-1 px-3 text-right font-mono">1,000.00</td>
                      </tr>
                    )}
                  </>
                )}

                {/* Total Current Assets */}
                <tr className="bg-gray-100 font-bold border-t border-b border-gray-300">
                  <td className="py-2 px-3 text-right uppercase border-r text-gray-800">Total Current Assets</td>
                  <td className="py-2 px-3 text-right font-mono border-r">12,216,884.62</td>
                  <td className="py-2 px-3 text-right font-mono border-r">1,506,747.10</td>
                  <td className="py-2 px-3 text-right font-mono">13,723,631.72</td>
                </tr>

                {/* Total Assets */}
                <tr className="bg-[#f0f4f8] font-black text-xs border-b-2 border-gray-400">
                  <td className="py-2.5 px-3 uppercase border-r text-gray-900">Total Assets</td>
                  <td className="py-2.5 px-3 text-right font-mono border-r">12,216,884.62</td>
                  <td className="py-2.5 px-3 text-right font-mono border-r">1,506,747.10</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#0084bf]">13,723,631.72</td>
                </tr>

                {/* LIABILITIES & OWNER'S EQUITY SECTION */}
                <tr className="bg-[#e4ebf2] text-gray-900 font-bold text-[11px] uppercase">
                  <td className="py-2 px-3 border-r">LIABILITIES &amp; OWNER'S EQUITY</td>
                  <td className="py-2 px-3 text-right border-r">Opening</td>
                  <td className="py-2 px-3 text-right border-r">During Time</td>
                  <td className="py-2 px-3 text-right">Closing</td>
                </tr>

                {/* Current Liabilities */}
                <tr className="bg-gray-50/70 font-bold hover:bg-sky-50/30 cursor-pointer" onClick={() => toggleBs('current-liabilities')}>
                  <td className="py-1.5 px-3 border-r">
                    <span className="mr-1.5 text-gray-500 text-[10px]">{bsExpanded['current-liabilities'] ? '▼' : '▶'}</span>
                    Current Liabilities
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">602,943.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">1,303,958.00</td>
                  <td className="py-1.5 px-3 text-right font-mono">1,906,901.00</td>
                </tr>

                {bsExpanded['current-liabilities'] && (
                  <>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBs('payables')}>
                      <td className="py-1.5 px-3 pl-7 border-r font-semibold text-gray-700">
                        <span className="mr-1.5 text-gray-400 text-[9px]">{bsExpanded['payables'] ? '▼' : '▶'}</span>
                        Account Payable
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">602,943.00</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">1,303,958.00</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">1,906,901.00</td>
                    </tr>
                    {bsExpanded['payables'] && (
                      <>
                        {[
                          { name: 'ABA/SU/001: Best Laptop Gallery', op: 475000.0, du: 377450.0, cl: 852450.0 },
                          { name: 'ABA/SU/003: AS MS', op: -16650.0, du: 0.0, cl: -16650.0 },
                          { name: 'ABA/SU/004: A 1 COMPUTER', op: 9693.0, du: 6930.0, cl: 16623.0 },
                          { name: 'ABA/SU/008: City Laptop Zone', op: 28970.0, du: 22000.0, cl: 50970.0 },
                          { name: 'ABA/SU/010: Dubai-Sajid', op: 56400.0, du: 30548.0, cl: 86948.0 },
                          { name: 'ABA/SU/011: Abdul Ahad Enterprise', op: 45500.0, du: 851080.0, cl: 896580.0 },
                          { name: 'ABA/SU/013: Map Computer', op: 850.0, du: 0.0, cl: 850.0 },
                          { name: 'ABA/SU/014: Bag Supplier', op: 3180.0, du: 15950.0, cl: 19130.0 }
                        ].map((s, idx) => (
                          <tr key={idx} className="text-gray-600 bg-white hover:bg-sky-50/20 text-[10.5px]">
                            <td className="py-1 px-3 pl-12 border-r">{s.name}</td>
                            <td className="py-1 px-3 text-right font-mono border-r">{formatBDT(s.op)}</td>
                            <td className="py-1 px-3 text-right font-mono border-r">{formatBDT(s.du)}</td>
                            <td className="py-1 px-3 text-right font-mono">{formatBDT(s.cl)}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </>
                )}

                {/* Total Current Liabilities */}
                <tr className="bg-gray-100 font-bold border-t border-gray-300">
                  <td className="py-2 px-3 text-right uppercase border-r text-gray-800">Total Current Liabilities</td>
                  <td className="py-2 px-3 text-right font-mono border-r">602,943.00</td>
                  <td className="py-2 px-3 text-right font-mono border-r">1,303,958.00</td>
                  <td className="py-2 px-3 text-right font-mono">1,906,901.00</td>
                </tr>

                {/* Owners' Equity */}
                <tr className="bg-gray-50/70 font-bold hover:bg-sky-50/30 cursor-pointer" onClick={() => toggleBs('owners-equity')}>
                  <td className="py-1.5 px-3 border-r">
                    <span className="mr-1.5 text-gray-500 text-[10px]">{bsExpanded['owners-equity'] ? '▼' : '▶'}</span>
                    Owners' Equity
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">10,000,000.00</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                  <td className="py-1.5 px-3 text-right font-mono">10,000,000.00</td>
                </tr>
                {bsExpanded['owners-equity'] && (
                  <>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBs('share-capital')}>
                      <td className="py-1.5 px-3 pl-7 border-r font-semibold text-gray-700">
                        <span className="mr-1.5 text-gray-400 text-[9px]">{bsExpanded['share-capital'] ? '▼' : '▶'}</span>
                        Share Capital
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono border-r">10,000,000.00</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">10,000,000.00</td>
                    </tr>
                    {bsExpanded['share-capital'] && (
                      <tr className="text-gray-600 bg-white hover:bg-sky-50/20">
                        <td className="py-1 px-3 pl-12 border-r">: Authorized / Paid Up Share Capital</td>
                        <td className="py-1 px-3 text-right font-mono border-r">10,000,000.00</td>
                        <td className="py-1 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                        <td className="py-1 px-3 text-right font-mono">10,000,000.00</td>
                      </tr>
                    )}
                  </>
                )}

                {/* Total Owners' Equity */}
                <tr className="bg-gray-100 font-bold border-t border-gray-300">
                  <td className="py-2 px-3 text-right uppercase border-r text-gray-800">Total Owners' Equity</td>
                  <td className="py-2 px-3 text-right font-mono border-r">10,000,000.00</td>
                  <td className="py-2 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                  <td className="py-2 px-3 text-right font-mono">10,000,000.00</td>
                </tr>

                {/* Retained Earnings */}
                <tr className="hover:bg-gray-50 font-bold">
                  <td className="py-1.5 px-3 border-r text-gray-800">
                    <span className="mr-1.5 text-gray-400 text-[9px]">▶</span>
                    Retained earnings
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">1,601,901.62</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">202,789.10</td>
                  <td className="py-1.5 px-3 text-right font-mono">1,804,690.72</td>
                </tr>

                {/* Total Liabilities and Owner's Equity */}
                <tr className="bg-[#f0f4f8] font-black text-xs border-t-2 border-b-2 border-gray-400">
                  <td className="py-2.5 px-3 uppercase border-r text-gray-900">Total Liabilities and Owner's Equity</td>
                  <td className="py-2.5 px-3 text-right font-mono border-r">12,204,844.62</td>
                  <td className="py-2.5 px-3 text-right font-mono border-r">1,506,747.10</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#0084bf]">13,711,591.72</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Common Financial Ratios Table */}
          <div className="pt-2">
            <div className="bg-[#e4ebf2] text-gray-900 font-bold text-[11px] px-3 py-1.5 uppercase border border-gray-300">
              Common Financial Ratios
            </div>
            <table className="w-full text-left text-xs border-x border-b border-gray-300 divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-100 text-[11px] text-gray-800">
                <tr className="hover:bg-sky-50/20">
                  <td className="py-1.5 px-3 border-r font-medium text-gray-800">Debt Ratio <span className="text-gray-500 font-normal">(Total Liabilities / Total Assets)</span></td>
                  <td className="py-1.5 px-3 text-right font-mono border-r w-32">20.26</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r w-32">1.16</td>
                  <td className="py-1.5 px-3 text-right font-mono w-36 font-semibold">7.20</td>
                </tr>
                <tr className="hover:bg-sky-50/20">
                  <td className="py-1.5 px-3 border-r font-medium text-gray-800">Current Ratio <span className="text-gray-500 font-normal">(Current Assets / Current Liabilities)</span></td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">20.26</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">1.16</td>
                  <td className="py-1.5 px-3 text-right font-mono font-semibold">7.20</td>
                </tr>
                <tr className="hover:bg-sky-50/20">
                  <td className="py-1.5 px-3 border-r font-medium text-gray-800">Working Capital <span className="text-gray-500 font-normal">(Current Assets - Current Liabilities)</span></td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">11,613,941.62</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">202,789.10</td>
                  <td className="py-1.5 px-3 text-right font-mono font-semibold">11,816,730.72</td>
                </tr>
                <tr className="hover:bg-sky-50/20">
                  <td className="py-1.5 px-3 border-r font-medium text-gray-800">Assets-to-Equity Ratio <span className="text-gray-500 font-normal">(Total Assets / Owner's Equity)</span></td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">1.22</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                  <td className="py-1.5 px-3 text-right font-mono font-semibold">1.37</td>
                </tr>
                <tr className="hover:bg-sky-50/20">
                  <td className="py-1.5 px-3 border-r font-medium text-gray-800">Debt-to-Equity Ratio <span className="text-gray-500 font-normal">(Total Liabilities / Owner's Equity)</span></td>
                  <td className="py-1.5 px-3 text-right font-mono border-r">0.06</td>
                  <td className="py-1.5 px-3 text-right font-mono border-r text-gray-400">0.00</td>
                  <td className="py-1.5 px-3 text-right font-mono font-semibold">0.19</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Filter Panel matching image_bb63b659.png */}
      <div className="w-full lg:w-72 bg-white rounded-none shadow-2xs border border-gray-300 overflow-hidden flex-shrink-0">
        <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-xs uppercase tracking-wider">
          FILTER
        </div>

        <div className="p-4 space-y-3.5 text-xs text-gray-800">
          <div>
            <label className="block text-gray-600 mb-1 font-semibold">From:</label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                placeholder="From Date"
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:border-[#0084bf] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-semibold">To:</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                placeholder="End Date"
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:border-[#0084bf] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setFromDate('2026-09-26');
                setToDate('2026-10-25');
              }}
              className="flex-1 bg-[#d9534f] hover:bg-[#c9302c] text-white font-bold py-1.5 rounded text-xs uppercase transition shadow-xs text-center"
            >
              RESET
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Balance Sheet recalculated for ${fromDate} to ${toDate}`);
              }}
              className="flex-1 bg-[#605ca8] hover:bg-[#504c98] text-white font-bold py-1.5 rounded text-xs uppercase transition shadow-xs text-center"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. Finance Analysis View (fin_accanalysis.php / fin_analysis.php) matching screenshot image_300dcdc9.png
  const renderFinanceAnalysis = () => (
    <div className="space-y-4">
      <div className="bg-white rounded border border-gray-200 shadow-xs p-6 space-y-5">
        <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
              Financial Performance &amp; Ratio Analysis
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comparative analysis of liquidity, solvency, inventory turnover, and profitability ratios.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-sky-50 text-[#0084bf] border border-sky-200 font-bold rounded">
            Period: FY 2026-2027
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f8fbfd] border border-sky-100 p-4 rounded">
            <span className="text-xs font-semibold text-gray-500 uppercase">Current Ratio</span>
            <div className="text-2xl font-bold font-mono text-[#0084bf] mt-1">7.20 : 1</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              <i className="fa fa-arrow-up mr-1"></i> Highly Liquid (Norm: &gt; 1.5)
            </p>
          </div>
          <div className="bg-[#f8fbfd] border border-sky-100 p-4 rounded">
            <span className="text-xs font-semibold text-gray-500 uppercase">Working Capital</span>
            <div className="text-2xl font-bold font-mono text-gray-900 mt-1">৳ 11.81M</div>
            <p className="text-[11px] text-gray-500 mt-1">Surplus operational buffer</p>
          </div>
          <div className="bg-[#f8fbfd] border border-sky-100 p-4 rounded">
            <span className="text-xs font-semibold text-gray-500 uppercase">Debt-to-Equity</span>
            <div className="text-2xl font-bold font-mono text-purple-900 mt-1">0.19</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Very low financial leverage</p>
          </div>
          <div className="bg-[#f8fbfd] border border-sky-100 p-4 rounded">
            <span className="text-xs font-semibold text-gray-500 uppercase">Gross Profit Margin</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">22.0%</div>
            <p className="text-[11px] text-gray-500 mt-1">Target benchmark: 20-25%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold text-xs uppercase text-gray-700 mb-3 border-b pb-2">
              Working Capital Composition
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Total Liquid Cash &amp; Bank:</span>
                <span className="font-mono font-bold">৳ 10,560,347.00 (76.9%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Inventory Stock Valuation:</span>
                <span className="font-mono font-bold">৳ 1,908,659.72 (13.9%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Accounts Receivable (Debtors):</span>
                <span className="font-mono font-bold">৳ 1,253,625.00 (9.1%)</span>
              </div>
              <div className="flex justify-between py-1 text-rose-700 font-semibold">
                <span>Less Current Payables:</span>
                <span className="font-mono">(৳ 1,906,901.00)</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold text-xs uppercase text-gray-700 mb-3 border-b pb-2">
              Equity &amp; Solvency Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Paid Up Share Capital:</span>
                <span className="font-mono font-bold">৳ 10,000,000.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Accumulated Retained Earnings:</span>
                <span className="font-mono font-bold">৳ 1,804,690.72</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Total Shareholders' Equity:</span>
                <span className="font-mono font-bold text-emerald-700">৳ 11,804,690.72</span>
              </div>
              <div className="flex justify-between py-1 text-gray-700 font-semibold">
                <span>Assets-to-Equity Multiple:</span>
                <span className="font-mono">1.37x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper for Breadcrumb matching real system
  const getSubTitle = () => {
    switch (currentRoute) {
      case 'fin_chartofacc.php':
        return 'Chart of Account';
      case 'fin_proandlos.php':
        return 'Profit And Loss';
      case 'fin_trialbal.php':
        return 'Trial Balance';
      case 'fin_blasheet.php':
      case 'fin_balancesheet.php':
        return 'Balance Sheet';
      case 'fin_accanalysis.php':
      case 'fin_analysis.php':
      case 'fin_financeanalysis.php':
        return 'Finace Analysis';
      default:
        return 'Financials';
    }
  };

  const isFinanceAnalysis =
    currentRoute === 'fin_accanalysis.php' ||
    currentRoute === 'fin_analysis.php' ||
    currentRoute === 'fin_financeanalysis.php';

  const isBalanceSheet =
    currentRoute === 'fin_blasheet.php' ||
    currentRoute === 'fin_balancesheet.php';

  return (
    <div className="space-y-4">
      {/* Top Header / Breadcrumbs matching BGD ERP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-300 gap-2 select-none">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-wide">
            {getSubTitle()}
          </h1>
        </div>

        <div className="text-xs text-gray-500 flex items-center space-x-1.5">
          <span
            onClick={() => setCurrentRoute('home.php', 'Dashboard')}
            className="cursor-pointer hover:text-[#0084bf] flex items-center space-x-1"
          >
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
          </span>
          <span>&gt;</span>
          <span className="text-gray-600 font-medium">Financials</span>
          <span>&gt;</span>
          <span className="text-gray-800 font-bold">{getSubTitle()}</span>
        </div>
      </div>

      {currentRoute === 'fin_chartofacc.php' && renderChartOfAccounts()}
      {currentRoute === 'fin_proandlos.php' && renderProfitAndLoss()}
      {currentRoute === 'fin_trialbal.php' && renderTrialBalance()}
      {isBalanceSheet && renderBalanceSheet()}
      {isFinanceAnalysis && renderFinanceAnalysis()}
      {currentRoute !== 'fin_chartofacc.php' &&
        currentRoute !== 'fin_proandlos.php' &&
        currentRoute !== 'fin_trialbal.php' &&
        !isBalanceSheet &&
        !isFinanceAnalysis &&
        renderChartOfAccounts()}
    </div>
  );
};

