// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, options);

    if (res.status !== 429) {
      return res;
    }

    const retryAfter = res.headers.get("Retry-After");
    const delay = retryAfter
      ? parseInt(retryAfter) * 1000
      : Math.min(Math.pow(2, attempt) * 4000, 30000); // ✅ Start at 4s, cap at 30s

    console.warn(`429 received. Retrying in ${delay}ms (attempt ${attempt + 1})`);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("Exceeded retries due to rate limiting");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`;

    const body = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a highly accurate birthday invitation parser. Extract the birthday event details from this invitation image. Transcribe the TIME and DATE sections exactly as they appear. If there is a range (e.g., '18:30 a 21:30'), include the entire range in the 'time' field.`,
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
          ],
        },
      ],
      tools: [
        {
          function_declarations: [
            {
              name: "extract_birthday_info",
              description: "Extract birthday event information from an invitation image",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  date: { type: "string" },
                  time: { type: "string" },
                  location: { type: "string" },
                  additional_notes: { type: "string" },
                },
                required: ["name", "date", "time", "location"],
              },
            },
          ],
        },
      ],
      tool_config: {
        function_calling_config: {
          mode: "ANY",
          allowed_function_names: ["extract_birthday_info"],
        },
      },
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.2,
      },
    });

    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: `AI error (${response.status})`, details: text }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "Could not extract birthday info from this image" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: toolCall.args }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("extract-birthday error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    // ✅ Return 429 with friendly message when Gemini rate limit is exhausted
    const isRateLimit = msg.includes("rate limit") || msg.includes("Exceeded retries");

    return new Response(
      JSON.stringify({
        error: isRateLimit
          ? "The service is busy, please try again in a minute."
          : msg,
      }),
      {
        status: isRateLimit ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});