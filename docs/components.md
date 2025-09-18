# React Components and Resolvers

Complete guide to the built-in React components and resolvers in @webicient/sanity-kit.

## Overview

@webicient/sanity-kit provides React components that handle common content rendering patterns. These components are designed to work seamlessly with Sanity data structures and provide optimal performance out of the box.

## Core Components

### ModuleResolver

Renders arrays of content modules with automatic component resolution.

```typescript
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';

interface Props {
  data?: any[]; // Array of module objects
}

// Usage in page component
export default function Page({ page }: { page: any }) {
  return (
    <main>
      <h1>{page.title}</h1>
      <ModuleResolver data={page.modules} />
    </main>
  );
}
```

#### How ModuleResolver Works

```typescript
// The resolver automatically maps module types to components
const moduleData = [
  { _type: 'module.hero', _key: '1', heading: 'Welcome' },
  { _type: 'module.gallery', _key: '2', images: [...] },
  { _type: 'kit.preset', _key: '3', preset: { ... } }
];

// Each module is rendered with its corresponding component
<ModuleResolver data={moduleData} />

// Results in:
<Fragment>
  <HeroComponent heading="Welcome" />
  <GalleryComponent images={[...]} />
  <PresetResolver preset={{...}} />
</Fragment>
```

#### Built-in Module Support

```typescript
// Built-in kit.preset support
{
  "_type": "kit.preset",
  "_key": "preset-key",
  "preset": {
    "_type": "reference",
    "_ref": "preset-document-id"
  }
}

// Automatically resolves preset and renders its modules
```

#### Error Boundary Integration

Each module is automatically wrapped with an error boundary:

```typescript
<ModuleErrorBoundary moduleName={module._type}>
  <ModuleComponent {...module} />
</ModuleErrorBoundary>
```

### ImageResolver

Renders optimized images with Sanity's image processing capabilities.

```typescript
import { ImageResolver } from '@webicient/sanity-kit/resolvers';

interface ImageResolverProps {
  // Sanity image object
  asset?: any;
  hotspot?: any;
  crop?: any;
  alt?: string;

  // HTML img attributes
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;

  // Image processing options
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

// Basic usage
<ImageResolver
  {...page.featuredImage}
  alt={page.title}
  className="w-full h-auto"
/>

// With responsive sizing
<ImageResolver
  {...product.image}
  alt={product.title}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="product-image"
/>

// With specific dimensions
<ImageResolver
  {...author.photo}
  alt={author.name}
  width={150}
  height={150}
  className="rounded-full"
/>
```

#### Advanced Image Features

```typescript
// High-quality hero image
<ImageResolver
  {...hero.backgroundImage}
  alt="Hero background"
  quality={90}
  priority={true}
  sizes="100vw"
  className="hero-bg"
/>

// Thumbnail with WebP optimization
<ImageResolver
  {...post.featuredImage}
  alt={post.title}
  width={400}
  height={300}
  format="webp"
  className="thumbnail"
/>

// Conditional rendering
{page.featuredImage && (
  <ImageResolver
    {...page.featuredImage}
    alt={page.featuredImage?.alt || page.title}
    className="featured-image"
  />
)}
```

### LinkResolver

Handles both internal and external links with proper routing.

```typescript
import { LinkResolver } from '@webicient/sanity-kit/resolvers';

interface LinkResolverProps {
  // Link data from Sanity
  _type: 'internalLink' | 'externalLink' | 'reference';
  _ref?: string;
  slug?: { current: string };
  url?: string;
  text?: string;

  // HTML attributes
  className?: string;
  target?: string;
  rel?: string;
  children?: React.ReactNode;
}

// Internal link (Next.js Link)
<LinkResolver
  _type="reference"
  _ref="page-id"
  slug={{ current: 'about' }}
  className="nav-link"
>
  About Us
</LinkResolver>

// External link
<LinkResolver
  _type="externalLink"
  url="https://example.com"
  text="Visit Example"
  target="_blank"
  rel="noopener noreferrer"
  className="external-link"
/>

// With custom children
<LinkResolver
  {...page.ctaLink}
  className="btn btn-primary"
>
  <span>Learn More</span>
  <ArrowIcon />
</LinkResolver>
```

#### Link Resolution

The LinkResolver automatically resolves URLs based on your configuration:

```typescript
// In kit.config.ts - custom href resolver
export default kitConfig({
  resolve: {
    hrefResolver: (prev, documentType, params, document) => {
      switch (documentType) {
        case "page":
          return `/${params?.slug}`;
        case "post":
          return `/blog/${params?.slug}`;
        case "product":
          return `/products/${params?.slug}`;
        default:
          return prev;
      }
    },
  },
});
```

## Provider Components

### KitProvider

Provides global context for settings, translations, and integrations.

```typescript
import { KitProvider } from '@webicient/sanity-kit/provider';
import { loadSettings } from '@webicient/sanity-kit/query';

export default async function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  const settings = await loadSettings();

  return (
    <html>
      <body>
        <KitProvider settings={settings}>
          {children}
        </KitProvider>
      </body>
    </html>
  );
}
```

#### KitProvider Features

The provider automatically handles:

- **Google Tag Manager**: Integration when `gtmId` is configured
- **Marker.io**: Feedback widget when `markerId` is configured
- **Custom Scripts**: Head, pre-body, and post-body script injection
- **Analytics**: Page view tracking
- **Settings Context**: Global access to all settings

```typescript
// Automatic GTM integration
{integrationSettings?.gtmId && (
  <>
    <GoogleTagManager gtmId={integrationSettings.gtmId} />
    <PageView /> {/* Tracks page views */}
  </>
)}

// Custom scripts injection
{scriptsSettings?.head && (
  <Script
    id="headScript"
    dangerouslySetInnerHTML={{ __html: scriptsSettings.head }}
  />
)}
```

### useKit Hook

Access kit context in any component:

```typescript
'use client';
import { useKit } from '@webicient/sanity-kit/provider';

function SiteHeader() {
  const { settings, translations, setTranslations } = useKit();

  return (
    <header>
      <h1>{settings.generalSettings?.siteTitle}</h1>

      <nav>
        {settings.socialMediaSettings?.facebook && (
          <a href={settings.socialMediaSettings.facebook}>
            Facebook
          </a>
        )}
      </nav>
    </header>
  );
}
```

## Visual Editing Components

### KitVisualEditing

Enables live preview and visual editing capabilities.

```typescript
import { KitVisualEditing } from '@webicient/sanity-kit/visual-editing';
import { draftMode } from 'next/headers';

export default async function Layout({ children }: {
  children: React.ReactNode;
}) {
  const { isEnabled } = draftMode();

  return (
    <html>
      <body>
        {children}
        {isEnabled && <KitVisualEditing />}
      </body>
    </html>
  );
}
```

### DisablePreviewMode

Provides UI to exit preview mode:

```typescript
import { DisablePreviewMode } from '@webicient/sanity-kit/visual-editing';

function PreviewBar() {
  return (
    <div className="preview-bar">
      <span>Preview Mode</span>
      <DisablePreviewMode />
    </div>
  );
}
```

## Error Boundary Components

### ModuleErrorBoundary

Handles errors in individual modules without breaking the entire page:

```typescript
import { ModuleErrorBoundary } from '@webicient/sanity-kit/resolvers';

function CustomModuleRenderer({ modules }: { modules: any[] }) {
  return (
    <div>
      {modules?.map(({ _key, ...module }) => {
        const ModuleComponent = getModuleComponent(module._type);

        return (
          <ModuleErrorBoundary key={_key} moduleName={module._type}>
            <ModuleComponent {...module} />
          </ModuleErrorBoundary>
        );
      })}
    </div>
  );
}
```

## Custom Component Patterns

### Creating Module Components

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
    <section className="hero">
      {backgroundImage && (
        <ImageResolver
          {...backgroundImage}
          alt="Hero background"
          className="hero-bg"
          priority
        />
      )}

      <div className="hero-content">
        <h1>{heading}</h1>
        {subheading && <p>{subheading}</p>}

        {cta && (
          <LinkResolver {...cta} className="btn btn-primary">
            {cta.text}
          </LinkResolver>
        )}
      </div>
    </section>
  );
}
```

### Module Registration

```typescript
// kit.config.ts
import HeroModule from "@/components/modules/Hero";

export default kitConfig({
  schema: {
    modules: [
      defineModule({
        name: "module.hero",
        title: "Hero Section",
        fields: [
          defineField({
            name: "heading",
            title: "Heading",
            type: "string",
            validation: (Rule) => Rule.required(),
          }),
          defineField({
            name: "subheading",
            title: "Subheading",
            type: "text",
          }),
          defineField({
            name: "backgroundImage",
            title: "Background Image",
            type: "image",
          }),
          defineField({
            name: "cta",
            title: "Call to Action",
            type: "kit.link",
          }),
        ],
        renderer: HeroModule,
        imageUrl: "/modules/hero.png",
      }),
    ],
  },
});
```

### Conditional Component Rendering

```typescript
function ConditionalModule({ module }: { module: any }) {
  // Render different layouts based on data
  if (module.layout === 'full-width') {
    return (
      <section className="full-width">
        <ModuleResolver data={[module]} />
      </section>
    );
  }

  if (module.layout === 'contained') {
    return (
      <div className="container">
        <ModuleResolver data={[module]} />
      </div>
    );
  }

  return <ModuleResolver data={[module]} />;
}
```

## Component Composition

### Complex Page Layouts

```typescript
interface PageProps {
  page: {
    title: string;
    featuredImage?: any;
    modules?: any[];
    seo?: any;
  };
}

export default function PageTemplate({ page }: PageProps) {
  return (
    <>
      {/* SEO Head */}
      <PageSEO seo={page.seo} title={page.title} />

      {/* Page Header */}
      <PageHeader>
        {page.featuredImage && (
          <ImageResolver
            {...page.featuredImage}
            alt={page.title}
            className="page-hero"
          />
        )}
        <h1>{page.title}</h1>
      </PageHeader>

      {/* Page Content */}
      <main>
        {page.modules && page.modules.length > 0 ? (
          <ModuleResolver data={page.modules} />
        ) : (
          <EmptyPageState />
        )}
      </main>
    </>
  );
}
```

### Module Wrappers

```typescript
function ModuleWrapper({ children, module }: {
  children: React.ReactNode;
  module: any;
}) {
  return (
    <section
      className={`module module--${module._type.replace('module.', '')}`}
      data-module={module._type}
    >
      {children}
    </section>
  );
}

// Custom ModuleResolver with wrappers
function WrappedModuleResolver({ data }: { data: any[] }) {
  return (
    <>
      {data?.map(({ _key, ...module }) => {
        const ModuleComponent = getModuleComponent(module._type);

        return (
          <ModuleWrapper key={_key} module={module}>
            <ModuleErrorBoundary moduleName={module._type}>
              <ModuleComponent {...module} />
            </ModuleErrorBoundary>
          </ModuleWrapper>
        );
      })}
    </>
  );
}
```

## Advanced Component Patterns

### Lazy Loading Modules

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const HeavyModule = lazy(() => import('@/components/modules/Heavy'));
const GalleryModule = lazy(() => import('@/components/modules/Gallery'));

function LazyModuleResolver({ data }: { data: any[] }) {
  return (
    <>
      {data?.map(({ _key, _type, ...module }) => {
        let ModuleComponent;

        switch (_type) {
          case 'module.heavy':
            ModuleComponent = HeavyModule;
            break;
          case 'module.gallery':
            ModuleComponent = GalleryModule;
            break;
          default:
            ModuleComponent = DefaultModule;
        }

        return (
          <Suspense key={_key} fallback={<ModuleSkeleton />}>
            <ModuleComponent {...module} />
          </Suspense>
        );
      })}
    </>
  );
}
```

### Intersection Observer for Modules

```typescript
'use client';
import { useEffect, useRef, useState } from 'react';

function LazyModule({ module }: { module: any }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <ModuleResolver data={[module]} />
      ) : (
        <div className="module-placeholder" style={{ minHeight: '200px' }} />
      )}
    </div>
  );
}
```

## Testing Components

### Component Testing

```typescript
// __tests__/components/ModuleResolver.test.tsx
import { render, screen } from '@testing-library/react';
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';

const mockModules = [
  {
    _type: 'module.hero',
    _key: 'hero-1',
    heading: 'Test Heading'
  }
];

describe('ModuleResolver', () => {
  test('renders modules correctly', () => {
    render(<ModuleResolver data={mockModules} />);

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  test('handles empty modules array', () => {
    render(<ModuleResolver data={[]} />);

    // Should render nothing without errors
    expect(screen.queryByText('Test Heading')).not.toBeInTheDocument();
  });

  test('handles missing modules', () => {
    render(<ModuleResolver data={undefined} />);

    // Should render nothing without errors
    expect(document.body.firstChild).toBeEmptyDOMElement();
  });
});
```

### Mock Providers for Testing

```typescript
// test-utils/MockKitProvider.tsx
import { KitProvider } from '@webicient/sanity-kit/provider';

const mockSettings = {
  generalSettings: {
    siteTitle: 'Test Site'
  },
  socialMediaSettings: {
    facebook: 'https://facebook.com/test'
  }
};

export function MockKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <KitProvider settings={mockSettings}>
      {children}
    </KitProvider>
  );
}
```

## Performance Optimization

### Component Memoization

```typescript
import { memo } from 'react';

const OptimizedModule = memo(function Module({ data }: { data: any }) {
  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </div>
  );
});

// Only re-render when data changes
```

### Selective Re-rendering

```typescript
'use client';
import { useKit } from '@webicient/sanity-kit/provider';
import { useMemo } from 'react';

function OptimizedHeader() {
  const { settings } = useKit();

  // Memoize expensive calculations
  const socialLinks = useMemo(() => {
    return Object.entries(settings.socialMediaSettings || {})
      .filter(([key, value]) => value)
      .map(([platform, url]) => ({ platform, url }));
  }, [settings.socialMediaSettings]);

  return (
    <header>
      <h1>{settings.generalSettings?.siteTitle}</h1>
      <nav>
        {socialLinks.map(({ platform, url }) => (
          <a key={platform} href={url as string}>
            {platform}
          </a>
        ))}
      </nav>
    </header>
  );
}
```

## Best Practices

### 1. Use Built-in Components

```typescript
// Good: Use provided resolvers
<ImageResolver {...image} alt={alt} />
<LinkResolver {...link}>{children}</LinkResolver>
<ModuleResolver data={modules} />

// Avoid: Custom implementations unless necessary
```

### 2. Handle Loading States

```typescript
function ComponentWithData() {
  const { data, loading } = useQuery(query);

  if (loading) return <Skeleton />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

### 3. Implement Error Boundaries

```typescript
function SafeComponent({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

### 4. Use TypeScript for Props

```typescript
interface ModuleProps {
  title: string;
  description?: string;
  image?: SanityImage;
}

function TypedModule({ title, description, image }: ModuleProps) {
  // Implementation with type safety
}
```

## Related Documentation

- [Modules](./modules.md) - Creating content modules
- [Visual Editing](./visual-editing.md) - Preview and editing setup
- [API Reference](./api-reference.md) - Component API reference
