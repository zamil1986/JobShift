import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

function muatEnvLokal() {
  if (typeof process.loadEnvFile !== "function") return;
  for (const namaFile of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.resolve(process.cwd(), namaFile));
    } catch (galat) {
      if (galat && typeof galat === "object" && "code" in galat && galat.code === "ENOENT") {
        continue;
      }
      throw galat;
    }
  }
}

muatEnvLokal();

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
  const cli = await server.ssrLoadModule("/src/eval/cli.ts");
  await cli.jalankanEval(process.argv.slice(2));
} catch (galat) {
  console.error(galat instanceof Error ? galat.message : "Evaluasi gagal dijalankan.");
  process.exitCode = 1;
} finally {
  await server.close();
}
