
interface HuntingResult {
  platform: string;
  title: string;
  price: number;
  url: string;
  image: string;
  confidence: number;
  seller: string;
  condition: string;
}

interface TreasureItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  image: string;
}

class HuntingEngine {
  private secondhandPlatforms = [
    { name: 'Vinted', baseUrl: 'vinted.co.uk', avgDiscount: 0.4 },
    { name: 'eBay', baseUrl: 'ebay.co.uk', avgDiscount: 0.3 },
    { name: 'Depop', baseUrl: 'depop.com', avgDiscount: 0.5 },
    { name: 'Vestiaire Collective', baseUrl: 'vestiairecollective.com', avgDiscount: 0.25 },
    { name: 'The RealReal', baseUrl: 'therealreal.com', avgDiscount: 0.35 }
  ];

  private generateSearchTerms(treasure: TreasureItem): string[] {
    const terms = [];
    
    // Brand + product type
    terms.push(`${treasure.brand} ${this.extractProductType(treasure.title)}`);
    
    // Full title
    terms.push(treasure.title);
    
    // Brand only
    terms.push(treasure.brand);
    
    // Product type + key features
    const productType = this.extractProductType(treasure.title);
    const features = this.extractFeatures(treasure.title);
    if (features.length > 0) {
      terms.push(`${productType} ${features.join(' ')}`);
    }
    
    return terms;
  }

  private extractProductType(title: string): string {
    const productTypes = [
      'dress', 'shirt', 'blouse', 'top', 'sweater', 'cardigan',
      'jacket', 'coat', 'blazer', 'trousers', 'jeans', 'skirt',
      'shorts', 'jumpsuit', 'romper', 'boots', 'shoes', 'sandals',
      'bag', 'handbag', 'backpack', 'scarf', 'hat', 'belt'
    ];
    
    const lowerTitle = title.toLowerCase();
    for (const type of productTypes) {
      if (lowerTitle.includes(type)) {
        return type;
      }
    }
    
    return 'item';
  }

  private extractFeatures(title: string): string[] {
    const features = [];
    const lowerTitle = title.toLowerCase();
    
    // Colors
    const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'grey', 'navy', 'beige'];
    colors.forEach(color => {
      if (lowerTitle.includes(color)) features.push(color);
    });
    
    // Materials
    const materials = ['cotton', 'linen', 'silk', 'wool', 'denim', 'leather', 'suede', 'cashmere'];
    materials.forEach(material => {
      if (lowerTitle.includes(material)) features.push(material);
    });
    
    // Styles
    const styles = ['vintage', 'midi', 'maxi', 'mini', 'long', 'short', 'oversized', 'fitted'];
    styles.forEach(style => {
      if (lowerTitle.includes(style)) features.push(style);
    });
    
    return features;
  }

  private simulateImageMatching(treasure: TreasureItem, result: any): number {
    // Simulate AI-powered image matching confidence
    let confidence = Math.random() * 30 + 70; // Base 70-100%
    
    // Adjust based on brand match
    if (result.title.toLowerCase().includes(treasure.brand.toLowerCase())) {
      confidence += 10;
    }
    
    // Adjust based on product type match
    const treasureType = this.extractProductType(treasure.title);
    if (result.title.toLowerCase().includes(treasureType)) {
      confidence += 15;
    }
    
    // Cap at 98% (never 100% certain)
    return Math.min(Math.round(confidence), 98);
  }

  private generateMockResults(treasure: TreasureItem, platform: any): HuntingResult[] {
    const results: HuntingResult[] = [];
    const numResults = Math.floor(Math.random() * 3) + 1; // 1-3 results per platform
    
    for (let i = 0; i < numResults; i++) {
      const discountFactor = platform.avgDiscount + (Math.random() * 0.2 - 0.1); // ±10%
      const foundPrice = Math.round(treasure.price * (1 - discountFactor));
      
      const mockResult = {
        platform: platform.name,
        title: this.generateSimilarTitle(treasure),
        price: foundPrice,
        url: `https://${platform.baseUrl}/item/${Date.now()}-${i}`,
        image: treasure.image,
        confidence: 0,
        seller: this.generateSellerName(),
        condition: this.generateCondition()
      };
      
      mockResult.confidence = this.simulateImageMatching(treasure, mockResult);
      
      // Only include high-confidence matches
      if (mockResult.confidence >= 75) {
        results.push(mockResult);
      }
    }
    
    return results;
  }

  private generateSimilarTitle(treasure: TreasureItem): string {
    const variations = [
      treasure.title,
      `${treasure.brand} ${this.extractProductType(treasure.title)}`,
      `Preloved ${treasure.title}`,
      `${treasure.brand} ${this.extractProductType(treasure.title)} - Great Condition`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  private generateSellerName(): string {
    const names = [
      'FashionLover23', 'VintageVibes', 'StyleSeller', 'ChicCloset',
      'TrendsetterUK', 'DesignerDeals', 'FashionFinds', 'StyleSwap'
    ];
    
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateCondition(): string {
    const conditions = [
      'Excellent', 'Very Good', 'Good', 'Fair'
    ];
    
    const weights = [0.4, 0.3, 0.2, 0.1]; // Favor better conditions
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < conditions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return conditions[i];
      }
    }
    
    return conditions[0];
  }

  public async huntForTreasure(treasure: TreasureItem): Promise<HuntingResult[]> {
    console.log(`🔍 Hunting for treasure: ${treasure.title}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    const allResults: HuntingResult[] = [];
    
    // Search each platform
    for (const platform of this.secondhandPlatforms) {
      const platformResults = this.generateMockResults(treasure, platform);
      allResults.push(...platformResults);
    }
    
    // Sort by confidence and price
    return allResults
      .sort((a, b) => {
        if (Math.abs(a.confidence - b.confidence) < 5) {
          return a.price - b.price; // Lower price wins if confidence is similar
        }
        return b.confidence - a.confidence; // Higher confidence wins
      })
      .slice(0, 5); // Return top 5 results
  }

  public async continuousHunt(treasure: TreasureItem, onResultFound: (result: HuntingResult) => void): Promise<void> {
    console.log(`🔄 Starting continuous hunt for: ${treasure.title}`);
    
    const huntInterval = setInterval(async () => {
      const results = await this.huntForTreasure(treasure);
      
      if (results.length > 0) {
        const bestResult = results[0];
        console.log(`✨ Found treasure on ${bestResult.platform}!`, bestResult);
        onResultFound(bestResult);
        clearInterval(huntInterval);
      }
    }, 30000); // Hunt every 30 seconds in demo
    
    // Stop hunting after 5 minutes in demo
    setTimeout(() => {
      clearInterval(huntInterval);
    }, 300000);
  }
}

export const huntingEngine = new HuntingEngine();
