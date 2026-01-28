import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Home, Sparkles, Wrench, Zap, Droplet, Wifi, Shield } from "lucide-react";
import { MockupStatusBar } from "./MockupStatusBar";
import { MockupBottomNav } from "./MockupBottomNav";

const transactions = [
  { type: "income", icon: Home, label: "Casa Verde Rental", amount: "+₱35,000", date: "Jan 11" },
  { type: "expense", icon: Sparkles, label: "Cleaning", amount: "-₱2,000", date: "Jan 11" },
  { type: "income", icon: Home, label: "Sunrise Rental", amount: "+₱28,000", date: "Jan 10" },
  { type: "income", icon: Home, label: "Beach House Rental", amount: "+₱42,000", date: "Jan 9" },
  { type: "expense", icon: Wrench, label: "Maintenance", amount: "-₱5,500", date: "Jan 8" },
  { type: "expense", icon: Wifi, label: "Internet", amount: "-₱2,500", date: "Jan 7" },
  { type: "expense", icon: Zap, label: "Electricity", amount: "-₱3,200", date: "Jan 5" },
  { type: "expense", icon: Shield, label: "Insurance", amount: "-₱8,000", date: "Jan 4" },
  { type: "expense", icon: Droplet, label: "Water", amount: "-₱1,800", date: "Jan 3" },
];

/**
 * Cashflow screen mockup showing income/expense summary and transactions.
 */
export function CashflowScreenMockup() {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <MockupStatusBar />

      {/* Month Header */}
      <div className="flex items-center justify-center gap-2 py-1.5">
        <ChevronLeft className="w-3 h-3 text-gray-400" />
        <span className="text-[9px] font-semibold text-gray-900">
          January 2026
        </span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
      </div>

      {/* Summary Cards - Horizontal Layout */}
      <div className="px-2 pb-1.5">
        <div className="flex gap-1.5">
          {/* Income Card */}
          <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-1.5">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
              <span className="text-[6px] text-emerald-600">Income</span>
            </div>
            <p className="text-[10px] font-bold text-emerald-700">₱125,000</p>
          </div>

          {/* Expense Card */}
          <div className="flex-1 bg-red-50 border border-red-100 rounded-lg p-1.5">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-2.5 h-2.5 text-red-500" />
              <span className="text-[6px] text-red-600">Expenses</span>
            </div>
            <p className="text-[10px] font-bold text-red-700">₱45,000</p>
          </div>

          {/* Net Card */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-1.5">
            <p className="text-[6px] text-gray-500">Net</p>
            <p className="text-[10px] font-bold text-gray-900">₱80,000</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-2 flex-1 overflow-hidden">
        <p className="text-[7px] font-semibold text-gray-700 mb-1">
          Transactions
        </p>
        <div className="space-y-1">
          {transactions.map((tx, i) => {
            const Icon = tx.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-lg px-2 py-1 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      tx.type === "income" ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
                    <Icon
                      className={`w-2 h-2 ${
                        tx.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <div>
                    <span className="text-[7px] text-gray-700 block">{tx.label}</span>
                    <span className="text-[5px] text-gray-400">{tx.date}</span>
                  </div>
                </div>
                <span
                  className={`text-[7px] font-semibold ${
                    tx.type === "income" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {tx.amount}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <MockupBottomNav activeTab="cashflow" />
    </div>
  );
}
