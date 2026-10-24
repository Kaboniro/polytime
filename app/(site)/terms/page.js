import { getContactEmail, mailto } from "@/lib/contact";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of use",
  description: "The rules for using PolyTime: listings are informational, organizers' rules come first, and what you can submit.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "24 October 2026";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-lg font-semibold text-neutral-50">{title}</h2>
      <div className="space-y-3 leading-relaxed text-neutral-300">{children}</div>
    </section>
  );
}

const link = "text-orange-400 hover:underline";

// Plain-language terms for an informational listings site, matching what the
// About and Privacy pages say. Like the privacy page, it is not a substitute
// for legal advice; if the site grows (accounts, payments, ads), have it
// properly drafted.
export default function TermsPage() {
  const email = getContactEmail();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-50">Terms of use</h1>
      <p className="mb-8 text-sm text-neutral-500">Last updated {UPDATED}</p>

      <Section title="Using PolyTime">
        <p>
          PolyTime lists 3D art competitions, challenges, conferences and useful resources so you can
          find them in one place. It&apos;s free to use and needs no account. By using the site you agree
          to these terms.
        </p>
      </Section>

      <Section title="Listings are information, not guarantees">
        <p>
          We review every listing before it appears, but details such as dates, prizes, eligibility and
          rules are set by each organizer and can change at any time. The organizer&apos;s own page and
          rules always take precedence over what&apos;s shown here.
        </p>
        <p>
          PolyTime doesn&apos;t run, judge or sponsor any of the events it lists and isn&apos;t
          responsible for them, their prizes, or how organizers behave. Always check the official page
          before entering.
        </p>
      </Section>

      <Section title="Entering competitions">
        <p>
          When you enter a competition, your agreement is with its organizer. Read their terms carefully,
          especially what rights you grant over your artwork, before you submit anything. If a listing
          looks misleading or like a scam, please tell us so we can review it.
        </p>
      </Section>

      <Section title="What you can submit">
        <p>
          Anyone can <a href="/submit" className={link}>suggest an event or link</a>. Submissions should
          be accurate, relevant to 3D art, and not spam, misleading, illegal, or something you have no
          right to share.
        </p>
        <p>
          By submitting, you allow us to publish the details you send (an event&apos;s name, dates,
          organizer, link and description) on PolyTime. We may edit submissions for clarity, and we may
          decline or remove any listing at our discretion. Your email address, if you give one, is only
          used to follow up and is never shown publicly (see{" "}
          <a href="/privacy" className={link}>Privacy &amp; data</a>).
        </p>
      </Section>

      <Section title="Links to other sites">
        <p>
          Listings link to organizers&apos; and other third-party websites. We don&apos;t control them
          and aren&apos;t responsible for their content, security or privacy practices.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          Please don&apos;t try to disrupt or break into the site, overload it with automated requests,
          or send automated or bulk submissions. We may block access that does.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          PolyTime is provided as it is, without any warranty. We work to keep it accurate and available,
          but we can&apos;t promise it will always be complete, correct or online, and we aren&apos;t
          liable for losses arising from its use, as far as the law allows.
        </p>
      </Section>

      <Section title="Changes and contact">
        <p>
          We may update these terms as the site changes; the date at the top shows the latest version.
          Questions, corrections or removal requests: use the{" "}
          <a href="/submit" className={link}>Query tab on the submit page</a>
          {email ? (
            <>
              {" "}
              or email{" "}
              <a href={mailto(email, { subject: "PolyTime: terms question" })} className={link}>
                {email}
              </a>
            </>
          ) : null}
          . See also <a href="/about" className={link}>About</a>.
        </p>
      </Section>
    </div>
  );
}
