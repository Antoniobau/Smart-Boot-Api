import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generates a handler function code string and an example curl
export async function generateApiCode(instruction) {
  const prompt = `Escribe solo el cuerpo de una función async para Express con la forma:
async function(req, res) { ... }
Que implemente la siguiente instrucción: "${instruction}"
La función debe procesar JSON recibido en req.body y devolver JSON.
Añade pocos comentarios y asegúrate que responde con res.json(...).
Envuelve llamadas externas con try/catch y errores con status 500.
Devuelve también una línea con un ejemplo curl separado por la cadena "###EXAMPLE###".`;

  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
  });

  const text = resp.choices[0].message.content;
  // Try to split example
  let code = text;
  let example = '';
  if (text.includes('###EXAMPLE###')) {
    const parts = text.split('###EXAMPLE###');
    code = parts[0].trim();
    example = parts[1].trim();
  }

  // strip code fences if present
  code = code.replace(/```(?:js|javascript)?/g, '').replace(/```/g, '').trim();

  // name generation
  const name = 'api_' + Math.random().toString(36).substring(2,9);

  return { name, code, example: example || `curl -X POST http://localhost:3000/api/${name} -H "Content-Type: application/json" -d '{"prompt":"ejemplo"}'` };
}
