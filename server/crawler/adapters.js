// Readers for curated calendar pages whose events are already structured data,
// so there is nothing to guess: they return finished candidates directly
// (dates, place and official link come from the site itself). Selected by a
// source's "adapter" field in config.json.
//
// Each adapter is (html, ctx) => candidates[], where ctx provides
//   today       "YYYYMMDD" (UTC)
//   countryCode(name) -> ISO code or null
//   text(html)  -> plain text of an HTML fragment
//   sourceName  the source's display name

const iso = (yyyymmdd) => (/^\d{8}$/.test(String(yyyymmdd || "")) ? `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}` : null);

module.exports = {
  // 80 Level's events calendar (https://80.lv/events): games / VFX / CG
  // industry events. The page embeds the whole list as JSON in __NEXT_DATA__.
  "80lv"(html, ctx) {
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return [];
    let items;
    try {
      items = JSON.parse(m[1]).props.initialState.events.events.items;
    } catch {
      return [];
    }
    if (!Array.isArray(items)) return [];
    return items
      .filter((it) => it && it.title && it.date_start && String(it.date_end || it.date_start) >= ctx.today)
      .map((it) => {
        const url = it.official?.url || `https://80.lv/events#event-${it.slug}`;
        const country = ctx.countryCode(it.place?.mini);
        return {
          htmlLang: "en",
          title: it.title,
          description: ctx.text(it.description || "").slice(0, 600),
          url,
          host: (it.official?.site || "80.lv").replace(/^www\./, ""),
          category: "general",
          software: null,
          geography: country ? `country:${country}` : "international",
          event_type: "conference",
          start_date: iso(it.date_start),
          end_date: it.date_end && it.date_end !== it.date_start ? iso(it.date_end) : null,
          location: it.place?.company || it.place?.mini || null,
          confidence: 92,
          note: `Found by crawler via ${ctx.sourceName}. Title, dates, place and link come straight from that calendar (${it.date || "no date text"}); it lists games / VFX / CG industry events, so check it fits before approving.`,
        };
      });
  },
};
