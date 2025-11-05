import React from "react";
import UploadCard from "./components/UploadCard";

export default function App() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-semibold">QuickEnhance</h1>
          <p className="text-sm text-slate-600">Fast image resize, optimize & enhance — privacy-first.</p>
        </div>
        <nav className="space-x-4">
          <a href="#" className="text-sm">Docs</a>
          <a href="#" className="text-sm">Pricing</a>
        </nav>
      </header>

      <main className="mt-8">
        <UploadCard />
      </main>

      <footer className="mt-12 text-center text-sm text-slate-500">© {new Date().getFullYear()} QuickEnhance — Built with Bun + React</footer>
    </div>
  );
}
