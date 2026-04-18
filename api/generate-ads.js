export default async function handler(req, res) {

  const allowedOrigin = "*";

  // ✅ Handle preflight (CORS fix)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // ✅ Add headers to all responses
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { service, result, offer } = req.body;

    const prompt = `
You are a strict JSON generator.

Create 3 high-converting ads.

INPUT:
Service: ${service}
Result: ${result}
Offer: ${offer}

RULES:
- Return ONLY valid JSON
- No explanation
- No text before or after
- No numbering
- Do NOT wrap in markdown
- Do NOT include backticks

FORMAT:
{
  "ads": [
    { "headline": "Ad 1", "text": "Body text...", "cta": "Book Now" },
    { "headline": "Ad 2", "text": "Body text...", "cta": "Claim Offer" },
    { "headline": "Ad 3", "text": "Body text...", "cta": "Learn More" }
  ]
}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    let output;
    try {
      output = JSON.parse(data.choices[0].message.content);
    } catch {
      output = { ads: [] };
    }

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({ error: "Error generating ads" });
  }
}
