"use client";

import { useEffect, useMemo, useState } from "react";
import { parseAdminApiResponse } from "@/lib/api/client";
import type { ContactMessage, MessageStatus } from "@/types/admin";

type MessagesResponse = {
  messages: ContactMessage[];
  counts: Record<string, number>;
};

const statuses: Array<MessageStatus | "all"> = [
  "all",
  "new",
  "delivered",
  "read",
  "replied",
  "archived",
];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ all: 0 });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const activeMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessage?.id) ?? selectedMessage,
    [messages, selectedMessage]
  );

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const url =
        statusFilter === "all"
          ? "/api/admin/messages"
          : `/api/admin/messages?status=${statusFilter}`;
      const response = await fetch(url);
      const data = await parseAdminApiResponse<MessagesResponse>(
        response,
        "Failed to fetch messages"
      );
      setMessages(data.messages);
      setCounts(data.counts);
      setSelectedMessage((current) =>
        current ? data.messages.find((message) => message.id === current.id) ?? current : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: MessageStatus) => {
    setUpdatingId(id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedMessage = await parseAdminApiResponse<ContactMessage>(
        response,
        "Failed to update status"
      );
      setMessages((current) =>
        current.map((msg) => (msg.id === id ? updatedMessage : msg))
      );
      setSelectedMessage((current) =>
        current?.id === id ? updatedMessage : current
      );
      setCounts((current) => {
        const previous = messages.find((message) => message.id === id)?.status;
        if (!previous || previous === newStatus) {
          return current;
        }

        return {
          ...current,
          [previous]: Math.max((current[previous] ?? 1) - 1, 0),
          [newStatus]: (current[newStatus] ?? 0) + 1,
        };
      });
      setSuccess(`Message marked as ${newStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeColor = (status: MessageStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "delivered":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Messages
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review contact form messages, inspect details, and manage delivery workflow states.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              statusFilter === status
                ? "border-accent bg-accent text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <span className="block text-xs font-medium uppercase tracking-wide">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="mt-1 block text-2xl font-semibold">
              {counts[status] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
        <div>
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center dark:border-slate-600 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No messages found for this filter.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Sender
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
                        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                          activeMessage?.id === message.id ? "bg-accent/5" : ""
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {message.full_name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {message.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            {message.subject || "No subject"}
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
                        <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                          <select
                            value={message.status}
                            disabled={updatingId === message.id}
                            onChange={(event) =>
                              updateStatus(message.id, event.target.value as MessageStatus)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700"
                          >
                            <option value="new">New</option>
                            <option value="delivered">Delivered</option>
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

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark xl:sticky xl:top-24 xl:self-start">
          {activeMessage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                    Message detail
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {activeMessage.subject || "No subject"}
                  </h2>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                    activeMessage.status
                  )}`}
                >
                  {activeMessage.status}
                </span>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    From
                  </dt>
                  <dd className="mt-1 text-slate-900 dark:text-slate-100">
                    {activeMessage.full_name} · {activeMessage.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Received
                  </dt>
                  <dd className="mt-1 text-slate-700 dark:text-slate-300">
                    {new Date(activeMessage.created_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Message
                  </dt>
                  <dd className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {activeMessage.message}
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-2 gap-2">
                {(["read", "replied", "archived", "delivered"] as MessageStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updatingId === activeMessage.id || activeMessage.status === status}
                      onClick={() => updateStatus(activeMessage.id, status)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Mark {status}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Select a message to inspect the full details and update its workflow status.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
