import { z } from "zod";
import { cek, PESAN_ERROR, TeksTidakValid, type ErrorCek, type KodeError } from "@/cek";

// Route tipis: parse JSON → cek() → JSON. Tidak ada logika penilaian di sini,
// dan isi Teks tidak pernah ditulis ke log (NFR-01).

const BodyCek = z.object({ teks: z.string() });

function tolak(kode: KodeError) {
  const body: ErrorCek = { error: { kode, pesan: PESAN_ERROR[kode] } };
  return Response.json(body, { status: 400 });
}

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return tolak("format_tidak_valid");
  }

  const body = BodyCek.safeParse(json);
  if (!body.success) return tolak("format_tidak_valid");

  try {
    return Response.json(await cek(body.data.teks));
  } catch (galat) {
    if (galat instanceof TeksTidakValid) return tolak(galat.kode);

    // Hanya nama error yang dicatat: pesan error bisa saja memuat isi Teks.
    console.error("Cek gagal:", galat instanceof Error ? galat.name : typeof galat);
    return Response.json(
      { error: { kode: "kesalahan_server", pesan: "Cek sedang bermasalah. Coba lagi sebentar lagi." } },
      { status: 500 },
    );
  }
}
