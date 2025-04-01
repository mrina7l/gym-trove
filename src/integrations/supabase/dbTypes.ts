// This file contains type definitions for our database tables
// while keeping the original types.ts file unchanged
import { Database } from './types';

// Export existing Database type
export type { Database };

// Define table row types as an alternative to modifying the read-only types.ts file
export type ProductRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageurl: string;
  category: string;
  tags: string[];
  quantity: number;
  createdat: string;
};

export type OrderRow = {
  id: string;
  userid: string;
  items: any; // JSON containing cart items
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingaddress: any; // JSON containing address
  paymentintentid: string | null;
  createdat: string;
};

export type ProfileRow = {
  id: string;
  email: string;
  name: string | null;
  createdat: string;
};

// Helper function to map database row to our application types
export function mapProductRowToProduct(row: ProductRow): import('@/types').Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    imageUrl: row.imageurl,
    category: row.category,
    tags: row.tags,
    quantity: row.quantity,
    createdAt: row.createdat
  };
}

// Helper function to map multiple products
export function mapProductRowsToProducts(rows: ProductRow[]): import('@/types').Product[] {
  return rows.map(mapProductRowToProduct);
}

// Helper function to map order row to our application Order type
export function mapOrderRowToOrder(row: OrderRow): import('@/types').Order {
  return {
    id: row.id,
    userId: row.userid,
    items: row.items,
    total: row.total,
    status: row.status,
    shippingAddress: row.shippingaddress,
    paymentIntentId: row.paymentintentid || undefined,
    createdAt: row.createdat
  };
}

// Helper function to map multiple orders
export function mapOrderRowsToOrders(rows: OrderRow[]): import('@/types').Order[] {
  return rows.map(mapOrderRowToOrder);
}
