export default async function handler(req, res) {
  try {
    const { service, result, offer } = req.body;

    const prompt = `
Create 3 high-converting ads for:

Service: ${service}
Result: ${result}
Offer: ${offer}

Return JSON only in this format:
{
  "ads": [
    { "headline": "...", "text": "...", "cta": "..." }
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

    res.status(200).json(output);

  } catch (error) {
    res.status(500).json({ error: "Error generating ads" });
  }
}
