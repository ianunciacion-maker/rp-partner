export const PROPERTY_TYPES = [
  { label: 'Villa', value: 'villa' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Condo', value: 'condo' },
  { label: 'House', value: 'house' },
  { label: 'Resort', value: 'resort' },
  { label: 'Other', value: 'other' },
] as const;

export const RESERVATION_STATUSES = [
  { label: 'Pending', value: 'pending', color: '#f59e0b' },
  { label: 'Confirmed', value: 'confirmed', color: '#10b981' },
  { label: 'Checked In', value: 'checked_in', color: '#3b82f6' },
  { label: 'Completed', value: 'completed', color: '#6b7280' },
  { label: 'Cancelled', value: 'cancelled', color: '#ef4444' },
  { label: 'No Show', value: 'no_show', color: '#6b7280' },
] as const;

export const BOOKING_SOURCES = [
  { label: 'Direct', value: 'direct' },
  { label: 'Airbnb', value: 'airbnb' },
  { label: 'Booking.com', value: 'booking' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Referral', value: 'referral' },
  { label: 'Other', value: 'other' },
] as const;

export const PAYMENT_METHODS = [
  { label: 'Cash', value: 'cash' },
  { label: 'GCash', value: 'gcash' },
  { label: 'Maya', value: 'maya' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Check', value: 'check' },
  { label: 'Other', value: 'other' },
] as const;

export const INCOME_CATEGORIES = [
  { label: 'Rental Income', value: 'rental_income', subcategories: ['Booking Payment', 'Extra Night', 'Extended Stay'] },
  { label: 'Additional Services', value: 'additional_services', subcategories: ['Cleaning Fee', 'Pet Fee', 'Extra Guest Fee', 'Late Checkout', 'Early Checkin'] },
  { label: 'Deposits', value: 'deposits', subcategories: ['Security Deposit', 'Damage Deposit'] },
  { label: 'Other Income', value: 'other_income', subcategories: ['Tips', 'Referral Bonus', 'Other'] },
] as const;

export const EXPENSE_CATEGORIES = [
  { label: 'Utilities', value: 'utilities', subcategories: ['Electricity', 'Water', 'Internet', 'Gas'] },
  { label: 'Maintenance', value: 'maintenance', subcategories: ['Repairs', 'Cleaning', 'Landscaping', 'Pool Maintenance'] },
  { label: 'Supplies', value: 'supplies', subcategories: ['Toiletries', 'Linens', 'Kitchen Supplies', 'Cleaning Supplies'] },
  { label: 'Services', value: 'services', subcategories: ['Property Management', 'Accounting', 'Legal', 'Insurance'] },
  { label: 'Marketing', value: 'marketing', subcategories: ['Listing Fees', 'Photography', 'Advertising'] },
  { label: 'Taxes & Fees', value: 'taxes_fees', subcategories: ['Property Tax', 'HOA Fees', 'Permits', 'Licenses'] },
  { label: 'Other Expenses', value: 'other_expenses', subcategories: ['Miscellaneous', 'Emergency Repairs'] },
] as const;
