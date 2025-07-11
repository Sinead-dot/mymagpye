
// MyMagPye Content Script - Web App Integration
class MyMagPyeExtension {
  constructor() {
    this.productData = null;
    this.isProcessing = false;
    
    // Initialize managers
    this.productExtractor = new ProductExtractor();
    this.sidebarManager = new SidebarManager();
    this.notificationManager = new NotificationManager();
    
    this.init();
  }

  init() {
    console.log('🔍 MyMagPye extension loading (Web App Integration)...');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupExtension());
    } else {
      this.setupExtension();
    }
    
    setTimeout(() => this.setupExtension(), 2000);
  }

  setupExtension() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    console.log('🔍 Setting up MyMagPye on:', window.location.hostname);
    
    // Create sidebar
    this.sidebarManager.createSidebar();
    
    // Extract product data
    this.productData = this.productExtractor.extractProductData();
    
    if (this.productData) {
      // Display current product in sidebar
      this.sidebarManager.displayCurrentProduct(this.productData);
      console.log('✅ MyMagPye: Product detected', this.productData);
    }
    
    this.isProcessing = false;
  }

  async saveProduct() {
    if (!this.productData) {
      console.error('No product data to save');
      this.notificationManager.showNotification('No product data to save', 'error');
      return;
    }
    
    // Show loading state in sidebar
    const huntBtn = document.querySelector('#mymagpye-quick-hunt');
    if (huntBtn) {
      huntBtn.textContent = '⏳ Hunting...';
      huntBtn.disabled = true;
    }
    
    try {
      // Try to save to web app database first
      const savedToWebApp = await this.saveToWebApp(this.productData);
      
      if (savedToWebApp) {
        this.notificationManager.showNotification('Treasure saved to MyMagPye! 🏴‍☠️', 'success');
        
        if (huntBtn) {
          huntBtn.textContent = '✅ Saved to MyMagPye';
        }
      } else {
        // Fallback to local storage
        await this.saveToLocalStorage(this.productData);
        this.notificationManager.showNotification('Treasure saved locally! Sign in to sync across devices. 🏴‍☠️', 'info');
        
        if (huntBtn) {
          huntBtn.textContent = '✅ Saved Locally';
        }
      }
      
      // Refresh sidebar data
      this.sidebarManager.loadSidebarData();
      
      console.log('✅ Product saved:', this.productData.title);
      
    } catch (error) {
      console.error('Error saving product:', error);
      this.notificationManager.showNotification('Error saving treasure: ' + error.message, 'error');
      if (huntBtn) {
        huntBtn.textContent = '❌ Error';
      }
    } finally {
      if (huntBtn) {
        setTimeout(() => {
          huntBtn.disabled = false;
          huntBtn.textContent = '🔍 Hunt';
        }, 2000);
      }
    }
  }

  async saveToWebApp(productData) {
    try {
      // Send message to web app via postMessage
      const messageData = {
        type: 'MYMAGPYE_SAVE_TREASURE',
        treasure: {
          title: productData.title,
          brand: productData.brand || 'Unknown Brand',
          price: productData.price || 0,
          image: productData.image || '/placeholder.svg',
          url: productData.url,
          platform: productData.platform,
          status: 'hunting',
          confidence: productData.confidence
        }
      };

      // Post message to all frames (including the main web app)
      window.postMessage(messageData, '*');
      
      // Also try to communicate with any MyMagPye web app tabs
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          await chrome.runtime.sendMessage({
            action: 'saveToWebApp',
            treasure: messageData.treasure
          });
        } catch (chromeError) {
          console.log('Chrome extension messaging failed:', chromeError);
          // Don't throw here as postMessage might still work
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to save to web app:', error);
      return false;
    }
  }

  async saveToLocalStorage(productData) {
    try {
      // Check if chrome.storage is available
      if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage not available');
      }

      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      const exists = savedItems.some(item => item.url === productData.url);
      if (exists) {
        throw new Error('Item already exists');
      }
      
      savedItems.push(productData);
      await chrome.storage.local.set({ savedItems });
      
      // Try to start hunting, but don't fail if it doesn't work
      if (chrome.runtime) {
        try {
          await chrome.runtime.sendMessage({
            action: 'startHunting',
            productData: productData
          });
        } catch (huntError) {
          console.log('Failed to start hunting:', huntError);
          // Don't throw here - the item was still saved locally
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save to local storage:', error);
      throw error;
    }
  }

  async removeItem(index) {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage not available');
      }

      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      savedItems.splice(index, 1);
      await chrome.storage.local.set({ savedItems });
      
      this.sidebarManager.loadSidebarData();
      this.notificationManager.showNotification('Item removed successfully', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      this.notificationManager.showNotification('Error removing item: ' + error.message, 'error');
    }
  }
}

// Load required modules and initialize
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src);
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Load all modules and then initialize the extension
Promise.all([
  loadScript('modules/ProductExtractor.js'),
  loadScript('modules/SidebarManager.js'),
  loadScript('modules/NotificationManager.js')
]).then(() => {
  window.myMagPyeExtension = new MyMagPyeExtension();
}).catch(error => {
  console.error('Failed to load MyMagPye modules:', error);
});
