import { Heart, Plus, MapPin, Search } from "lucide-react";
import { MockupStatusBar } from "./MockupStatusBar";
import { MockupBottomNav } from "./MockupBottomNav";

const properties = [
  {
    name: "Casa Verde",
    location: "Tagaytay",
    price: "₱3,500",
    gradient: "from-teal-400 to-emerald-500",
  },
  {
    name: "Sunrise Condo",
    location: "Makati",
    price: "₱2,800",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    name: "Beach House",
    location: "La Union",
    price: "₱4,200",
    gradient: "from-blue-400 to-cyan-500",
  },
];

/**
 * Properties screen mockup showing property list with cards.
 */
export function PropertiesScreenMockup() {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <MockupStatusBar />

      {/* Header */}
      <div className="px-3 pt-1 pb-1.5">
        <p className="text-[10px] text-gray-900 font-semibold">
          Hello, Maria! 👋
        </p>
        <p className="text-[8px] text-gray-500">3 properties</p>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-1.5">
        <div className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1.5 border border-gray-200">
          <Search className="w-3 h-3 text-gray-400" />
          <span className="text-[8px] text-gray-400">Search properties...</span>
        </div>
      </div>

      {/* Property Cards */}
      <div className="flex-1 px-3 space-y-1.5 overflow-hidden">
        {properties.map((property) => (
          <div
            key={property.name}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {/* Image placeholder */}
            <div
              className={`h-12 bg-gradient-to-br ${property.gradient} relative`}
            >
              <button className="absolute top-1 right-1 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-gray-400" />
              </button>
            </div>
            {/* Details */}
            <div className="p-1.5">
              <p className="text-[8px] font-semibold text-gray-900">
                {property.name}
              </p>
              <div className="flex items-center gap-0.5">
                <MapPin className="w-2 h-2 text-gray-400" />
                <p className="text-[6px] text-gray-500">{property.location}</p>
              </div>
              <p className="text-[7px] font-semibold text-teal-600 mt-0.5">
                {property.price}
                <span className="text-gray-400 font-normal">/night</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div className="absolute bottom-14 right-3">
        <button className="w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
          <Plus className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <MockupBottomNav activeTab="properties" />
    </div>
  );
}
