
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, CheckCircle, DollarSign } from "lucide-react";

interface Stats {
  spotted: number;
  hunting: number;
  found: number;
  claimed: number;
  totalSaved: number;
}

interface HuntingStatsProps {
  stats: Stats;
}

const HuntingStats: React.FC<HuntingStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: <Eye className="w-5 h-5 text-blue-600" />,
      label: "Spotted",
      value: stats.spotted,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Search className="w-5 h-5 text-orange-600" />,
      label: "Hunting",
      value: stats.hunting,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      label: "Found",
      value: stats.found,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      label: "Saved",
      value: `$${stats.totalSaved}`,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-xl">📊</span>
          <span>Hunting Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className={`${item.bgColor} p-4 rounded-lg text-center`}
            >
              <div className="flex justify-center mb-2">
                {item.icon}
              </div>
              <div className={`text-2xl font-bold ${item.color} mb-1`}>
                {item.value}
              </div>
              <div className="text-sm text-slate-600">
                {item.label}
              </div>
            </div>
          ))}
        </div>
        
        {stats.totalSaved > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <span className="text-lg">🎉</span>
              <span className="font-semibold">
                Amazing! You've saved ${stats.totalSaved} by shopping secondhand!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HuntingStats;
