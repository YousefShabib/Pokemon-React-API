export const FAV_KEY = "favorites";
export const SPECIAL_KEY = "dailySpecial";

export const readFavs = () => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
};

export const writeFavs = (arr) => {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch {}
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
};
