
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
    console.log('🔗 ExtensionBridge initializing...', { 
      user: !!user, 
      treasureCount: treasures.length,
      domain: window.location.hostname,
      pathname: window.location.pathname
    });
    
    // Set up global flag for extension detection
    (window as any).MYMAGPYE_WEB_APP_READY = true;
    (window as any).MYMAGPYE_USER_AUTHENTICATED = !!user;
    
    // Request saved treasures from extension on load
    const requestSavedTreasures = () => {
      console.log('🔗 Requesting saved treasures from extension...');
      
      // Method 1: postMessage to window
      window.postMessage({
        type: 'MYMAGPYE_GET_TREASURES'
      }, '*');
      
      // Method 2: Custom event for content scripts
      document.dispatchEvent(new CustomEvent('MYMAGPYE_GET_TREASURES', {
        detail: { requestedBy: 'web-app' }
      }));
      
      // Method 3: Try Chrome extension API if available
      if (typeof window !== 'undefined' && 'chrome' in window && (window as any).chrome?.runtime) {
        try {
          (window as any).chrome.runtime.sendMessage({
            action: 'getTreasures'
          }, (response: any) => {
            console.log('🔗 Chrome extension response:', response);
            if (response && response.treasures) {
              console.log('📦 Received treasures from Chrome extension:', response.treasures);
              // Process treasures if needed
            }
          });
        } catch (error) {
          console.log('🔗 Chrome extension API not available:', error);
        }
      }
    };

    const handleExtensionMessage = (event: MessageEvent) => {
      console.log('🔗 ExtensionBridge received message:', event.data);
      
      // Only accept messages from the same origin or extension
      if (event.origin !== window.location.origin && !event.data?.type?.startsWith('MYMAGPYE_')) {
        console.log('🔗 Ignoring message from:', event.origin);
        return;
      }

      if (event.data?.type === 'MYMAGPYE_SAVE_TREASURE') {
        const treasure = event.data.treasure;
        
        console.log('🏴‍☠️ Saving treasure from extension:', treasure);
        
        if (user) {
          console.log('✅ User authenticated, adding treasure...');
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
          console.log('❌ User not authenticated');
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
        
        console.log('📤 Sending treasures to extension:', formattedTreasures.length);
        
        // Send treasures back to extension sidebar
        window.postMessage({
          type: 'MYMAGPYE_TREASURES_RESPONSE',
          treasures: formattedTreasures
        }, '*');
      } else if (event.data?.type === 'MYMAGPYE_EXTENSION_READY') {
        console.log('🔗 Extension reported ready, requesting treasures...');
        setTimeout(requestSavedTreasures, 500);
      }
    };

    // Listen for messages from extension
    window.addEventListener('message', handleExtensionMessage);
    
    // Request saved treasures when component mounts and user is available
    if (user) {
      console.log('👤 User found, requesting treasures in 1 second...');
      setTimeout(requestSavedTreasures, 1000); // Small delay to ensure extension is ready
      
      // Also try again after a longer delay in case extension loads slowly
      setTimeout(requestSavedTreasures, 3000);
    } else {
      console.log('👤 No user found, skipping treasure request');
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
        } else if (request.action === 'getTreasures') {
          console.log('🔍 Chrome extension requesting treasures directly...');
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
          
          sendResponse({ treasures: formattedTreasures });
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
