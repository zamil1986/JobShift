// Runner `npm run cek-dataset`. Seperti scripts/eval.mjs, TypeScript dimuat
// lewat Vite (sudah terpasang bersama Vitest), jadi tidak butuh tsx.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const server = await createServer({
  root: akar,
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true, watch: null },
  optimizeDeps: { noDiscovery: true },
  resolve: { tsconfigPaths: true },
});

try {
  const cli = await server.ssrLoadModule("/src/dataset/cli.ts");
  process.exitCode = await cli.jalankanCekDataset(process.argv.slice(2));
} catch (galat) {
  console.error(galat instanceof Error ? galat.message : "Pemeriksaan dataset gagal dijalankan.");
  process.exitCode = 2;
} finally {
  await server.close();
}
