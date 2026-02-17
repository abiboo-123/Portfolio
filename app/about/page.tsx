import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Habib Mohamed Gouda, his education, backend experience, and AI-focused background.",
};

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          About
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          I&apos;m a back-end developer and Computer Science &amp; Artificial
          Intelligence student based in Ingolstadt, Germany. I enjoy designing
          and building scalable systems that combine reliable infrastructure
          with intelligent behavior.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Education
          </h2>
          <div className="space-y-4 text-xs text-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900">
                Technische Hochschule Ingolstadt
              </h3>
              <p className="text-slate-600">
                B.Sc. Computer Science &amp; Artificial Intelligence
              </p>
              <p className="mt-2 text-slate-600">Relevant coursework:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                <li>Algorithms for AI</li>
                <li>Software Engineering</li>
                <li>Web Technologies</li>
                <li>Data Structures</li>
              </ul>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-slate-900">Fayoum University</h3>
              <p className="text-slate-600">
                B.Sc. (Years 1–2 completed) – foundational Computer Science
                curriculum with a strong focus on mathematics, programming, and
                problem solving.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Professional Experience
          </h2>
          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900">
                Back-End Developer – QoneQ Startup (Remote)
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Built and optimized 6 backend microservices.</li>
                <li>
                  Implemented WebSocket-based real-time communication for
                  interactive features.
                </li>
                <li>
                  Integrated Firebase Cloud Messaging for reliable push
                  notifications.
                </li>
                <li>
                  Used Swagger and Postman to design, document, and test APIs.
                </li>
                <li>
                  Focused on scalability, modular architecture, and clean
                  service boundaries.
                </li>
              </ul>
            </div>
            <p className="border-t border-slate-100 pt-3 text-slate-700">
              Across my work, I aim to bring together strong backend engineering
              practices—clean APIs, robust data modeling, observability—with
              AI-driven capabilities such as intelligent routing, smart
              recommendations, and automation pipelines.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-xs text-slate-700">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Backend &amp; AI Focus
        </h2>
        <p className="mt-2">
          I enjoy working at the intersection of{" "}
          <span className="font-semibold">
            backend systems, data infrastructure, and applied AI
          </span>
          . From designing APIs and data models to integrating machine learning
          components, I care about building systems that are not only correct,
          but also observable, scalable, and easy to extend.
        </p>
        <p className="mt-2">
          My current interests include event-driven architectures, real-time
          applications, and ways to bring AI models closer to production
          backends through efficient inference pipelines and thoughtful system
          design.
        </p>
      </section>
    </div>
  );
}

