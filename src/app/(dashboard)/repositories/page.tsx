"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitFork,
  Plus,
  Trash2,
  RefreshCw,
  Lock,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import { useRepositories, useConnectRepository, useDisconnectRepository, useSyncRepository } from "@/hooks/useRepositories";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

function ConnectRepoModal({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState("");
  const connect = useConnectRepository();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    try {
      await connect.mutateAsync(value.trim());
      toast.success("Repository connected successfully!");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect repository");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181b] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-lg">Connect Repository</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Repository (owner/repo)
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. octocat/hello-world"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              autoFocus
            />
            <p className="text-zinc-600 text-xs mt-1.5">
              You must have admin access to the repository.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={connect.isPending || !value.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connect.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</>
              ) : (
                <><Plus className="h-4 w-4" /> Connect</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function RepositoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useRepositories();
  const disconnect = useDisconnectRepository();
  const sync = useSyncRepository();

  const repos = (data as { id: string; fullName: string; name: string; description: string | null; isPrivate: boolean; lastActivityAt: string; _count: { pullRequests: number }; isActive: boolean }[]) ?? [];

  async function handleDisconnect(repoId: string, fullName: string) {
    if (!confirm(`Disconnect ${fullName}? The webhook will be removed.`)) return;
    try {
      await disconnect.mutateAsync(repoId);
      toast.success("Repository disconnected");
    } catch {
      toast.error("Failed to disconnect repository");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Repositories</h2>
          <p className="text-zinc-400 mt-1">
            Manage connected repos — each gets a GitHub webhook for PR events.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Connect Repo
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
          <GitFork className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No repos connected</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Connect a GitHub repo to start receiving AI code reviews.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium"
          >
            <Plus className="h-4 w-4" /> Connect Your First Repo
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <motion.div
              key={repo.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {repo.isPrivate ? (
                    <Lock className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  ) : (
                    <Globe className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{repo.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{repo.fullName}</p>
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              {repo.description && (
                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-3">
                  <span>{repo._count?.pullRequests ?? 0} PRs</span>
                  <span>· Last active {formatRelativeTime(repo.lastActivityAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => sync.mutate(repo.id)}
                    disabled={sync.isPending}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                    title="Sync PRs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => handleDisconnect(repo.id, repo.fullName)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
                    title="Disconnect"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <ConnectRepoModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
