import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import "./SuccessToast.css";

/* ------------------------------------------------------------------
   Success toast
   showSuccessToast(content, { duration }) pushes a toast; <SuccessToastHost />
   (mounted once in App) renders it. The host lives at the app root, so a
   toast stays visible while the page navigates after a successful save.
   ------------------------------------------------------------------ */

const listeners = new Set();
let nextId = 1;

export const showSuccessToast = (content, options = {}) => {
  const toast = {
    id: nextId++,
    content,
    duration: options.duration || 4500,
  };
  listeners.forEach((listener) => listener(toast));
};

const MAX_VISIBLE = 3;
const EXIT_MS = 220;

// Toasts still on screen when the page reloads (e.g. Update Practice reloads
// after saving) are kept for the next page load in this tab.
const CARRY_KEY = "successToastCarryOver";
const CARRY_MAX_AGE_MS = 10000;

const saveVisibleToasts = () => {
  try {
    const messages = [
      ...document.querySelectorAll(".stoast:not(.is-leaving) .stoast__message"),
    ].map((el) => el.innerHTML);
    if (messages.length === 0) return;
    sessionStorage.setItem(
      CARRY_KEY,
      JSON.stringify({ savedAt: Date.now(), messages }),
    );
  } catch (e) {
    // storage unavailable: the toast simply isn't carried over
  }
};

const takeCarriedToasts = () => {
  try {
    const raw = sessionStorage.getItem(CARRY_KEY);
    sessionStorage.removeItem(CARRY_KEY);
    if (!raw) return [];
    const { savedAt, messages } = JSON.parse(raw);
    if (Date.now() - savedAt > CARRY_MAX_AGE_MS) return [];
    return Array.isArray(messages) ? messages : [];
  } catch (e) {
    return [];
  }
};

const ToastItem = ({ toast, onDone }) => {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);

  const dismiss = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => onDone(toast.id), EXIT_MS);
  };

  // Auto-dismiss; hovering pauses the countdown
  useEffect(() => {
    if (paused || leaving) return undefined;
    startedAt.current = Date.now();
    const timer = setTimeout(dismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, leaving]);

  return (
    <div
      className={`stoast${leaving ? " is-leaving" : ""}${paused ? " is-paused" : ""}`}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="stoast__icon">
        <CheckCircleOutlineIcon fontSize="inherit" />
      </span>

      <div className="stoast__body">
        <div className="stoast__title">Success</div>
        {toast.html !== undefined ? (
          // carried over from before a reload: markup this toast rendered itself
          <div
            className="stoast__message"
            dangerouslySetInnerHTML={{ __html: toast.html }}
          />
        ) : (
          <div className="stoast__message">{toast.content}</div>
        )}
      </div>

      <button
        type="button"
        className="stoast__close"
        aria-label="Dismiss notification"
        onClick={dismiss}
      >
        <CloseIcon fontSize="inherit" />
      </button>

      <span
        className="stoast__progress"
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
};

export const SuccessToastHost = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) =>
      setToasts((prev) => [...prev, toast].slice(-MAX_VISIBLE));
    listeners.add(listener);

    const carried = takeCarriedToasts().map((html) => ({
      id: nextId++,
      html,
      duration: 4500,
    }));
    if (carried.length) setToasts(carried.slice(-MAX_VISIBLE));

    window.addEventListener("pagehide", saveVisibleToasts);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("pagehide", saveVisibleToasts);
    };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="stoast-stack">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDone={remove} />
      ))}
    </div>,
    document.body,
  );
};
