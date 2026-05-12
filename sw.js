<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Gerador de Ícones PWA</title>
<style>
body{font-family:system-ui,sans-serif;padding:2rem;background:#f5f5f0;max-width:600px;margin:0 auto}
h1{font-size:20px;margin-bottom:1rem}
p{font-size:14px;color:#666;margin-bottom:1.5rem;line-height:1.6}
button{padding:.7rem 1.4rem;background:#e8a020;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:1rem}
button:hover{background:#d4901a}
.grid{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}
.grid a{background:#fff;border-radius:8px;padding:.4rem .7rem;font-size:12px;color:#444;text-decoration:none;border:1px solid #ddd}
.grid a:hover{border-color:#e8a020;color:#e8a020}
canvas{display:none}
.info{background:#d4edda;color:#155724;padding:.7rem 1rem;border-radius:8px;font-size:13px;margin-top:.8rem;display:none}
</style>
</head>
<body>
<h1>🎨 Gerador de Ícones PWA</h1>
<p>Este utilitário gera todos os ícones necessários para o PWA do restaurante.<br>
Clique em <b>Gerar Ícones</b>, depois baixe cada um e salve na pasta <code>icons/</code> do projeto.</p>
<button onclick="gerar()">🖼️ Gerar e Baixar Todos os Ícones</button>
<div class="info" id="info">✅ Ícones gerados! Salve-os na pasta <code>icons/</code> do projeto.</div>
<div class="grid" id="links"></div>
<canvas id="cv"></canvas>

<script>
const TAMANHOS = [72, 96, 128, 144, 152, 192, 384, 512];

function gerarIcone(size) {
  const cv = document.getElementById('cv');
  cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d');

  // Fundo gradiente
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#e8a020');
  grad.addColorStop(1, '#c47a10');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();

  // Emoji 🍽️
  const fs = Math.floor(size * 0.52);
  ctx.font = `${fs}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍽️', size / 2, size / 2 + size * 0.03);

  return cv.toDataURL('image/png');
}

function gerar() {
  const links = document.getElementById('links');
  links.innerHTML = '';

  TAMANHOS.forEach(size => {
    const dataURL = gerarIcone(size);
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `icon-${size}.png`;
    a.textContent = `⬇ icon-${size}.png`;
    links.appendChild(a);

    // Auto-download
    const tmp = document.createElement('a');
    tmp.href = dataURL;
    tmp.download = `icon-${size}.png`;
    document.body.appendChild(tmp);
    tmp.click();
    document.body.removeChild(tmp);
  });

  // Screenshot placeholders
  ['screenshot-wide', 'screenshot-narrow'].forEach(name => {
    const cv2 = document.createElement('canvas');
    cv2.width  = name.includes('wide') ? 1280 : 390;
    cv2.height = name.includes('wide') ? 720  : 844;
    const ctx2 = cv2.getContext('2d');
    ctx2.fillStyle = '#f5f5f0';
    ctx2.fillRect(0, 0, cv2.width, cv2.height);
    ctx2.fillStyle = '#e8a020';
    ctx2.fillRect(0, 0, cv2.width, 80);
    ctx2.fillStyle = '#fff';
    ctx2.font = 'bold 32px sans-serif';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.fillText('🍽️ Sistema Restaurante', cv2.width/2, 40);

    const dataURL2 = cv2.toDataURL('image/png');
    const a2 = document.createElement('a');
    a2.href = dataURL2; a2.download = `${name}.png`; a2.textContent = `⬇ ${name}.png`;
    links.appendChild(a2);
  });

  document.getElementById('info').style.display = 'block';
}
</script>
</body>
</html>
