import { FormCek } from "@/ui/FormCek";
import { TAGLINE } from "@/ui/salinan";

export default function Beranda() {
  return (
    <div className="halaman">
      <header className="kepala">
        <h1>JobShift</h1>
        <p className="tagline">{TAGLINE}</p>
      </header>
      <main>
        <FormCek />
      </main>
    </div>
  );
}
