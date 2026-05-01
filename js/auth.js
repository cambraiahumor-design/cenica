const AUTH_KEY = 'cenica_auth';

const _USUARIO = {
  email: 'aluno@teste.com',
  senha: '1234',
  nome: 'Maria Santos',
  curso: 'Comunicação Autêntica',
  progresso: 65
};

function login(email, senha) {
  if (email.trim() === _USUARIO.email && senha === _USUARIO.senha) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      nome: _USUARIO.nome,
      email: _USUARIO.email,
      curso: _USUARIO.curso,
      progresso: _USUARIO.progresso
    }));
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  const inPages = window.location.pathname.includes('/pages/');
  window.location.href = inPages ? 'login.html' : 'pages/login.html';
}

function checkAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? 'login.html' : 'pages/login.html';
    return null;
  }
  return JSON.parse(raw);
}

function getAluno() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}
