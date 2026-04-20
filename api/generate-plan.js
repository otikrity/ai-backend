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
      practiceName,
      location,
      owner,
      timeframe,
      goals,
      primaryService,
      secondaryServices,
      patientAgeRange,
      patientConcern,
      patientSearch,
      patientPriority,
      patientProfile,
      primaryChannel,
      secondaryChannel,
      channelReason,
      budget,
      manager,
      message,
      reviewCount,
      reviewRating,
      proofLevel,
      websiteClarity,
      pricingVisibility,
      bookingEase,
      gaps,
      responder,
      responseSpeed,
      consultation,
      followup,
      finance,
      weeklyActions,
      reviewDate,
      trackingFocus
    } = req.body;

    const prompt = `
You are creating a REAL marketing plan for a clinic or local service business.

This must feel like it was written specifically for this business.
Do NOT be generic. Do NOT use jargon.

---

INPUT:

Practice Name: ${practiceName}
Location: ${location}
Plan Owner: ${owner}
Plan Period: ${timeframe}

Goals: ${JSON.stringify(goals)}

Primary Service: ${primaryService}
Secondary Services: ${secondaryServices}

Target Patient:
- Age Range: ${patientAgeRange}
- Main Concern: ${patientConcern}
- Search Behaviour: ${patientSearch}
- Priority: ${patientPriority}
- Profile: ${patientProfile}

Channel Strategy:
- Primary: ${primaryChannel}
- Secondary: ${secondaryChannel}
- Reason: ${channelReason}
- Budget: ${budget}
- Managed by: ${manager}
- Message: ${message}

Trust Signals:
- Reviews: ${reviewCount} (${reviewRating})
- Proof: ${proofLevel}
- Website: ${websiteClarity}
- Pricing: ${pricingVisibility}
- Booking: ${bookingEase}
- Gaps: ${gaps}

Conversion Setup:
- Responder: ${responder}
- Response Speed: ${responseSpeed}
- Consultation: ${consultation}
- Follow Up: ${followup}
- Finance: ${finance}

Execution:
- Weekly Actions: ${weeklyActions}
- Review Date: ${reviewDate}
- Tracking: ${trackingFocus}

---

STRUCTURE:

HEADER

Marketing Plan

Business: ${practiceName}
Location: ${location}
Prepared for: ${owner}
Plan Period: ${timeframe}

---

1. TARGET

State the main goal clearly.

Then estimate:
- Enquiries needed
- Consultations needed
- Patients needed

Use realistic assumptions.

---

2. TARGET PATIENT

Define clearly:
- Who they are
- Their main concern
- What they search for

Include a short real-life example profile.

---

3. HOW WE WILL GET ENQUIRIES

Primary Channel: ${primaryChannel}

Explain:
- What we will run
- How it works locally
- What type of leads to expect

Include:
Budget: ${budget}

Message example:
Write ONE natural, non-salesy example.

---

WHY THIS APPROACH

Explain why this channel makes sense for this business.

---

4. BEFORE WE RUN THIS

Explain:
"Before people contact us, they will check us online."

Then:

What’s already strong:
- Based on inputs

What needs improving:
- Identify real gaps using trust inputs

---

5. HOW WE HANDLE ENQUIRIES

Write simple steps:
- Respond quickly
- Ask what they need
- Guide to consultation
- Follow up if no response

Add:
"Most businesses lose patients at this stage. Speed and clarity here directly affect results."

---

6. WEEKLY ACTION PLAN

Create a simple routine:
- Monday: check ads
- Daily: respond to enquiries
- Mid-week: post content
- End of week: request reviews

---

7. TRACKING

Include:
- Enquiries
- Consultations
- Patients

Then:

"If results are low, check:"
- visibility
- trust
- conversion

---

8. SUMMARY

Provide:
- Goal
- Channel
- Budget
- Responsible person
- Review date

---

9. NEXT STEPS

Based on the plan, suggest 2–3 guides:

Rules:

Primary:
- Meta Ads → Run Facebook & Instagram Ads
- Google Ads → Show up on Google
- Existing Patients → Email Your Patients
- Local SEO → Get Found on Google

Support:
- Weak reviews/proof → Get More Reviews
- Weak visibility → Grow Your Following

Recommended:
- If Email not selected → Email Your Patients
- If Email selected → Get Found on Google

Limit to max 3.

No explanations.

---

STYLE:

- short sentences
- simple English
- no fluff
- practical tone

---

Return ONLY the full plan text.
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
      output = {
        plan: data.choices[0].message.content
      };
    } catch {
      output = {
        plan: "Error generating plan. Please try again."
      };
    }

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({ error: "Error generating marketing plan" });
  }
}
