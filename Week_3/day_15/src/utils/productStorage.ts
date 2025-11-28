class ProductStorage {
  private customProducts: any[] = [];

  addProduct(product: any) {
    const newProduct = {
      ...product,
      id: Date.now(), // Generate unique ID
      price: parseFloat(product.price)
    };
    this.customProducts.push(newProduct);
    return newProduct;
  }

  getAllProducts(): any[] {
    return this.customProducts;
  }

  getProductsByCategory(category: string): any[] {
    return this.customProducts.filter(product => 
      product.category?.toLowerCase() === category.toLowerCase()
    );
  }
}

export const productStorage = new ProductStorage();