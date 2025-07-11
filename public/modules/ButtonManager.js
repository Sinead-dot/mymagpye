
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
    
    // Set styles using individual properties instead of cssText
    this.saveButton.style.position = 'fixed';
    this.saveButton.style.top = '50%';
    this.saveButton.style.right = '20px';
    this.saveButton.style.transform = 'translateY(-50%)';
    this.saveButton.style.zIndex = '10000';
    this.saveButton.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.5)';
    this.saveButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    this.saveButton.style.color = 'white';
    this.saveButton.style.border = 'none';
    this.saveButton.style.padding = '12px 24px';
    this.saveButton.style.borderRadius = '8px';
    this.saveButton.style.fontWeight = 'bold';
    this.saveButton.style.cursor = 'pointer';
    this.saveButton.style.margin = '0';
    this.saveButton.style.fontSize = '14px';
    this.saveButton.style.transition = 'all 0.3s ease';
    this.saveButton.style.maxWidth = '200px';
    this.saveButton.style.whiteSpace = 'nowrap';
    
    // Add event listener properly
    this.saveButton.addEventListener('click', onSave);
    
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
