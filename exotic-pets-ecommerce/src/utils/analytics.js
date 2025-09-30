// Google Analytics 4 Event Tracking Utilities

// Función helper para verificar si gtag está disponible
const isGtagAvailable = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// ===== EVENTOS DE NAVEGACIÓN =====

export const trackPageView = (pageName, pageTitle = '') => {
  if (!isGtagAvailable()) return;
  
  window.gtag('event', 'page_view', {
    page_title: pageTitle || pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
    custom_page_name: pageName
  });
};

// ===== EVENTOS DE PRODUCTOS =====

export const trackProductView = (product) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'view_item', {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_variant: product.color || 'N/A',
      price: product.price,
      quantity: 1
    }]
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_variant: product.color || 'N/A',
      price: product.price,
      quantity: quantity
    }]
  });
};

export const trackRemoveFromCart = (product, quantity = 1) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'remove_from_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_variant: product.color || 'N/A',
      price: product.price,
      quantity: quantity
    }]
  });
};

export const trackViewCart = (cartItems, totalValue) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'view_cart', {
    currency: 'USD',
    value: totalValue,
    items: cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_variant: item.color || 'N/A',
      price: item.price,
      quantity: item.quantity
    }))
  });
};

// ===== EVENTOS DE BÚSQUEDA Y FILTROS =====

export const trackSearch = (searchTerm, resultsCount = 0) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount
  });
};

export const trackCategoryFilter = (categoryName, resultsCount = 0) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'select_content', {
    content_type: 'category_filter',
    item_id: categoryName,
    results_count: resultsCount,
    custom_parameters: {
      filter_type: 'category',
      filter_value: categoryName
    }
  });
};

export const trackPriceFilter = (minPrice, maxPrice, resultsCount = 0) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'select_content', {
    content_type: 'price_filter',
    item_id: `${minPrice}-${maxPrice}`,
    results_count: resultsCount,
    custom_parameters: {
      filter_type: 'price_range',
      min_price: minPrice,
      max_price: maxPrice
    }
  });
};

export const trackDifficultyFilter = (difficulty, resultsCount = 0) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'select_content', {
    content_type: 'difficulty_filter',
    item_id: difficulty,
    results_count: resultsCount,
    custom_parameters: {
      filter_type: 'care_difficulty',
      filter_value: difficulty
    }
  });
};

// ===== EVENTOS DE INTERACCIÓN =====

export const trackSortProducts = (sortType, resultsCount = 0) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'select_content', {
    content_type: 'sort_products',
    item_id: sortType,
    results_count: resultsCount,
    custom_parameters: {
      sort_type: sortType
    }
  });
};

export const trackViewModeChange = (viewMode) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'select_content', {
    content_type: 'view_mode',
    item_id: viewMode,
    custom_parameters: {
      view_mode: viewMode
    }
  });
};

export const trackClearFilters = () => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'select_content', {
    content_type: 'clear_filters',
    item_id: 'all_filters_cleared'
  });
};

// ===== EVENTOS DE ENGAGEMENT =====

export const trackProductImageError = (productId, productName) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'exception', {
    description: `Product image failed to load: ${productName}`,
    fatal: false,
    custom_parameters: {
      product_id: productId,
      error_type: 'image_load_error'
    }
  });
};

export const trackNewsletterSignup = (email) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'sign_up', {
    method: 'newsletter',
    custom_parameters: {
      signup_location: 'footer'
    }
  });
};

// ===== EVENTOS PERSONALIZADOS PARA ECOMMERCE =====

export const trackSpeciesInterest = (category, action = 'view') => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'custom_species_interest', {
    event_category: 'Species Engagement',
    event_label: category,
    custom_parameters: {
      species_category: category,
      interaction_type: action
    }
  });
};

export const trackExoticPetEducation = (contentType, contentName) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'custom_education_content', {
    event_category: 'Pet Education',
    event_label: contentName,
    custom_parameters: {
      content_type: contentType,
      education_topic: contentName
    }
  });
};