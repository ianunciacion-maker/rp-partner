/**
 * iOS-style status bar for phone mockups.
 * Shows time on left, Dynamic Island space in center, and system icons on right.
 */
export function MockupStatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-1 bg-gray-50">
      {/* Time */}
      <span className="text-[9px] font-semibold text-gray-900 w-8">9:41</span>

      {/* Dynamic Island */}
      <div className="w-20 h-5 bg-black rounded-full" />

      {/* System Icons */}
      <div className="flex items-center gap-0.5 w-8 justify-end">
        {/* Signal bars */}
        <div className="flex items-end gap-[1px]">
          <div className="w-[2px] h-[4px] bg-gray-900 rounded-sm" />
          <div className="w-[2px] h-[6px] bg-gray-900 rounded-sm" />
          <div className="w-[2px] h-[8px] bg-gray-900 rounded-sm" />
          <div className="w-[2px] h-[10px] bg-gray-900 rounded-sm" />
        </div>
        {/* Wifi */}
        <svg
          className="w-3 h-3 text-gray-900"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3c2.7-2.7 7.1-2.7 9.8 0l1.4-1.4c-3.5-3.5-9.1-3.5-12.6 0l1.4 1.4zm-2.8-2.8c4.3-4.3 11.3-4.3 15.6 0l1.4-1.4c-5.1-5.1-13.3-5.1-18.4 0l1.4 1.4z" />
        </svg>
        {/* Battery */}
        <div className="flex items-center">
          <div className="w-4 h-2 border border-gray-900 rounded-sm relative">
            <div className="absolute inset-[1px] bg-gray-900 rounded-[1px]" />
          </div>
          <div className="w-[2px] h-1 bg-gray-900 rounded-r-sm" />
        </div>
      </div>
    </div>
  );
}
