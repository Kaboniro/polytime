import { getContactEmail, mailto } from "@/lib/contact";
import { DocPage, DocSection } from "@/components/DocPage";

export const dynamic = "force-dynamic";

export const metadata = { title: "Privacy & data", alternates: { canonical: "/privacy" } };


// This page exists so anyone connected to a listing — or just visiting —
// has a plain-language explanation of what PolyTime collects and why, and a
// real way to reach us. It is not a substitute for legal advice; if this
// site scales up, replace it with a properly drafted policy.
export default function PrivacyPage() {
  const email = getContactEmail();
  const contactHref = email
    ? mailto(email, { subject: "PolyTime: question about a listing" })
    : null;

  return (
    <DocPage title="Privacy & data">

      <DocSection n={1} title="What's on this site">
        <p>
          PolyTime aggregates 3D art events, ongoing challenges, and useful resources: communities,
          tools, and tutorials. Anyone can submit an addition through{" "}
          <a href="/submit" className="text-orange-400 hover:underline">/submit</a>, and nothing
          appears publicly until it's reviewed and approved.
        </p>
      </DocSection>

      <DocSection n={2} title="What information do we collect?">
        <p>
          <strong>From submissions:</strong> whatever you enter on the form (an event's details, a
          link, a host name), plus, optionally, your email address, only so we can follow up if we
          have a question about your submission. We don't ask for your name, and there's no account
          to create.
        </p>
        <p>
          <strong>From browsing, only if you accept the cookie banner:</strong> which pages you
          visit, and a rough country or region (not a precise location, and not your IP address
          itself) detected from your network connection. See "Cookie policy" below for exactly
          what that is and isn't.
        </p>
      </DocSection>

      <DocSection n={3} title="How do we use your information?">
        <p>
          Submission details go straight to the admin review queue for review before
          anything is published. An optional email stays there too, in case we need to follow up;
          it's never shown on the site or linked to any public listing.
        </p>
        <p>
          Page visits and the rough region they came from help us see which listings are actually
          useful to people, and in which parts of the world, so we know what's worth featuring or
          expanding, rather than guessing.
        </p>
      </DocSection>

      <DocSection n={4} title="How do we protect your information?">
        <p>
          Absolutely nothing is handed off to a third party analytics or
          advertising service, so there's no second copy of your data sitting on someone else's
          servers.
        </p>
      </DocSection>

      <DocSection n={5} title="Cookie policy">
        <p>
          The visitor cookie is optional: it&apos;s set only if you accept the banner shown on your
          first visit, and never if you decline. You can change your mind any time from{" "}
          <strong>Cookie preferences</strong> in the footer.
        </p>
        <p>
          None of this is tied to your name, email, or any listing. It's never sold or shared with anyone outside this site.
        </p>
      </DocSection>

      <DocSection n={6} title="Third party disclosure & links">
        <p>
          We do not sell, trade, or share your information with outside parties, and this site
          doesn't run any third party analytics, advertising, or tracking scripts.
        </p>
        <p>
          When you search for a city in the submit form, the search runs entirely on our own
          server against a built-in list of places; what you type isn&apos;t sent anywhere else.
        </p>
        <p>
          Event and resource listings link out to other sites we don't control, each with its own
          privacy practices. We're not responsible for those, though we do try to only list
          reputable ones.
        </p>
      </DocSection>

      <DocSection n={7} title="Do Not Track">
        <p>
          There's no third party ad tracking here for a Do Not Track signal to opt out of, and
          nothing is recorded at all until you actively accept the cookie banner.
        </p>
      </DocSection>

      <DocSection n={8} title="Corrections & deletion">
        <p>
          If you&apos;re connected to something listed here (an event, a host, a link) and want it
          corrected or removed, or you&apos;d like a resource&apos;s link deleted, contact us below.
        </p>
      </DocSection>

      <DocSection n={9} title="Contact">
        {contactHref ? (
          <p>
            Questions, corrections, or removal requests:{" "}
            <a href={contactHref} className="text-orange-400 hover:underline">
              {email}
            </a>
            .
          </p>
        ) : (
          <p className="text-neutral-500">
            {process.env.NODE_ENV !== "production" && " Set CONTACT_EMAIL in .env.local to show one here."}
          </p>
        )}
      </DocSection>
    </DocPage>
  );
}
