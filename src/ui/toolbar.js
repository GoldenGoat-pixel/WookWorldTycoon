export class Toolbar {
  constructor(onChange) {
    this.activeTool = 'build';
    this.onChange = onChange;

    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTool(btn.dataset.tool);
      });
    });
  }

  setTool(tool) {
    this.activeTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
    this.onChange(tool);
  }
}
