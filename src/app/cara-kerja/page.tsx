import type { Metadata } from "next";
import { bacaFileHasilEval } from "@/eval/hasil-tersimpan";
import { IsiCaraKerja } from "@/ui/IsiCaraKerja";
import { JUDUL_HALAMAN, PENGANTAR_HALAMAN } from "@/ui/salinan-cara-kerja";

export const metadata: Metadata = {
  title: `${JUDUL_HALAMAN} · JobShift`,
  description: PENGANTAR_HALAMAN,
};

// Dibaca sekali di module scope dengan readFileSync, jadi halaman ini
// di-prerender saat build dan angkanya ikut file hasil eval yang ada saat itu
// (spec, "Dataset dan eval"). Belum ada file = "belum dievaluasi".
const HASIL_EVAL = bacaFileHasilEval();

export default function CaraKerja() {
  return <IsiCaraKerja hasil={HASIL_EVAL} />;
}
