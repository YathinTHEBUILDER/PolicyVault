// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  console.log("Generating monthly brokerage report...");

  try {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Calculate Motor Premiums (Total, OD, and TP)
    const { data: motor } = await supabase
      .from("motor_policies")
      .select("premium_amount, od_premium, tp_premium")
      .gte("created_at", firstDayLastMonth)
      .lte("created_at", lastDayLastMonth);

    // Calculate Health Premiums
    const { data: health } = await supabase
      .from("health_policies")
      .select("premium_amount")
      .gte("created_at", firstDayLastMonth)
      .lte("created_at", lastDayLastMonth);

    // Calculate Others Premiums
    const { data: others } = await supabase
      .from("others_policies")
      .select("premium_amount")
      .gte("created_at", firstDayLastMonth)
      .lte("created_at", lastDayLastMonth);

    const totalMotor = motor?.reduce((acc: number, p: any) => acc + (p.premium_amount || 0), 0) || 0;
    const totalMotorOD = motor?.reduce((acc: number, p: any) => acc + (p.od_premium || 0), 0) || 0;
    const totalMotorTP = motor?.reduce((acc: number, p: any) => acc + (p.tp_premium || 0), 0) || 0;
    const totalHealth = health?.reduce((acc: number, p: any) => acc + (p.premium_amount || 0), 0) || 0;
    const totalOthers = others?.reduce((acc: number, p: any) => acc + (p.premium_amount || 0), 0) || 0;

    console.log(`Monthly Totals - Motor: ${totalMotor}, Health: ${totalHealth}, Others: ${totalOthers}`);

    // Log the report event
    await supabase.from("audit_logs").insert({
      action: "Monthly Report Generated",
      table_name: "multiple",
      new_data: { 
        motor_total: totalMotor, 
        motor_od: totalMotorOD, 
        motor_tp: totalMotorTP, 
        health: totalHealth, 
        others: totalOthers,
        period: `${firstDayLastMonth} to ${lastDayLastMonth}` 
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      totals: { 
        motor: { total: totalMotor, od: totalMotorOD, tp: totalMotorTP }, 
        health: totalHealth,
        others: totalOthers
      } 
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
