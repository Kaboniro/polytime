import { jsonLdString } from "@/lib/seo";

// Server-rendered <script type="application/ld+json"> for one or more objects.
export default function JsonLd({ data }) {
  return (
    <>
      {[].concat(data).filter(Boolean).map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(d) }} />
      ))}
    </>
  );
}
