const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString());

async function getJson(path) {
  const res = await fetch(path);
  if (!res.ok) return null;
  const body = await res.json();
  return body.ok ? body.data : null;
}

function renderSummary(s) {
  if (!s) return;
  document.getElementById('kpi-picks').textContent = fmt(s.total_picks);
  document.getElementById('kpi-orders').textContent = fmt(s.total_orders);
  document.getElementById('kpi-pickers').textContent = fmt(s.picker_count);
  document.getElementById('kpi-days').textContent = fmt(s.day_count);
}

function renderDailyChart(rows) {
  if (!rows || rows.length === 0) return;
  const ordered = [...rows].sort((a, b) => String(a.day).localeCompare(String(b.day)));
  const labels = ordered.map((r) => r.day);
  const picks = ordered.map((r) => Number(r.picks));
  new Chart(document.getElementById('chart-daily'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Picks',
          data: picks,
          borderColor: '#1F8FFF',
          backgroundColor: 'rgba(31,143,255,0.15)',
          fill: true,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderPickerTable(rows) {
  const tbody = document.getElementById('picker-rows');
  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="py-4 text-slate-400">No data.</td></tr>';
    return;
  }
  tbody.innerHTML = rows
    .map(
      (r) =>
        `<tr class="border-b border-slate-100">
          <td class="py-2">${r.picker ?? '—'}</td>
          <td class="py-2 text-right tabular-nums">${fmt(r.picks)}</td>
          <td class="py-2 text-right tabular-nums">${fmt(r.orders)}</td>
        </tr>`,
    )
    .join('');
}

(async () => {
  const [summary, daily, pickers] = await Promise.all([
    getJson('/api/summary'),
    getJson('/api/daily'),
    getJson('/api/pickers'),
  ]);
  renderSummary(summary);
  renderDailyChart(daily);
  renderPickerTable(pickers);
})();
