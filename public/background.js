// Background script for MyMagPye extension - Web App Integration
class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Background received message:', request);
      
      if (request.action === 'saveToWebApp') {
        this.forwardToWebApp(request.treasure)
          .then(() => sendResponse({ success: true }))
          .catch(error => {
            console.error('Error forwarding to web app:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep message channel open for async response
      } else if (request.action === 'startHunting') {
        this.startHunting(request.productData)
          .then(() => sendResponse({ success: true }))
          .catch(error => {
            console.error('Error starting hunt:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep message channel open for async response
      }
    });

    // Set up periodic checks for better deals (every 2 hours for MVP)
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'checkDeals') {
        this.checkAllDeals();
      }
    });

    // Create alarm for periodic deal checking
    chrome.alarms.create('checkDeals', { periodInMinutes: 120 });
    
    console.log('MyMagPye Background Service initialized');
  }

  async forwardToWebApp(treasure) {
    try {
      // Query MyMagPye web app tabs
      const tabs = await chrome.tabs.query({
        url: ['https://mymagpye.lovable.app/*', 'https://*.lovableproject.com/*']
      });

      // Send message to all MyMagPye tabs
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'MYMAGPYE_SAVE_TREASURE',
            treasure: treasure
          });
        } catch (err) {
          console.log('Could not send to tab:', tab.id, err);
        }
      }

      console.log('✅ Forwarded treasure to web app tabs:', tabs.length);
    } catch (error) {
      console.error('Error forwarding to web app:', error);
      throw error;
    }
  }

  async startHunting(productData) {
    console.log('🔍 Starting hunt for:', productData);
    
    try {
      // For MVP, we'll simulate eBay search results
      // In production, this would call the actual eBay API
      setTimeout(() => {
        this.simulateEbaySearch(productData);
      }, 3000); // 3 second delay to simulate API call
      
    } catch (error) {
      console.error('Error starting hunt:', error);
      throw error;
    }
  }

  async simulateEbaySearch(productData) {
    console.log('🏴‍☠️ Simulating eBay search for:', productData.title);
    
    // Simulate finding better deals on eBay
    const betterDeals = [];
    
    // Create 1-3 potential better deals
    const numDeals = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numDeals; i++) {
      const discountPercent = 0.1 + (Math.random() * 0.3); // 10-40% discount
      const newPrice = Math.round(productData.price * (1 - discountPercent) * 100) / 100;
      const savings = Math.round((productData.price - newPrice) * 100) / 100;
      
      if (savings > 5) { // Only show deals with £5+ savings
        betterDeals.push({
          title: `${productData.title} - Similar Item`,
          price: newPrice,
          originalPrice: productData.price,
          platform: 'eBay',
          url: `https://ebay.co.uk/search?q=${encodeURIComponent(productData.title)}`,
          image: productData.image,
          savings: savings,
          confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
        });
      }
    }

    if (betterDeals.length > 0) {
      // Save the hunt results
      const result = await chrome.storage.local.get(['huntResults']);
      const huntResults = result.huntResults || {};
      huntResults[productData.url] = {
        originalProduct: productData,
        betterDeals,
        lastChecked: Date.now(),
        status: 'found'
      };
      
      await chrome.storage.local.set({ huntResults });

      // Show success notification
      const bestDeal = betterDeals[0];
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'favicon.ico',
        title: '🏴‍☠️ Treasure Found!',
        message: `Found a better deal! Save £${bestDeal.savings} on ${productData.title.substring(0, 50)}...`,
        buttons: [
          { title: 'View Deal' },
          { title: 'Dismiss' }
        ]
      });
      
      console.log('✅ Hunt successful! Found', betterDeals.length, 'better deals');
    } else {
      console.log('❌ No better deals found');
      
      // Still save the result to show we checked
      const result = await chrome.storage.local.get(['huntResults']);
      const huntResults = result.huntResults || {};
      huntResults[productData.url] = {
        originalProduct: productData,
        betterDeals: [],
        lastChecked: Date.now(),
        status: 'no_deals'
      };
      
      await chrome.storage.local.set({ huntResults });
    }
  }

  async checkAllDeals() {
    console.log('🔄 Checking all saved items for better deals...');
    
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      // Re-check each saved item (limit to 5 for MVP to avoid rate limits)
      const itemsToCheck = savedItems.slice(0, 5);
      
      for (const item of itemsToCheck) {
        await this.startHunting(item);
        // Add delay between searches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error('Error checking deals:', error);
    }
  }
}

// Handle notification clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) { // "View Deal" button
    chrome.tabs.create({ url: 'https://mymagpye.lovable.app/' });
  }
  chrome.notifications.clear(notificationId);
});

// Initialize background service
new BackgroundService();
