const KEY = "dormming.remindDays";

/** How many days before a bill's due date Ming starts reminding you (1 to 3, default 2). */
export const getRemindDays = () => { try { return Number(localStorage.getItem(KEY)) || 2; } catch { return 2; } };
export const setRemindDays = (n) => { try { localStorage.setItem(KEY, String(n)); } catch { /* lasts this visit */ } };
