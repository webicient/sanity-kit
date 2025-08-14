# Schema System

Learn how to create and manage schemas in @webicient/sanity-kit using the powerful define functions.

## Overview

The schema system in @webicient/sanity-kit provides a structured way to define different types of content schemas. Each schema type serves a specific purpose in organizing your content architecture.

## Schema Types

### Content Types (Collections)

Content types represent collections of documents like pages, posts, or products.

```typescript
import { defineContentType } from '@webicient/sanity-kit';
import { defineField } from 'sanity';

const product = defineContentType({
  name: 'product',
  title: 'Product',
  pluralTitle: 'Products',
  supports: ['title', 'slug', 'seo', 'featuredImage'],
  rewrite: '/shop/:slug',
  hierarchical: false,
  translate: true,
  taxonomies: [
    { name: 'category', multiple: true, required: true }
  ],
  fields: [
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: Rule => Rule.required().positive()
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: Rule => Rule.required()
    })
  ]
});
```

#### Content Type Properties

- `name` (string, required): Unique schema identifier
- `title` (string, required): Display name in Studio
- `pluralTitle` (string, required): Plural form for UI
- `supports` (array): Built-in fields to include
- `rewrite` (string): URL pattern with `:slug` placeholder
- `hierarchical` (boolean): Enable parent-child relationships
- `translate` (boolean): Enable multi-language support
- `taxonomies` (array): Associated taxonomy schemas
- `fields` (array): Additional custom fields
- `menu` (object): Studio menu configuration
- `hidden` (boolean): Hide from studio structure

### Entities (Singletons)

Entities are singleton documents like homepage or about page settings.

```typescript
import { defineEntity } from '@webicient/sanity-kit';

const homepage = defineEntity({
  name: 'home',
  title: 'Homepage',
  supports: ['seo', 'modules'],
  rewrite: '/',
  translate: true,
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string'
        }),
        defineField({
          name: 'subheadline',
          title: 'Subheadline',
          type: 'text'
        })
      ]
    })
  ]
});
```

#### Entity Properties

- `name` (string, required): Unique schema identifier
- `title` (string, required): Display name
- `supports` (array): Built-in fields to include
- `rewrite` (string): Associated URL path
- `translate` (boolean): Enable multi-language
- `fields` (array): Custom fields
- `menu` (object): Studio menu configuration
- `hidden` (boolean): Hide from structure

### Settings

Settings are global configuration documents grouped under the Settings menu.

```typescript
import { defineSetting } from '@webicient/sanity-kit';

const emailSettings = defineSetting({
  name: 'email',
  title: 'Email Settings',
  translate: false,
  fields: [
    defineField({
      name: 'fromAddress',
      title: 'From Address',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'smtpHost',
      title: 'SMTP Host',
      type: 'string'
    }),
    defineField({
      name: 'smtpPort',
      title: 'SMTP Port',
      type: 'number',
      initialValue: 587
    })
  ]
});
```

#### Setting Properties

- `name` (string, required): Unique identifier
- `title` (string, required): Display name
- `translate` (boolean): Enable multi-language
- `fields` (array): Setting fields

### Taxonomies

Taxonomies are classification schemas like categories or tags.

```typescript
import { defineTaxonomy } from '@webicient/sanity-kit';

const productCategory = defineTaxonomy({
  name: 'productCategory',
  title: 'Product Category',
  pluralTitle: 'Product Categories',
  supports: ['title', 'slug', 'description', 'featuredImage'],
  translate: true,
  fields: [
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'productCategory' }]
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 0
    })
  ]
});
```

#### Taxonomy Properties

- `name` (string, required): Unique identifier
- `title` (string, required): Display name
- `pluralTitle` (string, required): Plural form
- `supports` (array): Built-in fields
- `translate` (boolean): Enable multi-language
- `fields` (array): Custom fields

### Modules

Modules are reusable content blocks for the content builder system.

```typescript
import { defineModule } from '@webicient/sanity-kit';
import { defineField } from 'sanity';
import HeroComponent from '@/components/modules/Hero';

const heroModule = defineModule({
  name: 'module.hero',
  title: 'Hero Section',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: Rule => Rule.required().max(100)
    }),
    defineField({
      name: 'subheadline',
      title: 'Subheadline',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'kit.link'
    })
  ],
  renderer: HeroComponent,
  imageUrl: '/static/modules/hero.png',
  query: (language) => `
    headline,
    subheadline,
    backgroundImage,
    cta
  `
});
```

#### Module Properties

- `name` (string, required): Must start with "module."
- `title` (string, required): Display name
- `fields` (array, required): Module fields
- `renderer` (Component, required): React component
- `imageUrl` (string, required): Preview image
- `query` (function): GROQ projection function

### Structures

Custom studio structures for organizing content.

```typescript
import { defineStructure } from '@webicient/sanity-kit';

const blogStructure = defineStructure({
  menu: {
    level: 2
  },
  builder: (S) =>
    S.listItem()
      .title('Blog')
      .child(
        S.list()
          .title('Blog')
          .items([
            S.listItem()
              .title('Posts')
              .child(
                S.documentTypeList('post')
                  .title('All Posts')
              ),
            S.listItem()
              .title('Authors')
              .child(
                S.documentTypeList('author')
                  .title('All Authors')
              ),
            S.divider(),
            S.listItem()
              .title('Categories')
              .child(
                S.documentTypeList('category')
                  .title('All Categories')
              )
          ])
      )
});
```

## Supported Fields

The `supports` array enables built-in field configurations:

### Available Support Types

- `title`: Document title field
- `slug`: URL slug with generation
- `seo`: SEO metadata fields
- `modules`: Content builder modules array
- `body`: Rich text body field
- `excerpt`: Short description/excerpt
- `featuredImage`: Featured image with alt text
- `publishedAt`: Publication date

### Using Supports

```typescript
const article = defineContentType({
  name: 'article',
  title: 'Article',
  pluralTitle: 'Articles',
  supports: [
    'title',        // Adds title field
    'slug',         // Adds slug field with generator
    'publishedAt',  // Adds publication date
    'featuredImage', // Adds featured image
    'excerpt',      // Adds excerpt field
    'body',         // Adds rich text body
    'seo'           // Adds SEO fields
  ]
});
```

## Hierarchical Content

Enable parent-child relationships for nested content:

```typescript
const page = defineContentType({
  name: 'page',
  title: 'Page',
  pluralTitle: 'Pages',
  hierarchical: true, // Enables parent field
  supports: ['title', 'slug', 'seo', 'modules'],
  rewrite: '/:slug' // Supports nested paths
});
```

This automatically adds:
- Parent page reference field
- Breadcrumb support
- Nested URL generation
- Hierarchical slug validation

## Taxonomy Associations

Link content types with taxonomies:

```typescript
const post = defineContentType({
  name: 'blogPost',
  title: 'Blog Post',
  pluralTitle: 'Blog Posts',
  taxonomies: [
    {
      name: 'category',
      multiple: true,  // Allow multiple categories
      required: true   // Make field required
    },
    {
      name: 'tag',
      multiple: true,
      required: false
    }
  ]
});
```

## Custom Fields

Add custom fields beyond the supported defaults:

```typescript
const event = defineContentType({
  name: 'event',
  title: 'Event',
  pluralTitle: 'Events',
  supports: ['title', 'slug', 'seo'],
  fields: [
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      validation: Rule => Rule.required().min(Rule.valueOfField('startDate'))
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        defineField({
          name: 'venue',
          title: 'Venue',
          type: 'string'
        }),
        defineField({
          name: 'address',
          title: 'Address',
          type: 'text'
        }),
        defineField({
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint'
        })
      ]
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Ticket URL',
      type: 'url'
    })
  ]
});
```

## URL Rewriting

Configure URL patterns for content:

```typescript
// Simple rewrite
const post = defineContentType({
  name: 'post',
  rewrite: '/blog/:slug'
  // URL: /blog/my-post-title
});

// Nested rewrite for hierarchical content
const page = defineContentType({
  name: 'page',
  hierarchical: true,
  rewrite: '/:slug'
  // URL: /parent/child/grandchild
});

// Category-based rewrite
const product = defineContentType({
  name: 'product',
  rewrite: '/shop/:category/:slug',
  // Requires custom resolver to inject category
});
```

## Translation Support

Enable multi-language for schemas:

```typescript
// In kit.config.ts
export default kitConfig({
  languages: [
    { id: 'en', title: 'English', isDefault: true },
    { id: 'es', title: 'Spanish' }
  ],
  schema: {
    contentTypes: [
      defineContentType({
        name: 'page',
        translate: true, // Enable translation
        // ...
      })
    ]
  }
});
```

## Schema Validation

### Required Fields

```typescript
defineField({
  name: 'email',
  type: 'string',
  validation: Rule => Rule.required().email()
})
```

### Conditional Validation

```typescript
defineField({
  name: 'discountPrice',
  type: 'number',
  validation: Rule => 
    Rule.custom((value, context) => {
      const price = context.document?.price;
      if (value && value >= price) {
        return 'Discount price must be less than regular price';
      }
      return true;
    })
})
```

### Pattern Validation

```typescript
defineField({
  name: 'sku',
  type: 'string',
  validation: Rule => 
    Rule.required()
      .regex(/^[A-Z]{3}-\d{4}$/, {
        name: 'SKU format',
        invert: false
      })
      .error('SKU must match format: ABC-1234')
})
```

## Best Practices

### 1. Naming Conventions

```typescript
// Good naming
defineContentType({ name: 'productReview', ... })
defineTaxonomy({ name: 'productCategory', ... })
defineModule({ name: 'module.productGrid', ... })

// Avoid
defineContentType({ name: 'review', ... }) // Too generic
defineModule({ name: 'grid', ... }) // Missing module prefix
```

### 2. Use Supports When Possible

```typescript
// Good: Use supports for common fields
defineContentType({
  supports: ['title', 'slug', 'seo']
})

// Avoid: Redefining common fields
defineContentType({
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug' })
  ]
})
```

### 3. Organize Complex Schemas

```typescript
// Split complex field definitions
const addressFields = [
  defineField({ name: 'street', type: 'string' }),
  defineField({ name: 'city', type: 'string' }),
  defineField({ name: 'postalCode', type: 'string' })
];

const customerSchema = defineContentType({
  name: 'customer',
  fields: [
    defineField({
      name: 'billing',
      type: 'object',
      fields: addressFields
    }),
    defineField({
      name: 'shipping',
      type: 'object',
      fields: addressFields
    })
  ]
});
```

### 4. Document Field Purpose

```typescript
defineField({
  name: 'metaRobots',
  title: 'Meta Robots',
  type: 'string',
  description: 'Controls search engine crawling and indexing',
  options: {
    list: [
      { title: 'Index & Follow', value: 'index,follow' },
      { title: 'No Index', value: 'noindex,follow' },
      { title: 'No Follow', value: 'index,nofollow' },
      { title: 'None', value: 'noindex,nofollow' }
    ]
  }
})
```

## Troubleshooting

### Module Name Validation Error

```typescript
// ❌ Error: Module name must start with "module."
defineModule({
  name: 'hero',
  // ...
})

// ✅ Correct
defineModule({
  name: 'module.hero',
  // ...
})
```

### Missing Slug in Rewrite

```typescript
// ❌ Error: Rewrite path must include ":slug"
defineContentType({
  name: 'post',
  rewrite: '/blog',
  // ...
})

// ✅ Correct
defineContentType({
  name: 'post',
  rewrite: '/blog/:slug',
  // ...
})
```

## Related Documentation

- [Content Types](./content-types.md) - Built-in content types
- [Modules](./modules.md) - Module system details
- [Settings](./settings.md) - Settings management
- [Configuration](./configuration.md) - Kit configuration