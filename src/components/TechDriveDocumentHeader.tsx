import React from 'react';

interface TechDriveDocumentHeaderProps {
  refNo?: string;
  date?: string;
  docTitle?: string;
}

export const TechDriveDocumentHeader: React.FC<TechDriveDocumentHeaderProps> = ({
  refNo = 'REP251026DPES',
  date = '25 Oct 2026',
  docTitle
}) => {
  return (
    <div className="w-full space-y-3 pb-2">
      {/* 3-Column Header matching image.png exactly */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-3">
        {/* Left: Tech Drive Official Logo Monogram */}
        <div className="w-1/4 flex flex-col items-start pr-4">
          <div className="flex items-center space-x-2">
            <div className="relative w-16 h-14 flex items-center justify-center">
              <svg viewBox="0 0 100 85" className="w-full h-full drop-shadow-xs">
                {/* Gold outer circle arc */}
                <circle
                  cx="48"
                  cy="42"
                  r="34"
                  fill="none"
                  stroke="#f39c12"
                  strokeWidth="6"
                  strokeDasharray="210"
                  strokeDashoffset="25"
                />
                {/* Blue Laptop frame */}
                <rect
                  x="26"
                  y="26"
                  width="44"
                  height="26"
                  rx="2"
                  fill="#ffffff"
                  stroke="#0084bf"
                  strokeWidth="3.5"
                />
                {/* Laptop base */}
                <path
                  d="M 18 54 L 78 54"
                  stroke="#0084bf"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Circuit tech traces inside laptop screen */}
                <path
                  d="M 32 38 L 40 38 L 46 32 M 35 44 L 45 44"
                  stroke="#0084bf"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Gold 'T' */}
                <path
                  d="M 46 22 L 72 22 M 59 22 L 59 52"
                  stroke="#f39c12"
                  strokeWidth="6.5"
                  strokeLinecap="square"
                />
                {/* Blue 'D' */}
                <path
                  d="M 64 24 L 74 24 C 84 24 84 52 74 52 L 64 52 Z"
                  fill="#0084bf"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight leading-none text-[#0084bf]">
                TECH <span className="text-[#f39c12]">DRIVE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Company Contact & Address Info */}
        <div className="flex-1 px-5 border-l border-r border-gray-300 text-left text-[11px] leading-tight text-gray-800">
          <div className="text-sm font-black text-gray-900 tracking-wide mb-0.5">TECH DRIVE</div>
          <div className="text-gray-700">Harun Super Market, Road No : 03, Plot : 07, Shop No -109/110, Ground Floor</div>
          <div className="text-gray-700">Mirpur-10, Dhaka -1216</div>
          <div className="mt-1 font-medium text-gray-900">
            <span className="font-bold">Phone:</span> 01920424323
          </div>
          <div className="font-medium text-gray-900">
            <span className="font-bold">Mobile:</span> 01701561395
          </div>
          <div className="font-medium text-gray-900">
            <span className="font-bold">Email:</span> info.techdrivebd@gmail.com
          </div>
          <div className="font-medium text-gray-900">
            <span className="font-bold">Web:</span> http://www.techdrivebd.com
          </div>
        </div>

        {/* Right: Barcode + Ref No + Date */}
        <div className="w-1/4 pl-5 text-right flex flex-col items-end justify-center">
          {/* Barcode Graphic */}
          <div className="w-36 h-8 flex items-end justify-between px-1 mb-1">
            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1].map((w, i) => (
              <span
                key={i}
                className="bg-black inline-block"
                style={{ width: `${w}px`, height: '100%' }}
              ></span>
            ))}
          </div>
          <div className="text-[11px] font-bold text-gray-900">
            Ref Nº: <span className="font-mono font-bold">{refNo}</span>
          </div>
          <div className="text-[11px] text-gray-800 mt-0.5">
            Date: <span className="font-semibold">{date}</span>
          </div>
        </div>
      </div>

      {/* Optional Document Title (e.g. DAILY PURCHASE REPORT) */}
      {docTitle && (
        <div className="text-center pt-1">
          <h2 className="text-base font-black text-[#0084bf] uppercase tracking-wider">
            {docTitle}
          </h2>
        </div>
      )}
    </div>
  );
};
