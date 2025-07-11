
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
        if (content) {
          content.insertBefore(statsDiv, content.firstChild);
        }
      }
      
    } catch (error) {
      console.error('Error loading hunt results:', error);
    }
  }

  displayItems(items) {
    const content = document.getElementById('content');
    const emptyState = document.getElementById('emptyState');
    
    if (!content || !emptyState) {
      console.error('Required DOM elements not found');
      return;
    }
    
    if (items.length === 0) {
      emptyState.style.display = 'block';
      // Clear content but keep empty state
      const existingItems = content.querySelectorAll('.item');
      existingItems.forEach(item => item.remove());
      return;
    }
    
    emptyState.style.display = 'none';
    
    // Clear existing items
    const existingItems = content.querySelectorAll('.item');
    existingItems.forEach(item => item.remove());
    
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
    const openAppButton = document.getElementById('openApp');
    if (openAppButton) {
      openAppButton.addEventListener('click', () => {
        // Open the actual MyMagPye web app
        chrome.tabs.create({ url: 'https://mymagpye.lovable.app/' });
      });
    }

    // Add clear all button
    const footer = document.querySelector('.footer');
    if (footer) {
      const clearButton = document.createElement('button');
      clearButton.textContent = 'Clear All Items';
      clearButton.style.cssText = `
        background: #ef4444; color: white; border: none; padding: 8px 16px; 
        border-radius: 6px; font-size: 12px; cursor: pointer; margin-top: 10px; width: 100%;
      `;
      clearButton.onclick = () => this.clearAllItems();
      
      footer.appendChild(clearButton);
    }
  }

  async clearAllItems() {
    if (confirm('Clear all saved items?')) {
      try {
        await chrome.storage.local.set({ savedItems: [], huntResults: {} });
        
        // Safely refresh the display
        const emptyState = document.getElementById('emptyState');
        const content = document.getElementById('content');
        
        if (emptyState && content) {
          // Remove all items from content
          const existingItems = content.querySelectorAll('.item');
          existingItems.forEach(item => item.remove());
          
          // Show empty state
          emptyState.style.display = 'block';
          
          // Remove hunt stats if they exist
          const huntStats = content.querySelector('.hunt-stats');
          if (huntStats) {
            huntStats.remove();
          }
        }
        
        console.log('All items cleared');
      } catch (error) {
        console.error('Error clearing items:', error);
      }
    }
  }
}

// Initialize popup - make it globally accessible for button clicks
const popupManager = new PopupManager();
