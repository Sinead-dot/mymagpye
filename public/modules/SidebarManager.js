
// Sidebar management utility
class SidebarManager {
  constructor() {
    this.sidebar = null;
    this.sidebarOpen = false;
  }

  createSidebar() {
    const existingSidebar = document.querySelector('.mymagpye-sidebar');
    if (existingSidebar) {
      existingSidebar.remove();
    }

    this.sidebar = document.createElement('div');
    this.sidebar.className = 'mymagpye-sidebar';
    this.sidebar.innerHTML = `
      <div class="mymagpye-sidebar-header">
        <div class="mymagpye-sidebar-logo">
          <span class="mymagpye-logo-icon">🔍</span>
          <span class="mymagpye-logo-text">MyMagPye</span>
        </div>
        <button class="mymagpye-close-btn">×</button>
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
        <button class="mymagpye-full-app-btn">
          Open Full App
        </button>
      </div>
    `;
    
    this.attachEventListeners();
    document.body.appendChild(this.sidebar);
    this.loadSidebarData();
  }

  attachEventListeners() {
    const closeBtn = this.sidebar.querySelector('.mymagpye-close-btn');
    closeBtn.addEventListener('click', () => this.toggleSidebar());
    
    const fullAppBtn = this.sidebar.querySelector('.mymagpye-full-app-btn');
    fullAppBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    });
  }

  toggleSidebar() {
    if (this.sidebarOpen) {
      this.sidebar.classList.remove('mymagpye-sidebar-open');
      this.sidebarOpen = false;
    } else {
      this.sidebar.classList.add('mymagpye-sidebar-open');
      this.sidebarOpen = true;
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
      <div class="mymagpye-sidebar-item" data-url="${item.url}">
        <img src="${item.image}" alt="${item.title}" class="mymagpye-item-image" onerror="this.src='/placeholder.svg'">
        <div class="mymagpye-item-info">
          <div class="mymagpye-item-title">${item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title}</div>
          <div class="mymagpye-item-price">£${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</div>
          <div class="mymagpye-item-platform">${item.platform}</div>
        </div>
        <button class="mymagpye-remove-btn" data-index="${index}">×</button>
      </div>
    `).join('');
    
    this.attachItemEventListeners(container);
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
              <div class="mymagpye-deal-item" data-url="${deal.url}">
                <span class="mymagpye-deal-platform">${deal.platform}</span>
                <span class="mymagpye-deal-price">£${deal.price}</span>
                <span class="mymagpye-savings">Save £${(result.originalItem.price - deal.price).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p class="mymagpye-no-deals">No better deals found</p>'}
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
        window.myMagPyeExtension.removeItem(index);
      });
    });
  }

  attachDealEventListeners(container) {
    container.querySelectorAll('.mymagpye-deal-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        window.open(url, '_blank');
      });
    });
  }
}
