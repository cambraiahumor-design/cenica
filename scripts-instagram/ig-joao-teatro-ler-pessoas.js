const axios = require('axios');

const IG_USER_ID = process.env.IG_USER_ID;
const IG_TOKEN   = process.env.IG_TOKEN;
const EXPECTED   = 'joaocambraia';
const API        = 'https://graph.facebook.com/v19.0';
const BRANCH     = process.env.BRANCH || 'post/joao-teatro-ler-pessoas';
const BASE       = `https://raw.githubusercontent.com/cambraiahumor-design/cenica/${BRANCH}/posts/joao-teatro-ler-pessoas`;

const SLIDES = Array.from({ length: 8 }, (_, i) => `${BASE}/slide_${String(i + 1).padStart(2, '0')}.jpg`);

const CAPTION = `Antes do palco, eu ouvia palavras. Depois do teatro, comecei a ler pessoas. 🎭

Não é adivinhação, nem truque de linguagem corporal. É atenção: ao que a pessoa quer, ao que ela não diz e ao momento em que algo muda nela.

Qual dessas 4 lições mais fez sentido pra você? Me conta nos comentários 👇

#teatro #linguagemcorporal #comunicação #lerpessoas #inteligenciaemocional #somoscenica #fortaleza`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  if (!IG_USER_ID || !IG_TOKEN) {
    console.error('❌ Secrets JOAO_IG_ID / JOAO_IG_TOKEN ausentes. Nada foi publicado.');
    process.exit(1);
  }

  // Trava de segurança: só publica se a conta for @joaocambraia
  const me = await axios.get(`${API}/${IG_USER_ID}`, { params: { fields: 'username', access_token: IG_TOKEN } });
  console.log(`👤 Conta: @${me.data.username}`);
  if (me.data.username !== EXPECTED) {
    console.error(`❌ Conta inesperada (@${me.data.username}). Esperado @${EXPECTED}. Nada foi publicado.`);
    process.exit(1);
  }

  const ids = [];
  for (const [i, url] of SLIDES.entries()) {
    const r = await axios.post(`${API}/${IG_USER_ID}/media`, { image_url: url, is_carousel_item: true, access_token: IG_TOKEN });
    ids.push(r.data.id);
    console.log(`   📸 Slide ${i + 1}/${SLIDES.length}: ${r.data.id}`);
    await sleep(1000);
  }

  const c = await axios.post(`${API}/${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL', children: ids.join(','), caption: CAPTION, access_token: IG_TOKEN,
  });

  for (let i = 0; i < 24; i++) {
    const s = await axios.get(`${API}/${c.data.id}`, { params: { fields: 'status_code', access_token: IG_TOKEN } });
    if (s.data.status_code === 'FINISHED') break;
    if (s.data.status_code === 'ERROR') throw new Error('Container com erro no processamento');
    await sleep(5000);
  }

  const pub = await axios.post(`${API}/${IG_USER_ID}/media_publish`, { creation_id: c.data.id, access_token: IG_TOKEN });
  const link = await axios.get(`${API}/${pub.data.id}`, { params: { fields: 'permalink', access_token: IG_TOKEN } }).catch(() => null);
  console.log(`✅ Publicado! ID: ${pub.data.id} ${link?.data?.permalink || ''}`);
})().catch(e => {
  console.error('❌ Erro:', e.response?.data?.error?.message || e.message);
  process.exit(1);
});
