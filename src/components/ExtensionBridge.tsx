
import { useEffect } from 'react';
import { useTreasures } from '@/hooks/useTreasures';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ExtensionBridgeProps {
  // This component handles communication between the extension and web app
}

const ExtensionBridge: React.FC<ExtensionBridgeProps> = () => {
  const { user } = useAuth();
  const { addTreasure } = useTreasures();
  const { toast } = useToast();

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      console.log('🔗 ExtensionBridge received message:', event.data);
      
      // Only accept messages from the same origin or extension
      if (event.origin !== window.location.origin && !event.data?.type?.startsWith('MYMAGPYE_')) {
        return;
      }

      if (event.data?.type === 'MYMAGPYE_SAVE_TREASURE') {
        const treasure = event.data.treasure;
        
        console.log('🏴‍☠️ Saving treasure from extension:', treasure);
        
        if (user) {
          addTreasure(treasure);
          
          toast({
            title: "Treasure Saved! 🏴‍☠️",
            description: `${treasure.title} has been added to your collection`,
          });
          
          // Send confirmation back to extension
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'MYMAGPYE_TREASURE_SAVED',
              success: true
            }, '*');
          }
        } else {
          toast({
            title: "Sign In Required",
            description: "Please sign in to save treasures from the extension",
            variant: "destructive"
          });
          
          // Send error back to extension
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'MYMAGPYE_TREASURE_SAVED',
              success: false,
              error: 'User not authenticated'
            }, '*');
          }
        }
      }
    };

    // Listen for messages from extension
    window.addEventListener('message', handleExtensionMessage);
    
    // Also listen for chrome extension messages if available
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      const chromeMessageHandler = (request: any, sender: any, sendResponse: any) => {
        console.log('🔗 Chrome extension message received:', request);
        
        if (request.type === 'MYMAGPYE_SAVE_TREASURE') {
          handleExtensionMessage({
            data: request,
            origin: window.location.origin,
            source: null
          } as MessageEvent);
          
          sendResponse({ success: true });
        }
      };
      
      chrome.runtime.onMessage.addListener(chromeMessageHandler);
      
      return () => {
        window.removeEventListener('message', handleExtensionMessage);
        if (chrome.runtime && chrome.runtime.onMessage) {
          chrome.runtime.onMessage.removeListener(chromeMessageHandler);
        }
      };
    }
    
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, [user, addTreasure, toast]);

  // This component doesn't render anything, it just handles communication
  return null;
};

export default ExtensionBridge;
