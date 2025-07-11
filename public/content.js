
// MyMagPye Content Script - Extracts product data and adds save button
class MyMagPyeExtension {
  constructor() {
    this.saveButton = null;
    this.productData = null;
    this.init();
  }

  init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupExtension());
    } else {
      this.setupExtension();
    }
  }

  setupExtension() {
    // Extract product data
    this.productData = this.extractProductData();
    
    if (this.productData) {
      this.createSaveButton();
      console.log('MyMagPye: Product detected', this.productData);
    }
  }

  extractProductData() {
    const hostname = window.location.hostname;
    const url = window.location.href;
    
    // Generic selectors for common e-commerce patterns
    const titleSelectors = [
      'h1[data-testid*="product"]',
      'h1.product-title',
      'h1.pdp-product-name',
      '.product-name h1',
      '.product-title',
      'h1[id*="product"]',
      '.ProductSummary-name',
      '#productTitle'
    ];
    
    const priceSelectors = [
      '[data-testid*="price"]',
      '.price',
      '.product-price',
      '.current-price',
      '.Price-current',
      '.a-price-whole',
      '.notranslate'
    ];
    
    const imageSelectors = [
      '[data-testid*="product-image"] img',
      '.product-image img',
      '.product-photo img',
      '.pdp-image img',
      '.ProductMedia img',
      '#landingImage'
    ];

    const title = this.extractText(titleSelectors);
    const priceText = this.extractText(priceSelectors);
    const image = this.extractImage(imageSelectors);
    
    if (!title || !priceText) {
      return null;
    }
    
    const price = this.parsePrice(priceText);
    if (price === 0) {
      return null;
    }
    
    return {
      title: title.trim(),
      price,
      image: image || '/placeholder.svg',
      url,
      platform: this.getPlatformName(hostname),
      timestamp: Date.now()
    };
  }

  extractText(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  extractImage(selectors) {
    for (const selector of selectors) {
      const img = document.querySelector(selector);
      if (img && img.src) {
        return img.src;
      }
    }
    return '';
  }

  parsePrice(priceText) {
    const cleaned = priceText.replace(/[£$€¥₹]/g, '').replace(/[,\s]/g, '');
    const match = cleaned.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  getPlatformName(hostname) {
    const platformMap = {
      'zara.com': 'Zara',
      'hm.com': 'H&M',
      'asos.com': 'ASOS',
      'amazon.co.uk': 'Amazon UK',
      'amazon.com': 'Amazon',
      'next.co.uk': 'Next',
      'johnlewis.com': 'John Lewis'
    };
    
    for (const [domain, name] of Object.entries(platformMap)) {
      if (hostname.includes(domain)) {
        return name;
      }
    }
    
    return hostname.replace('www.', '').split('.')[0];
  }

  createSaveButton() {
    // Create save button
    this.saveButton = document.createElement('button');
    this.saveButton.innerHTML = '🔍 Hunt for Better Deals';
    this.saveButton.className = 'mymagpye-save-btn';
    this.saveButton.onclick = () => this.saveProduct();
    
    // Try to find a good place to insert the button
    const insertionPoints = [
      '.product-actions',
      '.add-to-cart',
      '.buy-now',
      '#priceblock_dealprice',
      '.price-section'
    ];
    
    let inserted = false;
    for (const selector of insertionPoints) {
      const element = document.querySelector(selector);
      if (element) {
        element.insertAdjacentElement('afterend', this.saveButton);
        inserted = true;
        break;
      }
    }
    
    // Fallback: add to top of page
    if (!inserted) {
      document.body.insertAdjacentElement('afterbegin', this.saveButton);
    }
  }

  async saveProduct() {
    if (!this.productData) return;
    
    try {
      // Save to extension storage
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      // Check if already saved
      const exists = savedItems.some(item => item.url === this.productData.url);
      if (exists) {
        this.showNotification('Already hunting for this item!', 'info');
        return;
      }
      
      savedItems.push(this.productData);
      await chrome.storage.local.set({ savedItems });
      
      // Start hunting for better deals
      chrome.runtime.sendMessage({
        action: 'startHunting',
        productData: this.productData
      });
      
      this.showNotification('Started hunting for better deals!', 'success');
      this.saveButton.innerHTML = '✅ Hunting Started';
      this.saveButton.disabled = true;
      
    } catch (error) {
      console.error('Error saving product:', error);
      this.showNotification('Error starting hunt', 'error');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `mymagpye-notification mymagpye-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize extension
new MyMagPyeExtension();
