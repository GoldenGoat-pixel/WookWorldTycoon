export class InfoPanel {
  constructor() {
    this.panel = document.getElementById('info-panel');
    this.nameEl = document.getElementById('info-name');
    this.bodyEl = document.getElementById('info-body');
    this.closeBtn = document.getElementById('close-info');

    this.closeBtn.addEventListener('click', () => this.hide());
  }

  show(entry) {
    const b = entry.data;
    this.nameEl.textContent = `${b.icon} ${b.name}`;
    let html = `<p>${b.description}</p>`;
    if (b.capacity) html += `<p>Capacity: ${b.capacity}</p>`;
    if (b.income) html += `<p>Income: $${b.income}/tick</p>`;
    html += `<p style="color:var(--text-dim);margin-top:8px;">Cost: $${b.cost.toLocaleString()}</p>`;
    this.bodyEl.innerHTML = html;
    this.panel.classList.remove('hidden');
  }

  hide() {
    this.panel.classList.add('hidden');
  }
}
