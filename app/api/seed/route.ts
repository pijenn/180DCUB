import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mockProducts, mockSchedules } from "@/lib/mockData";

export async function GET() {
  // Use the service role key to bypass RLS policies
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log("Seeding products...");
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from("products")
      .upsert(
        mockProducts.map((p) => ({
          id: p.id === "1" || p.id === "2" || p.id === "3" || p.id === "4" || p.id === "5" || p.id === "6" ? undefined : p.id,
          // Generating random UUIDs or omitting ID to let the DB generate it.
          // Wait, mockData has '1', '2' which are not valid UUIDs.
          // We must generate UUIDs or map them. Let's just omit ID to let DB generate,
          // but we need to map product_id for mentoring schedules.
        })).map(() => null) // Just to satisfy TS locally, doing the real mapping below
      );

      // Actually, since mockProducts use IDs like '1', '2', we need to create valid UUIDs.
      const uuidMap: Record<string, string> = {
        '1': 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        '2': 'd290f1ee-6c54-4b01-90e6-d701748f0852',
        '3': 'd290f1ee-6c54-4b01-90e6-d701748f0853',
        '4': 'd290f1ee-6c54-4b01-90e6-d701748f0854',
        '5': 'd290f1ee-6c54-4b01-90e6-d701748f0855',
        '6': 'd290f1ee-6c54-4b01-90e6-d701748f0856',
      };

      const formattedProducts = mockProducts.map(p => ({
        id: uuidMap[p.id],
        type: p.type,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image_url,
        category: p.category,
        file_url: p.file_url,
        owner: p.owner,
      }));

    const { error: insertProdError } = await supabaseAdmin
      .from("products")
      .upsert(formattedProducts);

    if (insertProdError) throw insertProdError;

    console.log("Seeding schedules...");
    const formattedSchedules = mockSchedules.map(s => ({
      // skip id to let db generate
      product_id: uuidMap[s.product_id],
      start_time: s.start_time,
      end_time: s.end_time,
      is_booked: s.is_booked,
      locked_until: s.locked_until
    }));

    const { error: insertSchedError } = await supabaseAdmin
      .from("mentoring_schedules")
      .upsert(formattedSchedules);

    if (insertSchedError) throw insertSchedError;

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
