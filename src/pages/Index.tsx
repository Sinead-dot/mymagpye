
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Eye, Target, ShoppingBag, User, LogOut } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import TreasureCard from "@/components/TreasureCard";
import ExtensionBridge from "@/components/ExtensionBridge";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTreasures } from '@/hooks/useTreasures';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { treasures, isLoading: treasuresLoading, addTreasure } = useTreasures();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle treasure saving from extension URL parameters
  useEffect(() => {
    if (user && searchParams.get('action') === 'save_treasure') {
      const title = searchParams.get('title');
      const brand = searchParams.get('brand');
      const price = searchParams.get('price');
      const image = searchParams.get('image');
      const url = searchParams.get('url');
      const platform = searchParams.get('platform');

      if (title && url) {
        const newTreasure = {
          title,
          brand: brand || "Unknown Brand",
          price: price ? parseFloat(price) : 0,
          image: image || "/placeholder.svg",
          url,
          platform: platform || "Unknown Platform",
          status: 'hunting' as const,
          confidence: 0
        };

        addTreasure(newTreasure);
        
        toast({
          title: "Treasure Saved! 🏴‍☠️",
          description: `${title} has been added to your collection`,
        });

        // Clear the URL parameters
        setSearchParams({});
      }
    }
  }, [user, searchParams, addTreasure, toast, setSearchParams]);

  const handleProductSpotted = (product: any) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save treasures",
        variant: "destructive"
      });
      return;
    }

    const newTreasure = {
      title: product.title,
      brand: product.brand || "Unknown Brand",
      price: product.price || 0,
      image: product.image || "/placeholder.svg",
      url: product.url,
      platform: product.platform,
      status: 'hunting' as const,
      confidence: product.confidence
    };

    addTreasure(newTreasure);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  // Calculate stats from treasures
  const stats = {
    spotted: treasures.length,
    hunting: treasures.filter(t => t.status === 'hunting').length,
    found: treasures.filter(t => t.status === 'found').length,
    claimed: treasures.filter(t => t.status === 'claimed').length,
    totalSaved: treasures.filter(t => t.foundPrice).reduce((acc, t) => acc + (t.price - (t.foundPrice || 0)), 0)
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-white">
      {/* Extension Bridge - handles communication with browser extension */}
      <ExtensionBridge />
      
      <header className="py-6 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/ecbb7536-998c-4b9b-9641-b540f619fc6c.png" alt="MyMagPye Logo" className="w-[225px] h-[225px] object-contain" />
            <div className="flex space-x-4">
              <Button size="sm">Get Browser Extension</Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">{user.email}</span>
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div> : <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>}
          </div>
        </div>
      </header>

      {/* Spot, Save, Snag Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Your Secondhand Shopping Companion</h2>
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
        <div className="flex justify-center">
          {/* Treasures */}
          <div className="w-full max-w-2xl space-y-6">
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
                {treasuresLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your treasures...</p>
                  </div>
                ) : treasures.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Gem className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No treasures found yet</p>
                    <p className="text-xs mt-1">
                      {user ? "Use the browser extension or simulator to find your first treasure!" : "Sign in to start collecting treasures"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {treasures.map(treasure => (
                      <TreasureCard key={treasure.id} treasure={treasure} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>;
};

export default Index;
