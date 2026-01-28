import { Search } from "lucide-react";
import { MockupStatusBar } from "./MockupStatusBar";
import { MockupBottomNav } from "./MockupBottomNav";

const reservations = [
  {
    initials: "JD",
    name: "Juan Dela Cruz",
    property: "Casa Verde",
    dates: "Jan 9-11",
    nights: 3,
    amount: "₱10,500",
    status: "Confirmed",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    initials: "MS",
    name: "Maria Santos",
    property: "Sunrise Condo",
    dates: "Jan 22-24",
    nights: 3,
    amount: "₱8,400",
    status: "Pending",
    statusColor: "bg-amber-100 text-amber-700",
  },
  {
    initials: "AR",
    name: "Ana Reyes",
    property: "Casa Verde",
    dates: "Feb 1-3",
    nights: 3,
    amount: "₱10,500",
    status: "Confirmed",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    initials: "PG",
    name: "Pedro Garcia",
    property: "Beach House",
    dates: "Feb 5-8",
    nights: 4,
    amount: "₱16,800",
    status: "Confirmed",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    initials: "LT",
    name: "Lisa Torres",
    property: "Sunrise Condo",
    dates: "Feb 10-12",
    nights: 2,
    amount: "₱5,600",
    status: "Confirmed",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    initials: "RC",
    name: "Roberto Cruz",
    property: "Beach House",
    dates: "Feb 14-17",
    nights: 3,
    amount: "₱12,600",
    status: "Pending",
    statusColor: "bg-amber-100 text-amber-700",
  },
];

/**
 * Guest/Reservations screen mockup showing reservation cards.
 */
export function GuestScreenMockup() {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <MockupStatusBar />

      {/* Header */}
      <div className="px-3 pt-1 pb-1">
        <p className="text-[10px] text-gray-900 font-semibold">Reservations</p>
      </div>

      {/* Search/Filter Bar */}
      <div className="px-3 pb-1">
        <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-200">
          <Search className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-[6px] text-gray-400">Search guests...</span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-3 pb-1 flex gap-1">
        <span className="px-2 py-0.5 bg-teal-500 text-white text-[6px] rounded-full">
          All
        </span>
        <span className="px-2 py-0.5 bg-white text-gray-600 text-[6px] rounded-full border border-gray-200">
          Confirmed
        </span>
        <span className="px-2 py-0.5 bg-white text-gray-600 text-[6px] rounded-full border border-gray-200">
          Pending
        </span>
      </div>

      {/* Reservation Cards */}
      <div className="flex-1 px-3 space-y-1 overflow-hidden">
        {reservations.map((reservation) => (
          <div
            key={reservation.name}
            className="bg-white rounded-lg p-1 shadow-sm"
          >
            <div className="flex items-start gap-1">
              {/* Avatar */}
              <div className="w-5 h-5 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[6px] font-semibold text-navy-600">
                  {reservation.initials}
                </span>
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-semibold text-gray-900">
                  {reservation.name}
                </p>
                <p className="text-[6px] text-gray-500">{reservation.property}</p>
                <p className="text-[6px] text-gray-500">
                  {reservation.dates} · {reservation.nights} nights
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[7px] font-semibold text-gray-900">
                    {reservation.amount}
                  </span>
                  <span
                    className={`text-[5px] px-1 py-0.5 rounded-full font-medium ${reservation.statusColor}`}
                  >
                    {reservation.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <MockupBottomNav activeTab="guests" />
    </div>
  );
}
