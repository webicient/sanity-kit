# Configuration Guide

Complete reference for configuring @webicient/sanity-kit using the KitConfig interface.

## Overview

The `kitConfig` function is the primary way to configure @webicient/sanity-kit. It accepts a configuration object that defines schemas, languages, customizations, and resolver functions.

## Basic Configuration

```typescript
import { kitConfig } from '@webicient/sanity-kit';

export default kitConfig({
  // Your configuration options
});
```

## KitConfig Interface

### Complete Interface Definition

```typescript
interface KitConfig {
  // Multi-language configuration
  languages?: Array<Language & { isDefault?: boolean }>;
  
  // Schema definitions
  schema?: {
    objects?: ReturnType<typeof defineType>[];
    contentTypes?: ContentType[];
    taxonomies?: Taxonomy[];
    entities?: Entity[];
    settings?: Setting[];
    modules?: Module[];
    structures?: Structure[];
  };
  
  // Customization options
  custom?: {
    projection?: (
      type: CustomProjectionType,
      defaultProjection: string
    ) => string;
  };
  
  // Disable default schemas
  disableDefault?: {
    schema?: {
      contentTypes?: string[];
      taxonomies?: string[];
    };
  };
  
  // Resolver functions
  resolve?: {
    hrefResolver?: (
      prev: string,
      documentType: string | null | undefined,
      params?: Record<string, any>,
      document?: LinkablePayload | null | undefined
    ) => string;
    
    documentHrefResolver?: (
      prev: string,
      document?: LinkablePayload | null | undefined,
      locale?: string
    ) => string;
    
    internalLinkQueryFields?: (
      prev: string,
      language?: string
    ) => string;
    
    hierarchyQueryFields?: (
      prev: string,
      language?: string,
      schemaName?: string
    ) => string;
    
    richTextQueryFields?: (language?: string) => string;
  };
  
  // Rich text configuration
  richText?: ReturnType<typeof defineType>[];
}
```

## Configuration Options

### Languages

Configure multi-language support for your content:

```typescript
export default kitConfig({
  languages: [
    { 
      id: 'en', 
      title: 'English', 
      isDefault: true  // Mark default language
    },
    { 
      id: 'es', 
      title: 'Spanish' 
    },
    { 
      id: 'fr', 
      title: 'French' 
    }
  ]
});
```

**Language Object Properties:**
- `id` (string, required): Language code (e.g., 'en', 'es')
- `title` (string, required): Display name for the language
- `isDefault` (boolean, optional): Marks the default language

### Schema Configuration

Add custom schemas to extend the default ones:

```typescript
export default kitConfig({
  schema: {
    // Custom object types
    objects: [
      defineType({
        name: 'customButton',
        type: 'object',
        fields: [/* ... */]
      })
    ],
    
    // Custom content types (collections)
    contentTypes: [
      defineContentType({
        name: 'product',
        title: 'Product',
        pluralTitle: 'Products',
        supports: ['title', 'slug', 'seo'],
        rewrite: '/products/:slug',
        translate: true
      })
    ],
    
    // Custom taxonomies
    taxonomies: [
      defineTaxonomy({
        name: 'brand',
        title: 'Brand',
        pluralTitle: 'Brands',
        supports: ['title', 'slug']
      })
    ],
    
    // Custom entities (singletons)
    entities: [
      defineEntity({
        name: 'about',
        title: 'About Page',
        supports: ['seo', 'modules'],
        rewrite: '/about'
      })
    ],
    
    // Custom settings
    settings: [
      defineSetting({
        name: 'shop',
        title: 'Shop Settings',
        fields: [/* ... */]
      })
    ],
    
    // Content builder modules
    modules: [
      defineModule({
        name: 'module.hero',
        title: 'Hero Section',
        fields: [/* ... */],
        renderer: HeroComponent,
        imageUrl: '/modules/hero.png'
      })
    ],
    
    // Custom studio structures
    structures: [
      defineStructure({
        menu: { level: 1 },
        builder: (S) => S.listItem()
          .title('Custom Section')
          .child(/* ... */)
      })
    ]
  }
});
```

### Custom Projections

Customize GROQ projections for different field types:

```typescript
export default kitConfig({
  custom: {
    projection: (type, defaultProjection) => {
      switch (type) {
        case 'image':
          return `
            ${defaultProjection},
            "customField": @.customField
          `;
        case 'link':
          return `
            ${defaultProjection},
            "analytics": @.analytics
          `;
        default:
          return defaultProjection;
      }
    }
  }
});
```

**Projection Types:**
- `parent`: Parent document projection
- `modules`: Module array projection
- `supports`: Supported fields projection
- `internalLink`: Internal link projection
- `link`: General link projection
- `hierarchy`: Hierarchical structure projection
- `image`: Image field projection
- `editor`: Rich text editor projection

### Disabling Default Schemas

Remove default schemas you don't need:

```typescript
export default kitConfig({
  disableDefault: {
    schema: {
      // Disable specific content types
      contentTypes: ['post', 'redirect'],
      
      // Disable specific taxonomies
      taxonomies: ['category']
    }
  }
});
```

**Default Content Types:**
- `page`: Hierarchical pages
- `post`: Blog posts
- `redirect`: URL redirects
- `preset`: Reusable content modules

**Default Taxonomies:**
- `category`: Content categories

### Custom Resolvers

Override default URL and query field resolvers:

```typescript
export default kitConfig({
  resolve: {
    // Custom href resolver for links
    hrefResolver: (prev, documentType, params, document) => {
      if (documentType === 'product') {
        return `/shop/${params?.slug}`;
      }
      return prev;
    },
    
    // Document-specific href resolver
    documentHrefResolver: (prev, document, locale) => {
      if (document?._type === 'product') {
        const prefix = locale && locale !== 'en' ? `/${locale}` : '';
        return `${prefix}/products/${document.slug}`;
      }
      return prev;
    },
    
    // Custom internal link query fields
    internalLinkQueryFields: (prev, language) => {
      return `
        ${prev},
        "customField": customField,
        "localizedField": ${language ? `coalesce(${language}, @)` : '@'}
      `;
    },
    
    // Custom hierarchy query fields
    hierarchyQueryFields: (prev, language, schemaName) => {
      if (schemaName === 'page') {
        return `
          ${prev},
          "breadcrumbs": breadcrumbs[]->{ title, slug }
        `;
      }
      return prev;
    },
    
    // Custom rich text query fields
    richTextQueryFields: (language) => {
      return `
        ...,
        "localized": ${language ? `coalesce(${language}, @)` : '@'}
      `;
    }
  }
});
```

### Rich Text Configuration

Add custom rich text configurations:

```typescript
export default kitConfig({
  richText: [
    defineType({
      name: 'customRichText',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image' },
        { type: 'customEmbed' }
      ]
    })
  ]
});
```

## Advanced Configuration Patterns

### Environment-Based Configuration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export default kitConfig({
  languages: isDevelopment 
    ? [{ id: 'en', title: 'English', isDefault: true }]
    : [
        { id: 'en', title: 'English', isDefault: true },
        { id: 'es', title: 'Spanish' },
        { id: 'fr', title: 'French' }
      ],
  
  disableDefault: {
    schema: {
      contentTypes: isDevelopment ? [] : ['redirect']
    }
  }
});
```

### Modular Configuration

Split configuration into separate files:

```typescript
// config/schemas.ts
export const customSchemas = {
  contentTypes: [
    defineContentType({ /* ... */ })
  ],
  modules: [
    defineModule({ /* ... */ })
  ]
};

// config/languages.ts
export const languages = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'es', title: 'Spanish' }
];

// kit.config.ts
import { kitConfig } from '@webicient/sanity-kit';
import { customSchemas } from './config/schemas';
import { languages } from './config/languages';

export default kitConfig({
  languages,
  schema: customSchemas
});
```

### Type-Safe Configuration

Use TypeScript for type-safe configuration:

```typescript
import { KitConfig } from '@webicient/sanity-kit';

const config: KitConfig = {
  languages: [
    { id: 'en', title: 'English', isDefault: true }
  ],
  schema: {
    contentTypes: [
      defineContentType({
        name: 'article',
        title: 'Article',
        pluralTitle: 'Articles',
        supports: ['title', 'slug', 'seo'],
        rewrite: '/articles/:slug',
        translate: true
      })
    ]
  }
};

export default kitConfig(config);
```

## Configuration Validation

The plugin validates configuration at runtime:

### Module Name Validation

Modules must be prefixed with `module.`:

```typescript
// ✅ Correct
defineModule({
  name: 'module.hero',
  // ...
})

// ❌ Error: Module name must start with "module."
defineModule({
  name: 'hero',
  // ...
})
```

### Rewrite Path Validation

Content type rewrites must include `:slug`:

```typescript
// ✅ Correct
defineContentType({
  name: 'product',
  rewrite: '/products/:slug',
  // ...
})

// ❌ Error: Rewrite path must include ":slug"
defineContentType({
  name: 'product',
  rewrite: '/products',
  // ...
})
```

## Default Configuration

When no configuration is provided, these defaults are applied:

```typescript
{
  schema: {
    entities: [home, page404],
    contentTypes: [page, post, redirect, preset],
    objects: [seo, kitPreset],
    taxonomies: [category],
    settings: [
      generalSettings,
      socialSettings,
      seoSettings,
      integrationSettings,
      scriptsSettings,
      advancedSettings
    ]
  },
  languages: [],
  richText: []
}
```

## Best Practices

### 1. Start Simple

Begin with minimal configuration and add complexity as needed:

```typescript
// Start with this
export default kitConfig({});

// Then add languages
export default kitConfig({
  languages: [
    { id: 'en', title: 'English', isDefault: true }
  ]
});

// Then add custom schemas
export default kitConfig({
  languages: [/* ... */],
  schema: {
    contentTypes: [/* ... */]
  }
});
```

### 2. Use Define Functions

Always use the provided define functions for type safety:

```typescript
// ✅ Good
const product = defineContentType({
  name: 'product',
  title: 'Product',
  // ...
});

// ❌ Avoid
const product = {
  name: 'product',
  title: 'Product',
  // ...
};
```

### 3. Organize Large Configurations

For large projects, organize configuration by feature:

```typescript
// features/blog/config.ts
export const blogConfig = {
  contentTypes: [
    defineContentType({ name: 'blogPost', /* ... */ }),
    defineContentType({ name: 'author', /* ... */ })
  ],
  taxonomies: [
    defineTaxonomy({ name: 'blogCategory', /* ... */ })
  ]
};

// features/shop/config.ts
export const shopConfig = {
  contentTypes: [
    defineContentType({ name: 'product', /* ... */ })
  ],
  settings: [
    defineSetting({ name: 'shopSettings', /* ... */ })
  ]
};

// kit.config.ts
export default kitConfig({
  schema: {
    ...blogConfig,
    ...shopConfig
  }
});
```

## Troubleshooting

### Configuration Not Applied

Ensure the configuration is passed to the plugin:

```typescript
// sanity.config.ts
import kitConfig from './kit.config'; // Import your config

export default defineConfig({
  plugins: [
    sanityKit(kitConfig) // Pass config to plugin
  ]
});
```

### Schema Conflicts

Check for duplicate schema names:

```typescript
// This will cause conflicts
export default kitConfig({
  schema: {
    contentTypes: [
      defineContentType({ name: 'page', /* ... */ })
      // 'page' already exists in defaults
    ]
  }
});

// Solution: Disable the default
export default kitConfig({
  disableDefault: {
    schema: {
      contentTypes: ['page']
    }
  },
  schema: {
    contentTypes: [
      defineContentType({ name: 'page', /* ... */ })
    ]
  }
});
```

## Related Documentation

- [Schema System](./schema-system.md) - Creating custom schemas
- [Multi-Language](./multi-language.md) - Language configuration details
- [API Reference](./api-reference.md) - Complete API documentation