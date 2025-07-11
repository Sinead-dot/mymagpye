
// Product data extraction utility
class ProductExtractor {
  constructor() {
    this.platformMap = {
      'zara.com': 'Zara',
      'hm.com': 'H&M',
      'asos.com': 'ASOS',
      'amazon.co.uk': 'Amazon UK',
      'amazon.com': 'Amazon',
      'next.co.uk': 'Next',
      'johnlewis.com': 'John Lewis'
    };
  }

  extractProductData() {
    const hostname = window.location.hostname;
    const url = window.location.href;
    
    if (!this.isProductPage(url)) {
      return null;
    }
    
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
    const productIndicators = [
      '/dp/',
      '/product/',
      '/p/',
      '/item/',
      '/products/',
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
    const cleaned = priceText.replace(/[£$€¥₹,\s]/g, '');
    const match = cleaned.match(/[\d.]+/);
    const price = match ? parseFloat(match[0]) : 0;
    
    console.log('Price parsing:', priceText, '->', price);
    return price;
  }

  getPlatformName(hostname) {
    for (const [domain, name] of Object.entries(this.platformMap)) {
      if (hostname.includes(domain)) {
        return name;
      }
    }
    
    return hostname.replace('www.', '').split('.')[0];
  }
}
