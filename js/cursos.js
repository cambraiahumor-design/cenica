const CURSOS = [
  {
    id: 1,
    nome: 'Comunicação Autêntica',
    desc: 'Desenvolva voz, presença e clareza nas relações interpessoais com técnicas teatrais práticas.',
    datas: '17 e 18 de maio',
    carga: '8h',
    dias: '2 dias',
    preco: 490,
    vagas: 12,
    destaque: false,
    badge: 'Mais procurado'
  },
  {
    id: 2,
    nome: 'Empatia em Ação',
    desc: 'Escuta ativa, leitura emocional e conexão genuína para construir relacionamentos que importam.',
    datas: '24 e 25 de maio',
    carga: '8h',
    dias: '2 dias',
    preco: 490,
    vagas: 10,
    destaque: false,
    badge: null
  },
  {
    id: 3,
    nome: 'Liderança pelo Palco',
    desc: 'Improviso, autoridade presencial e gestão de conflitos com as ferramentas do teatro corporativo.',
    datas: '7, 8, 14 e 15 de junho',
    carga: '16h',
    dias: '4 dias',
    preco: 690,
    vagas: 8,
    destaque: false,
    badge: 'Novo'
  },
  {
    id: 4,
    nome: 'Programa Completo',
    desc: '3 meses de imersão nos 4 pilares. Metodologia completa com certificado e acompanhamento individual.',
    datas: 'Início: 1º de junho',
    carga: '48h',
    dias: 'mensal',
    preco: 1890,
    vagas: 6,
    destaque: true,
    badge: 'Transformação total'
  }
];

function renderCursos() {
  const el = document.getElementById('cursos-grid');
  if (!el) return;
  el.innerHTML = CURSOS.map(c => `
    <div class="curso-card${c.destaque ? ' destaque' : ''}">
      ${c.badge ? `<span class="curso-badge">${c.badge}</span>` : ''}
      <h3 class="curso-nome">${c.nome}</h3>
      <p class="curso-desc">${c.desc}</p>
      <div class="curso-meta">
        <span class="curso-meta-item">📅 ${c.datas}</span>
        <span class="curso-meta-item">⏱ ${c.carga} · ${c.dias}</span>
        <span class="curso-meta-item">👥 ${c.vagas} vagas restantes</span>
      </div>
      <div class="curso-divider"></div>
      <div>
        <div class="curso-preco">R$ ${c.preco.toLocaleString('pt-BR')}</div>
        <div class="curso-parcel">ou 3x de R$ ${Math.ceil(c.preco/3).toLocaleString('pt-BR')}</div>
      </div>
      <button class="btn-primary" onclick="openModal(${c.id})" style="width:100%;justify-content:center;">
        Inscrever-se →
      </button>
    </div>
  `).join('');
}

function getCursoById(id) {
  return CURSOS.find(c => c.id === +id) || null;
}
