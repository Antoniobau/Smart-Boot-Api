import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { addDynamicRoute } from './utils/dynamicRouter.js';
import { generateApiCode } from './ai/codeGenerator.js';
import { initDb, saveApiMeta, listApis } from './services/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

// Static panel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/panel', express.static(path.join(__dirname, 'public')));

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Smart Bot API', version: '1.0.0' },
  },
  apis: ['./server.js'], // minimal - dynamic endpoints won't be auto-documented here
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/', (req, res) => res.send('🤖 Smart Bot API activo'));

// List created APIs (from DB)
app.get('/api/list', async (req, res) => {
  try {
    const items = await listApis();
    res.json({ apis: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to create new API from instruction
app.post('/create-api', async (req, res) => {
  const { instruction } = req.body;
  if (!instruction) return res.status(400).json({ error: 'Falta field: instruction' });
  try {
    const { name, code, example } = await generateApiCode(instruction);
    addDynamicRoute(app, name, code);
    await saveApiMeta({ name, instruction, example });
    res.json({ message: `✅ API creada: /api/${name}`, endpoint: `/api/${name}`, example });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize DB and Telegram
const start = async () => {
  await initDb();
  // Telegram bot (optional)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token) {
    const bot = new TelegramBot(token, { polling: true });
    bot.onText(/\/create (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const instruction = match[1];
      try {
        const { name, code, example } = await generateApiCode(instruction);
        addDynamicRoute(app, name, code);
        await saveApiMeta({ name, instruction, example });
        bot.sendMessage(chatId, `✅ API creada: /api/${name}\nEjemplo: ${example}`);
      } catch (err) {
        bot.sendMessage(chatId, `Error: ${err.message}`);
      }
    });
    console.log('🤖 Telegram integrado: comandos con /create <instrucción>');
  } else {
    console.log('⚠️ TELEGRAM_BOT_TOKEN no definido; salto integración Telegram');
  }

  app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
};

start();
