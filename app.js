# 🍽️ Sistema Restaurante — PWA + Supabase + GitHub Pages

## Visão geral

| Componente | Tecnologia | Custo |
|---|---|---|
| Hospedagem (arquivos) | GitHub Pages | **Grátis** |
| Banco de dados + Realtime | Supabase | **Grátis** até 500 MB |
| Keep-alive automático | cron-job.org | **Grátis** |
| App instalável | PWA (manifest + SW) | **Grátis** |

---

## PASSO 1 — Criar projeto no Supabase

1. Acesse **supabase.com** → crie conta grátis
2. Clique em **New Project** → dê um nome (ex: `restaurante`)
3. Aguarde o projeto iniciar (~2 min)
4. Vá em **SQL Editor** → **New Query**
5. Cole todo o conteúdo do arquivo `supabase-setup.sql`
6. Clique em **Run** ✅

### Pegar suas credenciais:
- Vá em **Project Settings → API**
- Copie:
  - **Project URL** → ex: `https://abcxyz.supabase.co`
  - **anon public key** → começa com `eyJhbGciO...`

---

## PASSO 2 — Configurar o arquivo app.js

Abra `app.js` e edite as linhas:

```javascript
const CFG = {
  url: localStorage.getItem('sb_url') || 'https://SEU-PROJETO.supabase.co',  // ← cole aqui
  key: localStorage.getItem('sb_key') || 'SUA-ANON-KEY'                       // ← cole aqui
};
```

> **Alternativa sem editar código:** deixe como está e configure pelo app.
> Na tela de login, clique em "⚙️ Configurar conexão Supabase" e cole os valores.
> Eles são salvos no localStorage do dispositivo.

---

## PASSO 3 — Gerar os ícones do PWA

1. Abra o arquivo `gerar-icones.html` no seu navegador (duplo-clique)
2. Clique em **Gerar e Baixar Todos os Ícones**
3. Crie a pasta `icons/` dentro do projeto
4. Mova todos os arquivos `.png` baixados para `icons/`

---

## PASSO 4 — Subir no GitHub Pages

### 4a. Criar repositório no GitHub
1. Acesse **github.com** → crie conta grátis
2. Clique em **New repository**
3. Nome: `restaurante` (ou qualquer nome)
4. Marque **Public** (obrigatório para GitHub Pages grátis)
5. Clique em **Create repository**

### 4b. Fazer upload dos arquivos
**Opção fácil (pelo site):**
1. No repositório criado, clique em **Add file → Upload files**
2. Arraste TODOS os arquivos do projeto (incluindo a pasta `icons/`)
3. Clique em **Commit changes**

**Opção com Git (se tiver instalado):**
```bash
cd restaurante-pwa
git init
git add .
git commit -m "Sistema restaurante v1"
git remote add origin https://github.com/SEU-USUARIO/restaurante.git
git push -u origin main
```

### 4c. Ativar GitHub Pages
1. No repositório, vá em **Settings → Pages**
2. Em **Source**, selecione: `Deploy from a branch`
3. Branch: `main` / Folder: `/ (root)`
4. Clique em **Save**
5. Aguarde ~2 minutos
6. Sua URL será: `https://SEU-USUARIO.github.io/restaurante`

---

## PASSO 5 — Configurar Keep-alive no cron-job.org

O Supabase pausa projetos gratuitos sem uso por 7 dias. O cron mantém ativo.

1. Acesse **cron-job.org** → crie conta grátis
2. Clique em **Create cronjob**
3. Configure:
   - **URL:** `https://SEU-PROJETO.supabase.co/rest/v1/keepalive?select=id&limit=1`
   - **Headers:** adicione dois:
     - `apikey` = sua anon key
     - `Authorization` = `Bearer SUA-ANON-KEY`
   - **Schedule:** Every 5 days (ou use o cron: `0 12 */5 * *`)
4. Clique em **Create** ✅

> O sistema também faz ping automático via Service Worker (Periodic Background Sync)
> quando o app está instalado no Android/Chrome, como camada extra de proteção.

---

## PASSO 6 — Instalar como App PWA

### No Android (Chrome):
1. Abra `https://SEU-USUARIO.github.io/restaurante/login.html`
2. Aparecerá o banner **"Instale o app"** — toque em **Instalar**
3. Ou: menu (⋮) → **Adicionar à tela inicial**
4. O app aparece como ícone no Android, sem barra do Chrome ✅

### No iOS (Safari):
1. Abra a URL no Safari
2. Toque em **Compartilhar** (ícone de caixinha com seta)
3. Toque em **Adicionar à Tela de Início**
4. Confirme — aparece como app ✅

### No Desktop (Chrome/Edge):
1. Acesse a URL
2. Clique no ícone de instalação na barra de endereço (📲)
3. Confirme — abre sem barra de navegador ✅

---

## URLs do sistema (substitua pelos seus dados)

| Acesso | URL |
|---|---|
| **Login** | `https://SEU-USUARIO.github.io/restaurante/login.html` |
| **Mesa (QR Code)** | `https://SEU-USUARIO.github.io/restaurante/mesa.html?mesa=5` |
| **Painel Garçom** | `https://SEU-USUARIO.github.io/restaurante/painel.html` |
| **Cozinha** | `https://SEU-USUARIO.github.io/restaurante/cozinha.html` |
| **Configurações** | `https://SEU-USUARIO.github.io/restaurante/config.html` |

> O parâmetro `?mesa=5` na URL da mesa pré-seleciona a mesa no QR Code.
> Gere um QR Code diferente para cada mesa em **qr-code-generator.com**

---

## Usuários padrão

| Usuário | Senha | Acesso |
|---|---|---|
| admin | 1234 | Painel + Configurações |
| garcom1 | 1234 | Painel do garçom |
| cozinha1 | 1234 | Painel da cozinha |

---

## Estrutura de arquivos

```
restaurante-pwa/
├── login.html          ← tela de login
├── painel.html         ← painel do garçom/admin
├── mesa.html           ← cardápio do cliente
├── cozinha.html        ← painel da cozinha
├── config.html         ← configurações (só admin)
├── app.js              ← lógica compartilhada + Supabase client
├── sw.js               ← Service Worker (cache + keep-alive)
├── manifest.json       ← manifesto PWA
├── supabase-setup.sql  ← script do banco (execute no Supabase)
├── gerar-icones.html   ← utilitário para gerar ícones
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    ├── icon-512.png
    ├── screenshot-wide.png
    └── screenshot-narrow.png
```
