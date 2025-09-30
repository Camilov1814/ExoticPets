import { client as contentfulClient } from '../contentfulClient.js';

class HybridProductService {
  constructor() {
    this.mongoBaseUrl = import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:3001/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get MongoDB data via API call
  async getMongoData(endpoint) {
    try {
      const response = await fetch(`${this.mongoBaseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`MongoDB API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from MongoDB:', error);
      // Fallback to static data if MongoDB is unavailable
      return null;
    }
  }

  // Get Contentful data with error handling
  async getContentfulData(contentfulId) {
    try {
      const entry = await contentfulClient.getEntry(contentfulId);
      return entry.fields;
    } catch (error) {
      console.error(`Error fetching Contentful entry ${contentfulId}:`, error);
      return null;
    }
  }

  // Get Contentful data by product name (alternative method)
  async getContentfulDataByName(productName) {
    try {
      const response = await contentfulClient.getEntries({
        content_type: 'productCard',
        'fields.name': productName,
        limit: 1
      });

      if (response.items.length > 0) {
        return response.items[0].fields;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching Contentful entry by name ${productName}:`, error);
      return null;
    }
  }

  // Merge MongoDB and Contentful data
  mergeProductData(mongoData, contentfulData) {
    if (!mongoData) return null;

    const merged = {
      // MongoDB data (dynamic)
      ...mongoData,

      // Contentful data (static) - overwrites if available
      ...(contentfulData && {
        description: contentfulData.description,
        badge: contentfulData.badge,
        badgeColor: contentfulData.badgeColor,
        features: contentfulData.features || [],
        images: contentfulData.imagen ? this.processContentfulImages(contentfulData.imagen) : null,
        careInstructions: contentfulData.careInstructions,
        productHighlights: contentfulData.productHighlights
      })
    };

    return merged;
  }

  // Process Contentful image assets
  processContentfulImages(imageAsset) {
    if (!imageAsset) return null;

    return {
      url: imageAsset.fields?.file?.url ? `https:${imageAsset.fields.file.url}` : null,
      alt: imageAsset.fields?.description || '',
      title: imageAsset.fields?.title || ''
    };
  }

  // Get single product with hybrid data
  async getProduct(productId) {
    const cacheKey = `product_${productId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Get MongoDB data first
      const mongoData = await this.getMongoData(`/products/${productId}`);

      // Try to get Contentful data by ID first, then by name
      let contentfulData = await this.getContentfulData(productId);

      // If not found and we have MongoDB data, try by product name
      if (!contentfulData && mongoData && mongoData.name) {
        console.log(`Trying to find Contentful data by name for: ${mongoData.name}`);
        contentfulData = await this.getContentfulDataByName(mongoData.name);
      }

      const merged = this.mergeProductData(mongoData, contentfulData);

      // Cache the result
      this.cache.set(cacheKey, {
        data: merged,
        timestamp: Date.now()
      });

      return merged;
    } catch (error) {
      console.error(`Error getting hybrid product ${productId}:`, error);
      return null;
    }
  }

  // Get all products with hybrid data
  async getProducts(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

      const mongoProducts = await this.getMongoData(endpoint);

      if (!mongoProducts || !Array.isArray(mongoProducts)) {
        return [];
      }

      // Get Contentful data for all products in parallel - try by ID first, then by name
      const contentfulPromises = mongoProducts.map(async (product) => {
        // First try to get by contentfulId
        let contentfulData = await this.getContentfulData(product.contentfulId);

        // If not found, try to get by product name
        if (!contentfulData && product.name) {
          console.log(`Trying to find Contentful data by name for: ${product.name}`);
          contentfulData = await this.getContentfulDataByName(product.name);
        }

        return contentfulData;
      });

      const contentfulResults = await Promise.allSettled(contentfulPromises);

      // Merge data for each product
      const hybridProducts = mongoProducts.map((mongoProduct, index) => {
        const contentfulResult = contentfulResults[index];
        const contentfulData = contentfulResult.status === 'fulfilled'
          ? contentfulResult.value
          : null;

        return this.mergeProductData(mongoProduct, contentfulData);
      }).filter(Boolean); // Remove null results

      return hybridProducts;
    } catch (error) {
      console.error('Error getting hybrid products:', error);
      return [];
    }
  }

  // Get featured products
  async getFeaturedProducts() {
    return this.getProducts({ featured: true });
  }

  // Get products by category
  async getProductsByCategory(category) {
    return this.getProducts({ category });
  }

  // Search products
  async searchProducts(searchTerm) {
    return this.getProducts({ search: searchTerm });
  }

  // Update stock (MongoDB only)
  async updateStock(productId, newStock) {
    try {
      const response = await fetch(`${this.mongoBaseUrl}/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update stock: ${response.status}`);
      }

      // Clear cache for this product
      this.cache.delete(`product_${productId}`);

      return await response.json();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const hybridProductService = new HybridProductService();
export default hybridProductService;