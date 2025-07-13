import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EbayItem {
  title: string;
  price: number;
  url: string;
  image: string;
  condition: string;
  seller: string;
  shipping: string;
}

export interface EbaySearchResult {
  success: boolean;
  items: EbayItem[];
  totalResults: number;
}

export const useEbaySearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<EbayItem[]>([]);
  const { toast } = useToast();

  const searchEbay = async (title: string, maxPrice?: number): Promise<EbaySearchResult | null> => {
    setIsSearching(true);
    
    try {
      console.log('🔍 Searching eBay for:', title);
      
      const { data, error } = await supabase.functions.invoke('search-ebay', {
        body: { 
          title,
          maxPrice 
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'eBay search failed');
      }

      setSearchResults(data.items);
      
      toast({
        title: "eBay Hunt Complete! 🎯",
        description: `Found ${data.items.length} items on eBay`,
      });

      console.log('✅ eBay search completed:', data);
      return data;

    } catch (error) {
      console.error('❌ eBay search error:', error);
      
      toast({
        title: "Hunt Failed",
        description: error.message || "Failed to search eBay. Please try again.",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    isSearching,
    searchResults,
    searchEbay,
    clearResults
  };
};