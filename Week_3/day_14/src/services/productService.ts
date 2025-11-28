import apiClient from './apiClient';

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  category?: string;
  images?: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export const productService = {
  // Get all products from DummyJSON
  async getProducts(limit: number = 20, skip: number = 0): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get(`/products?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products by category ${category}:`, error);
      throw error;
    }
  },

  // Search products
  async searchProducts(query: string): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get(`/products/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching products with query ${query}:`, error);
      throw error;
    }
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};