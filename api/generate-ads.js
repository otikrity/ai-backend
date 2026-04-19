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
    // ✅ FIXED: include audience + angle
    const { service, result, offer, audience, angle } = req.body;

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

AUDIENCE UNDERSTANDING

- Business owners → use "clients", "enquiries", "leads"
- Local customers → use "appointments", "book in", "visit"
- If unsure → keep language simple

---

TONE CONTROL

Use the Tone Angle:

- Curiosity → make them think
- Problem → highlight frustration
- Direct → clear outcome
- Personal → message style

Vary tone across ads.

---

WRITING STYLE

- simple English
- short sentences
- slightly informal
- human
- no jargon
- no hype

DO NOT sound like marketing.

---

RULES

DO:
- start with a relatable thought
- keep it short
- feel natural

DO NOT:
- be salesy
- over-explain
- use buzzwords

---

STRUCTURE

Each ad:
1. Thought / problem
2. Relate to reader
3. Introduce offer naturally
4. Simple next step

---

CTA RULE

Stage 1 → Stage 2

Use:
- "Send Message"
- "Learn More"
- "See More"

---

EMAIL & DM CONTEXT

These are for leads from the ad.

They:
- showed interest
- are not fully convinced

OBJECTIVE:
- feel personal
- not salesy
- continue conversation

STYLE:
- short
- simple
- human

DO NOT:
- be pushy
- sound like marketing

---

EMAIL STRUCTURE

Each email:
1. Subject
2. Short message
3. Reference problem
4. Light offer
5. Simple next step

---

DM STRUCTURE

Each DM:
1. Personal tone
2. Reference situation
3. 1–3 lines
4. Invite reply

---

FORMAT (STRICT)

Return ONLY:

{
  "ads": [
    { "headline": "...", "text": "...", "cta": "Send Message" },
    { "headline": "...", "text": "...", "cta": "Learn More" },
    { "headline": "...", "text": "...", "cta": "See More" }
  ],
  "emails": [
    { "subject": "...", "body": "..." },
    { "subject": "...", "body": "..." }
  ],
  "dms": [
    { "message": "..." },
    { "message": "..." }
  ]
}

---

EXAMPLE STYLE (do not copy)

Headline: Getting enquiries but not enough clients?

Text: We see this a lot. Businesses get interest but it doesn’t always turn into bookings. Usually something simple is missing. Might be worth looking at.

CTA: Send Message
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
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
      // ✅ FIXED fallback
      output = { ads: [], emails: [], dms: [] };
    }

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({ error: "Error generating ads" });
  }
}
