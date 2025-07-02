// This is a Vercel Serverless Function that acts as a secure proxy.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, lang, jsonSchema, type } = req.body;
  // IMPORTANT: The key is read from the server's environment, not the browser's.
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on the server' });
  }

  let apiUrl;
  let payload;

  if (type === 'image') {
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    payload = { instances: [{ prompt }], parameters: { sampleCount: 1 } };
  } else {
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const fullPrompt = `${prompt}. Respond in the ${lang || 'en'} language.`;
    payload = { contents: [{ role: "user", parts: [{ text: fullPrompt }] }] };
    if (jsonSchema) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
      };
    }
  }

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Google API Error:", errorBody);
        return res.status(apiResponse.status).json({ error: `Google API error: ${apiResponse.statusText}` });
    }

    const data = await apiResponse.json();
    
    if (type === 'image') {
        const imageUrl = data.predictions?.[0]?.bytesBase64Encoded 
            ? `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
            : 'https://placehold.co/600x400/1a202c/edf2f7?text=Image+Not+Available';
        res.status(200).json({ imageUrl });
    } else {
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0]) {
             const text = data.candidates[0].content.parts[0].text;
             const finalData = jsonSchema ? JSON.parse(text) : text;
             res.status(200).json(finalData);
        } else {
            res.status(500).json({ error: 'Unexpected response structure from Google API' });
        }
    }

  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
