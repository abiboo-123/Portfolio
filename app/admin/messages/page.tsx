"use client";

import { useState, useEffect } from "react";
import type { ContactMessage, MessageStatus } from "@/types/admin";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const url =
        statusFilter === "all"
          ? "/api/admin/messages"
          : `/api/admin/messages?status=${statusFilter}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: MessageStatus) => {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setMessages(
        messages.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const getStatusBadgeColor = (status: MessageStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "read":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "replied":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "archived":
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Messages
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage contact form messages
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "new", "read", "replied", "archived"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-accent text-white dark:bg-accent"
                : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center dark:border-slate-600 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No messages found.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {message.full_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {message.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-900 dark:text-slate-100">
                        {message.subject}
                      </div>
                      <div className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                          message.status
                        )}`}
                      >
                        {message.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(message.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={message.status}
                        onChange={(e) =>
                          updateStatus(message.id, e.target.value as MessageStatus)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
