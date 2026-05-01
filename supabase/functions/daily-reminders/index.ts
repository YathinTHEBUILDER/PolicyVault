// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  console.log("Starting daily reminders cron...");

  try {
    const today = new Date().toISOString().split("T")[0];
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Fetch Motor policies expiring in 7 days (Check both OD and TP)
    const { data: motor } = await supabase
      .from("motor_policies")
      .select("*, customer:customer_id(full_name, phone_primary, email)")
      .or(`od_expiry_date.eq.${next7Days},tp_expiry_date.eq.${next7Days}`)
      .eq("archived", false);

    // Fetch Health policies
    const { data: health } = await supabase
      .from("health_policies")
      .select("*, customer:customer_id(full_name, phone_primary, email)")
      .eq("expiry_date", next7Days)
      .eq("archived", false);

    // Fetch Others policies
    const { data: others } = await supabase
      .from("others_policies")
      .select("*, customer:customer_id(full_name, phone_primary, email)")
      .eq("expiry_date", next7Days)
      .eq("archived", false);

    const allPolicies = [
      ...(motor || []).map(p => ({ ...p, category: 'Motor' })),
      ...(health || []).map(p => ({ ...p, category: 'Health' })),
      ...(others || []).map(p => ({ ...p, category: 'Others' }))
    ];

    console.log(`Found ${allPolicies.length} policies expiring on ${next7Days}`);

    for (const policy of allPolicies) {
      let expiryType = "";
      if (policy.category === 'Motor') {
        if (policy.od_expiry_date === next7Days) expiryType = " (OD Part)";
        if (policy.tp_expiry_date === next7Days) expiryType = " (TP Part)";
      }

      await supabase.from("communication_logs").insert({
        customer_id: policy.customer_id,
        channel: "SMS",
        direction: "Outbound",
        subject: "Policy Renewal Reminder",
        content: `Dear ${policy.customer?.full_name}, your ${policy.category} policy ${policy.policy_number}${expiryType} is expiring on ${next7Days}. Please contact us for renewal.`,
        status: "Sent",
      });
      
      console.log(`Sent reminder to ${policy.customer?.full_name} for ${policy.category}`);
    }

    return new Response(JSON.stringify({ success: true, processed: allPolicies.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
