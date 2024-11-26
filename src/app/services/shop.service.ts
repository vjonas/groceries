import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product, Order, Supplier, Tag } from '../models/product.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private orders = new BehaviorSubject<Order[]>([]);
  private cart = new BehaviorSubject<Order[]>([]);
  private products = new BehaviorSubject<Product[]>([]);
  private tags = new BehaviorSubject<Tag[]>([]);

  constructor(private supabaseService: SupabaseService) {
    this.loadOrders();
    this.loadProducts();
    this.loadTags();
  }

  private async loadTags() {
    const { data, error } = await this.supabaseService.supabase
      .from('tags')
      .select('*')
      .order('name');

    if (!error && data) {
      this.tags.next(data);
    }
  }

  private async loadProducts() {
    // First get all products
    const { data: productsData, error: productsError } = await this.supabaseService.supabase
      .from('groceries')
      .select('*')
      .order('name');

    if (productsError || !productsData) {
      console.error('Error loading products:', productsError);
      return;
    }

    // Then get tags for these products
    const { data: tagsData, error: tagsError } = await this.supabaseService.supabase
      .from('grocery_tags')
      .select(`
        grocery_id,
        tag:tags(*)
      `);

    if (tagsError) {
      console.error('Error loading product tags:', tagsError);
      return;
    }

    // Combine products with their tags
    const productsWithTags = productsData.map(product => ({
      ...product,
      tags: tagsData
        ?.filter(t => t.grocery_id === product.id)
        .map(t => t.tag)
        || []
    }));

    this.products.next(productsWithTags);
  }

  private async loadOrders() {
    const { data: { user } } = await this.supabaseService.getUser();
    if (!user) return;

    const { data: ordersData, error: ordersError } = await this.supabaseService.supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        user_id
      `)
      .eq('user_id', user.id);

    if (ordersError || !ordersData) {
      console.error('Error loading orders:', ordersError);
      return;
    }

    const orderIds = ordersData.map(order => order.id);
    const { data: itemsData, error: itemsError } = await this.supabaseService.supabase
      .from('order_items')
      .select(`
        order_id,
        grocery_id,
        quantity,
        price
      `)
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error loading order items:', itemsError);
      return;
    }

    const { data: userData, error: userError } = await this.supabaseService.supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    const userEmail = userData?.email || user.email || 'Unknown';

    const formattedOrders = ordersData.map(order => ({
      id: order.id,
      userId: order.user_id,
      userEmail: userEmail,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: new Date(order.created_at),
      products: (itemsData || [])
        .filter(item => item.order_id === order.id)
        .map(item => ({
          productId: item.grocery_id,
          quantity: item.quantity,
          price: item.price
        }))
    }));

    this.orders.next(formattedOrders);
  }

  getProducts(): Observable<Product[]> {
    return this.products.asObservable();
  }

  getTags(): Observable<Tag[]> {
    return this.tags.asObservable();
  }

  getSuppliers(): Observable<Supplier[]> {
    return new Observable(subscriber => {
      this.supabaseService.supabase
        .from('suppliers')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            subscriber.error(error);
          } else {
            subscriber.next(data as Supplier[]);
          }
        });
    });
  }

  getOrders(): Observable<Order[]> {
    return this.orders.asObservable();
  }

  getCart(): Observable<Order[]> {
    return this.cart.asObservable();
  }

  getProductName(productId: number): string {
    const product = this.products.getValue().find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  }

  async addGrocery(grocery: Partial<Product>): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('groceries')
      .insert(grocery);
    
    if (error) throw error;
    await this.loadProducts();
  }

  async updateProduct(product: Product): Promise<void> {
    const { id, tags, ...updateData } = product;
    const { error } = await this.supabaseService.supabase
      .from('groceries')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    await this.loadProducts();
  }

  async addTag(tag: Partial<Tag>): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('tags')
      .insert(tag);
    
    if (error) throw error;
    await this.loadTags();
  }

  async addTagToGrocery(groceryId: number, tagId: number): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('grocery_tags')
      .insert({ grocery_id: groceryId, tag_id: tagId });
    
    if (error) throw error;
    await this.loadProducts();
  }

  async removeTagFromGrocery(groceryId: number, tagId: number): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('grocery_tags')
      .delete()
      .eq('grocery_id', groceryId)
      .eq('tag_id', tagId);
    
    if (error) throw error;
    await this.loadProducts();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cart.getValue();
    const existingOrder = currentCart.find(order => 
      order.products.some(item => item.productId === product.id)
    );

    if (existingOrder) {
      const existingItem = existingOrder.products.find(item => item.productId === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
        existingOrder.totalAmount = existingOrder.products.reduce(
          (sum, item) => sum + (item.price * item.quantity), 
          0
        );
      }
    } else {
      const newOrder: Order = {
        id: Date.now(),
        userId: '',
        userEmail: '',
        products: [{
          productId: product.id,
          quantity,
          price: product.price
        }],
        totalAmount: product.price * quantity,
        status: 'pending',
        createdAt: new Date()
      };
      currentCart.push(newOrder);
    }

    this.cart.next([...currentCart]);
  }

  async placeOrder(): Promise<void> {
    const currentCart = this.cart.getValue();
    if (currentCart.length === 0) return;

    const { data: { user } } = await this.supabaseService.getUser();
    if (!user) throw new Error('User must be logged in to place order');

    const { data: orderData, error: orderError } = await this.supabaseService.supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: currentCart[0].totalAmount,
        created_at: new Date()
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = currentCart[0].products.map(item => ({
      order_id: orderData.id,
      grocery_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await this.supabaseService.supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    await this.loadOrders();
    this.cart.next([]);
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'processing' | 'completed'): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    await this.loadOrders();
  }

  async orderFromSupplier(supplier: Supplier): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('supplier_orders')
      .insert({
        supplier_id: supplier.id,
        status: 'pending',
        created_at: new Date()
      });

    if (error) throw error;
  }
}