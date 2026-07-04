import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("inputs")
    .select("*")
    .order("date", { ascending: false })
    .limit(20);

  if (error) {
    console.error("GET /api/inputs failed:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  // Resolve legacy short codes to full producer names
  const producerMap: Record<string, string> = {
    "PRD-001": "Ali Ouedraogo",
    "PRD-002": "Fati Sawadogo",
    "PRD-003": "Moussa Kaboré",
    "PRD-004": "Jean Ilboudo",
    "PRD-005": "Amadou Traoré",
    "PRD-006": "Awa Diallo",
  };

  const normalized = (data || []).map((inp: any, i: number) => {
    let producerName = inp.producer || "Inconnu";
    // Replace raw short codes (e.g. PRD-001, PRD-002...)
    if (/^PRD-\d{3}$/i.test(producerName)) {
      producerName = producerMap[producerName.toUpperCase()] || producerName;
    }

    return {
      id: `DIST-${String(i + 1).padStart(4, "0")}`,
      producer: producerName,
      village: inp.village || "",
      items: `${inp.quantity} ${inp.product}`,
      amount:
        inp.amount != null && inp.amount !== "" && Number(inp.amount) !== 0
          ? `${Number(inp.amount).toLocaleString("fr-FR")} FCFA`
          : "0 FCFA",
      rawAmount: inp.amount,
      date: inp.date
        ? new Date(inp.date).toLocaleDateString("fr-FR")
        : "—",
      status: inp.status || "En attente",
      _raw: inp,
    };
  });

  return NextResponse.json(normalized);
}
