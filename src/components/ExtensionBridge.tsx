
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
      // Only accept messages from the same origin or extension
      if (event.origin !== window.location.origin && !event.data?.type?.startsWith('MYMAGPYE_')) {
        return;
      }

      if (event.data?.type === 'MYMAGPYE_SAVE_TREASURE' && user) {
        const treasure = event.data.treasure;
        
        console.log('🏴‍☠️ Saving treasure from extension:', treasure);
        
        addTreasure(treasure);
        
        // Send confirmation back to extension
        if (event.source) {
          (event.source as Window).postMessage({
            type: 'MYMAGPYE_TREASURE_SAVED',
            success: true
          }, { targetOrigin: '*' });
        }
      } else if (event.data?.type === 'MYMAGPYE_SAVE_TREASURE' && !user) {
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
          }, { targetOrigin: '*' });
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, [user, addTreasure, toast]);

  // This component doesn't render anything, it just handles communication
  return null;
};

export default ExtensionBridge;
