export const SUBJECT_LABELS = {
  chem: "AL Chemistry (Tamil)",
  iol: "OL ICT (English)",
  iotm: "OL ICT (Tamil)",
  ial: "AL ICT (English)",
  iatm: "AL ICT (Tamil)",
};

export const SUBJECT_OPTIONS = [
  { value: "chem", label: SUBJECT_LABELS.chem },
  { value: "iol", label: SUBJECT_LABELS.iol },
  { value: "iotm", label: SUBJECT_LABELS.iotm },
  { value: "ial", label: SUBJECT_LABELS.ial },
  { value: "iatm", label: SUBJECT_LABELS.iatm },
];

export const AVATAR_COLORS = [
  { bg: "#EDE9FE", fg: "#4C1D95" },
  { bg: "#E0F2FE", fg: "#075985" },
  { bg: "#FFE4E6", fg: "#9F1239" },
  { bg: "#FEF9C3", fg: "#713F12" },
  { bg: "#DCFCE7", fg: "#14532D" },
  { bg: "#FFE8D6", fg: "#7C2D12" },
  { bg: "#E0E7FF", fg: "#3730A3" },
];

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DURATION_OPTIONS = ["1hr", "1.5hr", "2hr", "2.5hr", "3hr"];

export function dayLabelToDayIndex(dayLabel) {
  const i = DAYS.indexOf(dayLabel);
  return i >= 0 ? i : 0;
}

/** e.g. 14:30 → 2:30 PM (HH:MM 24h from native time picker) */
export function formatTime12FromTime24(time24) {
  if (!time24 || typeof time24 !== "string") return "";
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time24).trim());
  if (!m) return String(time24).trim();
  const hh = Number(m[1]);
  const mm = m[2];
  if (!Number.isFinite(hh) || hh < 0 || hh > 23) return String(time24).trim();
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  return `${h12}:${mm} ${period}`;
}

export function slotDisplayTime(slot) {
  if (!slot) return "—";
  if (slot.time24) return formatTime12FromTime24(slot.time24);
  if (slot.time) return String(slot.time);
  return "—";
}

export function compareSlotRows(a, b) {
  const di = (Number(a.dayIndex) || 0) - (Number(b.dayIndex) || 0);
  if (di !== 0) return di;
  const ta = String(a.time24 || a.time || "");
  const tb = String(b.time24 || b.time || "");
  return ta.localeCompare(tb);
}

export function tsValue(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

/** Default cap per "Got payment" when student has no custom bundle size. */
export const DEFAULT_PAYMENT_BUNDLE_SIZE = 10;
/** @deprecated Use DEFAULT_PAYMENT_BUNDLE_SIZE or studentPaymentBundleSize(student). */
export const PAYMENT_BUNDLE_SIZE = DEFAULT_PAYMENT_BUNDLE_SIZE;

export const MIN_PAYMENT_BUNDLE_SIZE = 1;
export const MAX_PAYMENT_BUNDLE_SIZE = 50;

/** Billable units per logged session (1 = one rate at pricePerClass). Quarters allowed. */
export const MIN_CLASS_BILLING_UNITS = 0.25;
export const MAX_CLASS_BILLING_UNITS = 24;

export const SESSION_BILLING_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4];

export function normalizePaymentBundleSize(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_PAYMENT_BUNDLE_SIZE;
  return Math.min(MAX_PAYMENT_BUNDLE_SIZE, Math.max(MIN_PAYMENT_BUNDLE_SIZE, Math.floor(n)));
}

export function studentPaymentBundleSize(student) {
  return normalizePaymentBundleSize(student?.paymentBundleSize);
}

/** Snap to quarter-hours; missing or invalid → 1. */
export function classBillableUnits(classDoc) {
  const raw = Number(classDoc?.billingUnits);
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const q = Math.round(raw * 4) / 4;
  return Math.min(MAX_CLASS_BILLING_UNITS, Math.max(MIN_CLASS_BILLING_UNITS, q));
}

export function totalBillableUnitsForStudent(studentId, classes) {
  return classes
    .filter((c) => c.studentId === studentId)
    .reduce((sum, c) => sum + classBillableUnits(c), 0);
}

/** Unpaid billable units (FIFO vs payment.classCount totals). */
export function unpaidClasses(studentId, classes, payments) {
  const logged = totalBillableUnitsForStudent(studentId, classes);
  const totalPaid = payments
    .filter((p) => p.studentId === studentId)
    .reduce((sum, p) => sum + (Number(p.classCount) || 0), 0);
  return Math.max(0, logged - totalPaid);
}

/** Position 1…bundleSize within the current payment block (e.g. 13 unpaid, size 10 → 3). */
export function unpaidInCurrentBundle(totalUnpaid, bundleSize) {
  const b = normalizePaymentBundleSize(bundleSize);
  if (totalUnpaid <= 0) return 0;
  const r = totalUnpaid % b;
  return r === 0 ? b : r;
}

/** Units covered by the next "Got payment" (oldest unpaid first, capped by bundle size). */
export function nextPaymentClassCount(studentId, classes, payments, bundleSize) {
  const u = unpaidClasses(studentId, classes, payments);
  const cap = normalizePaymentBundleSize(bundleSize);
  return Math.min(u, cap);
}

export function totalPaidClassCount(studentId, payments) {
  return payments
    .filter((p) => p.studentId === studentId)
    .reduce((sum, p) => sum + (Number(p.classCount) || 0), 0);
}

export function sortStudentsByUnpaid(students, classes, payments) {
  return [...students].sort(
    (a, b) =>
      unpaidClasses(b.id, classes, payments) -
      unpaidClasses(a.id, classes, payments),
  );
}

export function studentAvatarIndex(student, allStudents) {
  const sorted = [...allStudents].sort(
    (a, b) => tsValue(a.createdAt) - tsValue(b.createdAt),
  );
  const i = sorted.findIndex((s) => s.id === student.id);
  return i < 0 ? 0 : i % AVATAR_COLORS.length;
}

export function initials(name) {
  if (!name || !String(name).trim()) return "?";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function subjectBadgeClasses(subject) {
  if (subject === "chem") {
    return "bg-[#EDE9FE] text-[#4C1D95] border-[#DDD6FE]";
  }
  return "bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]";
}

export function formatRs(n) {
  return `Rs. ${Number(n || 0).toLocaleString()}`;
}

export function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function classesChronologicalForStudent(studentId, classes) {
  return [...classes]
    .filter((c) => c.studentId === studentId)
    .sort((a, b) => {
      if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
      return tsValue(a.loggedAt) - tsValue(b.loggedAt);
    });
}

const EPS = 1e-6;

/** FIFO: fully paid session ids (whole row covered by payment units). */
export function paidClassIdSet(studentId, classes, payments) {
  const st = classPaymentStatusById(studentId, classes, payments);
  const set = new Set();
  st.forEach((row, id) => {
    if (row.state === "paid") set.add(id);
  });
  return set;
}

/**
 * FIFO payment allocation over billable units (chronological).
 * @returns {Map<string, { state: 'paid'|'partial'|'unpaid', unitsCovered: number, unitsTotal: number }>}
 */
export function classPaymentStatusById(studentId, classes, payments) {
  const paidTotal = totalPaidClassCount(studentId, payments);
  const ordered = classesChronologicalForStudent(studentId, classes);
  const map = new Map();
  let remaining = paidTotal;
  for (const c of ordered) {
    const u = classBillableUnits(c);
    if (remaining + EPS >= u) {
      map.set(c.id, { state: "paid", unitsCovered: u, unitsTotal: u });
      remaining = Math.max(0, remaining - u);
    } else if (remaining > EPS) {
      map.set(c.id, { state: "partial", unitsCovered: remaining, unitsTotal: u });
      remaining = 0;
    } else {
      map.set(c.id, { state: "unpaid", unitsCovered: 0, unitsTotal: u });
    }
  }
  return map;
}

export function totalEarnedFromStudent(studentId, payments) {
  return payments
    .filter((p) => p.studentId === studentId)
    .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
}

export function totalClassesLogged(classes) {
  return classes.length;
}

export function totalIncomeAll(payments) {
  return payments.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
}

export function totalClassesPaidAll(payments) {
  return payments.reduce((s, p) => s + (Number(p.classCount) || 0), 0);
}

export function uniquePaymentMonths(payments) {
  const set = new Set();
  payments.forEach((p) => {
    if (p.date && String(p.date).length >= 7) {
      set.add(String(p.date).slice(0, 7));
    }
  });
  return [...set].sort((a, b) => b.localeCompare(a));
}
