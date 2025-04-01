
import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    title: 'Premium Whey Protein Isolate',
    description: 'Our highest quality whey protein with 27g of protein per serving and minimal fats and carbs. Ideal for muscle recovery and growth.',
    price: 59.99,
    imageUrl: 'https://images.unsplash.com/photo-1579722820310-211f4d88a5a9?q=80&w=2940&auto=format&fit=crop',
    category: 'Protein',
    tags: ['whey', 'isolate', 'muscle building'],
    quantity: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Mass Gainer - Chocolate',
    description: 'High-calorie formula with 1250 calories per serving to help you bulk up. Contains 50g protein and 250g carbs.',
    price: 64.99,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2787&auto=format&fit=crop',
    category: 'Gainers',
    tags: ['mass gainer', 'bulking', 'weight gain'],
    quantity: 35,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Pre-Workout Energy Boost',
    description: 'Powerful pre-workout formula with caffeine, beta-alanine, and creatine to maximize your training performance.',
    price: 39.99,
    imageUrl: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2858&auto=format&fit=crop',
    category: 'Pre-Workout',
    tags: ['energy', 'focus', 'pump'],
    quantity: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'BCAAs Recovery Formula',
    description: '2:1:1 ratio of BCAAs to support muscle recovery and reduce muscle soreness after intense workouts.',
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop',
    category: 'Amino Acids',
    tags: ['recovery', 'bcaa', 'amino acids'],
    quantity: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Vegan Plant Protein',
    description: 'Plant-based protein blend from pea, rice, and hemp sources. 24g of protein per serving with all essential amino acids.',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=2833&auto=format&fit=crop',
    category: 'Protein',
    tags: ['vegan', 'plant-based', 'dairy-free'],
    quantity: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Creatine Monohydrate',
    description: 'Pure creatine monohydrate for strength gains, improved performance, and increased muscle mass.',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1627467959547-215397e330e6?q=80&w=2864&auto=format&fit=crop',
    category: 'Performance',
    tags: ['strength', 'power', 'muscle'],
    quantity: 75,
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Omega-3 Fish Oil',
    description: 'High-quality fish oil capsules providing essential omega-3 fatty acids for heart health and joint support.',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1577460551100-85fa993c4e95?q=80&w=2787&auto=format&fit=crop',
    category: 'Health',
    tags: ['fish oil', 'heart health', 'joints'],
    quantity: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Vitamin D3 + K2',
    description: 'Synergistic combination of Vitamin D3 and K2 for optimal calcium absorption and bone health.',
    price: 17.99,
    imageUrl: 'https://images.unsplash.com/photo-1584308074548-ad52816deb9d?q=80&w=2830&auto=format&fit=crop',
    category: 'Vitamins',
    tags: ['vitamin d', 'vitamin k', 'bone health'],
    quantity: 90,
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'Gym Shaker Bottle',
    description: 'Premium 24oz shaker bottle with BlenderBall wire whisk for smooth, lump-free protein shakes.',
    price: 9.99,
    imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=2787&auto=format&fit=crop',
    category: 'Accessories',
    tags: ['shaker', 'bottle', 'blender'],
    quantity: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: '10',
    title: 'Weightlifting Gloves',
    description: 'Durable weightlifting gloves with wrist support. Prevents calluses and improves grip strength.',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop',
    category: 'Accessories',
    tags: ['gloves', 'lifting', 'gym'],
    quantity: 0,
    createdAt: new Date().toISOString(),
  },
];

export const categories = [
  'All',
  'Protein',
  'Gainers',
  'Pre-Workout',
  'Amino Acids',
  'Performance',
  'Health',
  'Vitamins',
  'Accessories',
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All') return products;
  return products.filter((product) => product.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter((product) =>
    product.title.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};
