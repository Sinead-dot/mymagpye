
// MyMagPye Content Script - MindStudio Style Integration
class MyMagPyeExtension {
  constructor() {
    this.productData = null;
    this.isProcessing = false;
    
    // Initialize managers
    this.productExtractor = new ProductExtractor();
    this.sidebarManager = new SidebarManager();
    this.notificationManager = new NotificationManager();
    // Remove ButtonManager as we're integrating into sidebar
    
    this.init();
  }

  init() {
    console.log('🔍 MyMagPye extension loading (MindStudio style)...');
    
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
    
    // Create MindStudio-style sidebar
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
      return;
    }
    
    // Show loading state in sidebar
    const huntBtn = document.querySelector('#mymagpye-quick-hunt');
    if (huntBtn) {
      huntBtn.textContent = '⏳ Hunting...';
      huntBtn.disabled = true;
    }
    
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      const exists = savedItems.some(item => item.url === this.productData.url);
      if (exists) {
        this.notificationManager.showNotification('Already hunting for this item!', 'info');
        if (huntBtn) {
          huntBtn.textContent = '✅ Already Saved';
        }
        return;
      }
      
      savedItems.push(this.productData);
      await chrome.storage.local.set({ savedItems });
      
      chrome.runtime.sendMessage({
        action: 'startHunting',
        productData: this.productData
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Message error:', chrome.runtime.lastError);
        } else {
          console.log('Hunt started successfully');
        }
      });
      
      this.notificationManager.showNotification('Started hunting for better deals! 🏴‍☠️', 'success');
      
      if (huntBtn) {
        huntBtn.textContent = '✅ Hunt Started';
      }
      
      // Refresh sidebar data
      this.sidebarManager.loadSidebarData();
      
      console.log('✅ Product saved and hunt started:', this.productData.title);
      
    } catch (error) {
      console.error('Error saving product:', error);
      this.notificationManager.showNotification('Error starting hunt', 'error');
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

  async removeItem(index) {
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      savedItems.splice(index, 1);
      await chrome.storage.local.set({ savedItems });
      
      this.sidebarManager.loadSidebarData();
      this.notificationManager.showNotification('Item removed successfully', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      this.notificationManager.showNotification('Error removing item', 'error');
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
