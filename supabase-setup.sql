// ─── CONFIGURAÇÃO SUPABASE ────────────────────────────────────────────────────
// Substitua pelos seus valores em: supabase.com → Project Settings → API
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_KEY = 'SUA-ANON-KEY-PUBLICA';

// ─── CLIENTE SUPABASE (via CDN, sem Node.js) ──────────────────────────────────
// Importado nos HTMLs como: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
let _sb = null;
function getSB() {
  if (!_sb) _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
async function login(nome, senha) {
  const sb = getSB();
  const { data, error } = await sb
    .from('usuarios')
    .select('id, nome, perfil, ativo')
    .eq('nome', nome)
    .eq('senha', senha)
    .eq('ativo', true)
    .single();
  if (error || !data) throw new Error('Usuário ou senha inválidos');
  return data;
}

async function verificarSenha(id, senha) {
  const sb = getSB();
  const { data } = await sb.from('usuarios').select('id').eq('id', id).eq('senha', senha).single();
  return !!data;
}

function salvarSessao(usuario) { sessionStorage.setItem('usuario', JSON.stringify(usuario)); }
function getSessao() {
  const u = sessionStorage.getItem('usuario');
  return u ? JSON.parse(u) : null;
}
function checarAuth(perfilPermitido) {
  const u = getSessao();
  if (!u) { location.href = '/login.html'; return null; }
  if (perfilPermitido && !perfilPermitido.includes(u.perfil)) { location.href = '/login.html'; return null; }
  return u;
}
function sair() { sessionStorage.clear(); location.href = '/login.html'; }

// ─── KEEP-ALIVE (ping ao Supabase a cada 5 dias via Service Worker) ───────────
// Registrado no SW, não precisa de cron externo para manter sessão ativa
async function keepAlive() {
  const sb = getSB();
  await sb.from('keepalive').select('id').limit(1);
}
