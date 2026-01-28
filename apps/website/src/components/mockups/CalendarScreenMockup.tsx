import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { MockupStatusBar } from "./MockupStatusBar";
import { MockupBottomNav } from "./MockupBottomNav";

const bookedDays = [9, 10, 11, 22, 23, 24, 28, 29];
const blockedDays = [15, 16];

const days = Array.from({ length: 31 }, (_, i) => i + 1);

const upcomingReservations = [
  { name: "Juan Santos", dates: "Jan 9-11", nights: 3, property: "Casa Verde" },
  { name: "Maria Cruz", dates: "Jan 22-24", nights: 3, property: "Sunrise" },
  { name: "Ana Reyes", dates: "Jan 28-29", nights: 2, property: "Beach House" },
];

const monthHistory = [
  { month: "December", nights: 12, revenue: "₱42,000" },
  { month: "November", nights: 18, revenue: "₱63,000" },
  { month: "October", nights: 15, revenue: "₱52,500" },
];

/**
 * Calendar screen mockup showing month view with bookings.
 */
export function CalendarScreenMockup() {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <MockupStatusBar />

      {/* Property Filter Pills */}
      <div className="px-2 pt-1 pb-1 flex gap-1">
        <span className="px-2 py-0.5 bg-teal-500 text-white text-[6px] rounded-full">
          All
        </span>
        <span className="px-2 py-0.5 bg-white text-gray-600 text-[6px] rounded-full border border-gray-200">
          Casa Verde
        </span>
        <span className="px-2 py-0.5 bg-white text-gray-600 text-[6px] rounded-full border border-gray-200">
          Sunrise
        </span>
      </div>

      {/* Month Header */}
      <div className="flex items-center justify-center gap-2 py-1">
        <ChevronLeft className="w-3 h-3 text-gray-400" />
        <span className="text-[9px] font-semibold text-gray-900">
          January 2026
        </span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
      </div>

      {/* Calendar Grid */}
      <div className="px-2">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={`header-${i}`}
              className="text-[5px] text-gray-400 text-center font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells for Jan 1, 2026 (Wednesday) */}
          {[...Array(3)].map((_, i) => (
            <div key={`empty-${i}`} className="h-3.5" />
          ))}
          {days.map((day) => {
            const isBooked = bookedDays.includes(day);
            const isBlocked = blockedDays.includes(day);
            return (
              <div
                key={day}
                className={`h-3.5 flex items-center justify-center text-[6px] rounded ${
                  isBooked
                    ? "bg-teal-500 text-white font-medium"
                    : isBlocked
                    ? "bg-gray-300 text-gray-500"
                    : "text-gray-700"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-teal-500 rounded" />
          <span className="text-[6px] text-gray-500">Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-300 rounded" />
          <span className="text-[6px] text-gray-500">Blocked</span>
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="px-2 overflow-hidden">
        <p className="text-[7px] font-semibold text-gray-700 mb-1">Upcoming</p>
        <div className="space-y-1">
          {upcomingReservations.map((reservation, i) => (
            <div key={i} className="bg-white rounded-lg p-1.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[7px] font-semibold text-gray-900">
                    {reservation.name}
                  </p>
                  <p className="text-[6px] text-gray-500">
                    {reservation.dates} · {reservation.nights} nights · {reservation.property}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Month History Section */}
      <div className="px-2 py-1 flex-1 overflow-hidden">
        <p className="text-[7px] font-semibold text-gray-700 mb-1">History</p>
        <div className="flex gap-1">
          {monthHistory.map((item, i) => (
            <div key={i} className="flex-1 bg-white rounded-lg p-1 shadow-sm">
              <p className="text-[6px] font-medium text-gray-700">{item.month}</p>
              <p className="text-[5px] text-gray-500">{item.nights} nights</p>
              <p className="text-[6px] font-semibold text-teal-600">{item.revenue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <MockupBottomNav activeTab="calendar" />
    </div>
  );
}
