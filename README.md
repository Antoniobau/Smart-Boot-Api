# smart-bot-api

Proyecto: Bot inteligente que genera APIs dinámicas, guarda metadata en Neon (Postgres),
expone documentación automática (Swagger), un panel web para ver y probar APIs, y control por Telegram.

## Pasos rápidos

1. Copia `.env.example` a `.env` y completa las variables.
2. `npm install`
3. `npm run dev`
4. Panel: `http://localhost:3000/panel`
5. Crear API (ejemplo):
   ```
   curl -X POST http://localhost:3000/create-api \
     -H "Content-Type: application/json" \
     -d '{"instruction":"crear una api que devuelva una pista musical con prompt recibido"}'
   ```

## Estructura
- server.js: servidor Express principal
- ai/codeGenerator.js: usa OpenAI para generar la función handler
- utils/dynamicRouter.js: añade rutas a Express en tiempo real
- services/db.js: conexión con Neon (Postgres)
- public/panel.html: panel web para listar y probar APIs
- .env.example: variables de entorno
