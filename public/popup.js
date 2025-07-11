
// Popup script for MyMagPye extension
class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSavedItems();
    this.setupEventListeners();
  }

  async loadSavedItems() {
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      this.displayItems(savedItems);
    } catch (error) {
      console.error('Error loading saved items:', error);
    }
  }

  displayItems(items) {
    const content = document.getElementById('content');
    const emptyState = document.getElementById('emptyState');
    
    if (items.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    content.innerHTML = '';
    
    items.forEach(item => {
      const itemElement = this.createItemElement(item);
      content.appendChild(itemElement);
    });
  }

  createItemElement(item) {
    const div = document.createElement('div');
    div.className = 'item';
    div.onclick = () => this.openItem(item.url);
    
    div.innerHTML = `
      <img src="${item.image}" alt="${item.title}" class="item-image" onerror="this.src='/placeholder.svg'">
      <div class="item-info">
        <div class="item-title">${item.title}</div>
        <div class="item-price">£${item.price}</div>
        <div class="item-platform">${item.platform}</div>
      </div>
    `;
    
    return div;
  }

  openItem(url) {
    chrome.tabs.create({ url });
  }

  setupEventListeners() {
    document.getElementById('openApp').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    });
  }
}

// Initialize popup
new PopupManager();
