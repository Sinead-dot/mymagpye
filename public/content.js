
// MyMagPye Content Script - MVP Version
class MyMagPyeExtension {
  constructor() {
    this.saveButton = null;
    this.productData = null;
    this.isProcessing = false;
    this.init();
  }

  init() {
    console.log('🔍 MyMagPye extension loading...');
    
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupExtension());
    } else {
      this.setupExtension();
    }
    
    // Also try after a short delay to catch dynamic content
    setTimeout(() => this.setupExtension(), 2000);
  }

  setupExtension() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    console.log('🔍 Setting up MyMagPye on:', window.location.hostname);
    
    // Extract product data
    this.productData = this.extractProductData();
    
    if (this.productData) {
      this.createSaveButton();
      console.log('✅ MyMagPye: Product detected', this.productData);
    } else {
      console.log('❌ MyMagPye: No product detected on this page');
    }
    
    this.isProcessing = false;
  }

  extractProductData() {
    const hostname = window.location.hostname;
    const url = window.location.href;
    
    // Skip if not on a product page
    if (!this.isProductPage(url)) {
      return null;
    }
    
    // Enhanced selectors for better detection
    const titleSelectors = [
      'h1[data-testid*="product"]',
      'h1.product-title',
      'h1.pdp-product-name',
      '.product-name h1',
      '.product-title',
      'h1[id*="product"]',
      '.ProductSummary-name',
      '#productTitle',
      '[data-cy="product-name"]',
      '.product-name',
      '.pdp-product-name'
    ];
    
    const priceSelectors = [
      '[data-testid*="price"]',
      '.price',
      '.product-price',
      '.current-price',
      '.Price-current',
      '.a-price-whole',
      '.notranslate',
      '[data-cy="price"]',
      '.price-current',
      '.price-now'
    ];
    
    const imageSelectors = [
      '[data-testid*="product-image"] img',
      '.product-image img',
      '.product-photo img',
      '.pdp-image img',
      '.ProductMedia img',
      '#landingImage',
      '.product-gallery img',
      '.product-main-image img'
    ];

    const title = this.extractText(titleSelectors);
    const priceText = this.extractText(priceSelectors);
    const image = this.extractImage(imageSelectors);
    
    console.log('Extracted data:', { title, priceText, image });
    
    if (!title || !priceText) {
      console.log('Missing required data:', { title: !!title, priceText: !!priceText });
      return null;
    }
    
    const price = this.parsePrice(priceText);
    if (price === 0) {
      console.log('Invalid price:', priceText);
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

  isProductPage(url) {
    // Simple heuristics to determine if this is a product page
    const productIndicators = [
      '/dp/',           // Amazon
      '/product/',      // General
      '/p/',           // Many sites
      '/item/',        // eBay style
      '/products/',    // Shopify style
    ];
    
    return productIndicators.some(indicator => url.includes(indicator)) ||
           url.includes('product') ||
           document.querySelector('.add-to-cart, .add-to-bag, [data-testid*="add-to"], .buy-now');
  }

  extractText(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  extractImage(selectors) {
    for (const selector of selectors) {
      const img = document.querySelector(selector);
      if (img && img.src && !img.src.includes('data:image')) {
        return img.src;
      }
    }
    return '';
  }

  parsePrice(priceText) {
    // Remove currency symbols and clean up
    const cleaned = priceText.replace(/[£$€¥₹,\s]/g, '');
    const match = cleaned.match(/[\d.]+/);
    const price = match ? parseFloat(match[0]) : 0;
    
    console.log('Price parsing:', priceText, '->', price);
    return price;
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
    // Remove any existing button
    const existingButton = document.querySelector('.mymagpye-save-btn');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Create save button
    this.saveButton = document.createElement('button');
    this.saveButton.innerHTML = '🔍 Hunt for Better Deals';
    this.saveButton.className = 'mymagpye-save-btn';
    this.saveButton.onclick = () => this.saveProduct();
    
    // Try to find a good place to insert the button
    const insertionPoints = [
      '.product-actions',
      '.add-to-cart',
      '.add-to-bag',
      '.buy-now',
      '#priceblock_dealprice',
      '.price-section',
      '.product-price',
      '.price'
    ];
    
    let inserted = false;
    for (const selector of insertionPoints) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) { // Check if element is visible
        element.insertAdjacentElement('afterend', this.saveButton);
        inserted = true;
        console.log('✅ Button inserted after:', selector);
        break;
      }
    }
    
    // Fallback: add to body with fixed positioning
    if (!inserted) {
      this.saveButton.style.cssText += `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
      `;
      document.body.appendChild(this.saveButton);
      console.log('✅ Button added to body (fallback)');
    }
  }

  async saveProduct() {
    if (!this.productData) {
      console.error('No product data to save');
      return;
    }
    
    // Disable button during processing
    this.saveButton.disabled = true;
    this.saveButton.innerHTML = '⏳ Saving...';
    
    try {
      // Save to extension storage
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      // Check if already saved
      const exists = savedItems.some(item => item.url === this.productData.url);
      if (exists) {
        this.showNotification('Already hunting for this item!', 'info');
        this.saveButton.innerHTML = '✅ Already Saved';
        return;
      }
      
      savedItems.push(this.productData);
      await chrome.storage.local.set({ savedItems });
      
      // Start hunting for better deals
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
      
      this.showNotification('Started hunting for better deals! 🏴‍☠️', 'success');
      this.saveButton.innerHTML = '✅ Hunt Started';
      
      console.log('✅ Product saved and hunt started:', this.productData.title);
      
    } catch (error) {
      console.error('Error saving product:', error);
      this.showNotification('Error starting hunt', 'error');
      this.saveButton.innerHTML = '❌ Error';
      this.saveButton.disabled = false;
    }
  }

  showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.mymagpye-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `mymagpye-notification mymagpye-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10001;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }
}

// Initialize extension
console.log('🚀 MyMagPye Content Script loaded');
new MyMagPyeExtension();
