
// Popup script for MyMagPye extension - MVP Version
class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    console.log('MyMagPye Popup initialized');
    await this.loadSavedItems();
    await this.loadHuntResults();
    this.setupEventListeners();
  }

  async loadSavedItems() {
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      console.log('Loaded saved items:', savedItems.length);
      this.displayItems(savedItems);
    } catch (error) {
      console.error('Error loading saved items:', error);
    }
  }

  async loadHuntResults() {
    try {
      const result = await chrome.storage.local.get(['huntResults']);
      const huntResults = result.huntResults || {};
      
      // Show hunt results summary
      const totalResults = Object.keys(huntResults).length;
      const successfulHunts = Object.values(huntResults).filter(r => r.betterDeals.length > 0).length;
      
      if (totalResults > 0) {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'hunt-stats';
        statsDiv.innerHTML = `
          <div style="background: rgba(255,255,255,0.1); padding: 10px; margin-bottom: 15px; border-radius: 8px;">
            <div style="color: white; font-size: 12px;">
              🔍 ${totalResults} items hunted • 🏴‍☠️ ${successfulHunts} treasures found
            </div>
          </div>
        `;
        
        const content = document.getElementById('content');
        content.insertBefore(statsDiv, content.firstChild);
      }
      
    } catch (error) {
      console.error('Error loading hunt results:', error);
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
    
    items.forEach((item, index) => {
      const itemElement = this.createItemElement(item, index);
      content.appendChild(itemElement);
    });
  }

  createItemElement(item, index) {
    const div = document.createElement('div');
    div.className = 'item';
    div.onclick = () => this.openItem(item.url);
    
    // Format price properly
    const price = typeof item.price === 'number' ? item.price.toFixed(2) : item.price;
    
    div.innerHTML = `
      <img src="${item.image}" alt="${item.title}" class="item-image" onerror="this.src='/placeholder.svg'">
      <div class="item-info">
        <div class="item-title">${item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title}</div>
        <div class="item-price">£${price}</div>
        <div class="item-platform">${item.platform}</div>
        <div class="item-actions">
          <button onclick="event.stopPropagation(); popupManager.removeItem(${index})" 
                  style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
            Remove
          </button>
        </div>
      </div>
    `;
    
    return div;
  }

  async removeItem(index) {
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      savedItems.splice(index, 1);
      await chrome.storage.local.set({ savedItems });
      
      this.displayItems(savedItems);
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  openItem(url) {
    chrome.tabs.create({ url });
  }

  setupEventListeners() {
    document.getElementById('openApp').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    });

    // Add clear all button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear All Items';
    clearButton.style.cssText = `
      background: #ef4444; color: white; border: none; padding: 8px 16px; 
      border-radius: 6px; font-size: 12px; cursor: pointer; margin-top: 10px; width: 100%;
    `;
    clearButton.onclick = () => this.clearAllItems();
    
    document.querySelector('.footer').appendChild(clearButton);
  }

  async clearAllItems() {
    if (confirm('Clear all saved items?')) {
      try {
        await chrome.storage.local.set({ savedItems: [], huntResults: {} });
        this.displayItems([]);
        console.log('All items cleared');
      } catch (error) {
        console.error('Error clearing items:', error);
      }
    }
  }
}

// Initialize popup - make it globally accessible for button clicks
const popupManager = new PopupManager();
