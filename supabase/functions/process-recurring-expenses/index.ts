import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function addFrequency(dateStr: string, frequency: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  switch (frequency) {
    case 'quarterly':
      date.setUTCMonth(date.getUTCMonth() + 3);
      break;
    case 'yearly':
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      break;
    default: // monthly
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];

    const { data: dueEntries, error: fetchError } = await supabase
      .from('cashflow_entries')
      .select('*')
      .eq('is_recurring', true)
      .lte('next_due_date', today);

    if (fetchError) throw fetchError;

    console.log(`Found ${dueEntries?.length || 0} recurring entries due`);

    let createdCount = 0;

    for (const entry of dueEntries || []) {
      const newEntry = {
        property_id: entry.property_id,
        user_id: entry.user_id,
        type: entry.type,
        category: entry.category,
        subcategory: entry.subcategory,
        description: entry.description,
        amount: entry.amount,
        currency: entry.currency,
        transaction_date: entry.next_due_date,
        payment_method: entry.payment_method,
        reference_number: null,
        receipt_url: null,
        receipt_thumbnail_url: null,
        tags: entry.tags,
        notes: entry.notes,
        is_recurring: false,
        recurring_config: null,
        recurrence_frequency: null,
        next_due_date: null,
        recurrence_end_date: null,
        parent_entry_id: entry.id,
      };

      const { error: insertError } = await supabase
        .from('cashflow_entries')
        .insert(newEntry);

      if (insertError) {
        console.error(`Failed to create entry for parent ${entry.id}:`, insertError);
        continue;
      }

      createdCount++;

      const nextDue = addFrequency(entry.next_due_date, entry.recurrence_frequency || 'monthly');
      const shouldDeactivate = entry.recurrence_end_date && nextDue > entry.recurrence_end_date;

      if (shouldDeactivate) {
        await supabase
          .from('cashflow_entries')
          .update({ is_recurring: false, next_due_date: null })
          .eq('id', entry.id);
      } else {
        await supabase
          .from('cashflow_entries')
          .update({ next_due_date: nextDue })
          .eq('id', entry.id);
      }
    }

    console.log(`Created ${createdCount} new entries`);

    return new Response(
      JSON.stringify({ success: true, processed: dueEntries?.length || 0, created: createdCount }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in process-recurring-expenses:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
