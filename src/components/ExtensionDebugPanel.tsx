
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chrome, MessageCircle, Database } from "lucide-react";

const ExtensionDebugPanel: React.FC = () => {
  const [lastMessage, setLastMessage] = useState<string>('None');
  const [extensionStatus, setExtensionStatus] = useState<string>('Unknown');

  const testExtensionConnection = () => {
    console.log('🔧 Testing extension connection...');
    
    // Listen for response
    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'MYMAGPYE_TREASURES_RESPONSE') {
        setLastMessage(`Received ${event.data.treasures?.length || 0} treasures`);
        setExtensionStatus('Connected');
        window.removeEventListener('message', messageHandler);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Send test message
    window.postMessage({
      type: 'MYMAGPYE_GET_TREASURES'
    }, '*');
    
    // Timeout after 3 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      if (lastMessage === 'None') {
        setLastMessage('No response received');
        setExtensionStatus('Not responding');
      }
    }, 3000);
  };

  const testSaveTreasure = () => {
    console.log('🔧 Testing save treasure...');
    
    const testTreasure = {
      title: 'Test Item',
      brand: 'Test Brand',
      price: 19.99,
      image: '/placeholder.svg',
      url: 'https://example.com/test',
      platform: 'Test Platform',
      status: 'hunting',
      confidence: 85
    };

    window.postMessage({
      type: 'MYMAGPYE_SAVE_TREASURE',
      treasure: testTreasure
    }, '*');
    
    setLastMessage('Sent test treasure');
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Chrome className="w-5 h-5 text-orange-600" />
          <span>Extension Debug</span>
          <Badge variant={extensionStatus === 'Connected' ? 'default' : 'destructive'}>
            {extensionStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <strong>Last Message:</strong> {lastMessage}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testExtensionConnection}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          
          <Button 
            onClick={testSaveTreasure}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            <Database className="w-4 h-4 mr-2" />
            Test Save
          </Button>
        </div>
        
        <p className="text-xs text-slate-600">
          Use these buttons to test communication with the browser extension.
        </p>
      </CardContent>
    </Card>
  );
};

export default ExtensionDebugPanel;
