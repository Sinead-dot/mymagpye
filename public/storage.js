
// Storage utilities for MyMagPye extension
class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async saveItem(item) {
    try {
      const result = await this.storage.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      // Check if item already exists
      const existingIndex = savedItems.findIndex(saved => saved.url === item.url);
      
      if (existingIndex >= 0) {
        // Update existing item
        savedItems[existingIndex] = { ...savedItems[existingIndex], ...item };
      } else {
        // Add new item
        savedItems.push(item);
      }
      
      await this.storage.set({ savedItems });
      return true;
    } catch (error) {
      console.error('Error saving item:', error);
      return false;
    }
  }

  async getSavedItems() {
    try {
      const result = await this.storage.get(['savedItems']);
      return result.savedItems || [];
    } catch (error) {
      console.error('Error getting saved items:', error);
      return [];
    }
  }

  async removeItem(url) {
    try {
      const result = await this.storage.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      const filteredItems = savedItems.filter(item => item.url !== url);
      await this.storage.set({ savedItems: filteredItems });
      
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  async saveHuntResult(url, huntResult) {
    try {
      const result = await this.storage.get(['huntResults']);
      const huntResults = result.huntResults || {};
      
      huntResults[url] = huntResult;
      await this.storage.set({ huntResults });
      
      return true;
    } catch (error) {
      console.error('Error saving hunt result:', error);
      return false;
    }
  }

  async getHuntResults() {
    try {
      const result = await this.storage.get(['huntResults']);
      return result.huntResults || {};
    } catch (error) {
      console.error('Error getting hunt results:', error);
      return {};
    }
  }

  async clearAllData() {
    try {
      await this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
