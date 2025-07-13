
import { useEffect } from 'react';
import { useTreasures } from '@/hooks/useTreasures';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ExtensionBridgeProps {
  // This component handles communication between the extension and web app
}

const ExtensionBridge: React.FC<ExtensionBridgeProps> = () => {
  const { user } = useAuth();
  const { treasures, addTreasure } = useTreasures();
  const { toast } = useToast();

  useEffect(() => {
    // Request saved treasures from extension on load
    const requestSavedTreasures = () => {
      console.log('🔗 Requesting saved treasures from extension...');
      window.postMessage({
        type: 'MYMAGPYE_GET_TREASURES'
      }, '*');
    };

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
      } else if (event.data?.type === 'MYMAGPYE_GET_TREASURES') {
        console.log('🔍 Extension requesting treasures list...');
        
        // Convert treasures to format expected by extension
        const formattedTreasures = treasures.map(treasure => ({
          title: treasure.title,
          brand: treasure.brand,
          price: treasure.price,
          image: treasure.image,
          url: treasure.url,
          platform: treasure.platform,
          status: treasure.status,
          confidence: treasure.confidence
        }));
        
        // Send treasures back to extension sidebar
        window.postMessage({
          type: 'MYMAGPYE_TREASURES_RESPONSE',
          treasures: formattedTreasures
        }, '*');
        
        console.log('📤 Sent treasures to extension:', formattedTreasures.length);
      }
    };

    // Listen for messages from extension
    window.addEventListener('message', handleExtensionMessage);
    
    // Request saved treasures when component mounts and user is available
    if (user) {
      setTimeout(requestSavedTreasures, 1000); // Small delay to ensure extension is ready
    }
    
    // Also listen for chrome extension messages if available
    if (typeof window !== 'undefined' && 'chrome' in window && (window as any).chrome?.runtime?.onMessage) {
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
      
      (window as any).chrome.runtime.onMessage.addListener(chromeMessageHandler);
      
      return () => {
        window.removeEventListener('message', handleExtensionMessage);
        if ((window as any).chrome?.runtime?.onMessage) {
          (window as any).chrome.runtime.onMessage.removeListener(chromeMessageHandler);
        }
      };
    }
    
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, [user, treasures, addTreasure, toast]);

  // This component doesn't render anything, it just handles communication
  return null;
};

export default ExtensionBridge;
