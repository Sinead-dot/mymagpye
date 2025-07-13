
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

  // Check if extension context is still valid
  isExtensionContextValid() {
    try {
      return typeof chrome !== 'undefined' && 
             chrome.runtime && 
             chrome.runtime.id;
    } catch (error) {
      return false;
    }
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
      // Check if extension context is still valid
      if (!this.isExtensionContextValid()) {
        console.warn('Extension context invalidated - falling back to web app only');
        
        // Try to save to web app only
        const savedToWebApp = await this.saveToWebApp(this.productData);
        
        if (savedToWebApp) {
          this.notificationManager.showNotification('Treasure saved to MyMagPye! 🏴‍☠️', 'success');
          if (huntBtn) {
            huntBtn.textContent = '✅ Saved to MyMagPye';
          }
        } else {
          throw new Error('Failed to save to web app and extension context is invalid');
        }
      } else {
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
      }
      
      // Refresh sidebar data if possible
      if (this.isExtensionContextValid()) {
        this.sidebarManager.loadSidebarData();
      }
      
      console.log('✅ Product saved:', this.productData.title);
      
    } catch (error) {
      console.error('Error saving product:', error);
      
      // More user-friendly error messages
      let errorMessage = 'Error saving treasure';
      if (error.message.includes('Extension context invalidated')) {
        errorMessage = 'Extension needs to be refreshed. Please reload this page after refreshing the extension.';
      } else if (error.message.includes('Could not establish connection')) {
        errorMessage = 'Extension connection lost. Please refresh this page.';
      } else {
        errorMessage += ': ' + error.message;
      }
      
      this.notificationManager.showNotification(errorMessage, 'error');
      if (huntBtn) {
        huntBtn.textContent = '❌ Error - Refresh Page';
      }
    } finally {
      if (huntBtn) {
        setTimeout(() => {
          if (huntBtn.textContent.includes('Error')) {
            // Don't reset error state automatically
            return;
          }
          huntBtn.disabled = false;
          huntBtn.textContent = '🔍 Hunt';
        }, 3000);
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
      
      // Also try to communicate with any MyMagPye web app tabs if extension context is valid
      if (this.isExtensionContextValid()) {
        try {
          const response = await chrome.runtime.sendMessage({
            action: 'saveToWebApp',
            treasure: messageData.treasure
          });
          console.log('Chrome extension response:', response);
        } catch (chromeError) {
          console.log('Chrome extension messaging failed (expected if context invalidated):', chromeError);
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
      // Check if chrome.storage is available and extension context is valid
      if (!this.isExtensionContextValid()) {
        throw new Error('Extension context invalidated - cannot save locally');
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
      try {
        await chrome.runtime.sendMessage({
          action: 'startHunting',
          productData: productData
        });
      } catch (huntError) {
        console.log('Failed to start hunting (expected if context invalidated):', huntError);
        // Don't throw here - the item was still saved locally
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save to local storage:', error);
      throw error;
    }
  }

  async removeItem(index) {
    try {
      if (!this.isExtensionContextValid()) {
        throw new Error('Extension context invalidated - cannot remove item');
      }

      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      savedItems.splice(index, 1);
      await chrome.storage.local.set({ savedItems });
      
      this.sidebarManager.loadSidebarData();
      this.notificationManager.showNotification('Item removed successfully', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      let errorMessage = 'Error removing item';
      if (error.message.includes('Extension context invalidated')) {
        errorMessage = 'Please refresh this page after refreshing the extension.';
      } else {
        errorMessage += ': ' + error.message;
      }
      this.notificationManager.showNotification(errorMessage, 'error');
    }
  }
}

// Initialize the extension after ensuring all classes are loaded
function initializeExtension() {
  // Check if all required classes are available
  if (typeof ProductExtractor === 'undefined' || 
      typeof SidebarManager === 'undefined' || 
      typeof NotificationManager === 'undefined') {
    console.log('MyMagPye: Waiting for modules to load...');
    setTimeout(initializeExtension, 100);
    return;
  }
  
  console.log('MyMagPye: All modules loaded, initializing extension...');
  window.myMagPyeExtension = new MyMagPyeExtension();
}

// Start initialization
initializeExtension();
