
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Search, Bell, Heart, Star, Eye, ShoppingBag, Zap } from "lucide-react";
import TreasureCard from "@/components/TreasureCard";
import SpotButton from "@/components/SpotButton";
import HuntingStats from "@/components/HuntingStats";
import NotificationDemo from "@/components/NotificationDemo";
import { Treasure } from "@/types/treasure";

const Index = () => {
  const [treasures, setTreasures] = useState<Treasure[]>([
    {
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
    },
    {
      id: '2', 
      title: 'Wool Blend Coat',
      brand: 'Zara',
      price: 89,
      image: '/placeholder.svg',
      status: 'hunting' as const,
      dateSpotted: '2025-01-10',
      lastHunted: '2025-01-11',
      confidence: null
    },
    {
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
    }
  ]);

  const [showDemo, setShowDemo] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
      setTreasures(prev => prev.map(t => 
        t.id === newTreasure.id 
          ? { ...t, status: 'found' as const, platform: 'Vinted', foundPrice: 45, confidence: 91 }
          : t
      ));
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'treasure_found',
        treasure: { ...newTreasure, status: 'found' as const, platform: 'Vinted', foundPrice: 45 }
      }]);
    }, 3000);
  };

  const stats = {
    spotted: treasures.length,
    hunting: treasures.filter(t => t.status === 'hunting').length,
    found: treasures.filter(t => t.status === 'found').length,
    claimed: treasures.filter(t => t.status === 'claimed').length,
    totalSaved: treasures.reduce((sum, t) => 
      t.status === 'found' || t.status === 'claimed' 
        ? sum + (t.price - (t.foundPrice || 0)) 
        : sum, 0
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/ecbb7536-998c-4b9b-9641-b540f619fc6c.png" 
                  alt="MyMagPye Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">MyMagPye</h1>
                <p className="text-slate-600 text-sm">Your Smart Treasure Collector</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Demo Version
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                      {treasures.map(treasure => (
                        <TreasureCard key={treasure.id} treasure={treasure} />
                      ))}
                      {treasures.length === 0 && (
                        <div className="col-span-2 text-center py-12 text-slate-500">
                          <span className="text-4xl block mb-4">🪶</span>
                          <p>No treasures spotted yet!</p>
                          <p className="text-sm">Visit a retail site and click the MyMagPye button to start collecting.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hunting" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {treasures.filter(t => t.status === 'hunting').map(treasure => (
                        <TreasureCard key={treasure.id} treasure={treasure} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="found" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {treasures.filter(t => t.status === 'found').map(treasure => (
                        <TreasureCard key={treasure.id} treasure={treasure} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="claimed" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {treasures.filter(t => t.status === 'claimed').map(treasure => (
                        <TreasureCard key={treasure.id} treasure={treasure} />
                      ))}
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
            <img 
              src="/lovable-uploads/ecbb7536-998c-4b9b-9641-b540f619fc6c.png" 
              alt="MyMagPye Logo" 
              className="w-12 h-12 object-contain filter brightness-0 invert"
            />
            <h3 className="text-xl font-bold">MyMagPye</h3>
          </div>
          <p className="text-slate-300 mb-4">Spot. Save. Snag.</p>
          <p className="text-slate-400 text-sm">
            Sustainable shopping made effortless with your clever magpie companion
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
