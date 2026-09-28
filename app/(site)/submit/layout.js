// The Submit page is a client component, which can't export metadata itself.
export const metadata = {
  title: "Submit an event or link",
  description: "Know a 3D art competition, conference or useful resource we're missing? Submit it for review, or send us a content removal request or question.",
  alternates: { canonical: "/submit" },
};

export default function SubmitLayout({ children }) {
  return children;
}
