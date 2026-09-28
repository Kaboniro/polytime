import { CATEGORY_LABEL, COOKIE_POLICY } from "@/lib/cookiePolicy";

const CATEGORY_TONE = {
  necessary: "text-neutral-300",
  unnecessary: "text-orange-400",
};

// Plain, no state — safe to render from a Server Component (/privacy) or a
// Client Component (the CookieConsent banner) alike. Grouped by category
// (Necessary first) rather than one flat table, so the Accept/Decline split
// is legible at a glance, not something you have to read a column to find.
export default function CookiePolicyTable({ compact = false }) {
  const groups = ["necessary", "unnecessary"].map((category) => ({
    category,
    cookies: COOKIE_POLICY.filter((c) => c.category === category),
  }));

  return (
    <div className="space-y-4">
      {groups.map(({ category, cookies }) => (
        <div key={category}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${CATEGORY_TONE[category]}`}>
            {CATEGORY_LABEL[category]}
          </p>
          <div className="overflow-x-auto border border-neutral-800">
            <table className="w-full min-w-[420px] border-collapse text-xs">
              <thead>
                <tr className="bg-black text-left uppercase tracking-wide text-white">
                  <th scope="col" className="border border-neutral-800 px-2.5 py-1.5 font-semibold">Cookie</th>
                  <th scope="col" className="border border-neutral-800 px-2.5 py-1.5 font-semibold">Purpose</th>
                  <th scope="col" className="border border-neutral-800 px-2.5 py-1.5 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c, i) => (
                  <tr key={c.name} className={i % 2 === 0 ? "bg-neutral-950" : "bg-neutral-900"}>
                    <td className="border border-neutral-800 px-2.5 py-1.5 font-mono text-neutral-200 align-top whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="border border-neutral-800 px-2.5 py-1.5 text-neutral-400 align-top">{c.purpose}</td>
                    <td className="border border-neutral-800 px-2.5 py-1.5 text-neutral-400 align-top whitespace-nowrap">
                      {c.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {!compact && (
        <p className="text-xs text-neutral-500">
          Necessary cookies are set regardless of your choice below — the site (or the banner
          itself) can&apos;t work without them. Only the Unnecessary one is gated on Accept, and is
          exactly what Decline prevents.
        </p>
      )}
    </div>
  );
}
