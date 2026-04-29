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

export function tsValue(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

export function unpaidClasses(studentId, classes, payments) {
  const totalLogged = classes.filter((c) => c.studentId === studentId).length;
  const totalPaid = payments
    .filter((p) => p.studentId === studentId)
    .reduce((sum, p) => sum + (Number(p.classCount) || 0), 0);
  return Math.max(0, totalLogged - totalPaid);
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

export function paidClassIdSet(studentId, classes, payments) {
  const paidTotal = totalPaidClassCount(studentId, payments);
  const ordered = classesChronologicalForStudent(studentId, classes);
  const set = new Set();
  for (let i = 0; i < ordered.length && i < paidTotal; i++) {
    set.add(ordered[i].id);
  }
  return set;
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
