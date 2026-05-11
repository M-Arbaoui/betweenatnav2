import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const appUrl = "https://betweenatna.vercel.app";

  if (!code) {
    // No code — redirect to homepage
    return Response.redirect(appUrl, 302);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: room } = await supabase
    .from("game_rooms")
    .select("player1_name, room_code, relationship_type")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  const playerName = room?.player1_name || "Someone";
  const joinUrl = `${appUrl}/?join=${code.toUpperCase()}`;
  const ogImage = `${appUrl}/og-image.png`;

  const title = `${playerName} invited you to play betweenatna!`;
  const description = "The game that exposes everything. No filter, no mercy. Join now!";

  // Check if request is from a bot/crawler (for OG previews)
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isBot = /bot|crawler|spider|facebook|whatsapp|telegram|twitter|slack|discord|linkedin|preview/i.test(ua);

  if (!isBot) {
    // Real user — instant 302 redirect
    return Response.redirect(joinUrl, 302);
  }

  // Bot/crawler — serve HTML with OG meta tags
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${joinUrl}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImage}">
</head>
<body></body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
