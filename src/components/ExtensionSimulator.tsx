
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Chrome, Zap, CheckCircle } from "lucide-react";

interface ExtensionSimulatorProps {
  onProductSpotted: (product: any) => void;
}

const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({ onProductSpotted }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSite, setCurrentSite] = useState('');
  const [detectedProduct, setDetectedProduct] = useState<any>(null);

  const retailSites = [
    { name: 'Zara', url: 'zara.com', products: [
      { title: 'Linen Blend Shirt', brand: 'Zara', price: 29.99, image: '/placeholder.svg' },
      { title: 'Wide Leg Trousers', brand: 'Zara', price: 39.99, image: '/placeholder.svg' }
    ]},
    { name: 'H&M', url: 'hm.com', products: [
      { title: 'Cotton T-shirt', brand: 'H&M', price: 12.99, image: '/placeholder.svg' },
      { title: 'Denim Jacket', brand: 'H&M', price: 49.99, image: '/placeholder.svg' }
    ]},
    { name: 'ASOS', url: 'asos.com', products: [
      { title: 'Midi Dress', brand: 'ASOS Design', price: 35.00, image: '/placeholder.svg' },
      { title: 'Ankle Boots', brand: 'ASOS', price: 65.00, image: '/placeholder.svg' }
    ]}
  ];

  const simulateRetailBrowsing = (site: any) => {
    setCurrentSite(site.name);
    const randomProduct = site.products[Math.floor(Math.random() * site.products.length)];
    
    setTimeout(() => {
      setDetectedProduct({
        ...randomProduct,
        url: `https://${site.url}/product/${Date.now()}`,
        platform: site.name,
        dateSpotted: new Date().toISOString().split('T')[0]
      });
    }, 1500);
  };

  const spotTreasure = () => {
    if (detectedProduct) {
      onProductSpotted(detectedProduct);
      setDetectedProduct(null);
      setCurrentSite('');
      setIsActive(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Chrome className="w-5 h-5 text-blue-600" />
          <span>Extension Simulator</span>
          <Badge variant="secondary" className="ml-auto">
            Demo Mode
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Simulate browsing retail websites with the MyMagPye extension installed:
        </p>
        
        {!isActive && (
          <div className="grid grid-cols-1 gap-2">
            {retailSites.map((site) => (
              <Button
                key={site.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsActive(true);
                  simulateRetailBrowsing(site);
                }}
                className="justify-start"
              >
                <span className="mr-2">🛍️</span>
                Browse {site.name}
              </Button>
            ))}
          </div>
        )}
        
        {isActive && currentSite && !detectedProduct && (
          <div className="text-center py-4">
            <div className="animate-pulse">
              <Chrome className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-slate-600">
                Browsing {currentSite}...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                MyMagPye is scanning for products
              </p>
            </div>
          </div>
        )}
        
        {detectedProduct && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Product Detected!</span>
            </div>
            
            <div className="bg-white border rounded-lg p-3">
              <div className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-lg">👗</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{detectedProduct.title}</h4>
                  <p className="text-xs text-slate-600">{detectedProduct.brand}</p>
                  <p className="text-sm font-semibold">${detectedProduct.price}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={spotTreasure}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500"
            >
              <Eye className="w-4 h-4 mr-2" />
              Spot with MyMagPye
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtensionSimulator;
