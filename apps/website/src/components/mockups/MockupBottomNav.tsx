import { Home, Calendar, DollarSign, Users } from "lucide-react";

type TabName = "properties" | "calendar" | "cashflow" | "guests";

interface MockupBottomNavProps {
  activeTab: TabName;
}

const tabs: { id: TabName; icon: typeof Home; label: string }[] = [
  { id: "properties", icon: Home, label: "Properties" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "cashflow", icon: DollarSign, label: "Cashflow" },
  { id: "guests", icon: Users, label: "Guests" },
];

/**
 * iOS-style bottom navigation bar for phone mockups.
 */
export function MockupBottomNav({ activeTab }: MockupBottomNavProps) {
  return (
    <div className="bg-white border-t border-gray-100 px-2 pt-1.5 pb-1">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <div key={tab.id} className="flex flex-col items-center gap-0.5">
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-teal-500" : "text-gray-400"
                }`}
              />
              <span
                className={`text-[6px] ${
                  isActive
                    ? "text-teal-500 font-medium"
                    : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
