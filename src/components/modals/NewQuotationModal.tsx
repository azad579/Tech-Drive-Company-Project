import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Calendar,
  Building,
  DollarSign,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Package,
} from 'lucide-react';
import {
  Quotation,
  QuotationItem,
  createQuotation,
} from '../../utils/quotationService';
import { Customer, Product } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface NewQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: Product[];
  onQuotationCreated: (quote: Quotation) => void;
}

export const NewQuotationModal: React.FC<NewQuotationModalProps> = ({
  isOpen,
  onClose,
  customers,
  products,
  onQuotationCreated,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyCompany, setPartyCompany] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyEmail, setPartyEmail] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [attention, setAttention] = useState('');
  const [subject, setSubject] = useState('');
  const [validDays, setValidDays] = useState(15);
  const [vatRate, setVatRate] = useState(5);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryLeadTime, setDeliveryLeadTime] = useState('Within 24 to 48 business hours');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance with PO, 50% on Delivery');
  const [warrantyTerms, setWarrantyTerms] = useState('Official manufacturer warranty with NextGen IT service');
  const [notes, setNotes] = useState('');

  // Items list
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: `item-${Date.now()}-1`,
      name: '',
      sku: '',
      specs: '',
      warranty: '1 Year Warranty',
      qty: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  if (!isOpen) return null;

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setPartyName(found.name);
      setPartyPhone(found.phone || '');
      setPartyEmail(found.email || '');
      setPartyAddress(found.address || '');
      setPartyCompany(found.companyName || '');
      setAttention(`Attn: ${found.name}`);
    }
  };

  const handleAddItem = () => {
    playClickSound();
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        name: '',
        sku: '',
        specs: '',
        warranty: '1 Year Warranty',
        qty: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleSelectProductForItem = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        name: prod.name,
        sku: prod.sku,
        specs: prod.specs || prod.category || '',
        warranty: prod.warranty || '1 Year Official Warranty',
        unitPrice: prod.price,
        total: prod.price * copy[idx].qty,
      };
      return copy;
    });
  };

  const handleUpdateItem = (idx: number, field: keyof QuotationItem, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const updated = { ...copy[idx], [field]: val };
      if (field === 'qty' || field === 'unitPrice') {
        const q = field === 'qty' ? Number(val) : updated.qty;
        const p = field === 'unitPrice' ? Number(val) : updated.unitPrice;
        updated.total = q * p;
      }
      copy[idx] = updated;
      return copy;
    });
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    playClickSound();
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const grossAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxable = Math.max(0, grossAmount - discountAmount);
  const taxAmount = (taxable * vatRate) / 100;
  const grandTotal = taxable + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) {
      alert('Please enter a customer or recipient name');
      return;
    }
    if (items.some((it) => !it.name.trim() || it.qty <= 0)) {
      alert('Please fill all item descriptions and ensure quantity is at least 1');
      return;
    }

    playCashDrawerDing();

    const today = new Date();
    const validDate = new Date();
    validDate.setDate(today.getDate() + validDays);

    const newQuote = createQuotation({
      date: today.toLocaleDateString('en-GB'),
      validUntil: validDate.toLocaleDateString('en-GB'),
      partyName,
      partyCompany: partyCompany.trim() || undefined,
      partyPhone: partyPhone.trim() || undefined,
      partyEmail: partyEmail.trim() || undefined,
      partyAddress: partyAddress.trim() || undefined,
      attention: attention.trim() || undefined,
      subject: subject.trim() || `Quotation for IT Products & Solutions`,
      itemsList: items,
      grossAmount,
      discountAmount,
      vatRate,
      taxAmount,
      grandTotal,
      status: 'Draft',
      deliveryLeadTime,
      paymentTerms,
      warrantyTerms,
      notes: notes.trim() || undefined,
      createdBy: 'Sales Specialist',
    });

    onQuotationCreated(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Official Quotation / Pro-Forma</h2>
              <p className="text-xs text-slate-400">
                Generate price estimate on Company Letterhead with one-click WhatsApp sharing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Customer Selection & Details */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>Recipient Customer &amp; Organization Details</span>
              </h3>
              {customers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Select Existing:</span>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer / Contact Name *</label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={partyCompany}
                  onChange={(e) => setPartyCompany(e.target.value)}
                  placeholder="e.g. Apex Software Ltd."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="text"
                  value={partyPhone}
                  onChange={(e) => setPartyPhone(e.target.value)}
                  placeholder="e.g. +880 1711-456789"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono font-semibold text-emerald-300"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={partyEmail}
                  onChange={(e) => setPartyEmail(e.target.value)}
                  placeholder="procurement@company.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Attention Line</label>
                <input
                  type="text"
                  value={attention}
                  onChange={(e) => setAttention(e.target.value)}
                  placeholder="Attn: Head of Procurement"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Validity (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Quotation Subject / Title</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Supply of Intel Core i7 14th Gen Developer Workstations"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Timeline</label>
                <input
                  type="text"
                  value={deliveryLeadTime}
                  onChange={(e) => setDeliveryLeadTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Line Items &amp; Technical Specifications</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-800/90 border border-slate-700 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Item #{idx + 1}
                    </span>
                    {/* Quick populate from existing products dropdown */}
                    {products.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleSelectProductForItem(idx, e.target.value);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-300"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          -- Quick Select Product Catalog Item --
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatCurrency(p.price)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Item Name *</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        placeholder="e.g. NextGen Core i7 Workstation"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-semibold"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">SKU / Code</label>
                      <input
                        type="text"
                        value={item.sku || ''}
                        onChange={(e) => handleUpdateItem(idx, 'sku', e.target.value)}
                        placeholder="WS-147K"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono text-purple-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Warranty</label>
                      <input
                        type="text"
                        value={item.warranty || ''}
                        onChange={(e) => handleUpdateItem(idx, 'warranty', e.target.value)}
                        placeholder="3 Years Warranty"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-emerald-300"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-bold text-center text-white"
                        required
                      />
                    </div>

                    <div className="sm:col-span-1 flex items-end justify-center pb-1">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/40 transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-8">
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        Technical Specs &amp; Components Detail
                      </label>
                      <input
                        type="text"
                        value={item.specs || ''}
                        onChange={(e) => handleUpdateItem(idx, 'specs', e.target.value)}
                        placeholder="e.g. 14th Gen 20-Core, Corsair 32GB 6000MHz, 1TB NVMe, RTX 4060 8GB"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Unit Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono font-bold text-right text-white"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Total (৳)</label>
                      <div className="p-1.5 bg-slate-950 border border-slate-800 rounded font-mono font-bold text-xs text-right text-blue-400">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Terms Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1">
                Commercial Terms &amp; Conditions
              </h4>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Warranty Guarantee Terms</label>
                <input
                  type="text"
                  value={warrantyTerms}
                  onChange={(e) => setWarrantyTerms(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Public Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Free mouse, keyboard, delivery and on-site setup included."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1">
                Quotation Financial Summary
              </h4>

              <div className="flex justify-between items-center text-slate-300">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-bold">{formatCurrency(grossAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Special Discount (৳):</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-28 bg-slate-800 border border-slate-700 rounded p-1 text-xs text-right font-mono font-bold text-rose-400"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>VAT / Tax Rate (%):</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-20 bg-slate-800 border border-slate-700 rounded p-1 text-xs text-right font-mono font-bold text-blue-300"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Tax Amount:</span>
                <span className="font-mono text-slate-300">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-bold text-white">
                <span>Net Grand Total:</span>
                <span className="font-mono text-base text-blue-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Generate Quotation on Letterhead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
