import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function promptHidden(question) {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY || !stdin.setRawMode) {
    stdout.write(question);
    let value = "";
    for await (const chunk of stdin) value += chunk;
    return value.trimEnd();
  }

  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();

  return await new Promise((resolvePrompt) => {
    let value = "";

    function finish() {
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      stdin.off("data", onData);
      resolvePrompt(value);
    }

    function onData(buffer) {
      for (const code of buffer) {
        if (code === 3) {
          stdin.setRawMode(false);
          stdout.write("\n");
          process.exit(130);
        }

        if (code === 13 || code === 10) {
          finish();
          return;
        }

        if (code === 8 || code === 127) {
          value = value.slice(0, -1);
          continue;
        }

        value += Buffer.from([code]).toString("utf8");
      }
    }

    stdin.on("data", onData);
  });
}

const sourcePath = resolve(
  argValue("--source") ??
    join(scriptDir, "..", "Landing Page para_ Servicios y Obras Jorge Huerta", "Landing JH - export.html"),
);
const outPath = resolve(argValue("--out") ?? join(scriptDir, "index.html"));
const title = argValue("--title") ?? "Vista privada JH";
const iterations = Number.parseInt(argValue("--iterations") ?? "250000", 10);

if (!existsSync(sourcePath)) {
  throw new Error(`No encuentro el HTML de origen: ${sourcePath}`);
}

const password = process.env.PREVIEW_PASSWORD || await promptHidden("Clave para proteger la vista: ");

if (!password || password.length < 10) {
  throw new Error("Usa una clave de al menos 10 caracteres.");
}

const html = readFileSync(sourcePath, "utf8");
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([
  cipher.update(html, "utf8"),
  cipher.final(),
  cipher.getAuthTag(),
]);

const payload = {
  v: 1,
  kdf: "PBKDF2",
  hash: "SHA-256",
  cipher: "AES-GCM",
  iterations,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  data: encrypted.toString("base64"),
};

const protectedHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --ink: #0a1330;
      --ink-2: #101b3d;
      --gold: #d6b46a;
      --bone: #f5f0e6;
      --muted: #b7ad98;
      --line: rgba(214, 180, 106, 0.24);
      --danger: #ffb4a8;
    }

    * { box-sizing: border-box; }

    html, body { min-height: 100%; }

    body {
      margin: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at 70% 20%, rgba(214, 180, 106, 0.20), transparent 34%),
        linear-gradient(140deg, var(--ink), #060b1d 72%);
      color: var(--bone);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    main {
      width: min(100%, 420px);
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(16, 27, 61, 0.82);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
      padding: 28px;
    }

    .mark {
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
      border: 1px solid var(--line);
      border-radius: 50%;
      color: var(--gold);
      font-family: Georgia, serif;
      font-size: 25px;
      font-style: italic;
      margin-bottom: 22px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      line-height: 1.12;
      font-weight: 650;
      letter-spacing: 0;
    }

    p {
      margin: 0 0 22px;
      color: var(--muted);
      line-height: 1.55;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: var(--bone);
      font-size: 14px;
      font-weight: 600;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
    }

    input, button {
      min-height: 48px;
      border-radius: 6px;
      font: inherit;
    }

    input {
      width: 100%;
      border: 1px solid var(--line);
      background: rgba(10, 19, 48, 0.86);
      color: var(--bone);
      padding: 0 14px;
      outline: none;
    }

    input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(214, 180, 106, 0.14);
    }

    button {
      border: 0;
      background: linear-gradient(180deg, #e5c777, #b88d37);
      color: #10101a;
      font-weight: 700;
      padding: 0 18px;
      cursor: pointer;
    }

    button:disabled {
      cursor: wait;
      opacity: 0.72;
    }

    #status {
      min-height: 20px;
      margin: 14px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    #status.error { color: var(--danger); }

    @media (max-width: 420px) {
      body { padding: 16px; }
      main { padding: 22px; }
      .row { grid-template-columns: 1fr; }
      button { width: 100%; }
    }
  </style>
</head>
<body>
  <main>
    <div class="mark" aria-hidden="true">JH</div>
    <h1>Vista privada</h1>
    <p>Introduce la clave para abrir la pagina de prueba en este dispositivo.</p>
    <form id="unlock-form">
      <label for="password">Clave</label>
      <div class="row">
        <input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
        <button id="unlock" type="submit">Entrar</button>
      </div>
      <p id="status" role="status" aria-live="polite"></p>
    </form>
  </main>

  <script>
    const encryptedPage = ${JSON.stringify(payload)};
    const form = document.getElementById("unlock-form");
    const passwordInput = document.getElementById("password");
    const button = document.getElementById("unlock");
    const status = document.getElementById("status");

    function bytesFromBase64(value) {
      const binary = atob(value);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return bytes;
    }

    async function decryptHtml(password) {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: encryptedPage.kdf },
        false,
        ["deriveKey"],
      );
      const key = await crypto.subtle.deriveKey(
        {
          name: encryptedPage.kdf,
          salt: bytesFromBase64(encryptedPage.salt),
          iterations: encryptedPage.iterations,
          hash: encryptedPage.hash,
        },
        keyMaterial,
        { name: encryptedPage.cipher, length: 256 },
        false,
        ["decrypt"],
      );
      const clear = await crypto.subtle.decrypt(
        { name: encryptedPage.cipher, iv: bytesFromBase64(encryptedPage.iv) },
        key,
        bytesFromBase64(encryptedPage.data),
      );
      return new TextDecoder("utf-8").decode(clear);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.className = "";
      status.textContent = "Abriendo vista privada...";
      button.disabled = true;

      try {
        const html = await decryptHtml(passwordInput.value);
        document.open();
        document.write(html);
        document.close();
      } catch (error) {
        status.className = "error";
        status.textContent = "Clave incorrecta o navegador incompatible.";
        button.disabled = false;
        passwordInput.select();
      }
    });
  </script>
</body>
</html>
`;

writeFileSync(outPath, protectedHtml, "utf8");
writeFileSync(join(dirname(outPath), "404.html"), protectedHtml, "utf8");
console.log(`Pagina protegida generada en ${outPath}`);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
