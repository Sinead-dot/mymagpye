
// Sidebar management utility - MindStudio-like side panel
class SidebarManager {
  constructor() {
    this.sidebar = null;
    this.sidebarOpen = true; // Default to open like MindStudio
    this.isInitialized = false;
  }

  createSidebar() {
    if (this.isInitialized) return;
    
    const existingSidebar = document.querySelector('.mymagpye-sidebar');
    if (existingSidebar) {
      existingSidebar.remove();
    }

    // Create sidebar container positioned further down the page
    this.sidebar = document.createElement('div');
    this.sidebar.className = 'mymagpye-sidebar mymagpye-sidebar-mindstudio';
    this.sidebar.innerHTML = `
      <div class="mymagpye-sidebar-header">
        <div class="mymagpye-sidebar-logo">
          <span class="mymagpye-logo-icon">🔍</span>
          <span class="mymagpye-logo-text">MyMagPye</span>
        </div>
        <button class="mymagpye-minimize-btn" title="Minimize Panel">−</button>
      </div>
      <div class="mymagpye-sidebar-content">
        <div class="mymagpye-sidebar-section mymagpye-current-treasure">
          <h3>Current Treasure</h3>
          <div id="mymagpye-current-product" class="mymagpye-current-section">
            <div class="mymagpye-empty-state">
              <div class="mymagpye-empty-icon">🔍</div>
              <p>No treasure detected on this page</p>
            </div>
          </div>
        </div>
        <div class="mymagpye-sidebar-section">
          <h3>Saved Items</h3>
          <div id="mymagpye-saved-items" class="mymagpye-items-list">
            <div class="mymagpye-empty-state">
              <div class="mymagpye-empty-icon">🏴‍☠️</div>
              <p>No treasures saved yet!</p>
            </div>
          </div>
        </div>
        <div class="mymagpye-sidebar-section">
          <h3>Hunt Results</h3>
          <div id="mymagpye-hunt-results" class="mymagpye-results-list">
            <div class="mymagpye-empty-state">
              <div class="mymagpye-empty-icon">⚡</div>
              <p>No hunt results yet!</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mymagpye-sidebar-footer">
        <button class="mymagpye-full-app-btn">
          📱 Open Full App
        </button>
      </div>
    `;
    
    // Add to page and adjust layout
    document.body.appendChild(this.sidebar);
    this.adjustPageLayout();
    this.attachEventListeners();
    this.loadSidebarData();
    this.isInitialized = true;
  }

  adjustPageLayout() {
    // Add margin to body to accommodate the sidebar like MindStudio
    document.body.style.marginRight = '320px';
    document.body.style.transition = 'margin-right 0.3s ease';
    
    // Handle responsive design
    if (window.innerWidth < 1200) {
      document.body.style.marginRight = '280px';
    }
  }

  attachEventListeners() {
    const minimizeBtn = this.sidebar.querySelector('.mymagpye-minimize-btn');
    minimizeBtn.addEventListener('click', () => this.toggleSidebar());
    
    const fullAppBtn = this.sidebar.querySelector('.mymagpye-full-app-btn');
    fullAppBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.sidebarOpen) {
        this.adjustPageLayout();
      }
    });
  }

  toggleSidebar() {
    if (this.sidebarOpen) {
      this.sidebar.style.transform = 'translateX(100%)';
      document.body.style.marginRight = '0';
      this.sidebarOpen = false;
      
      // Show a small tab to reopen
      this.createReopenTab();
    } else {
      this.sidebar.style.transform = 'translateX(0)';
      this.adjustPageLayout();
      this.sidebarOpen = true;
      this.removeReopenTab();
      this.loadSidebarData();
    }
  }

  createReopenTab() {
    const existingTab = document.querySelector('.mymagpye-reopen-tab');
    if (existingTab) return;

    const reopenTab = document.createElement('div');
    reopenTab.className = 'mymagpye-reopen-tab';
    reopenTab.innerHTML = '🔍';
    reopenTab.title = 'Open MyMagPye Panel';
    reopenTab.addEventListener('click', () => this.toggleSidebar());
    
    document.body.appendChild(reopenTab);
  }

  removeReopenTab() {
    const reopenTab = document.querySelector('.mymagpye-reopen-tab');
    if (reopenTab) {
      reopenTab.remove();
    }
  }

  displayCurrentProduct(productData) {
    const container = document.getElementById('mymagpye-current-product');
    if (!container || !productData) return;

    container.innerHTML = `
      <div class="mymagpye-current-treasure-card">
        <div class="mymagpye-treasure-header">
          <img src="${productData.image}" alt="${productData.title}" class="mymagpye-treasure-image">
          <div class="mymagpye-treasure-badge">💎 Found</div>
        </div>
        <div class="mymagpye-treasure-info">
          <div class="mymagpye-treasure-title">${productData.title.length > 40 ? productData.title.substring(0, 40) + '...' : productData.title}</div>
          <div class="mymagpye-treasure-price">£${typeof productData.price === 'number' ? productData.price.toFixed(2) : productData.price}</div>
          <div class="mymagpye-treasure-platform">from ${productData.platform}</div>
        </div>
        <button class="mymagpye-hunt-treasure-btn" id="mymagpye-quick-hunt">
          🏴‍☠️ Start Hunt
        </button>
      </div>
    `;

    // Add hunt button listener using proper event listener
    const huntBtn = container.querySelector('#mymagpye-quick-hunt');
    if (huntBtn) {
      huntBtn.addEventListener('click', () => {
        if (window.myMagPyeExtension) {
          window.myMagPyeExtension.saveProduct();
        }
      });
    }

    // Handle image error using proper event listener
    const treasureImage = container.querySelector('.mymagpye-treasure-image');
    if (treasureImage) {
      treasureImage.addEventListener('error', function() {
        this.src = '/placeholder.svg';
      });
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
        </div>
      `;
      return;
    }
    
    container.innerHTML = items.slice(0, 3).map((item, index) => `
      <div class="mymagpye-sidebar-item" data-url="${item.url}">
        <img src="${item.image}" alt="${item.title}" class="mymagpye-item-image">
        <div class="mymagpye-item-info">
          <div class="mymagpye-item-title">${item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title}</div>
          <div class="mymagpye-item-price">£${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</div>
        </div>
        <button class="mymagpye-remove-btn" data-index="${index}">×</button>
      </div>
    `).join('');

    if (items.length > 3) {
      container.innerHTML += `<div class="mymagpye-show-more">+${items.length - 3} more items</div>`;
    }
    
    this.attachItemEventListeners(container);
  }

  displayHuntResults(huntResults) {
    const container = document.getElementById('mymagpye-hunt-results');
    const resultEntries = Object.entries(huntResults).slice(0, 2);
    
    if (resultEntries.length === 0) {
      container.innerHTML = `
        <div class="mymagpye-empty-state">
          <div class="mymagpye-empty-icon">⚡</div>
          <p>No hunt results yet!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = resultEntries.map(([url, result]) => `
      <div class="mymagpye-hunt-result">
        <div class="mymagpye-result-summary">
          <strong>${result.originalItem?.title?.substring(0, 20) || 'Product'}...</strong>
          <span class="mymagpye-deals-badge">${result.betterDeals?.length || 0} deals</span>
        </div>
        ${result.betterDeals?.length > 0 ? `
          <div class="mymagpye-best-deal">
            Best: £${result.betterDeals[0].price} on ${result.betterDeals[0].platform}
          </div>
        ` : '<div class="mymagpye-no-deals">No better deals found</div>'}
      </div>
    `).join('');
    
    this.attachDealEventListeners(container);
  }

  attachItemEventListeners(container) {
    container.querySelectorAll('.mymagpye-sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('mymagpye-remove-btn')) return;
        const url = item.dataset.url;
        window.open(url, '_blank');
      });
    });
    
    container.querySelectorAll('.mymagpye-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        if (window.myMagPyeExtension) {
          window.myMagPyeExtension.removeItem(index);
        }
      });
    });

    // Handle image errors using proper event listeners
    container.querySelectorAll('.mymagpye-item-image').forEach(img => {
      img.addEventListener('error', function() {
        this.src = '/placeholder.svg';
      });
    });
  }

  attachDealEventListeners(container) {
    container.querySelectorAll('.mymagpye-hunt-result').forEach(item => {
      item.addEventListener('click', () => {
        // Open full app to see all deals
        chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
      });
    });
  }
}
