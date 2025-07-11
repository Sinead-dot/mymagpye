import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Eye, Target, ShoppingBag, User, LogOut } from "lucide-react";
import TreasureCard from "@/components/TreasureCard";
import ExtensionSimulator from "@/components/ExtensionSimulator";
import HuntingStats from "@/components/HuntingStats";
import NotificationDemo from "@/components/NotificationDemo";
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';
import UserProfile from '@/components/UserProfile';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Calculate stats from treasures
  const stats = {
    spotted: treasures.length,
    hunting: treasures.filter(t => t.status === 'hunting').length,
    found: treasures.filter(t => t.status === 'found').length,
    claimed: 0, // Set to 0 since 'claimed' is not a valid status
    totalSaved: treasures
      .filter(t => t.foundPrice)
      .reduce((acc, t) => acc + (t.price - (t.foundPrice || 0)), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="py-6 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/ecbb7536-998c-4b9b-9641-b540f619fc6c.png" 
              alt="MyMagPye Logo" 
              className="w-[250px] h-[250px] object-contain"
            />
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                How it Works
              </Button>
              <Button size="sm">Get Extension</Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">{user.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
                <Button size="sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spot, Save, Snag Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Spot, Save, Snag</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform your shopping with MyMagPye's intelligent treasure hunting system
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Spot Panel */}
          <Card className="text-center hover:shadow-lg transition-shadow border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Spot</h3>
              <p className="text-slate-600 mb-4">
                Browse your favorite retail sites while our extension automatically spots items you love
              </p>
              <div className="text-sm text-blue-700 font-medium">
                ✨ Automatic detection across 1000+ sites
              </div>
            </CardContent>
          </Card>

          {/* Save Panel */}
          <Card className="text-center hover:shadow-lg transition-shadow border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Save</h3>
              <p className="text-slate-600 mb-4">
                Save items to your treasure chest and let MyMagPye hunt for better deals across secondhand platforms
              </p>
              <div className="text-sm text-orange-700 font-medium">
                🔍 AI-powered hunting across multiple platforms
              </div>
            </CardContent>
          </Card>

          {/* Snag Panel */}
          <Card className="text-center hover:shadow-lg transition-shadow border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Snag</h3>
              <p className="text-slate-600 mb-4">
                Get notified instantly when we find your treasure at a better price on secondhand marketplaces
              </p>
              <div className="text-sm text-green-700 font-medium">
                💰 Save up to 70% on retail prices
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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
