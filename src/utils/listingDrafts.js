const STORAGE_KEY = "planie:listing-drafts";

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const read = () => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

const write = (drafts) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  window.dispatchEvent(new Event("planie:drafts-changed"));
};

const newId = () =>
  `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const listDrafts = () =>
  read().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

export const getDraft = (id) => read().find((d) => d.id === id) || null;

export const saveDraft = ({ id, form, imageNames }) => {
  const drafts = read();
  const updatedAt = Date.now();
  const draftId = id || newId();
  const next = {
    id: draftId,
    form,
    imageNames: imageNames || [],
    updatedAt,
  };
  const idx = drafts.findIndex((d) => d.id === draftId);
  if (idx >= 0) drafts[idx] = next;
  else drafts.push(next);
  write(drafts);
  return next;
};

export const deleteDraft = (id) => {
  write(read().filter((d) => d.id !== id));
};

export const subscribeDrafts = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(listDrafts());
  window.addEventListener("planie:drafts-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("planie:drafts-changed", handler);
    window.removeEventListener("storage", handler);
  };
};
