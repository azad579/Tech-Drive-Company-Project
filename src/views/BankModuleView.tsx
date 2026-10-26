import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { HistoryWidget } from '../components/HistoryWidget';
import { BankMaster, BankAccount, MobileAccount, BankTransaction } from '../types';

export const BankModuleView: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    banks,
    addBank,
    deleteBank,
    bankAccounts,
    addBankAccount,
    deleteBankAccount,
    mobileAccounts,
    addMobileAccount,
    deleteMobileAccount,
    bankTransactions,
    addBankTransaction,
    cheques,
    updateChequeStatus
  } = useApp();

  // Create Bank Form State (ban_bankcreate.php)
  const [bankName, setBankName] = useState('');
  const [bankSortName, setBankSortName] = useState('');

  // Create Account Form State (ban_accountcreate.php)
  const [accForm, setAccForm] = useState({
    accountNo: '',
    accountTitle: '',
    bankName: banks[0]?.name || 'DUTCH BANGLA BANK',
    branchName: '',
    branchCode: '',
    branchLocation: '',
    openingBalance: 0
  });

  // Mobile Account Drawer State (ban_mobileaccount.php)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileForm, setMobileForm] = useState({
    name: '',
    mobile: '',
    balance: 0,
    provider: 'bKash'
  });

  // Add Transaction Form State (ban_bnkcreate.php)
  const [tranForm, setTranForm] = useState({
    traNo: `TR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
    date: new Date().toISOString().split('T')[0],
    depositFrom: 'Cash Collection (Showroom)',
    depositTo: bankAccounts[0]?.bankName ? `${bankAccounts[0].bankName} - ${bankAccounts[0].accountNo}` : 'DUTCH BANGLA BANK - 0987654321',
    chequeNo: '',
    chequeDate: new Date().toISOString().split('T')[0],
    ref: '',
    amount: '',
    note: ''
  });

  // Cheque tab state for ban_checkman.php
  const [chequeTab, setChequeTab] = useState<'received' | 'given' | 'deposit' | 'payment' | 'bounced'>('received');

  // Submit Bank
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !bankSortName.trim()) return;
    addBank({
      name: bankName.trim().toUpperCase(),
      sortName: bankSortName.trim().toUpperCase(),
      status: 'Active'
    });
    setBankName('');
    setBankSortName('');
    setCurrentRoute('ban_banklist.php', 'Bank List');
  };

  // Submit Account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.accountNo.trim() || !accForm.bankName) return;
    addBankAccount({
      bankName: accForm.bankName,
      accountNo: accForm.accountNo.trim(),
      accountTitle: accForm.accountTitle.trim(),
      branchName: accForm.branchName.trim(),
      branchCode: accForm.branchCode.trim(),
      branchLocation: accForm.branchLocation.trim(),
      accountType: 'Current',
      debit: accForm.openingBalance || 0,
      credit: 0,
      balance: accForm.openingBalance || 0
    });
    setCurrentRoute('ban_accountlist.php', 'Account Record');
  };

  // Submit Mobile Account
  const handleSaveMobileAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileForm.name.trim() || !mobileForm.mobile.trim()) return;
    addMobileAccount({
      name: mobileForm.name.trim(),
      mobile: mobileForm.mobile.trim(),
      balance: Number(mobileForm.balance) || 0,
      provider: mobileForm.provider,
      status: 'Active'
    });
    setMobileForm({ name: '', mobile: '', balance: 0, provider: 'bKash' });
    setIsMobileDrawerOpen(false);
  };

  // Submit Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(tranForm.amount);
    if (!amountVal || isNaN(amountVal)) return;

    addBankTransaction({
      traNo: tranForm.traNo,
      date: tranForm.date,
      depositFrom: tranForm.depositFrom,
      depositTo: tranForm.depositTo,
      chequeNo: tranForm.chequeNo || '-',
      chequeDate: tranForm.chequeDate || '-',
      ref: tranForm.ref || '-',
      amount: amountVal,
      note: tranForm.note
    });

    setCurrentRoute('ban_bnktranlist.php', 'Bank Transaction Record');
  };

  // Determine which sub-view to render
  const renderContent = () => {
    // 1. BANK LIST (ban_banklist.php) matching screenshot image_69ea1ed6.png
    if (currentRoute === 'ban_banklist.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide">Bank List</h2>
              <button
                onClick={() => setCurrentRoute('ban_bankcreate.php', 'Add Bank')}
                className="bg-[#605ca8] hover:bg-[#504c98] text-white px-3 py-1 rounded text-xs font-bold transition flex items-center space-x-1"
              >
                <i className="fa fa-plus"></i>
                <span>ADD BANK</span>
              </button>
            </div>

            <div className="p-3 overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f4f4f4] text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center border-r border-gray-200">SN</th>
                    <th className="py-2 px-3 border-r border-gray-200">Name</th>
                    <th className="py-2 px-3 border-r border-gray-200">Sort Name</th>
                    <th className="py-2 px-3 w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {banks.map((b, idx) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800 border-r border-gray-100">{b.name}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-600 border-r border-gray-100">{b.sortName}</td>
                      <td className="py-2.5 px-3 text-center space-x-2">
                        <button
                          onClick={() => {
                            setBankName(b.name);
                            setBankSortName(b.sortName);
                            setCurrentRoute('ban_bankcreate.php', 'Add Bank');
                          }}
                          className="text-[#0084bf] hover:text-sky-800"
                          title="Edit"
                        >
                          <i className="fa fa-pencil"></i>
                        </button>
                        <button
                          onClick={() => deleteBank(b.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right History Widget */}
          <HistoryWidget />
        </div>
      );
    }

    // 2. ADD BANK (ban_bankcreate.php) matching screenshot image_7558b064.png
    if (currentRoute === 'ban_bankcreate.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide">Add Bank</h2>
              <button
                onClick={() => setCurrentRoute('ban_banklist.php', 'Bank List')}
                className="text-white hover:text-sky-200 text-xs font-semibold"
              >
                &larr; Back to List
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="p-6 space-y-4 max-w-xl text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. BRAC BANK"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Sort Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankSortName}
                  onChange={e => setBankSortName(e.target.value)}
                  placeholder="e.g. BRAC"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  className="bg-[#0084bf] hover:bg-[#0073a8] text-white px-6 py-2 rounded text-xs font-bold transition shadow-xs"
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentRoute('ban_banklist.php', 'Bank List')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded text-xs font-semibold transition"
                >
                  CLOSE
                </button>
              </div>
            </form>
          </div>

          {/* Right History Widget */}
          <HistoryWidget />
        </div>
      );
    }

    // 3. ACCOUNT RECORD (ban_accountlist.php) matching screenshot image_a271c592.png
    if (currentRoute === 'ban_accountlist.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide">Account Record</h2>
              <button
                onClick={() => setCurrentRoute('ban_accountcreate.php', 'Add Account')}
                className="bg-[#605ca8] hover:bg-[#504c98] text-white px-3 py-1 rounded text-xs font-bold transition flex items-center space-x-1"
              >
                <i className="fa fa-plus"></i>
                <span>ADD ACCOUNT</span>
              </button>
            </div>

            <div className="p-3 overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f4f4f4] text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center border-r border-gray-200">SN</th>
                    <th className="py-2 px-3 border-r border-gray-200">Bank</th>
                    <th className="py-2 px-3 border-r border-gray-200">A/C No</th>
                    <th className="py-2 px-3 border-r border-gray-200">Account Title</th>
                    <th className="py-2 px-3 border-r border-gray-200">Branch</th>
                    <th className="py-2 px-3 border-r border-gray-200">Location</th>
                    <th className="py-2 px-3 text-right border-r border-gray-200">Debit (৳)</th>
                    <th className="py-2 px-3 text-right border-r border-gray-200">Credit (৳)</th>
                    <th className="py-2 px-3 text-right border-r border-gray-200 font-bold">Balance (৳)</th>
                    <th className="py-2 px-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bankAccounts.map((acc, idx) => (
                    <tr key={acc.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#00305d] border-r border-gray-100">{acc.bankName}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-800 font-bold border-r border-gray-100">{acc.accountNo}</td>
                      <td className="py-2.5 px-3 text-gray-700 border-r border-gray-100">{acc.accountTitle || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-600 border-r border-gray-100">{acc.branchName || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-500 border-r border-gray-100">{acc.branchLocation || '-'}</td>
                      <td className="py-2.5 px-3 text-right text-gray-700 border-r border-gray-100">{formatBDT(acc.debit || 0)}</td>
                      <td className="py-2.5 px-3 text-right text-gray-700 border-r border-gray-100">{formatBDT(acc.credit || 0)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 border-r border-gray-100">{formatBDT(acc.balance)}</td>
                      <td className="py-2.5 px-3 text-center space-x-2">
                        <button
                          onClick={() => deleteBankAccount(acc.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right History Widget */}
          <HistoryWidget />
        </div>
      );
    }

    // 4. ADD ACCOUNT (ban_accountcreate.php) matching screenshot image_060ca67a.png
    if (currentRoute === 'ban_accountcreate.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide">Add Bank Account</h2>
              <button
                onClick={() => setCurrentRoute('ban_accountlist.php', 'Account Record')}
                className="text-white hover:text-sky-200 text-xs font-semibold"
              >
                &larr; Back to List
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 max-w-xl text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Account No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accForm.accountNo}
                  onChange={e => setAccForm(prev => ({ ...prev, accountNo: e.target.value }))}
                  placeholder="e.g. 0987654321"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Account Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accForm.accountTitle}
                  onChange={e => setAccForm(prev => ({ ...prev, accountTitle: e.target.value }))}
                  placeholder="e.g. Tech Drive Corporate"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Select Bank <span className="text-red-500">*</span>
                </label>
                <select
                  value={accForm.bankName}
                  onChange={e => setAccForm(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white focus:outline-none"
                >
                  {banks.map(b => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.sortName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={accForm.branchName}
                    onChange={e => setAccForm(prev => ({ ...prev, branchName: e.target.value }))}
                    placeholder="e.g. Mirpur 10"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={accForm.branchCode}
                    onChange={e => setAccForm(prev => ({ ...prev, branchCode: e.target.value }))}
                    placeholder="e.g. 104"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Branch Location</label>
                <input
                  type="text"
                  value={accForm.branchLocation}
                  onChange={e => setAccForm(prev => ({ ...prev, branchLocation: e.target.value }))}
                  placeholder="e.g. Dhaka-1216"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Opening Balance (৳)</label>
                <input
                  type="number"
                  value={accForm.openingBalance || ''}
                  onChange={e => setAccForm(prev => ({ ...prev, openingBalance: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  className="bg-[#0084bf] hover:bg-[#0073a8] text-white px-6 py-2 rounded text-xs font-bold transition shadow-xs"
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentRoute('ban_accountlist.php', 'Account Record')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded text-xs font-semibold transition"
                >
                  CLOSE
                </button>
              </div>
            </form>
          </div>

          {/* Right History Widget */}
          <HistoryWidget />
        </div>
      );
    }

    // 5. MOBILE ACCOUNT (ban_mobileaccount.php) matching screenshot image_9f9c5f09.png & image_b05c2487.png
    if (currentRoute === 'ban_mobileaccount.php') {
      return (
        <div className="relative">
          <div className="bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide">Mobile Account</h2>
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="bg-[#605ca8] hover:bg-[#504c98] text-white px-3 py-1 rounded text-xs font-bold transition flex items-center space-x-1"
              >
                <i className="fa fa-plus"></i>
                <span>ADD MOBILE ACCOUNT</span>
              </button>
            </div>

            <div className="p-3 overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f4f4f4] text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center border-r border-gray-200">SN</th>
                    <th className="py-2 px-3 border-r border-gray-200">Name</th>
                    <th className="py-2 px-3 border-r border-gray-200">Mobile</th>
                    <th className="py-2 px-3 text-right border-r border-gray-200">Balance (৳)</th>
                    <th className="py-2 px-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mobileAccounts.map((mob, idx) => (
                    <tr key={mob.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#00305d] border-r border-gray-100">{mob.name}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800 font-bold border-r border-gray-100">{mob.mobile}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 border-r border-gray-100">{formatBDT(mob.balance)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => deleteMobileAccount(mob.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slide-out Drawer for Add Mobile Account matching screenshot image_b05c2487.png */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
              <div className="w-80 md:w-96 bg-white h-full shadow-2xl flex flex-col justify-between text-xs animate-slide-left">
                <div className="bg-[#00305d] text-white px-4 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-sm tracking-wide">Add Mobile Account</h3>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="text-white hover:text-gray-300 text-lg font-bold"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSaveMobileAccount} className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={mobileForm.name}
                      onChange={e => setMobileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. bKash Merchant"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-[#0084bf] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={mobileForm.mobile}
                      onChange={e => setMobileForm(prev => ({ ...prev, mobile: e.target.value }))}
                      placeholder="e.g. 01616170071"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-[#0084bf] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Opening Balance (৳)</label>
                    <input
                      type="number"
                      value={mobileForm.balance || ''}
                      onChange={e => setMobileForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Provider</label>
                    <select
                      value={mobileForm.provider}
                      onChange={e => setMobileForm(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none text-xs"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Upay">Upay</option>
                    </select>
                  </div>
                </form>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="px-4 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMobileAccount}
                    className="px-5 py-1.5 rounded bg-[#0084bf] hover:bg-[#0073a8] text-white font-bold"
                  >
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 6. BANK TRANSACTION RECORD (ban_bnktranlist.php) matching screenshot image_3032d4bb.png
    if (currentRoute === 'ban_bnktranlist.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide">Bank Transaction Record</h2>
              <button
                onClick={() => setCurrentRoute('ban_bnkcreate.php', 'Add Transaction')}
                className="bg-[#605ca8] hover:bg-[#504c98] text-white px-3 py-1 rounded text-xs font-bold transition flex items-center space-x-1"
              >
                <i className="fa fa-plus"></i>
                <span>ADD TRANSACTION</span>
              </button>
            </div>

            <div className="p-3 overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f4f4f4] text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center border-r border-gray-200">SN</th>
                    <th className="py-2 px-3 border-r border-gray-200">Date</th>
                    <th className="py-2 px-3 border-r border-gray-200">Tra. No</th>
                    <th className="py-2 px-3 border-r border-gray-200">Deposit From</th>
                    <th className="py-2 px-3 border-r border-gray-200">Deposit To</th>
                    <th className="py-2 px-3 border-r border-gray-200 text-right">Amount (৳)</th>
                    <th className="py-2 px-3 border-r border-gray-200">Note</th>
                    <th className="py-2 px-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bankTransactions.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-gray-600 border-r border-gray-100">{t.date}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800 border-r border-gray-100">{t.traNo}</td>
                      <td className="py-2.5 px-3 text-gray-700 border-r border-gray-100">{t.depositFrom}</td>
                      <td className="py-2.5 px-3 font-medium text-[#00305d] border-r border-gray-100">{t.depositTo}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900 border-r border-gray-100">{formatBDT(t.amount)}</td>
                      <td className="py-2.5 px-3 text-gray-500 text-[11px] border-r border-gray-100">{t.note || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button className="text-[#0084bf] hover:text-sky-800" title="View details">
                          <i className="fa fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right History Widget */}
          <HistoryWidget />
        </div>
      );
    }

    // 7. ADD TRANSACTION (ban_bnkcreate.php) matching screenshot image_9f1fa634.png
    if (currentRoute === 'ban_bnkcreate.php') {
      return (
        <div className="bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
          <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
            <h2 className="font-bold text-sm tracking-wide">Transaction Record</h2>
            <button
              onClick={() => setCurrentRoute('ban_bnktranlist.php', 'Bank Transaction Record')}
              className="text-white hover:text-sky-200 text-xs font-semibold"
            >
              &larr; Back to List
            </button>
          </div>

          <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tra. No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  readOnly
                  value={tranForm.traNo}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 bg-gray-100 text-gray-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tranForm.date}
                  onChange={e => setTranForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Deposit From <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tranForm.depositFrom}
                  onChange={e => setTranForm(prev => ({ ...prev, depositFrom: e.target.value }))}
                  placeholder="e.g. Cash Collection (Showroom)"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cheque No</label>
                <input
                  type="text"
                  value={tranForm.chequeNo}
                  onChange={e => setTranForm(prev => ({ ...prev, chequeNo: e.target.value }))}
                  placeholder="e.g. CQ-98124"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cheque Date</label>
                <input
                  type="date"
                  value={tranForm.chequeDate}
                  onChange={e => setTranForm(prev => ({ ...prev, chequeDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Deposit To <span className="text-red-500">*</span>
                </label>
                <select
                  value={tranForm.depositTo}
                  onChange={e => setTranForm(prev => ({ ...prev, depositTo: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none"
                >
                  {bankAccounts.map(b => (
                    <option key={b.id} value={`${b.bankName} - ${b.accountNo}`}>
                      {b.bankName} ({b.accountNo})
                    </option>
                  ))}
                  {mobileAccounts.map(m => (
                    <option key={m.id} value={`${m.name} - ${m.mobile}`}>
                      {m.name} ({m.mobile})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ref</label>
                <input
                  type="text"
                  value={tranForm.ref}
                  onChange={e => setTranForm(prev => ({ ...prev, ref: e.target.value }))}
                  placeholder="e.g. INV-2026-089"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Amount (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={tranForm.amount}
                  onChange={e => setTranForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-[#0084bf] focus:outline-none font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Note / Description</label>
              <textarea
                rows={3}
                value={tranForm.note}
                onChange={e => setTranForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Enter transaction details..."
                className="w-full border border-gray-300 rounded p-2 focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="bg-[#0084bf] hover:bg-[#0073a8] text-white px-6 py-2 rounded text-xs font-bold transition shadow-xs"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() =>
                  setTranForm(prev => ({
                    ...prev,
                    depositFrom: 'Cash Collection (Showroom)',
                    chequeNo: '',
                    amount: '',
                    note: ''
                  }))
                }
                className="bg-[#f39c12] hover:bg-amber-600 text-white px-6 py-2 rounded text-xs font-bold transition"
              >
                RESET
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoute('ban_bnktranlist.php', 'Bank Transaction Record')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded text-xs font-semibold transition"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>
      );
    }

    // 8. CHEQUE MANAGEMENT (ban_checkman.php) matching screenshot image_7f6e9c07.png, image_8b91d736.png, image_47a09a29.png
    return (
      <div className="space-y-4">
        {/* Navigation Tabs for 5 sub-sections */}
        <div className="bg-white p-2 rounded-sm shadow-xs border border-gray-200 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setChequeTab('received')}
            className={`px-3 py-1.5 rounded transition ${
              chequeTab === 'received' ? 'bg-[#0084bf] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cheque Received List ({cheques.filter(c => c.type === 'Receive').length})
          </button>
          <button
            onClick={() => setChequeTab('given')}
            className={`px-3 py-1.5 rounded transition ${
              chequeTab === 'given' ? 'bg-[#0084bf] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cheque Given List ({cheques.filter(c => c.type === 'Given').length})
          </button>
          <button
            onClick={() => setChequeTab('deposit')}
            className={`px-3 py-1.5 rounded transition ${
              chequeTab === 'deposit' ? 'bg-[#0084bf] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cheque Deposit List ({cheques.filter(c => c.status === 'Cleared' && c.type === 'Receive').length})
          </button>
          <button
            onClick={() => setChequeTab('payment')}
            className={`px-3 py-1.5 rounded transition ${
              chequeTab === 'payment' ? 'bg-[#0084bf] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cheque Payment List ({cheques.filter(c => c.status === 'Cleared' && c.type === 'Given').length})
          </button>
          <button
            onClick={() => setChequeTab('bounced')}
            className={`px-3 py-1.5 rounded transition ${
              chequeTab === 'bounced' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cheque Bounce / Return ({cheques.filter(c => c.status === 'Bounced').length})
          </button>
        </div>

        {/* Selected Cheque Table */}
        <div className="bg-white rounded-sm shadow-xs border border-gray-200 overflow-hidden">
          <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
            <h2 className="font-bold text-sm tracking-wide capitalize">
              {chequeTab === 'received' && 'Cheque Received List'}
              {chequeTab === 'given' && 'Cheque Given List'}
              {chequeTab === 'deposit' && 'Cheque Deposit List'}
              {chequeTab === 'payment' && 'Cheque Payment List'}
              {chequeTab === 'bounced' && 'Cheque Bounce / Return List'}
            </h2>
          </div>

          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200">
              <thead className="bg-[#f4f4f4] text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3 w-10 text-center border-r border-gray-200">SN</th>
                  <th className="py-2 px-3 border-r border-gray-200">Date</th>
                  <th className="py-2 px-3 border-r border-gray-200">Party / Customer</th>
                  <th className="py-2 px-3 border-r border-gray-200">Cheque No</th>
                  <th className="py-2 px-3 border-r border-gray-200">Bank Name</th>
                  <th className="py-2 px-3 text-right border-r border-gray-200">Amount (৳)</th>
                  <th className="py-2 px-3 text-center border-r border-gray-200">Status</th>
                  <th className="py-2 px-3 w-32 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cheques
                  .filter(c => {
                    if (chequeTab === 'received') return c.type === 'Receive';
                    if (chequeTab === 'given') return c.type === 'Given';
                    if (chequeTab === 'deposit') return c.status === 'Cleared' && c.type === 'Receive';
                    if (chequeTab === 'payment') return c.status === 'Cleared' && c.type === 'Given';
                    if (chequeTab === 'bounced') return c.status === 'Bounced';
                    return true;
                  })
                  .map((chk, idx) => (
                    <tr key={chk.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-gray-600 border-r border-gray-100">{chk.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800 border-r border-gray-100">{chk.partyName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800 border-r border-gray-100">{chk.chequeNo}</td>
                      <td className="py-2.5 px-3 text-gray-700 border-r border-gray-100">{chk.bankName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900 border-r border-gray-100">{formatBDT(chk.amount)}</td>
                      <td className="py-2.5 px-3 text-center border-r border-gray-100">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.status === 'Cleared'
                              ? 'bg-emerald-100 text-emerald-800'
                              : chk.status === 'Bounced'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {chk.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center space-x-1">
                        {chk.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => updateChequeStatus(chk.id, 'Cleared')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded font-semibold transition"
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => updateChequeStatus(chk.id, 'Bounced')}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] px-2 py-0.5 rounded font-semibold transition"
                            >
                              Bounce
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => updateChequeStatus(chk.id, 'Pending')}
                            className="text-gray-500 hover:text-gray-700 underline text-[10px]"
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Sub-header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <span>
              {currentRoute === 'ban_banklist.php' && 'Bank List'}
              {currentRoute === 'ban_bankcreate.php' && 'Add Bank'}
              {currentRoute === 'ban_accountlist.php' && 'Account Record'}
              {currentRoute === 'ban_accountcreate.php' && 'Add Bank Account'}
              {currentRoute === 'ban_mobileaccount.php' && 'Mobile Account'}
              {currentRoute === 'ban_bnktranlist.php' && 'Bank Transaction Record'}
              {currentRoute === 'ban_bnkcreate.php' && 'Add Transaction'}
              {currentRoute === 'ban_checkman.php' && 'Cheque Management'}
            </span>
            <span className="text-xs font-normal text-gray-500">/ Bank</span>
          </h1>
        </div>

        {/* Quick Navigation Pills */}
        <div className="flex flex-wrap gap-1 text-xs">
          <button
            onClick={() => setCurrentRoute('ban_banklist.php', 'Bank List')}
            className={`px-2.5 py-1 rounded font-medium ${
              currentRoute.startsWith('ban_bank') ? 'bg-[#00305d] text-white' : 'bg-white border text-gray-700'
            }`}
          >
            Banks
          </button>
          <button
            onClick={() => setCurrentRoute('ban_accountlist.php', 'Account Record')}
            className={`px-2.5 py-1 rounded font-medium ${
              currentRoute.startsWith('ban_account') ? 'bg-[#00305d] text-white' : 'bg-white border text-gray-700'
            }`}
          >
            Accounts
          </button>
          <button
            onClick={() => setCurrentRoute('ban_mobileaccount.php', 'Mobile Account')}
            className={`px-2.5 py-1 rounded font-medium ${
              currentRoute === 'ban_mobileaccount.php' ? 'bg-[#00305d] text-white' : 'bg-white border text-gray-700'
            }`}
          >
            Mobile Wallets
          </button>
          <button
            onClick={() => setCurrentRoute('ban_bnktranlist.php', 'Bank Transaction Record')}
            className={`px-2.5 py-1 rounded font-medium ${
              currentRoute.startsWith('ban_bnk') ? 'bg-[#00305d] text-white' : 'bg-white border text-gray-700'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setCurrentRoute('ban_checkman.php', 'Cheque Management')}
            className={`px-2.5 py-1 rounded font-medium ${
              currentRoute === 'ban_checkman.php' ? 'bg-[#00305d] text-white' : 'bg-white border text-gray-700'
            }`}
          >
            Cheques
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};
