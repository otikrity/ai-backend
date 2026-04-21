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

    const {
      goal,
      focus,
      audience,
      timeline,
      budget,
      businessType,
      location
    } = req.body;

    const prompt = `
You are a marketing strategist for clinics, dental practices, pharmacies, and aesthetic businesses.

You are NOT a generic AI assistant.
You think like an experienced operator who gets results.

Your job is to create a clear, practical campaign plan based on two internal frameworks:

---

1. Demand Type Framework (decides strategy)

Classify the campaign into ONE:

- Need:
Urgent, problem-driven, high intent. People are actively searching now.

- Want:
Aspirational, elective. Not urgent. Requires attention and desire building.

- Considered:
User is comparing options. Trust and reassurance are critical.

- Repeat:
Existing patients. Focus on reactivation and retention.

- Promotion:
Time-sensitive offer, event, or deadline-driven campaign.

---

2. Patient Journey Framework (structures execution)

Every campaign MUST follow:

- Interest → get attention (do NOT sell the treatment)
- Review → build trust and allow evaluation
- Clarity → explain and guide decision (usually consultation)
- Protection → remove fear and enable commitment

---

INPUT:

Goal: ${goal}
Treatment / Focus: ${focus}
Audience: ${audience}
Timeline: ${timeline}
Budget: ${budget}
Business Type: ${businessType}
Location: ${location}

---

TASK:

Step 1:
Classify the Demand Type using logic, not keywords.

Consider:
- urgency (timeline)
- intent (goal)
- audience awareness
- nature of treatment

---

Step 2:
Create a full campaign plan using the 4-stage Patient Journey.

---

Step 3:
Select the BEST channel mix:

- ONE primary channel
- up to TWO support channels max

---

Step 4:
Decide the Review method:
- lead form
- assessment / “get your plan”
- website page
- social proof route

Choose ONE main approach.

---

Step 5:
Define Clarity method:
- consultation
- call
- WhatsApp
- booking

---

Step 6:
Define Protection requirements:
- pricing clarity
- finance
- reassurance
- follow-up

---

Step 7:
Recommend execution guides from this list:

- Run Facebook & Instagram Ads
- Show up on Google
- Email Your Patients
- Get More Reviews
- Grow Your Following
- Get Found on Google

Max 3 guides.

---

Step 8:
State what NOT to focus on (important).

---

OUTPUT FORMAT (STRICT):

Demand Type:
[one category]

Campaign Objective:
[clear, outcome-based objective]

Best Channel Mix:
- Primary:
- Support:
- Support:

4-Stage Journey:

Interest:
[what to run + goal]

Review:
[how they evaluate you]

Clarity:
[how decision happens]

Protection:
[what removes risk]

What Must Be Ready First:
- ...
- ...
- ...

Messaging Angle:
- ...
- ...
- ...

What Not To Focus On:
- ...
- ...

Recommended Guides:
1. ...
2. ...
3. ...

---

STYLE RULES:

- simple English
- short sentences
- practical
- no jargon
- no fluff
- no “you could try”
- be decisive

Write like you are giving instructions to a practice manager.

Make it feel like:
“This is exactly what to do next.”
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
      output = {
        plan: data.choices[0].message.content
      };
    } catch {
      output = {
        plan: "Unable to generate plan. Please try again."
      };
    }

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({ error: "Error generating plan" });
  }
}
