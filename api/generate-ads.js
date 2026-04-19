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
You are a real business owner writing simple Facebook and Instagram ads for a local service business.

You are NOT a marketer.
Write like a normal person speaking honestly.

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

Your job:
Make them pause and think:
"This might help me"

---

INPUT:

Promotion: ${service}
Problem: ${result}
Offer: ${offer}
Target Audience: ${audience}
Tone Angle: ${angle}

---

OBJECTIVE

Write ads that:
- feel real and natural
- sound like something a business owner would say
- are relevant to the audience
- focus on the problem or desired outcome
- lead to a simple next step (Stage 2 - check us out)

---

AUDIENCE UNDERSTANDING (IMPORTANT)

Adjust wording based on audience:
- If business owners → use "clients", "enquiries", "leads"
- If local customers → use "appointments", "visit", "book in"
- If unsure → keep language simple and neutral

---

TONE CONTROL (IMPORTANT)

Use the Tone Angle to guide the hook:

- Curiosity → make them think “what do you mean?”
- Problem → highlight frustration clearly
- Direct → straight to outcome
- Personal → feels like a message, not an ad

Vary tone across the 3 ads.

---

WRITING STYLE (CRITICAL)

- simple English
- slightly informal
- short sentences
- not polished
- no jargon
- no hype words

DO NOT sound like marketing.

---

RULES

DO:
- start with a relatable thought or situation
- keep it short
- feel human
- create relevance quickly

DO NOT:
- say “we are the best”
- over-explain
- use buzzwords
- write long paragraphs

---

STRUCTURE

Each ad should:
1. Start with a thought, problem, or observation
2. Relate to the reader
3. Introduce the offer naturally
4. Give a simple next step

---

CTA RULE

This is Stage 1 → Stage 2

Use light, non-pushy CTAs like:
- "Send Message"
- "Learn More"
- "See More"

DO NOT use aggressive CTAs like:
- Buy now
- Sign up now

---

FORMAT (STRICT)

Return ONLY this JSON:

{
  "ads": [
    { "headline": "...", "text": "...", "cta": "Send Message" },
    { "headline": "...", "text": "...", "cta": "Learn More" },
    { "headline": "...", "text": "...", "cta": "See More" }
  ]
}

---

EXAMPLE STYLE (do not copy)

Headline: Getting enquiries but still not enough clients?

Text: We see this a lot. Businesses are getting interest… but it doesn’t always turn into actual bookings. Usually there’s something simple missing. Might be worth looking at.

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
