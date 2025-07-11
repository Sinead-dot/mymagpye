
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Sparkles, Check } from "lucide-react";

interface SpotButtonProps {
  onSpot: () => void;
}

const SpotButton: React.FC<SpotButtonProps> = ({ onSpot }) => {
  const [isSpotting, setIsSpotting] = useState(false);

  const handleSpot = () => {
    setIsSpotting(true);
    onSpot();
    
    setTimeout(() => {
      setIsSpotting(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Demo Product Card */}
      <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👗</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-1">
                Demo Linen Dress
              </h3>
              <p className="text-slate-600 text-sm mb-2">Sample Brand</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">$75</span>
                <Badge className="bg-slate-200 text-slate-700" variant="secondary">
                  Demo Product
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spot Button */}
      <div className="relative">
        <Button
          onClick={handleSpot}
          disabled={isSpotting}
          className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
            isSpotting 
              ? 'bg-green-600 hover:bg-green-600' 
              : 'bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500'
          }`}
        >
          {isSpotting ? (
            <span className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>Treasure Spotted! 🪶</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Spot with MyMagPye</span>
              <Sparkles className="w-4 h-4" />
            </span>
          )}
        </Button>
        
        {isSpotting && (
          <div className="absolute inset-0 bg-green-500 rounded-md opacity-20 animate-pulse" />
        )}
      </div>

      <p className="text-sm text-slate-600 text-center">
        Click to simulate spotting a treasure from a retail website
      </p>
    </div>
  );
};

export default SpotButton;
