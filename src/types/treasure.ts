
export interface Treasure {
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
  confidence?: number | null;
}
