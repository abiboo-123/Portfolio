import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Habib Mohamed Gouda for internships, working student roles, or freelance backend projects.",
};

export default function ContactPage() {
  const links = [
    { href: "mailto:habib.attia.gouda@gmail.com", label: "habib.attia.gouda@gmail.com" },
    { href: "https://www.linkedin.com/in/habib-mohamed-gouda/", label: "LinkedIn" },
    { href: "https://github.com/abiboo-123", label: "GitHub" },
  ];
  const location = "85055 Ingolstadt, Germany";
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Contact
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Open to internships, working student roles, and freelance backend
          projects. Feel free to reach out if you&apos;d like to discuss
          backend systems, real-time applications, or AI-driven solutions.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
        <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-soft text-xs text-slate-700">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Contact Details
          </h2>
          <dl className="mt-2 space-y-2">
            <div className="flex flex-col">
              <dt className="text-slate-500">Email</dt>
              <dd>
                <a
                  href={links[0].href}
                  className="text-accent hover:text-accent-dark"
                >
                  {links[0].label}
                </a>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-slate-500">LinkedIn</dt>
              <dd>
                <a
                  href={links[1].href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-dark"
                >
                  {links[1].label} Profile
                </a>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-slate-500">GitHub</dt>
              <dd>
                <a
                  href={links[2].href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-dark"
                >
                  {links[2].label} Profile
                </a>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-slate-500">Location</dt>
              <dd>{location}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Send a Message
          </h2>
          <p className="text-xs text-slate-600">
            Simple contact form (UI only). This can later be wired to an API
            route or external service.
          </p>
          <form className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-slate-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-accent focus:bg-white"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-accent focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="text-xs font-medium text-slate-700"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-accent focus:bg-white"
                placeholder="Tell me a bit about what you have in mind…"
              />
            </div>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white shadow-soft transition-colors hover:bg-accent-dark"
            >
              Submit (coming soon)
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

