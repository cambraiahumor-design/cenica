const axios = require('axios');

const IG_USER_ID = process.env.IG_USER_ID;
const IG_TOKEN   = process.env.IG_TOKEN;
const API        = 'https://graph.facebook.com/v19.0';

const IMAGE_URL = 'https://res.cloudinary.com/dag4aiqp5/image/upload/v1777052733/somoscenica/cartaz-square-v2.jpg';

const CAPTION = `Faltam 3 dias. ⚡

Se você ainda está na dúvida — esse é o sinal.

As vagas do Manual Humano estão acabando. Depois não tem "queria ter ido".

📅 22 de maio · 20h
📍 Teatro Torquato Neto · Teresina
🎟 Inteira R$ 100 | Meia R$ 50

👉 Link na bio para garantir o seu agora.

#ManualHumano #SomosCênica #UltimasVagas #PalestraTeresina #Teresina`;

(async () => {
  console.log('📸 Publicando no Instagram (19/mai — últimas vagas)...');

  if (!IG_USER_ID || !IG_TOKEN) {
    console.error('❌ Secrets IG_USER_ID ou IG_TOKEN ausentes.');
    process.exit(1);
  }

  const container = await axios.post(`${API}/${IG_USER_ID}/media`, {
    image_url: IMAGE_URL,
    caption: CAPTION,
    access_token: IG_TOKEN,
  });
  const containerId = container.data.id;
  console.log(`   📦 Container: ${containerId}`);

  await new Promise(r => setTimeout(r, 5000));

  const pub = await axios.post(`${API}/${IG_USER_ID}/media_publish`, {
    creation_id: containerId,
    access_token: IG_TOKEN,
  });
  console.log(`   ✅ Publicado! ID: ${pub.data.id}`);
})().catch(e => {
  const err = e.response?.data?.error;
  console.error('❌ Erro:', err?.message || e.message);
  process.exit(1);
});
