import React, { useState } from 'react';
import { Ticket, Plus, Trash2, Tag, Percent } from 'lucide-react';
import { Select } from '../components/ui/select';

interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minOrderValue: number;
  usageCount: number;
  isActive: boolean;
}

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: 'c1', code: 'AOCIND20', discountType: 'Percentage', discountValue: 20, minOrderValue: 999, usageCount: 142, isActive: true },
    { id: 'c2', code: 'WELCOME100', discountType: 'Fixed', discountValue: 100, minOrderValue: 499, usageCount: 389, isActive: true },
  ]);

  const [code, setCode] = useState('');
  const [value, setValue] = useState(15);
  const [type, setType] = useState<'Percentage' | 'Fixed'>('Percentage');

  const handleAddCoupon = () => {
    if (!code.trim()) return;
    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.toUpperCase(),
      discountType: type,
      discountValue: value,
      minOrderValue: 799,
      usageCount: 0,
      isActive: true
    };
    setCoupons([...coupons, newCoupon]);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-rose-500" />
            <span>Coupons & Discount Promotions</span>
          </h3>
          <p className="text-xs text-slate-500">Create promotional promo codes with percentage or fixed order discounts.</p>
        </div>

        {/* CREATE FORM */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-3 text-xs">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon Code (e.g. SUMMER30)"
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-bold uppercase"
          />

          <div className="w-52">
            <Select
              value={type}
              onValueChange={(val) => setType(val as any)}
              className="rounded-xl font-semibold text-slate-800"
              options={[
                { value: 'Percentage', label: 'Percentage Discount (%)' },
                { value: 'Fixed', label: 'Fixed Amount (₹)' }
              ]}
            />
          </div>

          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            placeholder="Value"
            className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-bold"
          />

          <button
            onClick={handleAddCoupon}
            className="bg-zinc-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>

        {/* COUPONS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="pb-3">Promo Code</th>
                <th className="pb-3">Discount</th>
                <th className="pb-3">Min Order</th>
                <th className="pb-3">Total Uses</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-mono font-extrabold text-slate-900">{c.code}</td>
                  <td className="py-3.5 font-bold text-rose-600">
                    {c.discountType === 'Percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">₹{c.minOrderValue}</td>
                  <td className="py-3.5 font-bold text-slate-800">{c.usageCount} times</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setCoupons(coupons.filter(x => x.id !== c.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
