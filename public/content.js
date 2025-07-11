
// MyMagPye Content Script - Enhanced with Sidebar Panel
class MyMagPyeExtension {
  constructor() {
    this.saveButton = null;
    this.sidebar = null;
    this.sidebarOpen = false;
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
    
    // Always create the sidebar and toggle button
    this.createSidebar();
    this.createToggleButton();
    
    // Extract product data if on product page
    this.productData = this.extractProductData();
    
    if (this.productData) {
      this.createSaveButton();
      console.log('✅ MyMagPye: Product detected', this.productData);
    }
    
    this.isProcessing = false;
  }

  createToggleButton() {
    // Remove any existing toggle button
    const existingToggle = document.querySelector('.mymagpye-toggle-btn');
    if (existingToggle) {
      existingToggle.remove();
    }

    // Create floating toggle button (always visible)
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🔍';
    toggleBtn.className = 'mymagpye-toggle-btn';
    toggleBtn.title = 'Toggle MyMagPye Sidebar';
    toggleBtn.onclick = () => this.toggleSidebar();
    
    document.body.appendChild(toggleBtn);
  }

  createSidebar() {
    // Remove any existing sidebar
    const existingSidebar = document.querySelector('.mymagpye-sidebar');
    if (existingSidebar) {
      existingSidebar.remove();
    }

    // Create sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.className = 'mymagpye-sidebar';
    this.sidebar.innerHTML = `
      <div class="mymagpye-sidebar-header">
        <div class="mymagpye-sidebar-logo">
          <span class="mymagpye-logo-icon">🔍</span>
          <span class="mymagpye-logo-text">MyMagPye</span>
        </div>
        <button class="mymagpye-close-btn" onclick="myMagPyeExtension.toggleSidebar()">×</button>
      </div>
      <div class="mymagpye-sidebar-content">
        <div class="mymagpye-sidebar-section">
          <h3>Saved Items</h3>
          <div id="mymagpye-saved-items" class="mymagpye-items-list">
            <div class="mymagpye-empty-state">
              <div class="mymagpye-empty-icon">🏴‍☠️</div>
              <p>No treasures saved yet!</p>
              <small>Browse products and click "Hunt for Better Deals" to start collecting treasures.</small>
            </div>
          </div>
        </div>
        <div class="mymagpye-sidebar-section">
          <h3>Hunt Results</h3>
          <div id="mymagpye-hunt-results" class="mymagpye-results-list">
            <div class="mymagpye-empty-state">
              <div class="mymagpye-empty-icon">🏴‍☠️</div>
              <p>No hunt results yet!</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mymagpye-sidebar-footer">
        <button class="mymagpye-full-app-btn" onclick="chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })">
          Open Full App
        </button>
      </div>
    `;
    
    document.body.appendChild(this.sidebar);
    
    // Load saved items and hunt results
    this.loadSidebarData();
  }

  toggleSidebar() {
    if (this.sidebarOpen) {
      this.sidebar.classList.remove('mymagpye-sidebar-open');
      this.sidebarOpen = false;
    } else {
      this.sidebar.classList.add('mymagpye-sidebar-open');
      this.sidebarOpen = true;
      // Refresh data when opening
      this.loadSidebarData();
    }
  }

  async loadSidebarData() {
    try {
      const result = await chrome.storage.local.get(['savedItems', 'huntResults']);
      const savedItems = result.savedItems || [];
      const huntResults = result.huntResults || {};
      
      this.displaySavedItems(savedItems);
      this.displayHuntResults(huntResults);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    }
  }

  displaySavedItems(items) {
    const container = document.getElementById('mymagpye-saved-items');
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="mymagpye-empty-state">
          <div class="mymagpye-empty-icon">🏴‍☠️</div>
          <p>No treasures saved yet!</p>
          <small>Browse products and click "Hunt for Better Deals" to start collecting treasures.</small>
        </div>
      `;
      return;
    }
    
    container.innerHTML = items.map((item, index) => `
      <div class="mymagpye-sidebar-item" onclick="window.open('${item.url}', '_blank')">
        <img src="${item.image}" alt="${item.title}" class="mymagpye-item-image" onerror="this.src='/placeholder.svg'">
        <div class="mymagpye-item-info">
          <div class="mymagpye-item-title">${item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title}</div>
          <div class="mymagpye-item-price">£${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</div>
          <div class="mymagpye-item-platform">${item.platform}</div>
        </div>
        <button class="mymagpye-remove-btn" onclick="event.stopPropagation(); myMagPyeExtension.removeItem(${index})">×</button>
      </div>
    `).join('');
  }

  displayHuntResults(huntResults) {
    const container = document.getElementById('mymagpye-hunt-results');
    const resultEntries = Object.entries(huntResults);
    
    if (resultEntries.length === 0) {
      container.innerHTML = `
        <div class="mymagpye-empty-state">
          <div class="mymagpye-empty-icon">🔍</div>
          <p>No hunt results yet!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = resultEntries.map(([url, result]) => `
      <div class="mymagpye-hunt-result">
        <div class="mymagpye-result-header">
          <strong>${result.originalItem?.title || 'Product'}</strong>
          <span class="mymagpye-deals-count">${result.betterDeals?.length || 0} deals found</span>
        </div>
        ${result.betterDeals?.length > 0 ? `
          <div class="mymagpye-deals-list">
            ${result.betterDeals.slice(0, 2).map(deal => `
              <div class="mymagpye-deal-item" onclick="window.open('${deal.url}', '_blank')">
                <span class="mymagpye-deal-platform">${deal.platform}</span>
                <span class="mymagpye-deal-price">£${deal.price}</span>
                <span class="mymagpye-savings">Save £${(result.originalItem.price - deal.price).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p class="mymagpye-no-deals">No better deals found</p>'}
      </div>
    `).join('');
  }

  async removeItem(index) {
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      savedItems.splice(index, 1);
      await chrome.storage.local.set({ savedItems });
      
      this.loadSidebarData();
      this.showNotification('Item removed successfully', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      this.showNotification('Error removing item', 'error');
    }
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
    
    // Find the best insertion point - look for elements that are typically halfway down the page
    const insertionPoints = [
      // Product description/details area (usually mid-page)
      '#feature-bullets',
      '#productDescription',
      '.product-description',
      '.product-details',
      '#detailBullets_feature_div',
      
      // Reviews section (usually mid-page)
      '#reviews-medley-footer',
      '#customerReviews',
      '.reviews-section',
      
      // Related products or recommendations (mid-page)
      '#similarities_feature_div',
      '#HLCXComparisonWidget_feature_div',
      
      // Alternative spots if above not found
      '.product-info',
      '.product-summary',
      '#priceblock_dealprice',
      '.price-section',
      '.product-price',
      '.price'
    ];
    
    let inserted = false;
    for (const selector of insertionPoints) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) { // Check if element is visible
        // Insert before the element to appear above it
        element.insertAdjacentElement('beforebegin', this.saveButton);
        inserted = true;
        console.log('✅ Button inserted before:', selector);
        break;
      }
    }
    
    // Fallback: add to body with fixed positioning at middle of viewport
    if (!inserted) {
      this.saveButton.style.cssText += `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
      `;
      document.body.appendChild(this.saveButton);
      console.log('✅ Button added to body at middle of viewport (fallback)');
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
      
      // Refresh sidebar if open
      if (this.sidebarOpen) {
        this.loadSidebarData();
      }
      
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
      top: 120px;
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

// Initialize extension - make it globally accessible
const myMagPyeExtension = new MyMagPyeExtension();
