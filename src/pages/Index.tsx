import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Search, Bell, Heart, Star, Eye, ShoppingBag, Zap, Target, ArrowRight, DollarSign } from "lucide-react";
import TreasureCard from "@/components/TreasureCard";
import SpotButton from "@/components/SpotButton";
import HuntingStats from "@/components/HuntingStats";
import NotificationDemo from "@/components/NotificationDemo";
import ExtensionSimulator from "@/components/ExtensionSimulator";
import { Treasure } from "@/types/treasure";
const Index = () => {
  const [treasures, setTreasures] = useState<Treasure[]>([{
    id: '1',
    title: 'Linen Midi Dress',
    brand: 'Sezane',
    price: 150,
    image: '/placeholder.svg',
    status: 'found' as const,
    platform: 'Vinted',
    foundPrice: 89,
    dateSpotted: '2025-01-08',
    lastHunted: '2025-01-11',
    confidence: 92
  }, {
    id: '2',
    title: 'Wool Blend Coat',
    brand: 'Zara',
    price: 89,
    image: '/placeholder.svg',
    status: 'hunting' as const,
    dateSpotted: '2025-01-10',
    lastHunted: '2025-01-11',
    confidence: null
  }, {
    id: '3',
    title: 'Silk Scarf',
    brand: 'H&M',
    price: 29,
    image: '/placeholder.svg',
    status: 'claimed' as const,
    platform: 'eBay',
    foundPrice: 18,
    dateSpotted: '2025-01-06',
    lastHunted: '2025-01-10',
    confidence: 88
  }]);
  const [showDemo, setShowDemo] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [huntingTreasures, setHuntingTreasures] = useState<Set<string>>(new Set());
  const handleSpotTreasure = () => {
    const newTreasure: Treasure = {
      id: Date.now().toString(),
      title: 'Demo Treasure Item',
      brand: 'Sample Brand',
      price: 75,
      image: '/placeholder.svg',
      status: 'hunting' as const,
      dateSpotted: new Date().toISOString().split('T')[0],
      lastHunted: new Date().toISOString().split('T')[0],
      confidence: null
    };
    setTreasures(prev => [newTreasure, ...prev]);

    // Simulate finding treasure after 3 seconds
    setTimeout(() => {
      setTreasures(prev => prev.map(t => t.id === newTreasure.id ? {
        ...t,
        status: 'found' as const,
        platform: 'Vinted',
        foundPrice: 45,
        confidence: 91
      } : t));
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'treasure_found',
        treasure: {
          ...newTreasure,
          status: 'found' as const,
          platform: 'Vinted',
          foundPrice: 45
        }
      }]);
    }, 3000);
  };
  const handleExtensionSpot = (productData: any) => {
    const newTreasure: Treasure = {
      id: Date.now().toString(),
      title: productData.title,
      brand: productData.brand,
      price: productData.price,
      image: productData.image,
      status: 'hunting' as const,
      dateSpotted: new Date().toISOString().split('T')[0],
      lastHunted: new Date().toISOString().split('T')[0],
      confidence: null
    };
    setTreasures(prev => [newTreasure, ...prev]);

    // Auto-start hunting
    setTimeout(() => {
      handleStartHunt(newTreasure.id);
    }, 1000);
  };
  const handleStartHunt = (treasureId: string) => {
    const treasure = treasures.find(t => t.id === treasureId);
    if (!treasure) return;
    setHuntingTreasures(prev => new Set(prev).add(treasureId));

    // Simulate finding treasure after random time (3-8 seconds for demo)
    const huntTime = Math.random() * 5000 + 3000;
    setTimeout(() => {
      const foundPlatforms = ['Vinted', 'eBay', 'Depop', 'Vestiaire Collective'];
      const platform = foundPlatforms[Math.floor(Math.random() * foundPlatforms.length)];
      const discountFactor = 0.3 + Math.random() * 0.4; // 30-70% discount
      const foundPrice = Math.round(treasure.price * (1 - discountFactor));
      setTreasures(prev => prev.map(t => t.id === treasureId ? {
        ...t,
        status: 'found' as const,
        platform,
        foundPrice,
        confidence: Math.floor(Math.random() * 20) + 78,
        // 78-98% confidence
        lastHunted: new Date().toISOString().split('T')[0]
      } : t));
      setHuntingTreasures(prev => {
        const next = new Set(prev);
        next.delete(treasureId);
        return next;
      });

      // Add notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'treasure_found',
        treasure: {
          ...treasure,
          status: 'found' as const,
          platform,
          foundPrice
        }
      }]);
    }, huntTime);
  };
  const handleStopHunt = (treasureId: string) => {
    setHuntingTreasures(prev => {
      const next = new Set(prev);
      next.delete(treasureId);
      return next;
    });
  };
  const stats = {
    spotted: treasures.length,
    hunting: treasures.filter(t => t.status === 'hunting').length,
    found: treasures.filter(t => t.status === 'found').length,
    claimed: treasures.filter(t => t.status === 'claimed').length,
    totalSaved: treasures.reduce((sum, t) => t.status === 'found' || t.status === 'claimed' ? sum + (t.price - (t.foundPrice || 0)) : sum, 0)
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-[200px] h-[200px] rounded-full flex items-center justify-center overflow-hidden">
                <img src="/lovable-uploads/d917a94b-d365-4386-8b7e-16125ba0fa1e.png" alt="MyMagPye Logo" className="w-[200px] h-[200px] object-contain" />
              </div>
              <div>
                
                
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Demo Version
            </Badge>
          </div>
        </div>
      </header>

      {/* SPOT, SNAG, SAVE Section */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4"> Your Secondhand Shopping Companion</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Secondhand shopping easy with our simple three-step process</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* SPOT */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">SPOT</h3>
              <p className="text-slate-600 mb-4">Browse web and when you spot items you love, save them to your MyMagPye account</p>
              <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                Click the MyMagPye button while shopping online
              </div>
            </div>

            {/* Arrow */}
            

            {/* SNAG */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Search className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">SAVE</h3>
              <p className="text-slate-600 mb-4">Automatically hunt across secondhand platforms like Vinted, eBay, and more to find your treasures secondhand</p>
              <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                Smart AI matching finds the best deals
              </div>
            </div>

            {/* Arrow */}
            

            {/* SAVE */}
            <div className="text-center group md:col-start-3">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">SNAG</h3>
              <p className="text-slate-600 mb-4">Get notified when we find your treasure at amazing prices. Save money while shopping sustainably.</p>
              <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                Up to 70% off retail prices
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extension Simulator */}
            <ExtensionSimulator onProductSpotted={handleExtensionSpot} />

            {/* Demo Section */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <span>Try MyMagPye</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">
                    Experience how MyMagPye spots treasures from retail sites and hunts for them automatically!
                  </p>
                  <SpotButton onSpot={handleSpotTreasure} />
                </div>
              </CardContent>
            </Card>

            {/* Treasure Collection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-xl">💎</span>
                    <span>Your Treasure Collection</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All ({treasures.length})</TabsTrigger>
                    <TabsTrigger value="hunting">Hunting ({stats.hunting})</TabsTrigger>
                    <TabsTrigger value="found">Found ({stats.found})</TabsTrigger>
                    <TabsTrigger value="claimed">Claimed ({stats.claimed})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {treasures.map(treasure => <TreasureCard key={treasure.id} treasure={treasure} onStartHunt={handleStartHunt} onStopHunt={handleStopHunt} isHunting={huntingTreasures.has(treasure.id)} />)}
                      {treasures.length === 0 && <div className="col-span-2 text-center py-12 text-slate-500">
                          <span className="text-4xl block mb-4">🪶</span>
                          <p>No treasures spotted yet!</p>
                          <p className="text-sm">Use the extension simulator above or visit a retail site with MyMagPye installed.</p>
                        </div>}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hunting" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {treasures.filter(t => t.status === 'hunting').map(treasure => <TreasureCard key={treasure.id} treasure={treasure} onStartHunt={handleStartHunt} onStopHunt={handleStopHunt} isHunting={huntingTreasures.has(treasure.id)} />)}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="found" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {treasures.filter(t => t.status === 'found').map(treasure => <TreasureCard key={treasure.id} treasure={treasure} onStartHunt={handleStartHunt} onStopHunt={handleStopHunt} isHunting={huntingTreasures.has(treasure.id)} />)}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="claimed" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {treasures.filter(t => t.status === 'claimed').map(treasure => <TreasureCard key={treasure.id} treasure={treasure} onStartHunt={handleStartHunt} onStopHunt={handleStopHunt} isHunting={huntingTreasures.has(treasure.id)} />)}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <HuntingStats stats={stats} />
            <NotificationDemo notifications={notifications} />
            
            {/* Features Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">✨ Coming Soon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Search className="w-4 h-4" />
                  <span className="text-sm">Advanced image matching</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Smart notifications</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Wishlist sharing</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm">More platforms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/lovable-uploads/d917a94b-d365-4386-8b7e-16125ba0fa1e.png" alt="MyMagPye Logo" className="w-20 h-20 object-contain filter brightness-0 invert" />
            <h3 className="text-xl font-bold">MyMagPye</h3>
          </div>
          <p className="text-slate-300 mb-4">Spot. Save. Snag.</p>
          <p className="text-slate-400 text-sm">
            Sustainable shopping made effortless with your clever magpie companion
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;