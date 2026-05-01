/* ── Nav scroll ── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Hamburger ── */
function toggleMenu() {
  const btn  = document.querySelector('.nav-hamburger');
  const menu = document.querySelector('.nav-mobile-menu');
  if (!btn || !menu) return;
  const open = menu.classList.toggle('open');
  btn.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
}

/* ── Modal ── */
let _cursoId = null;

function openModal(id) {
  _cursoId = id;
  const curso = getCursoById(id);
  if (!curso) return;
  const overlay = document.getElementById('modal-overlay');
  const nameEl  = document.getElementById('modal-curso-name');
  if (!overlay) return;
  if (nameEl) nameEl.textContent = curso.nome + ' · R$ ' + curso.preco.toLocaleString('pt-BR');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  _cursoId = null;
}

function _handleInscricao(e) {
  e.preventDefault();
  if (!_cursoId) return;
  const f = e.target;
  localStorage.setItem('cenica_checkout', JSON.stringify({
    nome:      f.querySelector('[name=nome]').value,
    email:     f.querySelector('[name=email]').value,
    whatsapp:  f.querySelector('[name=whatsapp]').value,
    cursoId:   _cursoId
  }));
  const inPages = window.location.pathname.includes('/pages/');
  window.location.href = (inPages ? '' : 'pages/') + 'checkout.html?curso=' + _cursoId;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  /* modal overlay close */
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    const form = document.getElementById('form-inscricao');
    if (form) form.addEventListener('submit', _handleInscricao);
  }

  /* render cursos if present */
  if (document.getElementById('cursos-grid')) renderCursos();

  /* page-specific */
  const page = document.body.dataset.page;
  if (page === 'checkout')   initCheckout();
  if (page === 'area-aluno') initAreaAluno();
  if (page === 'login')      _setupLogin();
});

/* ── Login page ── */
function _setupLogin() {
  const form = document.getElementById('form-login');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('[name=email]').value;
    const senha = form.querySelector('[name=senha]').value;
    const err   = document.getElementById('login-error');
    if (login(email, senha)) {
      window.location.href = 'area-aluno.html';
    } else {
      if (err) err.style.display = 'block';
      form.querySelector('[name=senha]').value = '';
    }
  });
}

/* ── Área do Aluno ── */
function initAreaAluno() {
  const aluno = checkAuth();
  if (!aluno) return;
  const el = id => document.getElementById(id);
  if (el('aluno-nome'))    el('aluno-nome').textContent    = aluno.nome.split(' ')[0];
  if (el('aluno-curso'))   el('aluno-curso').textContent   = aluno.curso;
  if (el('prog-pct'))      el('prog-pct').textContent      = aluno.progresso + '%';
  setTimeout(() => {
    const fill = el('progress-fill');
    if (fill) fill.style.width = aluno.progresso + '%';
  }, 300);
  if (aluno.progresso >= 100 && el('btn-certificado')) {
    el('btn-certificado').style.display = 'block';
  }
}

/* ── Checkout ── */
function initCheckout() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('curso') || (JSON.parse(localStorage.getItem('cenica_checkout') || '{}').cursoId);
  const curso  = getCursoById(id);

  /* populate resumo */
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  if (curso) {
    set('#resumo-nome',  curso.nome);
    set('#resumo-preco', 'R$ ' + curso.preco.toLocaleString('pt-BR'));
    set('#resumo-carga', curso.carga + ' · ' + curso.dias);
    set('#resumo-datas', curso.datas);
    set('#resumo-vagas', curso.vagas + ' vagas');
    _updateTotal(curso.preco, 'pix');
  }

  /* pagamento options */
  document.querySelectorAll('.pgto-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.pgto-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
      const tipo = opt.dataset.tipo;
      _showPagamento(tipo);
      if (curso) _updateTotal(curso.preco, tipo);
    });
  });

  /* form submit */
  const form = document.getElementById('form-checkout');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      document.getElementById('checkout-form-wrap').style.display = 'none';
      const conf = document.getElementById('confirmacao');
      if (conf) {
        conf.classList.add('show');
        if (curso) {
          const tipo = (document.querySelector('.pgto-opt.selected') || {}).dataset?.tipo || 'pix';
          const preco = tipo === 'pix' ? Math.round(curso.preco * .95) : curso.preco;
          document.getElementById('conf-nome')?.let?.(el => el.textContent = form.querySelector('[name=nome]')?.value);
          set('#conf-curso',  curso.nome);
          set('#conf-preco',  'R$ ' + preco.toLocaleString('pt-BR'));
          set('#conf-metodo', tipo === 'pix' ? 'Pix (5% desc.)' : tipo === 'cartao' ? 'Cartão de crédito' : 'Boleto');
        }
      }
    });
  }
  /* init first option selected */
  const first = document.querySelector('.pgto-opt');
  if (first) { first.classList.add('selected'); first.querySelector('input').checked = true; }
  _showPagamento('pix');
}

function _showPagamento(tipo) {
  ['pix','cartao','boleto'].forEach(t => {
    const el = document.getElementById('pgto-' + t);
    if (el) el.style.display = t === tipo ? 'block' : 'none';
  });
}

function _updateTotal(preco, tipo) {
  const final = tipo === 'pix' ? Math.round(preco * .95) : preco;
  const el = document.getElementById('resumo-total-val');
  if (el) el.textContent = 'R$ ' + final.toLocaleString('pt-BR') + (tipo === 'pix' ? ' (5% off)' : '');
}

/* util */
function simulaDownload(btn) {
  const orig = btn.textContent;
  btn.textContent = '✓ Baixado';
  btn.style.cssText = 'background:rgba(30,120,60,.1);border-color:rgba(30,120,60,.25);color:#2a9a4f;';
  setTimeout(() => { btn.textContent = orig; btn.style.cssText = ''; }, 2000);
}

function downloadCertificado() {
  alert('🎓 Certificado gerado! Em produção, o PDF seria baixado automaticamente.');
}
