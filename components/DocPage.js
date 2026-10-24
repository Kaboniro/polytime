// A "document" layout for the Terms and Privacy pages: a centered page sheet
// with document margins and a soft shadow, a centered title block, and
// numbered section headings, so long policy text reads like a Word/PDF
// document instead of a narrow column beside empty space. The sheet is a
// comfortable reading width (about 90 characters a line); wider would make
// lines too long to read.

export function DocPage({ title, updated, children }) {
  return (
    <article className="mx-auto max-w-4xl rounded-sm border border-neutral-800 bg-neutral-950 px-6 py-10 shadow-[0_1px_3px_rgb(0_0_0_/_0.06),0_12px_32px_rgb(0_0_0_/_0.06)] sm:px-14 sm:py-14">
      <header className="mb-10 border-b border-neutral-800 pb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-50">{title}</h1>
        {updated && <p className="mt-2 text-sm text-neutral-500">Last updated {updated}</p>}
      </header>
      <div className="text-[15px] leading-7 text-neutral-300">{children}</div>
    </article>
  );
}

export function DocSection({ n, title, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="mb-2 text-lg font-semibold text-neutral-50">
        {n != null && <span className="mr-2 tabular-nums text-neutral-500">{n}.</span>}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
