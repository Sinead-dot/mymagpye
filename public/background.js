
// Background script for MyMagPye extension
class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startHunting') {
        this.startHunting(request.productData);
      }
    });

    // Set up periodic checks for better deals
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'checkDeals') {
        this.checkAllDeals();
      }
    });

    // Create alarm for periodic deal checking (every 6 hours)
    chrome.alarms.create('checkDeals', { periodInMinutes: 360 });
  }

  async startHunting(productData) {
    console.log('Starting hunt for:', productData);
    
    try {
      // In a real implementation, you would call eBay API here
      // For now, we'll simulate the hunt
      setTimeout(() => {
        this.simulateHuntResults(productData);
      }, 2000);
      
    } catch (error) {
      console.error('Error starting hunt:', error);
    }
  }

  async simulateHuntResults(productData) {
    // Simulate finding better deals
    const betterDeals = [
      {
        title: `Similar to: ${productData.title}`,
        price: Math.round(productData.price * 0.8 * 100) / 100, // 20% cheaper
        platform: 'eBay',
        url: 'https://ebay.com/example',
        image: productData.image,
        savings: Math.round(productData.price * 0.2 * 100) / 100
      },
      {
        title: `Alternative: ${productData.title}`,
        price: Math.round(productData.price * 0.9 * 100) / 100, // 10% cheaper
        platform: 'Amazon',
        url: 'https://amazon.com/example',
        image: productData.image,
        savings: Math.round(productData.price * 0.1 * 100) / 100
      }
    ];

    // Save the hunt results
    const result = await chrome.storage.local.get(['huntResults']);
    const huntResults = result.huntResults || {};
    huntResults[productData.url] = {
      originalProduct: productData,
      betterDeals,
      lastChecked: Date.now()
    };
    
    await chrome.storage.local.set({ huntResults });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'favicon.ico',
      title: 'MyMagPye Found Treasure! 🏴‍☠️',
      message: `Found ${betterDeals.length} better deals! Save up to £${betterDeals[0].savings}`
    });
  }

  async checkAllDeals() {
    console.log('Checking all saved items for better deals...');
    
    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const savedItems = result.savedItems || [];
      
      // Re-check each saved item
      for (const item of savedItems) {
        await this.startHunting(item);
      }
      
    } catch (error) {
      console.error('Error checking deals:', error);
    }
  }
}

// Initialize background service
new BackgroundService();
