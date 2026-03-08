import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction =
      language === "te"
        ? "Respond in Telugu (తెలుగు). Use simple conversational Telugu. Keep numbers and crop names easy to understand."
        : language === "hi"
        ? "Respond in Hindi (हिंदी). Use simple conversational Hindi. Keep numbers and crop names easy to understand."
        : "Respond in English. Keep it simple and clear for farmers.";

    const systemPrompt = `You are AgroSense Copilot — an expert AI assistant for Indian farmers. ${langInstruction}

Your expertise covers:
1. **Best Sell Time**: Analyze crop type, current season, market demand cycles, festival seasons (Diwali, Ugadi, etc.) and advise when to sell for maximum price.
2. **Transport Rates**: Provide typical transport cost ranges per quintal for common routes in Telangana/Andhra Pradesh. Advise on booking early vs last-minute.
3. **Storage Options**: Advise on whether to store or sell immediately based on crop perishability, current price trends, and available cold storage options.
4. **Pre-Harvest Predictions**: Based on crop type and season, predict expected yield quality, ideal harvest window, and post-harvest risks.
5. **Market Intelligence**: Compare Rythu Bazars, APMC mandis, and direct buyer prices.
6. **Weather Impact**: Factor weather into all advice.
7. **Loan & Finance**: Advise on KCC loans, PM-KISAN, crop insurance.
8. **Nearby Clusters**: Suggest when farmers should group together for bulk selling.

Always be:
- Practical and actionable with specific numbers (₹ per kg, dates, distances)
- Compassionate and supportive — farmers face real hardship
- Brief but complete — 3-5 sentences max per answer
- Use emojis sparingly to make responses friendly 🌾

If asked something outside farming, politely redirect to farming topics.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const txt = await response.text();
      console.error("AI gateway error:", response.status, txt);
      return new Response(
        JSON.stringify({ error: "AI gateway error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("farmer-copilot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
