import { Cinzel, EB_Garamond } from "next/font/google";

// The Terms and Privacy pages as an old parchment document: an aged
// parchment sheet, a classical capitals title (Cinzel), old-style body text (EB Garamond) and Roman-numeral
// section headings. Fonts are self-hosted by next/font. The sheet stays a
// comfortable reading width; wider would make lines too long to read.

const display = Cinzel({ subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const body = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

// Site palette: vanilla custard paper, edges aged with sunflower gold,
// midnight violet ink, and a deep gold (sunflower, darkened to read on the
// paper) for numerals and the ornament.
const INK = "#2d1e2f";
const GOLD = "#875805";

const PARCHMENT = {
  backgroundColor: "#fcf6b1",
  backgroundImage: [
    "radial-gradient(ellipse at 18% 22%, rgb(247 179 43 / 0.16), transparent 45%)",
    "radial-gradient(ellipse at 82% 68%, rgb(247 179 43 / 0.18), transparent 50%)",
    "radial-gradient(ellipse at 55% 95%, rgb(200 130 20 / 0.12), transparent 40%)",
    "linear-gradient(to right, rgb(190 120 20 / 0.20), transparent 7%, transparent 93%, rgb(190 120 20 / 0.20))",
  ].join(", "),
  boxShadow: "inset 0 0 50px rgb(170 105 10 / 0.25), 0 10px 30px rgb(45 30 47 / 0.14)",
  color: INK,
};

export function DocPage({ title, children }) {
  return (
    <div className={`mx-auto max-w-4xl ${body.className}`}>
      <article className="relative rounded-sm px-5 pb-10 pt-10 sm:px-14 sm:pb-12 sm:pt-14" style={PARCHMENT}>
        <header className="mb-10 text-center">
          <h1 className={`${display.className} text-3xl font-bold tracking-wide sm:text-4xl`} style={{ color: INK }}>
            {title}
          </h1>
          <p className="mt-3 text-lg tracking-[0.5em]" style={{ color: GOLD }} aria-hidden="true">
            ✦ ❦ ✦
          </p>
        </header>
        <div className="text-[17px] leading-8">{children}</div>
      </article>
    </div>
  );
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function DocSection({ n, title, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className={`${display.className} mb-2 text-lg font-semibold tracking-wide`} style={{ color: INK }}>
        {n != null && <span className="mr-2" style={{ color: GOLD }}>{ROMAN[n - 1] || n}.</span>}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
