
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem } from "lucide-react";
import TreasureCard from "@/components/TreasureCard";
import ExtensionSimulator from "@/components/ExtensionSimulator";
import HuntingStats from "@/components/HuntingStats";
import NotificationDemo from "@/components/NotificationDemo";
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';
import UserProfile from '@/components/UserProfile';

const Index = () => {
  const { user, loading } = useAuth();
  const [treasures, setTreasures] = useState([
    {
      id: "1",
      title: "Vintage Leather Jacket",
      brand: "Unknown Brand",
      platform: "Etsy",
      url: "https://www.etsy.com/listing/123456789",
      dateSpotted: "2024-03-15",
      lastHunted: "2024-03-15",
      price: 75.00,
      image: "/placeholder.svg",
      status: 'hunting' as const,
    },
    {
      id: "2",
      title: "Retro Floral Dress",
      brand: "Vintage Co",
      platform: "eBay",
      url: "https://www.ebay.com/itm/987654321",
      dateSpotted: "2024-03-10",
      lastHunted: "2024-03-10",
      price: 45.50,
      image: "/placeholder.svg",
      status: 'hunting' as const,
    },
    {
      id: "3",
      title: "Antique Silver Locket",
      brand: "Antique Shop",
      platform: "ThredUp",
      url: "https://www.thredup.com/product/abcdefgh",
      dateSpotted: "2024-03-05",
      lastHunted: "2024-03-05",
      price: 30.00,
      image: "/placeholder.svg",
      status: 'found' as const,
      foundPrice: 25.00,
    },
  ]);

  const [notifications, setNotifications] = useState([]);

  const handleProductSpotted = (product: any) => {
    const newTreasure = {
      ...product,
      id: Date.now().toString(),
      brand: product.brand || "Unknown Brand",
      image: product.image || "/placeholder.svg",
      status: 'hunting' as const,
      lastHunted: new Date().toISOString().split('T')[0],
    };
    setTreasures([newTreasure, ...treasures]);
  };

  // Calculate stats from treasures
  const stats = {
    spotted: treasures.length,
    hunting: treasures.filter(t => t.status === 'hunting').length,
    found: treasures.filter(t => t.status === 'found').length,
    claimed: treasures.filter(t => t.status === 'claimed').length,
    totalSaved: treasures
      .filter(t => t.foundPrice)
      .reduce((acc, t) => acc + (t.price - (t.foundPrice || 0)), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="py-6 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Gem className="w-6 h-6 mr-2 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">MyMagPye</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" size="sm">
              How it Works
            </Button>
            <Button size="sm">Get Extension</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Auth or Profile */}
          <div className="space-y-6">
            {user ? <UserProfile /> : <AuthForm />}
            
            {user && (
              <>
                <HuntingStats stats={stats} />
                <NotificationDemo notifications={notifications} />
              </>
            )}
          </div>

          {/* Middle Column - Extension Simulator */}
          <div className="space-y-6">
            <ExtensionSimulator onProductSpotted={handleProductSpotted} />
          </div>

          {/* Right Column - Treasures */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gem className="w-5 h-5 text-purple-600" />
                  <span>My Treasures</span>
                  <Badge variant="secondary" className="ml-auto">
                    {treasures.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treasures.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Gem className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No treasures found yet</p>
                    <p className="text-xs mt-1">
                      {user ? "Use the extension simulator to find your first treasure!" : "Sign in to start collecting treasures"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {treasures.map((treasure) => (
                      <TreasureCard key={treasure.id} treasure={treasure} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
