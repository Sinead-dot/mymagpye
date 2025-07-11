
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Treasure } from '@/types/treasure';

export const useTreasures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: treasures = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['treasures', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('treasures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching treasures:', error);
        throw error;
      }

      return data.map(treasure => ({
        id: treasure.id,
        title: treasure.title,
        brand: treasure.brand || 'Unknown Brand',
        price: Number(treasure.price) || 0,
        image: treasure.image || '/placeholder.svg',
        url: treasure.url,
        platform: treasure.platform,
        status: treasure.status as 'hunting' | 'found' | 'claimed',
        foundPrice: treasure.found_price ? Number(treasure.found_price) : undefined,
        dateSpotted: treasure.date_spotted,
        lastHunted: treasure.last_hunted,
        confidence: treasure.confidence
      })) as Treasure[];
    },
    enabled: !!user
  });

  const addTreasureMutation = useMutation({
    mutationFn: async (treasureData: Omit<Treasure, 'id' | 'dateSpotted' | 'lastHunted'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('treasures')
        .insert([{
          user_id: user.id,
          title: treasureData.title,
          brand: treasureData.brand,
          price: treasureData.price,
          image: treasureData.image,
          url: treasureData.url,
          platform: treasureData.platform,
          status: treasureData.status,
          found_price: treasureData.foundPrice,
          confidence: treasureData.confidence
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
      toast({
        title: "Treasure Added",
        description: "Your new treasure has been saved successfully!"
      });
    },
    onError: (error) => {
      console.error('Error adding treasure:', error);
      toast({
        title: "Error",
        description: "Failed to save treasure. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateTreasureMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Treasure> }) => {
      const { data, error } = await supabase
        .from('treasures')
        .update({
          title: updates.title,
          brand: updates.brand,
          price: updates.price,
          image: updates.image,
          url: updates.url,
          platform: updates.platform,
          status: updates.status,
          found_price: updates.foundPrice,
          confidence: updates.confidence
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
    }
  });

  const deleteTreasureMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treasures')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
      toast({
        title: "Treasure Removed",
        description: "Treasure has been removed from your collection."
      });
    }
  });

  return {
    treasures,
    isLoading,
    error,
    addTreasure: addTreasureMutation.mutate,
    updateTreasure: updateTreasureMutation.mutate,
    deleteTreasure: deleteTreasureMutation.mutate,
    isAddingTreasure: addTreasureMutation.isPending
  };
};
