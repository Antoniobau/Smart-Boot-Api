// Adds a new POST route to the express app at /api/:name
export function addDynamicRoute(app, name, code) {
  try {
    // Build a function from provided code. It must be an async function body.
    const handler = new Function('req', 'res', code);
    app.post(`/api/${name}`, async (req, res) => {
      try {
        // Allow the generated handler to be async
        const maybe = handler(req, res);
        if (maybe && typeof maybe.then === 'function') await maybe;
      } catch (err) {
        console.error('Error in dynamic handler:', err);
        res.status(500).json({ error: 'Error interno en handler dinámico' });
      }
    });
    console.log(`🧩 Ruta dinámica creada: /api/${name}`);
  } catch (err) {
    console.error('Error generando ruta dinámica:', err);
    throw err;
  }
}
