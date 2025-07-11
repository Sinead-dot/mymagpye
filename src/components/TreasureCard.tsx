
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Clock, CheckCircle, Search, Trash2, Zap, Target } from "lucide-react";
import { Treasure } from "@/types/treasure";

interface TreasureCardProps {
  treasure: Treasure;
  onStartHunt?: (treasureId: string) => void;
  onStopHunt?: (treasureId: string) => void;
  isHunting?: boolean;
}

const TreasureCard: React.FC<TreasureCardProps> = ({ treasure, onStartHunt, onStopHunt, isHunting = false }) => {
  const [huntingProgress, setHuntingProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHunting) {
      interval = setInterval(() => {
        setHuntingProgress(prev => {
          const next = prev + (Math.random() * 10 + 5);
          return next > 100 ? 0 : next; // Reset when reaches 100%
        });
      }, 1000);
    } else {
      setHuntingProgress(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHunting]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'hunting':
        return {
          icon: isHunting ? <Target className="w-4 h-4 animate-pulse" /> : <Search className="w-4 h-4" />,
          color: isHunting ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800',
          label: isHunting ? 'Hunting...' : 'Ready to Hunt'
        };
      case 'found':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800',
          label: 'Found'
        };
      case 'claimed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800',
          label: 'Claimed'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(treasure.status);
  const savings = treasure.foundPrice ? treasure.price - treasure.foundPrice : 0;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      treasure.status === 'found' ? 'ring-2 ring-green-200 bg-green-50' : ''
    } ${isHunting ? 'ring-2 ring-orange-200 bg-orange-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={treasure.image}
              alt={treasure.title}
              className="w-16 h-16 object-cover rounded-lg bg-gray-100"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm truncate">
                  {treasure.title}
                </h3>
                <p className="text-slate-600 text-xs">{treasure.brand}</p>
              </div>
              <Badge className={statusConfig.color} variant="secondary">
                <span className="flex items-center space-x-1">
                  {statusConfig.icon}
                  <span>{statusConfig.label}</span>
                </span>
              </Badge>
            </div>

            {/* Hunting Progress */}
            {isHunting && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-orange-600 mb-1">
                  <span>Scanning platforms...</span>
                  <span>{Math.round(huntingProgress)}%</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-1">
                  <div 
                    className="bg-orange-600 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${huntingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Price Info */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Retail:</span>
                <span className="font-medium">${treasure.price}</span>
              </div>
              
              {treasure.foundPrice && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Found on {treasure.platform}:</span>
                    <span className="font-medium text-green-600">${treasure.foundPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-green-700">You save:</span>
                    <span className="text-green-700">${savings}</span>
                  </div>
                </>
              )}
            </div>

            {/* Status Info */}
            <div className="text-xs text-slate-500 mb-3">
              <div>Spotted: {new Date(treasure.dateSpotted).toLocaleDateString()}</div>
              <div>Last hunt: {new Date(treasure.lastHunted).toLocaleDateString()}</div>
              {treasure.confidence && (
                <div className="flex items-center space-x-1 mt-1">
                  <span>Match confidence:</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {treasure.confidence}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {treasure.status === 'found' && (
                <Button size="sm" className="flex-1">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Claim Treasure
                </Button>
              )}
              
              {treasure.status === 'hunting' && (
                <>
                  {!isHunting ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => onStartHunt?.(treasure.id)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Start Hunt
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => onStopHunt?.(treasure.id)}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Stop Hunt
                    </Button>
                  )}
                </>
              )}

              <Button size="sm" variant="ghost" className="px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasureCard;
