import { Cinzel, EB_Garamond } from "next/font/google";

// The Terms and Privacy pages as an old rolled scroll: a parchment sheet
// hanging between two shaded paper rolls with wooden knobs, a classical
// capitals title (Cinzel), old-style body text (EB Garamond) and Roman-numeral
// section headings. Fonts are self-hosted by next/font. The sheet stays a
// comfortable reading width; wider would make lines too long to read.

const display = Cinzel({ subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const body = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const INK = "#3a2814";

const PARCHMENT = {
  backgroundColor: "#f3e5c3",
  backgroundImage: [
    "radial-gradient(ellipse at 18% 22%, rgb(150 100 40 / 0.10), transparent 45%)",
    "radial-gradient(ellipse at 82% 68%, rgb(150 100 40 / 0.12), transparent 50%)",
    "radial-gradient(ellipse at 55% 95%, rgb(130 85 30 / 0.10), transparent 40%)",
    "linear-gradient(to right, rgb(120 80 30 / 0.22), transparent 7%, transparent 93%, rgb(120 80 30 / 0.22))",
  ].join(", "),
  boxShadow: "inset 0 0 50px rgb(110 70 20 / 0.28), 0 10px 30px rgb(60 35 10 / 0.18)",
  color: INK,
};

// One rolled end: a shaded cylinder of paper, a little wider than the sheet,
// with a turned wooden knob at each end.
function Roll({ bottom = false }) {
  const knob = "absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full shadow-[0_3px_6px_rgb(0_0_0_/_0.35)]";
  const wood = { background: "radial-gradient(circle at 35% 35%, #9a6a3a, #5b3716 60%, #3a220c)" };
  return (
    <div className={`relative z-10 mx-3 ${bottom ? "-mt-2" : "-mb-2"}`} aria-hidden="true">
      <div
        className="h-8 rounded-full"
        style={{
          background: "linear-gradient(to bottom, #8a6332, #d8bd8a 22%, #f6e8c6 48%, #d4b47c 74%, #7c5428)",
          boxShadow: "0 4px 10px rgb(60 35 10 / 0.30)",
        }}
      />
      <span className={`${knob} -left-5`} style={wood} />
      <span className={`${knob} -right-5`} style={wood} />
    </div>
  );
}

export function DocPage({ title, children }) {
  return (
    <div className={`mx-auto max-w-4xl px-6 sm:px-8 ${body.className}`}>
      <Roll />
      <article className="relative mx-5 px-6 pb-12 pt-14 sm:mx-8 sm:px-14" style={PARCHMENT}>
        <header className="mb-10 text-center">
          <h1 className={`${display.className} text-3xl font-bold tracking-wide sm:text-4xl`} style={{ color: "#2a1a08" }}>
            {title}
          </h1>
          <p className="mt-3 text-lg tracking-[0.5em]" style={{ color: "#8a6332" }} aria-hidden="true">
            ✦ ❦ ✦
          </p>
        </header>
        <div className="text-[17px] leading-8">{children}</div>
      </article>
      <Roll bottom />
    </div>
  );
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function DocSection({ n, title, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className={`${display.className} mb-2 text-lg font-semibold tracking-wide`} style={{ color: "#2a1a08" }}>
        {n != null && <span className="mr-2" style={{ color: "#8a6332" }}>{ROMAN[n - 1] || n}.</span>}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
