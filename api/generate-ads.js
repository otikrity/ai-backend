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
const { service, result, offer, audience, angle, channel, cta } = req.body;
    
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
Channel: ${channel}
Primary CTA: ${cta}

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

---

CHANNEL LOGIC

If Channel = "meta":
- Generate Facebook/Instagram ads (as defined above)

If Channel = "google":
- Generate Google Search Ads
- Output 5–10 headlines (short, keyword-based)
- Output 3–4 descriptions (clear, direct)
- Headlines must match intent (what people search)
- Include location or service keywords where possible
- Use strong CTA like "Book Now", "Get Quote", "Call Now"

If Channel = "landing":
- Generate landing page copy only (no ads)
- This is for Google Ads traffic (high intent)
- The goal is to turn visitors into enquiries or bookings

Follow this structure EXACTLY:
(HERO → PROBLEM → SOLUTION → HOW IT WORKS → WHAT THEY GET → TRUST → CTA)

IMPORTANT:
- ONE primary CTA only
- Simple, clear, no fluff

---

If Channel = "email":
- Generate emails for an existing customer/patient database
- These people already know the business

Generate:
1. Single email
2. 3–5 email sequence

Keep:
- personal
- simple
- not salesy
- clear CTA

---

If Channel = "profile":

- Generate a high-converting social media profile (this is their "mini website")

OBJECTIVE:
When someone lands on the profile, they should:
- understand what the business does in seconds
- trust it
- know what to do next

Generate:

1. Bio (4 lines max):
- Line 1: What you do
- Line 2: Who you help
- Line 3: Why trust you (proof or outcome)
- Line 4: Clear CTA (DM us / click link)

2. Profile Checklist:
- Profile photo (logo or clear image)
- Location included
- Booking/contact link added

3. Highlights:
- Services (what you offer)
- Results (before/after, outcomes)
- Reviews (social proof)

IMPORTANT:
- Clear, not clever
- No jargon
- No fluff

---

If Channel = "content":

- Generate 3–5 high-quality social media posts

OBJECTIVE:
- Build trust (Stage 1)
- Make people click profile (Stage 2)
- Push to DM or link (Stage 3)

POST TYPES (MANDATORY MIX):

1. Problem Post:
- Call out a real situation
- Make reader feel understood

2. Proof Post:
- Show real result, outcome, or scenario
- Make it believable, not hype

3. Offer Post:
- Softly introduce service
- Show how to take next step

4. Optional Tip Post:
- Simple, useful insight

WRITING RULES:
- Short
- Conversational
- Real, not polished
- No buzzwords
- No generic advice

CRITICAL:
Each post must end with:
- "DM us"
OR
- "Link in bio"

Make posts feel like they came from a real business, not a marketer.

Also generate:

Ask AI Prompt (optional):
- A copy-paste prompt that can be used in GHL to create variations or styled posts
- This is optional, not the main output

---

FORMAT (STRICT)

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
    { "subject": "...", "body": "..." },
    { "subject": "...", "body": "..." }
  ]
},
  "dms": [
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
