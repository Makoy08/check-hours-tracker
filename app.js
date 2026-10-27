const STORAGE_KEY = "check-hours-tracker-v1";
const form = document.getElementById("timeForm");
const dateInput = document.getElementById("workDate");
const inInput = document.getElementById("checkIn");
const outInput = document.getElementById("checkOut");
const durationEl = document.getElementById("duration");
const totalHoursEl = document.getElementById("totalHours");
const recordCountEl = document.getElementById("recordCount");
const recordsBody = document.getElementById("recordsBody");
const recordsTable = document.getElementById("recordsTable");
const emptyState = document.getElementById("emptyState");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const formMessage = document.getElementById("formMessage");

const today = new Date();
dateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
function durationMinutes(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60; // checkout is next day
  return mins;
}
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function preview() {
  if (!inInput.value || !outInput.value) return;
  durationEl.textContent = formatDuration(
    durationMinutes(inInput.value, outInput.value),
  );
}
function render() {
  const records = loadRecords().sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  );
  recordsBody.replaceChildren();
  let total = 0;
  for (const record of records) {
    total += record.minutes;
    const tr = document.createElement("tr");
    const cells = [
      record.date,
      formatTime(record.checkIn),
      formatTime(record.checkOut),
      formatDuration(record.minutes),
    ];
    for (const value of cells) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    }
    const actionCell = document.createElement("td");
    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-one";
    del.textContent = "Delete";
    del.setAttribute("aria-label", `Delete record for ${record.date}`);
    del.addEventListener("click", () => {
      saveRecords(loadRecords().filter((item) => item.id !== record.id));
      render();
    });
    actionCell.appendChild(del);
    tr.appendChild(actionCell);
    recordsBody.appendChild(tr);
  }
  totalHoursEl.textContent = formatDuration(total);
  recordCountEl.textContent = String(records.length);
  recordsTable.hidden = records.length === 0;
  emptyState.hidden = records.length !== 0;
  clearBtn.hidden = records.length === 0;
}
[inInput, outInput].forEach((input) =>
  input.addEventListener("input", preview),
);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "";
  formMessage.classList.remove("error");
  if (!dateInput.value || !inInput.value || !outInput.value) return;
  const minutes = durationMinutes(inInput.value, outInput.value);
  if (minutes === 0) {
    formMessage.textContent =
      "Check-in and check-out are the same time, so the duration is 0 hours. Change a time if this is not intended.";
    formMessage.classList.add("error");
    return;
  }
  const records = loadRecords();
  records.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: dateInput.value,
    checkIn: inInput.value,
    checkOut: outInput.value,
    minutes,
    createdAt: Date.now(),
  });
  saveRecords(records);
  render();
  formMessage.textContent = `Saved — ${formatDuration(minutes)} recorded.`;
});

clearBtn.addEventListener("click", () => {
  if (confirm("Delete all saved records? This cannot be undone.")) {
    saveRecords([]);
    render();
    formMessage.textContent = "All records deleted.";
  }
});

exportBtn.addEventListener("click", () => {
  const records = loadRecords().sort((a, b) => a.date.localeCompare(b.date));
  if (!records.length) {
    formMessage.textContent = "There are no records to export yet.";
    formMessage.classList.add("error");
    return;
  }
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ["Date", "Check in", "Check out", "Duration minutes", "Duration"],
    ...records.map((r) => [
      r.date,
      formatTime(r.checkIn),
      formatTime(r.checkOut),
      r.minutes,
      formatDuration(r.minutes),
    ]),
  ];
  const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "check-hours-records.csv";
  link.click();
  URL.revokeObjectURL(url);
});

preview();
render();
