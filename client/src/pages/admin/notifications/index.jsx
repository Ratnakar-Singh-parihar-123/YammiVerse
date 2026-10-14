import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Users,
  BookOpen,
  Info,
  Send,
  History,
  Megaphone,
  AlertTriangle,
  Wrench,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";

import { useNotifications } from "../../../contexts/NotificationContext";
import { formatDistanceToNow, formatDate } from "../../../utils/timeUtils";
import api from "../../../utils/api";

const TYPE_OPTIONS = [
  {
    value: "announcement",
    label: "Announcement",
    icon: Megaphone,
    color: "text-primary bg-primary/10",
  },
  {
    value: "important",
    label: "Important",
    icon: AlertTriangle,
    color: "text-destructive bg-destructive/10",
  },
  {
    value: "recipe_update",
    label: "Recipe Update",
    icon: BookOpen,
    color: "text-success bg-success/10",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    icon: Wrench,
    color: "text-warning bg-warning/10",
  },
  {
    value: "general",
    label: "General",
    icon: Info,
    color: "text-accent bg-accent/10",
  },
];

const typeIcons = {
  new_user: { Icon: Users, color: "text-primary bg-primary/10" },
  new_recipe: { Icon: BookOpen, color: "text-success bg-success/10" },
  recipe_deleted: {
    Icon: BookOpen,
    color: "text-destructive bg-destructive/10",
  },
  recipe_updated: {
    Icon: BookOpen,
    color: "text-warning bg-warning/10",
  },
  system: { Icon: Info, color: "text-accent bg-accent/10" },
  announcement: {
    Icon: Megaphone,
    color: "text-primary bg-primary/10",
  },
  important: {
    Icon: AlertTriangle,
    color: "text-destructive bg-destructive/10",
  },
  recipe_update: {
    Icon: BookOpen,
    color: "text-success bg-success/10",
  },
  maintenance: {
    Icon: Wrench,
    color: "text-warning bg-warning/10",
  },
  general: { Icon: Info, color: "text-accent bg-accent/10" },
};

const EMPTY_FORM = {
  title: "",
  message: "",
  type: "announcement",
  actionLabel: "",
  actionUrl: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────────────────────────────────────

const AlertMessage = ({ type = "error", children, onClose }) => {
  const success = type === "success";

  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
        success
          ? "border-success/20 bg-success/10 text-success"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      }`}
    >
      {success ? (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      )}

      <div className="flex-1 min-w-0">{children}</div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  maxLength,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-foreground">
      {label}
      {required && " *"}
    </label>

    <input
      type={type}
      value={value}
      required={required}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Compose Tab
// ─────────────────────────────────────────────────────────────────────────────

const ComposeTab = ({ onCreated }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
      submit: "",
    }));

    setSuccess("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Message is required.";
    }

    if (form.actionUrl.trim()) {
      try {
        const parsed = new URL(form.actionUrl.trim());

        if (!["http:", "https:"].includes(parsed.protocol)) {
          nextErrors.actionUrl = "Use an HTTP or HTTPS URL.";
        }
      } catch {
        nextErrors.actionUrl = "Enter a valid URL.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSend = async () => {
    if (sending) return;

    setShowConfirm(false);
    setSending(true);
    setSuccess("");
    setErrors({});

    try {
      const response = await api.post("/api/notifications/broadcast", {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        actionLabel: form.actionLabel.trim(),
        actionUrl: form.actionUrl.trim(),
      });

      setSuccess(
        response.data?.message ||
          `Notification "${form.title.trim()}" sent successfully.`,
      );

      setForm(EMPTY_FORM);

      if (onCreated) {
        await onCreated();
      }
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to send notification. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      {success && (
        <AlertMessage type="success" onClose={() => setSuccess("")}>
          {success}
        </AlertMessage>
      )}

      {errors.submit && (
        <AlertMessage onClose={() => setErrors({})}>
          {errors.submit}
        </AlertMessage>
      )}

      <div className="p-5 space-y-5 border rounded-2xl border-border bg-card sm:p-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Compose notification
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an announcement for your registered users.
          </p>
        </div>

        <Field
          label="Notification Title"
          value={form.title}
          required
          maxLength={150}
          placeholder="e.g. New Feature Released!"
          onChange={(value) => handleChange("title", value)}
        />

        {errors.title && (
          <p className="-mt-4 text-xs text-destructive">{errors.title}</p>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Message *
          </label>

          <textarea
            required
            maxLength={5000}
            rows={4}
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder="Write your notification message..."
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {errors.message && (
            <p className="mt-1 text-xs text-destructive">{errors.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-foreground">
            Notification Type
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = form.type === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange("type", option.value)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Field
              label="Action Label (optional)"
              value={form.actionLabel}
              maxLength={100}
              placeholder="e.g. Learn More"
              onChange={(value) => handleChange("actionLabel", value)}
            />
          </div>

          <div>
            <Field
              label="Action URL (optional)"
              value={form.actionUrl}
              type="url"
              placeholder="https://example.com"
              onChange={(value) => handleChange("actionUrl", value)}
            />

            {errors.actionUrl && (
              <p className="mt-1 text-xs text-destructive">
                {errors.actionUrl}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-border sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-4 h-4 shrink-0" />
            Send to all eligible registered users.
          </p>

          <button
            type="button"
            disabled={sending}
            onClick={() => {
              if (validate()) setShowConfirm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? "Sending..." : "Send to All Users"}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-confirm-title"
            className="w-full max-w-md p-6 space-y-4 border shadow-2xl rounded-2xl border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3
                id="broadcast-confirm-title"
                className="text-lg font-bold text-foreground"
              >
                Send broadcast?
              </h3>
            </div>

            <div className="p-4 space-y-2 rounded-xl bg-muted/50">
              <p className="font-semibold text-foreground">{form.title}</p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {form.message}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                Type: {form.type.replace("_", " ")}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Please confirm before sending this notification.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={sending}
                onClick={handleSend}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Edit Broadcast Modal
// ─────────────────────────────────────────────────────────────────────────────

const EditBroadcastModal = ({ broadcast, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    title: broadcast.title || "",
    message: broadcast.message || "",
    type: broadcast.type || "general",
    actionLabel: broadcast.actionLabel || "",
    actionUrl: broadcast.actionUrl || "",
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required.");
      return;
    }

    if (form.actionUrl.trim()) {
      try {
        const url = new URL(form.actionUrl.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          setError("Action URL must use HTTP or HTTPS.");
          return;
        }
      } catch {
        setError("Please enter a valid action URL.");
        return;
      }
    }

    const result = await onSave({
      ...form,
      title: form.title.trim(),
      message: form.message.trim(),
      actionLabel: form.actionLabel.trim(),
      actionUrl: form.actionUrl.trim(),
    });

    if (!result?.success) {
      setError(result?.message || "Unable to save changes.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-broadcast-title"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              id="edit-broadcast-title"
              className="text-lg font-bold text-foreground"
            >
              Edit Broadcast
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your notification details.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close edit dialog"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <AlertMessage>{error}</AlertMessage>}

        <Field
          label="Title"
          value={form.title}
          required
          maxLength={150}
          onChange={(value) => updateField("title", value)}
          placeholder="Notification title"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Message *
          </label>

          <textarea
            required
            maxLength={5000}
            rows={5}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Notification Type
          </label>

          <select
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Action Label (optional)"
          value={form.actionLabel}
          maxLength={100}
          onChange={(value) => updateField("actionLabel", value)}
          placeholder="Learn More"
        />

        <Field
          label="Action URL (optional)"
          value={form.actionUrl}
          type="url"
          onChange={(value) => updateField("actionUrl", value)}
          placeholder="https://example.com"
        />

        <div className="flex flex-col-reverse gap-3 pt-4 border-t border-border sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// History Tab
// ─────────────────────────────────────────────────────────────────────────────

const HistoryTab = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/api/notifications/broadcasts?page=${page}&limit=10`,
      );

      setBroadcasts(response.data?.broadcasts || []);
      setPagination(
        response.data?.pagination || {
          total: 0,
          pages: 1,
          page: 1,
        },
      );
    } catch (err) {
      console.error("fetchBroadcasts error:", err);

      setError(
        err.response?.data?.message || "Failed to load broadcast history.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleUpdate = async (form) => {
    if (!editing || savingEdit) {
      return { success: false, message: "No broadcast selected." };
    }

    setSavingEdit(true);
    setError("");

    try {
      const response = await api.patch(
        `/api/notifications/broadcasts/${editing._id}`,
        form,
      );

      const updated = response.data?.broadcast || {
        ...editing,
        ...form,
      };

      setBroadcasts((previous) =>
        previous.map((item) =>
          item._id === editing._id ? { ...item, ...updated } : item,
        ),
      );

      setSelected((previous) =>
        previous?._id === editing._id ? { ...previous, ...updated } : previous,
      );

      setEditing(null);
      setSuccess(response.data?.message || "Broadcast updated successfully.");

      await fetchBroadcasts();

      return { success: true };
    } catch (err) {
      console.error("handleUpdate error:", err);

      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to update broadcast. Check your backend route.",
      };
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (broadcast) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${broadcast.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(broadcast._id);
    setError("");
    setSuccess("");

    try {
      const response = await api.delete(
        `/api/notifications/broadcasts/${broadcast._id}`,
      );

      setBroadcasts((previous) =>
        previous.filter((item) => item._id !== broadcast._id),
      );

      setPagination((previous) => ({
        ...previous,
        total: Math.max(0, previous.total - 1),
      }));

      if (selected?._id === broadcast._id) {
        setSelected(null);
      }

      if (editing?._id === broadcast._id) {
        setEditing(null);
      }

      setSuccess(response.data?.message || "Broadcast deleted successfully.");

      await fetchBroadcasts();
    } catch (err) {
      console.error("handleDelete error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete broadcast. Check your backend route.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Broadcast History</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {pagination.total} total broadcasts
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBroadcasts}
          disabled={loading}
          className="inline-flex items-center self-start justify-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg border-border text-foreground hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <AlertMessage onClose={() => setError("")}>{error}</AlertMessage>
      )}

      {success && (
        <AlertMessage type="success" onClose={() => setSuccess("")}>
          {success}
        </AlertMessage>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="border h-28 animate-pulse rounded-xl border-border bg-card"
            />
          ))}
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="py-16 text-center border rounded-2xl border-border bg-card">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />

          <p className="font-medium text-foreground">No broadcasts sent yet</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Use the Compose tab to send your first notification.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((broadcast) => {
            const typeInfo = typeIcons[broadcast.type] || typeIcons.general;

            const Icon = typeInfo.Icon;

            return (
              <article
                key={broadcast._id}
                className="p-4 transition-colors border rounded-xl border-border bg-card hover:border-primary/30 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${typeInfo.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="font-semibold break-words text-foreground">
                          {broadcast.title}
                        </h4>

                        <p className="mt-1 text-sm break-words whitespace-pre-wrap text-muted-foreground line-clamp-3">
                          {broadcast.message}
                        </p>
                      </div>

                      <span className="text-xs shrink-0 text-muted-foreground">
                        {formatDistanceToNow(
                          broadcast.sentAt || broadcast.createdAt,
                        )}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="px-2 py-1 font-semibold tracking-wide uppercase rounded-md bg-muted">
                        {broadcast.type?.replaceAll("_", " ") || "general"}
                      </span>

                      <span>By {broadcast.createdBy?.fullName || "Admin"}</span>

                      {broadcast.recipientCount !== undefined && (
                        <span>{broadcast.recipientCount} recipients</span>
                      )}

                      {broadcast.sentAt && (
                        <span>Sent {formatDate(broadcast.sentAt)}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 mt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setSelected(broadcast)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setEditing(broadcast);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === broadcast._id}
                        onClick={() => handleDelete(broadcast)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === broadcast._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {deletingId === broadcast._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && pagination.pages > 1 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-border sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page || page} of {pagination.pages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="p-2 border rounded-lg border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((previous) => Math.min(pagination.pages, previous + 1))
              }
              disabled={page >= pagination.pages}
              aria-label="Next page"
              className="p-2 border rounded-lg border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {editing && (
        <EditBroadcastModal
          broadcast={editing}
          saving={savingEdit}
          onClose={() => {
            if (!savingEdit) setEditing(null);
          }}
          onSave={handleUpdate}
        />
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3
                  id="broadcast-details-title"
                  className="font-semibold text-foreground"
                >
                  Broadcast Details
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Full notification information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Title
                </p>
                <p className="mt-1 font-semibold break-words text-foreground">
                  {selected.title}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Message
                </p>
                <p className="mt-1 text-sm break-words whitespace-pre-wrap text-foreground">
                  {selected.message}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="mt-1 font-medium capitalize text-foreground">
                    {selected.type?.replaceAll("_", " ") || "General"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="mt-1 font-medium text-foreground">
                    {formatDate(selected.sentAt || selected.createdAt)}
                  </p>
                </div>
              </div>

              {selected.actionLabel && (
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground">Action</p>
                  <p className="mt-1 font-medium text-foreground">
                    {selected.actionLabel}
                  </p>

                  {selected.actionUrl && (
                    <a
                      href={selected.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-1 text-sm underline break-all text-primary"
                    >
                      {selected.actionUrl}
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setEditing(selected);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg border-border hover:bg-muted"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selected)}
                  disabled={deletingId === selected._id}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin Inbox Tab
// ─────────────────────────────────────────────────────────────────────────────

const InboxTab = () => {
  const navigate = useNavigate();

  const {
    notifications = [],
    unreadCount = 0,
    loading,
    markAsRead,
    markAllRead,
    refresh,
  } = useNotifications();

  const [filter, setFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  const filtered =
    filter === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  const handleMarkRead = async (id) => {
    setActionError("");

    try {
      await markAsRead(id);
    } catch (error) {
      console.error("markAsRead error:", error);
      setActionError("Could not mark the notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    setActionError("");

    try {
      await markAllRead();
    } catch (error) {
      console.error("markAllRead error:", error);
      setActionError("Could not mark all notifications as read.");
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "All caught up"}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden text-sm border rounded-lg border-border">
            {["all", "unread"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`px-3 py-2 font-medium capitalize transition-colors ${
                  filter === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={refresh}
            title="Refresh notifications"
            className="p-2 border rounded-lg border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionError && (
        <AlertMessage onClose={() => setActionError("")}>
          {actionError}
        </AlertMessage>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 border animate-pulse rounded-xl border-border bg-card"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border rounded-2xl border-border bg-card">
          <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />

          <p className="font-medium text-foreground">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "unread"
              ? "You're all caught up!"
              : "System notifications appear here when events occur."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const typeInfo = typeIcons[notification.type] || typeIcons.system;

            const Icon = typeInfo.Icon;

            return (
              <article
                key={notification._id}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkRead(notification._id);
                  }

                  if (notification.link) {
                    navigate(notification.link);
                  }
                }}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 sm:gap-4 ${
                  !notification.isRead
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${typeInfo.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold break-words text-foreground">
                      {notification.title}
                    </p>

                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.isRead && (
                        <span
                          className="w-2 h-2 mt-1 rounded-full bg-primary"
                          aria-label="Unread"
                        />
                      )}

                      {!notification.isRead && (
                        <button
                          type="button"
                          title="Mark as read"
                          aria-label="Mark notification as read"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(notification._id);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-1 text-sm break-words whitespace-pre-wrap line-clamp-3 text-muted-foreground">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.createdAt)}
                    {" · "}
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const AdminNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("compose");

  const { unreadCount = 0 } = useNotifications();

  const tabs = [
    { id: "compose", label: "Compose", Icon: Send },
    { id: "history", label: "History", Icon: History },
    { id: "inbox", label: "Inbox", Icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Bell className="w-5 h-5" />
            </div>

            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Notifications
            </h2>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Broadcast announcements, manage sent messages, and monitor system
            alerts.
          </p>
        </div>
      </div>

      <div className="flex max-w-full gap-1 p-1 overflow-x-auto border rounded-xl border-border bg-muted">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-pressed={active}
              className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 ${
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>

              {id === "inbox" && unreadCount > 0 && (
                <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "compose" && (
        <ComposeTab onCreated={() => Promise.resolve()} />
      )}

      {activeTab === "history" && <HistoryTab />}

      {activeTab === "inbox" && <InboxTab />}
    </div>
  );
};

export default AdminNotificationsPage;
