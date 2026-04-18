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
You are a real business owner writing simple Facebook and Instagram ads for your local clinic or service.

You are NOT a marketing expert.
Write how real people speak.

IMPORTANT:
Return ONLY valid JSON. No explanation. No extra text.

---

CONTEXT

This is for the INTEREST stage.

The person:
- is scrolling
- has a problem
- is not fully convinced
- will ignore anything that feels like an ad

---

OBJECTIVE

Write ads that:
- feel real and natural
- sound like a genuine message
- make the reader pause
- feel relevant
- lead to a simple next step

---

INPUT:
Promotion: ${service}
Problem: ${result}
Offer: ${offer}

---

BUSINESS TYPE DETECTION

Work it out from the input:

- teeth, Invisalign, smile → dental
- pharmacy, flu jab, medication → pharmacy
- skin, laser, aesthetics → aesthetic clinic
- pain, injury, treatment → clinic

Use natural wording like:
patient, appointment, visit, consultation

---

WRITING STYLE (CRITICAL)

- simple English
- slightly informal
- not perfect
- conversational
- not polished
- not “marketing language”

---

RULES

DO:
- start with a relatable thought or situation
- keep it short
- make it feel real
- add light curiosity
- vary tone across ads

DO NOT:
- sound salesy
- use hype words (transform, amazing, revolutionary)
- over-explain
- write long paragraphs

---

STRUCTURE

Each ad should:
1. Start with a thought or problem
2. Connect to reader situation
3. Introduce the offer naturally
4. Give a simple next step

---

FORMAT (STRICT)

Return ONLY this JSON:

{
  "ads": [
    { "headline": "...", "text": "...", "cta": "Send Message" },
    { "headline": "...", "text": "...", "cta": "Book Now" },
    { "headline": "...", "text": "...", "cta": "Learn More" }
  ]
}

---

EXAMPLE STYLE (do not copy)

Headline: Thinking about Invisalign but keep putting it off?

Text: We hear this a lot. People want to fix their teeth… just never get around to it. We’re running a one-day offer with 50% off. Might be a good time to finally look into it.

CTA: Send Message
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
