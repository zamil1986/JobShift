// OCR screenshot di browser dengan Tesseract.js (spec, "Stack"). Semua aset
// (worker, core WASM, data bahasa ind+eng) dilayani dari /tesseract di situs
// ini sendiri, disalin dari node_modules oleh scripts/salin-tesseract.mjs.
// Gambar dibaca langsung dari Blob di dalam Web Worker dan tidak pernah
// dikirim lewat jaringan.

/** Folder aset OCR di public/. Harus sama dengan scripts/salin-tesseract.mjs. */
const FOLDER_ASET = "/tesseract";

/** Pesan logger Tesseract.js yang dipakai UI. */
export type PesanTesseract = { status: string; progress: number };

/** Progres untuk pengguna. `persen` null berarti tahap persiapan (tanpa angka). */
export type Progres = { teks: string; persen: number | null };

export const PROGRES_AWAL: Progres = { teks: "Menyiapkan pembaca teks…", persen: null };

/**
 * Menerjemahkan pesan logger ke progres pengguna. Persen di teks dibulatkan
 * ke bawah per 10% supaya pengumuman aria-live tidak berisik.
 */
export function progresOcr({ status, progress }: PesanTesseract): Progres {
  if (status === "recognizing text") {
    const persen = progress >= 1 ? 100 : Math.floor(progress * 10) * 10;
    return { teks: `Membaca teks dari screenshot… ${persen}%`, persen };
  }
  if (status === "loading language traineddata") return { teks: "Memuat data bahasa…", persen: null };
  return PROGRES_AWAL;
}

/**
 * Membaca teks dari gambar. Hasilnya sudah di-trim dan bisa string kosong
 * kalau tidak ada teks yang terbaca. Melempar kalau OCR gagal atau dibatalkan;
 * pembatalan menghentikan worker.
 */
export async function bacaScreenshot(
  gambar: Blob,
  opsi: { onProgres: (p: Progres) => void; signal?: AbortSignal },
): Promise<string> {
  const { signal, onProgres } = opsi;
  signal?.throwIfAborted();

  const { createWorker, OEM } = await import("tesseract.js");
  signal?.throwIfAborted();

  // Worker yang dihentikan tidak selalu menolak job yang sedang jalan, jadi
  // setiap tunggu dipacu dengan janji yang ditolak saat dibatalkan.
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  let dihentikan = false;
  const hentikan = () => {
    if (dihentikan || !worker) return;
    dihentikan = true;
    worker.terminate().catch(() => {});
  };
  const dibatalkan = new Promise<never>((_, tolak) => {
    signal?.addEventListener(
      "abort",
      () => {
        hentikan();
        tolak(signal.reason);
      },
      { once: true },
    );
  });
  dibatalkan.catch(() => {});
  const sampaiBatal = <T,>(janji: Promise<T>) => Promise.race([janji, dibatalkan]);

  // URL absolut karena dipakai dari dalam worker.
  const asal = `${window.location.origin}${FOLDER_ASET}`;
  try {
    const dibuat = createWorker(["ind", "eng"], OEM.LSTM_ONLY, {
      workerPath: `${asal}/worker.min.js`,
      corePath: `${asal}/core`,
      langPath: `${asal}/lang`,
      workerBlobURL: false,
      logger: (m) => {
        if (!signal?.aborted) onProgres(progresOcr(m));
      },
    }).then((w) => {
      // Worker yang baru jadi setelah dibatalkan langsung dihentikan.
      worker = w;
      if (signal?.aborted) hentikan();
      return w;
    });
    const siap = await sampaiBatal(dibuat);
    const { data } = await sampaiBatal(siap.recognize(gambar));
    return data.text.trim();
  } finally {
    hentikan();
  }
}
