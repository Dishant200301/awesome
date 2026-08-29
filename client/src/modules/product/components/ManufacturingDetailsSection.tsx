import React from "react";
import { ManufacturingInfo } from "../types/product";

interface ManufacturingDetailsSectionProps {
  info: ManufacturingInfo;
}

export const ManufacturingDetailsSection: React.FC<ManufacturingDetailsSectionProps> = ({
  info,
}) => {
  return (
    <section className="w-full py-6 sm:py-8 px-4 md:px-8 max-w-[1400px] mx-auto space-y-4 sm:space-y-6 font-sans">
      {/* Section Title matching Home Page */}
      <div className="space-y-2">
        <h2 className="text-2xl md:text-4xl font-800 text-zinc-900 tracking-tight">
          Manufacturing Details
        </h2>
        <div className="w-16 h-1 bg-[#520618] rounded-full" />
      </div>

      {/* Main Card matching Home Page design */}
      <div className="rounded-2xl sm:rounded-[20px] border border-zinc-200/80 bg-white p-4 sm:p-6 md:p-8 shadow-xs space-y-4 sm:space-y-6 font-sans">
        {/* Top Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-100 pb-4 sm:pb-6">
          <div className="space-y-1 max-w-2xl text-xs md:text-sm text-zinc-600">
            <p className="font-bold text-zinc-900 text-sm sm:text-base">{info.manufacturer}</p>
            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">{info.address}</p>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-bold text-zinc-800 tracking-wider bg-[#f5f2ee] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-zinc-200/60 w-full sm:w-fit shrink-0">
            <span>Country of Origin:</span>
            <span className="flex items-center gap-1 font-extrabold text-zinc-900 bg-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-zinc-200 shadow-2xs">
              🇮🇳 {info.countryOfOrigin}
            </span>
          </div>
        </div>

        {/* Detailed Grid: 1-col on Mobile, 2-col on Tablet (sm:), 3-col on Laptop (lg:) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 md:gap-6 text-xs md:text-sm">
          <div className="space-y-1.5 bg-[#f5f2ee] p-4 sm:p-5 rounded-xl sm:rounded-[16px] border border-zinc-200/60">
            <span className="text-zinc-400 font-bold tracking-wider text-[10px]">
              Manufacturer
            </span>
            <p className="font-bold text-zinc-900">{info.manufacturer}</p>
            <p className="text-zinc-600 text-xs">{info.address}</p>
          </div>

          <div className="space-y-1.5 bg-[#f5f2ee] p-4 sm:p-5 rounded-xl sm:rounded-[16px] border border-zinc-200/60">
            <span className="text-zinc-400 font-bold tracking-wider text-[10px]">
              Net Quantity & Price
            </span>
            <p className="font-bold text-zinc-900">{info.netQuantity}</p>
            <p className="text-zinc-600 text-xs font-semibold">{info.mrp}</p>
          </div>

          <div className="space-y-1.5 bg-[#f5f2ee] p-4 sm:p-5 rounded-xl sm:rounded-[16px] border border-zinc-200/60">
            <span className="text-zinc-400 font-bold tracking-wider text-[10px]">
              Material Composition
            </span>
            <p className="font-bold text-zinc-900">{info.material}</p>
            <p className="text-zinc-600 text-xs">High Stretch elastane micro-knit</p>
          </div>

          <div className="space-y-1.5 bg-[#f5f2ee] p-4 sm:p-5 rounded-xl sm:rounded-[16px] border border-zinc-200/60">
            <span className="text-zinc-400 font-bold tracking-wider text-[10px]">
              Packed By
            </span>
            <p className="font-bold text-zinc-900">{info.packedBy}</p>
          </div>

          <div className="space-y-1.5 bg-[#f5f2ee] p-4 sm:p-5 rounded-xl sm:rounded-[16px] border border-zinc-200/60">
            <span className="text-zinc-400 font-bold tracking-wider text-[10px]">
              Imported By
            </span>
            <p className="font-bold text-zinc-900">{info.importedBy}</p>
          </div>

          <div className="space-y-1.5 bg-[#f5f2ee] p-4 sm:p-5 rounded-xl sm:rounded-[16px] border border-zinc-200/60">
            <span className="text-zinc-400 font-bold tracking-wider text-[10px]">
              Customer Care Contact
            </span>
            <p className="font-bold text-zinc-900">{info.customerCare.email}</p>
            <p className="text-zinc-600 text-xs">{info.customerCare.phone}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManufacturingDetailsSection;
