import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-center px-4">
      <div>
        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 inline-flex mb-6">
          <BrainCircuit className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page not found</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
