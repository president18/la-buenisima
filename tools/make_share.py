"""Genera un link temporal (24 h por defecto) del sitio de la liga en v/<código>/.
Uso: python3 tools/make_share.py [horas]"""
import os, re, sys, secrets, time, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Uso: make_share.py [horas]  ó  make_share.py --refresh CODIGO EXPIRA_MS (regenera uno existente sin cambiar link ni vencimiento)
if len(sys.argv) > 3 and sys.argv[1] == "--refresh":
    code, expires = sys.argv[2], int(sys.argv[3])
else:
    hours = float(sys.argv[1]) if len(sys.argv) > 1 else 24
    code = secrets.token_urlsafe(6).replace("-", "x").replace("_", "y")
    expires = int((time.time() + hours * 3600) * 1000)
src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
# rutas relativas hacia la raíz
src = re.sub(r'(href|src)="(?!https?:|data:|#)([^"]+)"', lambda m: f'{m.group(1)}="../../{m.group(2)}"', src)
src = src.replace('<link rel="manifest" href="../../manifest.webmanifest">', "")
src = src.replace("<head>", '<head>\n<meta name="robots" content="noindex,nofollow">', 1)
# los scripts solo se cargan si el link sigue vigente
scripts = re.findall(r'<script src="([^"]+)"></script>', src)
src = re.sub(r'<script src="[^"]+"></script>\n?', "", src)
loader = f"""<script>
(function(){{
  window.LB_BASE = '../../';
  var EXP = {expires};
  if (Date.now() > EXP) {{
    document.getElementById('loading').innerHTML = '<div><div style="color:#2F5D50"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><h2 style="font-weight:300;letter-spacing:.14em;color:#E85A4F">LINK EXPIRADO</h2><p>Este link de La Buenísima ya no está disponible. Pídele uno nuevo al comisionado.</p></div>';
    return;
  }}
  var list = {json.dumps(scripts)};
  (function next(i){{ if (i >= list.length) {{ document.dispatchEvent(new Event('DOMContentLoaded')); return; }} var s = document.createElement('script'); s.src = list[i]; s.onload = function(){{ next(i + 1); }}; document.body.appendChild(s); }})(0);
}})();
</script>
"""
src = src.replace("</body>", loader + "</body>")
out = os.path.join(ROOT, "v", code)
os.makedirs(out, exist_ok=True)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(src)
print(json.dumps({"code": code, "path": f"v/{code}/", "expires_ms": expires}))
