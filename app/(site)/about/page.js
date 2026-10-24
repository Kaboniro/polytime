import { getContactEmail, mailto } from "@/lib/contact";
import SideImage from "@/components/SideImage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About",
  description:
    "What PolyTime is, how events and links get listed, and how to reach us: a free, independent calendar of 3D art competitions, challenges and conferences.",
  alternates: { canonical: "/about" },
};

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-lg font-semibold text-neutral-50">{title}</h2>
      <div className="space-y-3 leading-relaxed text-neutral-300">{children}</div>
    </section>
  );
}

const link = "text-orange-400 hover:underline";

// Plain facts about how the site works, so visitors (and the services that
// rate new sites) can see who's behind it and how listings are chosen. Keep
// it true to the code: review queue, crawler, no paid placements.
export default function AboutPage() {
  const email = getContactEmail();

  return (
    <div className="flex items-stretch gap-12">
    <div className="w-full max-w-2xl shrink-0">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-50">About PolyTime</h1>

      <Section title="What PolyTime is">
        <p>
          PolyTime is a free calendar of 3D art competitions, challenges, game jams and conferences from
          around the world, plus a directory of useful communities, tools, asset libraries and tutorials
          for 3D artists. The aim is simple: one place to see what&apos;s open now, what&apos;s coming
          up, and when entries close.
        </p>
      </Section>

      <Section title="How events get listed">
        <p>
          Listings come from two places: people who{" "}
          <a href="/submit" className={link}>submit an event or link</a>, and an automated finder that
          checks organizers&apos; sites and searches the web for new contests.
        </p>
        <p>
          <strong className="text-neutral-100">Nothing is published automatically.</strong> Every
          listing is reviewed by a person and checked against the organizer&apos;s own page before it
          appears on the site.
        </p>
      </Section>

      <Section title="Independent and free">
        <p>
          PolyTime is independent. It isn&apos;t run by, or affiliated with, the competitions,
          organizers or software companies it lists. There are no paid placements: events are ordered
          by date, not by who pays.
        </p>
        <p>
          Using the site is free and needs no account. Every listing links to the organizer&apos;s own
          page; always check the official rules, prizes and deadlines there before entering.
        </p>
      </Section>

      <Section title="Corrections and contact">
        <p>
          Spotted a mistake, an event that&apos;s been cancelled, or something that shouldn&apos;t be
          listed? Use the <a href="/submit" className={link}>Query tab on the submit page</a>
          {email ? (
            <>
              {" "}
              or email{" "}
              <a href={mailto(email, { subject: "PolyTime: question" })} className={link}>
                {email}
              </a>
            </>
          ) : null}
          . Removal requests are read by a person and acted on.
        </p>
        <p>
          How the site handles data and cookies is explained on the{" "}
          <a href="/privacy" className={link}>Privacy &amp; data</a> page, and the rules for using
          it on the <a href="/terms" className={link}>Terms of use</a> page.
        </p>
      </Section>
    </div>
    <SideImage src="/images/building1.jpg" position="50% 50%" />
    </div>
  );
}
