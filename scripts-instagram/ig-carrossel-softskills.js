const axios = require('axios');

const IG_USER_ID = process.env.IG_USER_ID;
const IG_TOKEN   = process.env.IG_TOKEN;
const API        = 'https://graph.facebook.com/v19.0';

const SLIDES = [
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-01.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-02.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-03.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-04.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-05.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-06.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-07.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-08.jpg',
  'https://res.cloudinary.com/dag4aiqp5/image/upload/somoscenica/carrossel-softskills-09.jpg',
];

const CAPTION = `O teatro treina o que nenhum curso consegue.

Você pode assistir a uma aula sobre comunicação.
Mas comunicar de verdade — com presença, escuta e confiança — só se aprende fazendo.

É por isso que usamos técnicas teatrais para desenvolver soft skills:

→ Comunicação que vai além das palavras
→ Presença que se sente antes de você falar
→ Empatia como prática, não como valor decorativo
→ Escuta ativa que muda a qualidade das relações
→ Confiança construída no processo, não prometida no certificado

Soft skills não se ensinam. Se vivem.

Salva esse carrossel pra compartilhar com o seu time ↓

📩 Quer levar essa experiência para a sua empresa? Link na bio.

#softskills #desenvolvimentoprofissional #liderança #teatroempresarial #treinamentocorporativo #habilidadescomportamentais #comunicação #presençaexecutiva #empatia #escutaativa #somoscênica #teatroeducacional #desenvolvimentohumano #RH #gestãodepessoas #culturaorganizacional #teambuilding #treinamento #comportamento #autoconhecimento`;

(async () => {
  console.log('🎭 Publicando carrossel no Instagram...');

  if (!IG_USER_ID || !IG_TOKEN) {
    console.error('❌ Secrets IG_USER_ID ou IG_TOKEN ausentes.');
    process.exit(1);
  }

  // 1. Criar container individual para cada slide
  const mediaIds = [];
  for (let i = 0; i < SLIDES.length; i++) {
    console.log(`   📸 Criando container slide ${i + 1}/${SLIDES.length}...`);
    const res = await axios.post(`${API}/${IG_USER_ID}/media`, {
      image_url: SLIDES[i],
      is_carousel_item: true,
      access_token: IG_TOKEN,
    });
    mediaIds.push(res.data.id);
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`   ✅ ${mediaIds.length} containers criados.`);

  // 2. Criar container do carrossel
  console.log('   📦 Criando container do carrossel...');
  const carousel = await axios.post(`${API}/${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    children: mediaIds.join(','),
    caption: CAPTION,
    access_token: IG_TOKEN,
  });
  const carouselId = carousel.data.id;
  console.log(`   📦 Carrossel: ${carouselId}`);

  await new Promise(r => setTimeout(r, 5000));

  // 3. Publicar
  console.log('   🚀 Publicando...');
  const pub = await axios.post(`${API}/${IG_USER_ID}/media_publish`, {
    creation_id: carouselId,
    access_token: IG_TOKEN,
  });
  console.log(`   ✅ Carrossel publicado! ID: ${pub.data.id}`);
})().catch(e => {
  const err = e.response?.data?.error;
  console.error('❌ Erro:', err?.message || e.message);
  process.exit(1);
});
