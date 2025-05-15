import ngrok from 'ngrok';
import fs from 'fs';

const CONFIG_PATH = './src/config.ts'; 

async function startTunnel() {
  const url = await ngrok.connect({
    addr: 4000,
    authtoken_from_env: true, // uses stored token
  });

  const configContent = `export const BACKEND_URL = '${url}';\n`;
  fs.writeFileSync(CONFIG_PATH, configContent);
  console.log(`✅ Ngrok started at ${url}`);
  console.log(`🔧 Updated ${CONFIG_PATH}`);
}

startTunnel();
