import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

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
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Contact
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Open to internships, working student roles, and freelance backend
          projects. Feel free to reach out if you&apos;d like to discuss
          backend systems, real-time applications, or AI-driven solutions.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
        <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 text-xs text-slate-700 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Contact Details
          </h2>
          <dl className="mt-2 space-y-2">
            <div className="flex flex-col">
              <dt className="text-slate-500 dark:text-slate-400">Email</dt>
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
              <dt className="text-slate-500 dark:text-slate-400">LinkedIn</dt>
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
              <dt className="text-slate-500 dark:text-slate-400">GitHub</dt>
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
              <dt className="text-slate-500 dark:text-slate-400">Location</dt>
              <dd>{location}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Send a Message
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Fill out the form below and I&apos;ll get back to you as soon as possible.
          </p>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}

