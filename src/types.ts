export type Category = 'real-estate' | 'factories' | 'heavy-equipment' | 'cars' | 'uber';

export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: Category;
  location: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  condition?: 'new' | 'used';
  specs?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}
