
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Clock, CheckCircle, Search, Trash2 } from "lucide-react";

interface Treasure {
  id: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  status: 'hunting' | 'found' | 'claimed';
  platform?: string;
  foundPrice?: number;
  dateSpotted: string;
  lastHunted: string;
  confidence?: number;
}

interface TreasureCardProps {
  treasure: Treasure;
}

const TreasureCard: React.FC<TreasureCardProps> = ({ treasure }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'hunting':
        return {
          icon: <Search className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800',
          label: 'Hunting'
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
    }`}>
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
                <Button size="sm" variant="outline" className="flex-1">
                  <Search className="w-3 h-3 mr-1" />
                  Hunt Now
                </Button>
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
