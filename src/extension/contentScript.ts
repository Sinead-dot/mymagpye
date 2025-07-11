
// Chrome Extension Content Script for MyMagPye
// This script runs on retail websites to extract product information

interface ProductData {
  title: string;
  brand: string;
  price: number;
  image: string;
  url: string;
  platform: string;
}

class ProductExtractor {
  private extractProductData(): ProductData | null {
    const hostname = window.location.hostname;
    const url = window.location.href;
    
    // Generic selectors that work across many e-commerce sites
    const titleSelectors = [
      'h1[data-testid*="product"]',
      'h1.product-title',
      'h1.pdp-product-name',
      '.product-name h1',
      '.product-title',
      '[data-cy="product-name"]',
      '.ProductSummary-name'
    ];
    
    const priceSelectors = [
      '[data-testid*="price"]',
      '.price',
      '.product-price',
      '.current-price',
      '[data-cy="price"]',
      '.Price-current'
    ];
    
    const imageSelectors = [
      '[data-testid*="product-image"] img',
      '.product-image img',
      '.product-photo img',
      '.pdp-image img',
      '.ProductMedia img'
    ];
    
    const brandSelectors = [
      '[data-testid*="brand"]',
      '.brand-name',
      '.product-brand',
      '[data-cy="brand"]',
      '.ProductSummary-brand'
    ];
    
    const title = this.extractText(titleSelectors);
    const priceText = this.extractText(priceSelectors);
    const image = this.extractImage(imageSelectors);
    const brand = this.extractText(brandSelectors) || this.extractBrandFromTitle(title);
    
    if (!title || !priceText) {
      return null;
    }
    
    const price = this.parsePrice(priceText);
    if (price === 0) {
      return null;
    }
    
    return {
      title: title.trim(),
      brand: brand.trim(),
      price,
      image: image || '/placeholder.svg',
      url,
      platform: this.getPlatformName(hostname)
    };
  }
  
  private extractText(selectors: string[]): string {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        return element.textContent.trim();
      }
    }
    return '';
  }
  
  private extractImage(selectors: string[]): string {
    for (const selector of selectors) {
      const img = document.querySelector(selector) as HTMLImageElement;
      if (img && img.src) {
        return img.src;
      }
    }
    return '';
  }
  
  private extractBrandFromTitle(title: string): string {
    // Try to extract brand from common title patterns
    const patterns = [
      /^([A-Z][a-zA-Z]+)\s+/,  // Brand at start
      /\s([A-Z][a-zA-Z]+)\s+/  // Brand in middle
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return 'Unknown Brand';
  }
  
  private parsePrice(priceText: string): number {
    // Remove currency symbols and extract numeric value
    const cleaned = priceText.replace(/[£$€¥₹]/g, '').replace(/[,\s]/g, '');
    const match = cleaned.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }
  
  private getPlatformName(hostname: string): string {
    const platformMap: { [key: string]: string } = {
      'zara.com': 'Zara',
      'hm.com': 'H&M',
      'asos.com': 'ASOS',
      'amazon.co.uk': 'Amazon UK',
      'amazon.com': 'Amazon',
      'next.co.uk': 'Next',
      'johnlewis.com': 'John Lewis',
      'marksandspencer.com': 'M&S',
      'topshop.com': 'Topshop'
    };
    
    for (const [domain, name] of Object.entries(platformMap)) {
      if (hostname.includes(domain)) {
        return name;
      }
    }
    
    return hostname.replace('www.', '').split('.')[0];
  }
  
  public extractAndSend(): void {
    const productData = this.extractProductData();
    
    if (productData) {
      // Send to MyMagPye extension
      window.postMessage({
        type: 'MYMAGPYE_PRODUCT_DETECTED',
        data: productData
      }, '*');
      
      console.log('MyMagPye: Product detected', productData);
    }
  }
}

// Initialize product extractor
const extractor = new ProductExtractor();

// Auto-detect products when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => extractor.extractAndSend(), 1000);
  });
} else {
  setTimeout(() => extractor.extractAndSend(), 1000);
}

// Listen for navigation changes (SPA routing)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => extractor.extractAndSend(), 2000);
  }
}).observe(document, { subtree: true, childList: true });

export {};
