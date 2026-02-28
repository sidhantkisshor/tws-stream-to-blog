#!/usr/bin/env node
// Updates LOCAL_API_TUNNEL_URL on the N8N VPS via SSH
// Usage: node update-tunnel-url.js <tunnel-url>
//
// Reads VPS credentials from .env.tunnel in the same directory.

const path = require("path");
const fs = require("fs");

const tunnelUrl = process.argv[2];
if (!tunnelUrl) {
  console.error("Usage: node update-tunnel-url.js <tunnel-url>");
  process.exit(1);
}

// Load .env.tunnel
const envFile = path.join(__dirname, ".env.tunnel");
if (!fs.existsSync(envFile)) {
  console.error(`Missing ${envFile} — create it with VPS_HOST, VPS_USER, VPS_PASS, N8N_URL`);
  process.exit(1);
}
const env = {};
fs.readFileSync(envFile, "utf8")
  .split("\n")
  .filter((l) => l.trim() && !l.startsWith("#"))
  .forEach((l) => {
    const [k, ...v] = l.split("=");
    env[k.trim()] = v.join("=").trim();
  });

const VPS_HOST = env.VPS_HOST;
const VPS_USER = env.VPS_USER;
const VPS_PASS = env.VPS_PASS;
const N8N_URL = env.N8N_URL || "https://n8n.srv1104529.hstgr.cloud";
const COMPOSE_FILE = "/root/docker-compose.yml";

async function main() {
  let Client;
  try {
    ({ Client } = require("ssh2"));
  } catch {
    console.error("ssh2 not installed. Run: npm install ssh2");
    process.exit(1);
  }

  const conn = new Client();

  function exec(cmd) {
    return new Promise((resolve, reject) => {
      conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);
        let out = "", errOut = "";
        stream.on("data", (d) => (out += d));
        stream.stderr.on("data", (d) => (errOut += d));
        stream.on("close", (code) => resolve({ out: out.trim(), err: errOut.trim(), code }));
      });
    });
  }

  return new Promise((resolve) => {
    conn.on("ready", async () => {
      try {
        const { out: content } = await exec(`cat ${COMPOSE_FILE}`);

        let updated;
        if (content.includes("LOCAL_API_TUNNEL_URL=")) {
          updated = content.replace(
            /- LOCAL_API_TUNNEL_URL=.*/,
            `- LOCAL_API_TUNNEL_URL=${tunnelUrl}`
          );
        } else {
          updated = content.replace(
            /- BLOG_BASE_URL=(.*)/,
            `- BLOG_BASE_URL=$1\n      - LOCAL_API_TUNNEL_URL=${tunnelUrl}`
          );
        }

        await exec('cat > ' + COMPOSE_FILE + ' << "ENDOFCOMPOSE"\n' + updated + '\nENDOFCOMPOSE');

        const { out: verify } = await exec(`grep LOCAL_API_TUNNEL_URL ${COMPOSE_FILE}`);
        console.log(`  Updated: ${verify.trim()}`);

        console.log("  Restarting N8N container...");
        const { out: restart, err: restartErr } = await exec("cd /root && docker compose up -d --force-recreate n8n 2>&1");
        console.log(`  ${restart || restartErr}`);

        console.log("  Waiting for N8N health check...");
        await new Promise((r) => setTimeout(r, 8000));
        const { out: health } = await exec(`curl -s -o /dev/null -w '%{http_code}' ${N8N_URL}/healthz`);
        console.log(`  N8N health: ${health}`);

        conn.end();
        resolve();
      } catch (e) {
        console.error("Error:", e.message);
        conn.end();
        resolve();
      }
    });

    conn.on("error", (e) => {
      console.error("SSH connection error:", e.message);
      resolve();
    });

    conn.connect({ host: VPS_HOST, port: 22, username: VPS_USER, password: VPS_PASS });
  });
}

main();
