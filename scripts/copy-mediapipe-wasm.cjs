// Copy MediaPipe WASM files from node_modules into public/ so they are served
// from our own origin (Cloudflare Pages) instead of an external CDN.
// Copying from the installed package keeps the JS and WASM versions in sync.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const dest = path.join(root, "public", "mediapipe", "wasm");

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const file of fs.readdirSync(src)) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
}
console.log(`Copied MediaPipe WASM to ${path.relative(process.cwd(), dest)}`);
