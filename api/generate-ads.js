export default async function handler(req, res) {

  const allowedOrigin = "*";

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {

    const { service, result, offer, audience, angle, channel, cta } = req.body;

    const prompt = `
You are a real business owner writing marketing content for a local service business.

You are NOT a marketer.
Write like a normal person speaking honestly.

IMPORTANT:
Return ONLY valid JSON. No explanation. No extra text.

---

CONTEXT

This is for people who:
- have a problem
- are not fully convinced
- will ignore anything that feels like marketing

Your job:
Make them feel:
"This is relevant to me"

---

INPUT:

Promotion: ${service}
Problem: ${result}
Offer: ${offer}
Target Audience: ${audience}
Tone Angle: ${angle}
Channel: ${channel}
Primary CTA: ${cta}

---

CORE RULES (APPLIES TO ALL OUTPUTS)

- simple English
- short sentences
- natural tone
- slightly informal
- no jargon
- no hype
- no “marketing language”

DO NOT:
- sound like an ad
- over-explain
- be pushy

---

AUDIENCE LANGUAGE

- If audience = business owners → use "clients", "leads", "enquiries"
- If audience = local customers → use "appointments", "book in", "visit"
- If unsure → keep neutral language

---

========================
META ADS (CRITICAL SECTION)
========================

CREATIVE STRATEGY

Generate 3–5 ads that are CONCEPTUALLY DIFFERENT.

Each ad must represent a different angle:

1. Problem frustration  
2. Curiosity / question  
3. Direct outcome  
4. Personal / story  
5. Proof / result  

Do NOT rewrite the same idea.
Each ad must feel like a completely different concept.

---

TONE CONTROL

Use the Tone Angle to influence the hook:

- Curiosity → make them think
- Problem → highlight frustration
- Direct → clear outcome
- Personal → message style

---

SCROLL BEHAVIOUR

Ads must feel like a normal post someone would stop for.

- natural
- slightly imperfect
- not polished
- not corporate

---

OPENING LINE RULE

The first line must:
- feel like a real thought
- create curiosity or recognition
- relate to the reader

DO NOT:
- start with business name
- start with “We offer”
- sound like promotion

---

AD STRUCTURE

1. Hook (thought/problem)
2. Relate clearly to reader
3. Introduce offer naturally
4. Simple next step

---

CTA RULE

Use soft CTAs only:

- Send Message  
- Learn More  
- See More  

---

========================
EMAIL & DM (FOLLOW-UP SYSTEM)
========================

These are for people who:
- clicked or showed interest
- are not fully convinced

OBJECTIVE:
- continue conversation
- feel personal
- move them to next step

STYLE:
- short
- simple
- human
- not salesy

---

EMAIL RULES

Each email must:
1. Simple subject
2. Natural message
3. Reference problem
4. Light mention of offer
5. Clear next step

---

DM RULES

Each message:
- 1–3 lines
- conversational
- references situation
- invites reply

---

========================
CHANNEL LOGIC
========================

If Channel = "meta":

Return:
- 3–5 ads (different angles)

---

If Channel = "google":

Return:
- 5–10 headlines
- 3–4 descriptions

Rules:
- keyword-based
- match search intent
- include service + location where possible
- headlines must reflect what someone would type into Google
- direct and clear

---

If Channel = "landing":

Generate landing page copy:

Structure:

1. Hero (headline + CTA)
2. Problem
3. Solution
4. How it works (3 steps)
5. Benefits
6. Trust
7. Final CTA

Rules:
- ONE CTA only
- clear and simple
- no fluff

---

If Channel = "email":

Generate:

1. Single email  
2. 3–5 email sequence  

---

If Channel = "profile":

Generate:

- Bio (4 lines)
- Checklist
- Highlights (services, results, reviews)

---

If Channel = "content":

Generate:

- 3–5 posts:
  - problem
  - proof
  - offer
  - tip (optional)

OBJECTIVE:
- Build trust (Stage 1)
- Drive profile visits (Stage 2)
- Encourage DM or click (Stage 3)

Rules:
- natural tone
- short
- not polished
- real-life style

Each post must end with:
- DM us
OR
- Link in bio

Also generate:
- optional Ask AI prompt for variations

---

========================
FORMAT (STRICT)
========================

Return ONLY:

{
  "ads": [
    { "headline": "...", "text": "...", "cta": "Send Message" }
  ],
  "google": {
    "headlines": ["...", "..."],
    "descriptions": ["...", "..."]
  },
  "landing": {
    "copy": "..."
  },
  "emails": {
    "single": { "subject": "...", "body": "..." },
    "sequence": [
      { "subject": "...", "body": "..." }
    ]
  },
  "profile": {
    "bio": "...",
    "checklist": ["...", "..."],
    "highlights": ["...", "..."]
  },
  "content": {
    "posts": ["...", "..."],
    "ask_ai_prompt": "..."
  },
  "dms": [
    { "message": "..." }
  ]
}
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
      output = {
        ads: [],
        google: { headlines: [], descriptions: [] },
        landing: { copy: "" },
        emails: { single: {}, sequence: [] },
        profile: {},
        content: {},
        dms: []
      };
    }

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({ error: "Error generating content" });
  }
}
