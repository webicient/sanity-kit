# Content Builder Modules

Complete guide to creating and using content builder modules in @webicient/sanity-kit.

## Overview

The module system in @webicient/sanity-kit provides a flexible way to create reusable content blocks that editors can use to build pages. Modules are defined with custom fields and React components for rendering.

## Defining Modules

### Basic Module Structure

```typescript
import { defineModule } from '@webicient/sanity-kit';
import { defineField } from 'sanity';
import HeroComponent from '@/components/modules/Hero';

export const heroModule = defineModule({
  name: 'module.hero',           // Must start with 'module.'
  title: 'Hero Section',         // Display name in Studio
  fields: [                      // Module-specific fields
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subheading', 
      title: 'Subheading',
      type: 'text',
      rows: 2
    })
  ],
  renderer: HeroComponent,       // React component
  imageUrl: '/modules/hero.png', // Preview image
  query: (language) => `         // Optional GROQ projection
    heading,
    subheading,
    backgroundImage
  `
});
```

### Module Naming Convention

Module names **must** start with `module.` prefix:

```typescript
// ✅ Correct
defineModule({ name: 'module.hero', ... })
defineModule({ name: 'module.gallery', ... })
defineModule({ name: 'module.contactForm', ... })

// ❌ Wrong - will throw validation error
defineModule({ name: 'hero', ... })
defineModule({ name: 'gallery', ... })
```

## Module Component Implementation

### Basic Component Structure

```typescript
// components/modules/Hero.tsx
interface HeroModuleProps {
  heading: string;
  subheading?: string;
  backgroundImage?: any;
  cta?: any;
}

export default function HeroModule({
  heading,
  subheading,
  backgroundImage,
  cta
}: HeroModuleProps) {
  return (
    <section className="hero relative min-h-screen flex items-center">
      {backgroundImage && (
        <ImageResolver
          {...backgroundImage}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 text-white">
            {heading}
          </h1>
          
          {subheading && (
            <p className="text-xl mb-8 text-white/90">
              {subheading}
            </p>
          )}
          
          {cta && (
            <LinkResolver {...cta} className="btn btn-primary">
              {cta.text}
            </LinkResolver>
          )}
        </div>
      </div>
    </section>
  );
}
```

### Advanced Component with Multiple Layouts

```typescript
// components/modules/ContentGrid.tsx
interface ContentGridProps {
  title: string;
  layout: 'grid' | 'masonry' | 'carousel';
  columns: number;
  items: Array<{
    title: string;
    image?: any;
    description?: string;
    link?: any;
  }>;
}

export default function ContentGridModule({
  title,
  layout = 'grid',
  columns = 3,
  items = []
}: ContentGridProps) {
  const gridClasses = {
    grid: `grid grid-cols-${columns} gap-6`,
    masonry: 'masonry-grid',
    carousel: 'flex space-x-6 overflow-x-auto'
  };
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">
          {title}
        </h2>
        
        <div className={gridClasses[layout]}>
          {items.map((item, index) => (
            <div key={index} className="content-item">
              {item.image && (
                <ImageResolver
                  {...item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-xl font-semibold mb-2">
                {item.title}
              </h3>
              
              {item.description && (
                <p className="text-gray-600 mb-4">
                  {item.description}
                </p>
              )}
              
              {item.link && (
                <LinkResolver 
                  {...item.link} 
                  className="btn btn-outline"
                >
                  {item.link.text}
                </LinkResolver>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Complex Module Examples

### Gallery Module

```typescript
// modules/gallery.ts
export const galleryModule = defineModule({
  name: 'module.gallery',
  title: 'Image Gallery',
  fields: [
    defineField({
      name: 'title',
      title: 'Gallery Title',
      type: 'string'
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'Masonry', value: 'masonry' },
          { title: 'Slider', value: 'slider' }
        ]
      },
      initialValue: 'grid'
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineField({
          name: 'galleryImage',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string'
            })
          ]
        })
      ],
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'columns',
      title: 'Columns (Grid Only)',
      type: 'number',
      hidden: ({ parent }) => parent?.layout !== 'grid',
      validation: Rule => Rule.min(1).max(6),
      initialValue: 3
    })
  ],
  renderer: GalleryModule,
  imageUrl: '/modules/gallery.png',
  query: (language) => `
    title,
    layout,
    columns,
    images[] {
      asset,
      hotspot,
      crop,
      alt,
      caption
    }
  `
});

// components/modules/Gallery.tsx
export default function GalleryModule({ 
  title, 
  layout, 
  columns, 
  images 
}: GalleryModuleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-3xl font-bold mb-12 text-center">
            {title}
          </h2>
        )}
        
        {layout === 'grid' && (
          <div className={`grid grid-cols-${columns} gap-4`}>
            {images?.map((image, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedImage(index);
                  setLightboxOpen(true);
                }}
              >
                <ImageResolver
                  {...image}
                  alt={image.alt}
                  className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
                />
                {image.caption && (
                  <p className="text-sm text-gray-600 mt-2">
                    {image.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Lightbox implementation */}
        {lightboxOpen && (
          <Lightbox
            images={images}
            currentIndex={selectedImage}
            onClose={() => setLightboxOpen(false)}
            onNavigate={setSelectedImage}
          />
        )}
      </div>
    </section>
  );
}
```

### Form Module

```typescript
// modules/contactForm.ts
export const contactFormModule = defineModule({
  name: 'module.contactForm',
  title: 'Contact Form',
  fields: [
    defineField({
      name: 'title',
      title: 'Form Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'fields',
      title: 'Form Fields',
      type: 'array',
      of: [
        defineField({
          name: 'formField',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Field Name',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'type',
              title: 'Field Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Text', value: 'text' },
                  { title: 'Email', value: 'email' },
                  { title: 'Phone', value: 'tel' },
                  { title: 'Textarea', value: 'textarea' },
                  { title: 'Select', value: 'select' }
                ]
              }
            }),
            defineField({
              name: 'required',
              title: 'Required',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'placeholder',
              title: 'Placeholder',
              type: 'string'
            }),
            defineField({
              name: 'options',
              title: 'Options (for select)',
              type: 'array',
              of: [{ type: 'string' }],
              hidden: ({ parent }) => parent?.type !== 'select'
            })
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'type',
              required: 'required'
            },
            prepare({ title, subtitle, required }) {
              return {
                title: title || 'Untitled Field',
                subtitle: `${subtitle}${required ? ' (required)' : ''}`
              };
            }
          }
        })
      ]
    }),
    defineField({
      name: 'submitText',
      title: 'Submit Button Text',
      type: 'string',
      initialValue: 'Send Message'
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      type: 'string',
      initialValue: 'Thank you for your message!'
    })
  ],
  renderer: ContactFormModule,
  imageUrl: '/modules/contact-form.png'
});

// components/modules/ContactForm.tsx
export default function ContactFormModule({
  title,
  description,
  fields,
  submitText = 'Send Message',
  successMessage = 'Thank you!'
}: ContactFormProps) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            {successMessage}
          </h2>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        
        {description && (
          <p className="text-gray-600 mb-8">{description}</p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields?.map((field, index) => (
            <FormField
              key={index}
              field={field}
              value={formData[field.name as keyof typeof formData]}
              onChange={(value) => 
                setFormData(prev => ({ ...prev, [field.name]: value }))
              }
            />
          ))}
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Sending...' : submitText}
          </button>
        </form>
      </div>
    </section>
  );
}
```

## Module Registration

### Adding Modules to Kit Config

```typescript
// kit.config.ts
import { kitConfig } from '@webicient/sanity-kit';
import { heroModule } from './modules/hero';
import { galleryModule } from './modules/gallery';
import { contactFormModule } from './modules/contactForm';

export default kitConfig({
  schema: {
    modules: [
      heroModule,
      galleryModule,
      contactFormModule
    ]
  }
});
```

### Module Organization

```typescript
// modules/index.ts - Organize modules
export { heroModule } from './hero';
export { galleryModule } from './gallery';
export { contactFormModule } from './contactForm';
export { testimonialsModule } from './testimonials';
export { pricingModule } from './pricing';

// kit.config.ts - Import all at once
import * as modules from './modules';

export default kitConfig({
  schema: {
    modules: Object.values(modules)
  }
});
```

## Module Rendering

### Using ModuleResolver

The ModuleResolver automatically renders modules based on their `_type`:

```typescript
// In page template
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';

export default function Page({ page }: { page: any }) {
  return (
    <main>
      <h1>{page.title}</h1>
      <ModuleResolver data={page.modules} />
    </main>
  );
}
```

### Custom Module Resolution

```typescript
// Custom module resolver with additional logic
function CustomModuleResolver({ modules }: { modules: any[] }) {
  return (
    <>
      {modules?.map(({ _key, _type, ...module }) => {
        const ModuleComponent = getModuleComponent(_type);
        
        if (!ModuleComponent) {
          console.warn(`No component found for module type: ${_type}`);
          return null;
        }
        
        return (
          <div key={_key} data-module={_type}>
            <ModuleErrorBoundary moduleName={_type}>
              <ModuleComponent {...module} />
            </ModuleErrorBoundary>
          </div>
        );
      })}
    </>
  );
}
```

## Module Presets

### Kit Preset Support

Built-in support for reusable module collections:

```typescript
// In Studio, editors can create presets
{
  "_type": "preset",
  "title": "Homepage Hero",
  "modules": [
    {
      "_type": "module.hero",
      "heading": "Welcome to Our Site",
      "subheading": "Discover amazing content"
    },
    {
      "_type": "module.gallery",
      "title": "Featured Work",
      "layout": "grid"
    }
  ]
}

// Use preset in pages
{
  "_type": "kit.preset",
  "preset": {
    "_type": "reference",
    "_ref": "preset-id"
  }
}
```

## Advanced Module Features

### Conditional Fields

```typescript
export const advancedModule = defineModule({
  name: 'module.advanced',
  title: 'Advanced Module',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: ['standard', 'featured', 'minimal']
      }
    }),
    defineField({
      name: 'featuredContent',
      title: 'Featured Content',
      type: 'text',
      hidden: ({ parent }) => parent?.layout !== 'featured'
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      hidden: ({ parent }) => parent?.layout === 'minimal',
      options: {
        list: [
          { title: 'White', value: 'white' },
          { title: 'Gray', value: 'gray' },
          { title: 'Blue', value: 'blue' }
        ]
      }
    })
  ],
  renderer: AdvancedModule,
  imageUrl: '/modules/advanced.png'
});
```

### Module Validation

```typescript
export const validatedModule = defineModule({
  name: 'module.validated',
  title: 'Validated Module',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => 
        Rule.required()
          .min(1).error('At least one item required')
          .max(10).error('Maximum 10 items allowed')
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      validation: Rule => 
        Rule.required()
          .email()
          .error('Valid email required')
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
      validation: Rule => 
        Rule.uri({ scheme: ['https'] })
          .error('HTTPS URL required')
    })
  ],
  renderer: ValidatedModule,
  imageUrl: '/modules/validated.png'
});
```

## Module Performance

### Lazy Loading

```typescript
// Lazy load heavy modules
import { lazy, Suspense } from 'react';

const HeavyModule = lazy(() => import('./HeavyModule'));

function LazyModuleWrapper(props: any) {
  return (
    <Suspense fallback={<ModuleSkeleton />}>
      <HeavyModule {...props} />
    </Suspense>
  );
}

export const heavyModule = defineModule({
  name: 'module.heavy',
  title: 'Heavy Module',
  fields: [/* ... */],
  renderer: LazyModuleWrapper,
  imageUrl: '/modules/heavy.png'
});
```

### Module Optimization

```typescript
// Optimized module with memo
import { memo } from 'react';

const OptimizedModule = memo(function OptimizedModule({
  title,
  content,
  image
}: ModuleProps) {
  return (
    <section className="module">
      <h2>{title}</h2>
      <p>{content}</p>
      {image && <ImageResolver {...image} alt={title} />}
    </section>
  );
});

export default OptimizedModule;
```

## Testing Modules

### Component Testing

```typescript
// __tests__/modules/Hero.test.tsx
import { render, screen } from '@testing-library/react';
import HeroModule from '@/components/modules/Hero';

const mockProps = {
  heading: 'Test Heading',
  subheading: 'Test Subheading',
  backgroundImage: {
    asset: { _ref: 'image-123' }
  }
};

describe('HeroModule', () => {
  test('renders heading and subheading', () => {
    render(<HeroModule {...mockProps} />);
    
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Subheading')).toBeInTheDocument();
  });
  
  test('renders without optional props', () => {
    render(<HeroModule heading="Test" />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Module Integration Testing

```typescript
// __tests__/ModuleResolver.test.tsx
import { render, screen } from '@testing-library/react';
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';

const mockModules = [
  {
    _type: 'module.hero',
    _key: 'hero-1',
    heading: 'Hero Title'
  },
  {
    _type: 'module.gallery',
    _key: 'gallery-1',
    title: 'Gallery Title'
  }
];

test('renders multiple modules', () => {
  render(<ModuleResolver data={mockModules} />);
  
  expect(screen.getByText('Hero Title')).toBeInTheDocument();
  expect(screen.getByText('Gallery Title')).toBeInTheDocument();
});
```

## Best Practices

### 1. Consistent Naming

```typescript
// Good: Descriptive, consistent names
module.hero
module.textAndImage
module.testimonialGrid
module.contactForm

// Avoid: Generic or unclear names
module.section
module.content
module.block
```

### 2. Modular Design

```typescript
// Good: Focused, single-purpose modules
export const heroModule = defineModule({
  name: 'module.hero',
  // Specific to hero functionality
});

export const ctaModule = defineModule({
  name: 'module.cta',
  // Specific to call-to-action
});

// Avoid: Overly complex, multi-purpose modules
```

### 3. Validation and Error Handling

```typescript
// Include proper validation
defineField({
  name: 'title',
  validation: Rule => Rule.required().max(100)
});

// Handle missing data gracefully
function Module({ title, items = [] }) {
  if (!title) return null;
  
  return (
    <section>
      <h2>{title}</h2>
      {items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <p>No items to display</p>
      )}
    </section>
  );
}
```

### 4. Accessibility

```typescript
function AccessibleModule({ title, content, image }) {
  return (
    <section aria-labelledby="module-title">
      <h2 id="module-title">{title}</h2>
      <p>{content}</p>
      {image && (
        <ImageResolver
          {...image}
          alt={image.alt || title}
          role="img"
        />
      )}
    </section>
  );
}
```

## Related Documentation

- [Schema System](./schema-system.md) - Defining module schemas
- [Components](./components.md) - Using ModuleResolver
- [Configuration](./configuration.md) - Module configuration
- [Examples](./examples.md) - Real-world module implementations