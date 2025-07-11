
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, ExternalLink } from "lucide-react";

interface Notification {
  id: number;
  type: string;
  treasure: any;
}

interface NotificationDemoProps {
  notifications: Notification[];
}

const NotificationDemo: React.FC<NotificationDemoProps> = ({ notifications }) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      setVisibleNotifications(prev => [...prev, latest]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setVisibleNotifications(prev => prev.filter(n => n.id !== latest.id));
      }, 5000);
    }
  }, [notifications]);

  const removeNotification = (id: number) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Notification Center Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {visibleNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {visibleNotifications.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visibleNotifications.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
              <p className="text-xs mt-1">Treasure alerts will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleNotifications.map(notification => (
                <div
                  key={notification.id}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">💎</span>
                        <span className="font-semibold text-green-800">
                          Treasure Found!
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">
                        Your {notification.treasure.title} is available on {notification.treasure.platform} for ${notification.treasure.foundPrice}!
                      </p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Claim Your Treasure
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="ml-2 p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browser Notification Demo */}
      {visibleNotifications.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🔔</span>
              <span className="font-semibold text-amber-800">
                Browser Notification
              </span>
            </div>
            <p className="text-sm text-amber-700">
              In the actual Chrome extension, you'd receive a system notification like this!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationDemo;
