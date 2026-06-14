import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-[#1E2A44]" />
          <span className="text-sm font-semibold text-[#1E2A44]">Pactum</span>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Pactum. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
