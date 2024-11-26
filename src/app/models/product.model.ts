export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Order {
  id: number;
  userId: string;
  userEmail: string;
  products: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Supplier {
  id: number;
  name: string;
  categories: string[];
}