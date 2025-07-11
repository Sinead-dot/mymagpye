
// Button management utility
class ButtonManager {
  constructor() {
    this.saveButton = null;
  }

  createToggleButton(onToggle) {
    const existingToggle = document.querySelector('.mymagpye-toggle-btn');
    if (existingToggle) {
      existingToggle.remove();
    }

    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🔍';
    toggleBtn.className = 'mymagpye-toggle-btn';
    toggleBtn.title = 'Toggle MyMagPye Sidebar';
    toggleBtn.addEventListener('click', onToggle);
    
    document.body.appendChild(toggleBtn);
  }

  createSaveButton(onSave) {
    const existingButton = document.querySelector('.mymagpye-save-btn');
    if (existingButton) {
      existingButton.remove();
    }
    
    this.saveButton = document.createElement('button');
    this.saveButton.innerHTML = '🔍 Hunt for Better Deals';
    this.saveButton.className = 'mymagpye-save-btn';
    this.saveButton.addEventListener('click', onSave);
    
    this.saveButton.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      right: 20px !important;
      transform: translateY(-50%) !important;
      z-index: 10000 !important;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5) !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      margin: 0 !important;
      font-size: 14px !important;
      transition: all 0.3s ease !important;
      max-width: 200px !important;
      white-space: nowrap !important;
    `;
    
    this.addHoverEffects();
    document.body.appendChild(this.saveButton);
    console.log('✅ Button positioned as floating element on right side, halfway down');
  }

  addHoverEffects() {
    this.saveButton.addEventListener('mouseenter', () => {
      this.saveButton.style.transform = 'translateY(-50%) translateX(-2px)';
      this.saveButton.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
    });
    
    this.saveButton.addEventListener('mouseleave', () => {
      this.saveButton.style.transform = 'translateY(-50%)';
      this.saveButton.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.5)';
    });
  }

  updateSaveButton(text, disabled = false) {
    if (this.saveButton) {
      this.saveButton.innerHTML = text;
      this.saveButton.disabled = disabled;
    }
  }
}
