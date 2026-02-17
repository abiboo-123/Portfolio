export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Habib Mohamed Gouda. All rights
          reserved.
        </p>
        <p className="text-center sm:text-right">
          Back-End Developer & AI-Focused Computer Science Student · Based in
          Ingolstadt, Germany
        </p>
      </div>
    </footer>
  );
}

