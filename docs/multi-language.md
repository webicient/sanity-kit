# Multi-Language Support

Complete guide to setting up and managing multi-language content with @webicient/sanity-kit.

## Overview

@webicient/sanity-kit provides built-in internationalization support using `@sanity/language-filter`. The system supports document-level translation, field-level filtering, and automatic language fallbacks.

## Language Configuration

### Basic Setup

```typescript
// kit.config.ts
import { kitConfig } from '@webicient/sanity-kit';

export default kitConfig({
  languages: [
    { id: 'en', title: 'English', isDefault: true },
    { id: 'es', title: 'Spanish' },
    { id: 'fr', title: 'French' },
    { id: 'de', title: 'German' }
  ],
  
  schema: {
    contentTypes: [
      defineContentType({
        name: 'page',
        translate: true, // Enable translation for this content type
        // ... other properties
      })
    ],
    
    settings: [
      defineSetting({
        name: 'seoSettings',
        translate: true, // Settings can also be translated
        // ... other properties
      })
    ]
  }
});
```

### Language Object Properties

```typescript
interface Language {
  id: string;           // Language code (ISO 639-1)
  title: string;        // Display name
  isDefault?: boolean;  // Mark as default language
}

// Examples
{ id: 'en', title: 'English', isDefault: true }
{ id: 'es-ES', title: 'Spanish (Spain)' }
{ id: 'pt-BR', title: 'Portuguese (Brazil)' }
```

## Studio Configuration

### Language Filter Integration

The plugin automatically integrates `@sanity/language-filter` when languages are configured:

```typescript
// Automatically applied when languages are defined
languageFilter({
  supportedLanguages: config.languages,
  defaultLanguages: [config.languages.find(lang => lang.isDefault)?.id || 'en'],
  documentTypes: [
    // All content types with translate: true
    'page', 'post', 'category'
  ],
  filterField: (enclosingType, field, selectedLanguageIds) => {
    // Hide language fields not selected
    return !(
      config.languages?.map(({ id }) => id).includes(field.name) &&
      !selectedLanguageIds.includes(field.name)
    );
  }
})
```

### Studio Language Switching

The language filter adds a language selector to your Sanity Studio, allowing editors to:

1. **Filter documents** by language
2. **Switch between language versions** of documents  
3. **Create translations** of existing documents
4. **View language-specific fields** only

## Document Translation

### Schema Translation Setup

Enable translation for content types and settings:

```typescript
// Content type with translation
export const page = defineContentType({
  name: 'page',
  title: 'Page',
  translate: true, // Enables translation fields
  supports: ['title', 'slug', 'seo', 'modules'],
  // ... other config
});

// Settings with translation
export const seoSettings = defineSetting({
  name: 'seoSettings',
  title: 'SEO Settings',
  translate: true, // Enables language-specific settings
  fields: [
    defineField({
      name: 'title',
      title: 'Default Title',
      type: 'string'
    })
  ]
});
```

### Document Structure

When translation is enabled, documents get language-specific fields:

```typescript
// Document structure with translations
{
  "_type": "page",
  "_id": "home",
  
  // Default language fields
  "title": "Welcome",
  "slug": { "current": "home" },
  "body": "Welcome to our site",
  
  // Spanish translation
  "es": {
    "title": "Bienvenidos", 
    "body": "Bienvenidos a nuestro sitio"
  },
  
  // French translation
  "fr": {
    "title": "Bienvenue",
    "body": "Bienvenue sur notre site"  
  }
}
```

## Querying Multi-Language Content

### Language-Aware Queries

Use `coalesce()` to provide language fallbacks:

```typescript
// Query with language fallback
const pageQuery = (slug: string, language: string = 'en') => `
  *[_type == "page" && slug.current == "${slug}"][0] {
    "title": coalesce(${language}.title, title),
    "body": coalesce(${language}.body, body),
    "slug": slug.current,
    "seo": coalesce(${language}.seo, seo)
  }
`;

// Usage
const { data: page } = await loadQuery(pageQuery('about', 'es'));
```

### Complex Translation Queries

```typescript
// All languages for a document
const multiLanguageQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    
    // All language versions
    "translations": {
      "en": {
        "title": coalesce(en.title, title),
        "body": coalesce(en.body, body)
      },
      "es": {
        "title": es.title,
        "body": es.body
      },
      "fr": {
        "title": fr.title, 
        "body": fr.body
      }
    },
    
    // Available languages (non-null translations)
    "availableLanguages": [
      select(defined(title) => "en"),
      select(defined(es.title) => "es"),
      select(defined(fr.title) => "fr")
    ][defined(@)]
  }
`;
```

### Language-Specific Content Lists

```typescript
// Posts available in specific language
const postsInLanguage = (language: string) => `
  *[_type == "post" && (
    defined(${language}.title) || 
    (${language} == "en" && defined(title))
  )] | order(publishedAt desc) {
    "title": coalesce(${language}.title, title),
    "slug": slug.current,
    "excerpt": coalesce(${language}.excerpt, excerpt),
    publishedAt
  }
`;

// Categories with post counts per language
const categoriesByLanguage = (language: string) => `
  *[_type == "category"] {
    "title": coalesce(${language}.title, title),
    "slug": slug.current,
    "postCount": count(*[
      _type == "post" && 
      references(^._id) && 
      (defined(${language}.title) || (${language} == "en" && defined(title)))
    ])
  }
`;
```

## Next.js Integration

### App Router with Internationalization

```typescript
// app/[locale]/layout.tsx
import { loadSettings } from '@webicient/sanity-kit/query';
import { KitProvider } from '@webicient/sanity-kit/provider';

const locales = ['en', 'es', 'fr', 'de'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(params.locale)) {
    notFound();
  }
  
  // Load localized settings
  const settings = await loadSettings(params.locale);
  
  return (
    <html lang={params.locale}>
      <body>
        <KitProvider settings={settings}>
          <LocaleProvider locale={params.locale}>
            {children}
          </LocaleProvider>
        </KitProvider>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}
```

### Dynamic Page Routes

```typescript
// app/[locale]/[...slug]/page.tsx
import { loadQuery } from '@webicient/sanity-kit/query';
import { generateMetadata as generateSEO } from '@webicient/sanity-kit/utils';

interface PageProps {
  params: {
    locale: string;
    slug: string[];
  };
}

const pageQuery = (slug: string, locale: string) => `
  *[_type == "page" && slug.current == "${slug}"][0] {
    "title": coalesce(${locale}.title, title),
    "body": coalesce(${locale}.body, body),
    "seo": coalesce(${locale}.seo, seo),
    "modules": modules[] {
      _type,
      _key,
      ...coalesce(${locale}, @)
    }
  }
`;

export default async function Page({ params }: PageProps) {
  const slug = params.slug.join('/');
  
  const { data: page } = await loadQuery(
    pageQuery(slug, params.locale),
    { slug, locale: params.locale }
  );
  
  if (!page) notFound();
  
  return (
    <main>
      <h1>{page.title}</h1>
      <ModuleResolver data={page.modules} />
    </main>
  );
}

// Generate SEO metadata with language support
export async function generateMetadata({ params }: PageProps) {
  const slug = params.slug.join('/');
  const { data: page } = await loadQuery(pageQuery(slug, params.locale));
  const settings = await loadSettings(params.locale);
  
  return generateSEO(page, settings, params.locale);
}
```

### Language Switching

```typescript
// components/LanguageSwitcher.tsx
'use client';
import { usePathname, useRouter } from 'next/navigation';

const languages = [
  { id: 'en', title: 'English', flag: '🇺🇸' },
  { id: 'es', title: 'Español', flag: '🇪🇸' },
  { id: 'fr', title: 'Français', flag: '🇫🇷' },
  { id: 'de', title: 'Deutsch', flag: '🇩🇪' }
];

interface LanguageSwitcherProps {
  currentLocale: string;
  availableLocales?: string[];
}

export default function LanguageSwitcher({ 
  currentLocale,
  availableLocales = languages.map(l => l.id)
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const switchLanguage = (newLocale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    
    // Add new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
  };
  
  const currentLanguage = languages.find(lang => lang.id === currentLocale);
  const availableLanguages = languages.filter(lang => 
    availableLocales.includes(lang.id)
  );
  
  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 rounded border hover:bg-gray-50">
        <span>{currentLanguage?.flag}</span>
        <span>{currentLanguage?.title}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      
      <div className="absolute top-full right-0 mt-1 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {availableLanguages.map((language) => (
          <button
            key={language.id}
            onClick={() => switchLanguage(language.id)}
            className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left ${
              currentLocale === language.id ? 'bg-gray-50' : ''
            }`}
            disabled={currentLocale === language.id}
          >
            <span>{language.flag}</span>
            <span>{language.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Translation Utilities

### Custom Hooks

```typescript
// hooks/useTranslation.ts
'use client';
import { useKit } from '@webicient/sanity-kit/provider';
import { useParams } from 'next/navigation';

export function useTranslation() {
  const { translations, setTranslations } = useKit();
  const params = useParams();
  const locale = params.locale as string || 'en';
  
  const t = (key: string, fallback?: string) => {
    return translations?.[locale]?.[key] || 
           translations?.en?.[key] || 
           fallback || 
           key;
  };
  
  return { t, locale, setTranslations };
}

// Usage in components
function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title', 'Welcome')}</h1>
      <p>{t('welcome.description', 'Welcome to our site')}</p>
    </div>
  );
}
```

### Language Detection

```typescript
// utils/language.ts
export function detectLanguage(
  acceptLanguage?: string,
  supportedLanguages: string[] = ['en']
): string {
  if (!acceptLanguage) return supportedLanguages[0];
  
  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, quality = '1'] = lang.trim().split(';q=');
      return { code: code.toLowerCase(), quality: parseFloat(quality) };
    })
    .sort((a, b) => b.quality - a.quality);
  
  // Find best match
  for (const { code } of languages) {
    // Exact match
    if (supportedLanguages.includes(code)) {
      return code;
    }
    
    // Partial match (e.g., 'en-US' -> 'en')
    const shortCode = code.split('-')[0];
    if (supportedLanguages.includes(shortCode)) {
      return shortCode;
    }
  }
  
  return supportedLanguages[0];
}

// Middleware for language detection
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const supportedLocales = ['en', 'es', 'fr', 'de'];
  
  // Check if pathname already has locale
  const pathnameHasLocale = supportedLocales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (!pathnameHasLocale) {
    // Detect language and redirect
    const locale = detectLanguage(
      request.headers.get('Accept-Language') || undefined,
      supportedLocales
    );
    
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
}
```

## Module Translations

### Translating Module Content

```typescript
// Module with translation support
export const heroModule = defineModule({
  name: 'module.hero',
  title: 'Hero Section',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading', 
      type: 'text'
    })
  ],
  renderer: HeroModule,
  imageUrl: '/modules/hero.png',
  query: (language) => `
    "heading": coalesce(${language}.heading, heading),
    "subheading": coalesce(${language}.subheading, subheading),
    backgroundImage
  `
});
```

### Module Component with Language Context

```typescript
// components/modules/Hero.tsx
'use client';
import { useTranslation } from '@/hooks/useTranslation';

interface HeroModuleProps {
  heading: string;
  subheading?: string;
  backgroundImage?: any;
}

export default function HeroModule({
  heading,
  subheading,
  backgroundImage
}: HeroModuleProps) {
  const { t } = useTranslation();
  
  return (
    <section className="hero">
      {backgroundImage && (
        <ImageResolver {...backgroundImage} alt={heading} />
      )}
      
      <div className="hero-content">
        <h1>{heading}</h1>
        {subheading && <p>{subheading}</p>}
        
        <button className="btn btn-primary">
          {t('cta.learnMore', 'Learn More')}
        </button>
      </div>
    </section>
  );
}
```

## SEO and Meta Tags

### Language-Aware SEO

```typescript
// utils/seo.ts
import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  locale: string;
  alternateUrls?: Record<string, string>;
}

export function generateLanguageMetadata({
  title,
  description,
  locale,
  alternateUrls = {}
}: SEOProps): Metadata {
  return {
    title,
    description,
    
    openGraph: {
      title,
      description,
      locale: locale,
      alternateLocale: Object.keys(alternateUrls)
    },
    
    alternates: {
      canonical: alternateUrls[locale],
      languages: alternateUrls
    },
    
    other: {
      'content-language': locale
    }
  };
}
```

### Hreflang Implementation

```typescript
// components/HreflangTags.tsx
interface HreflangTagsProps {
  alternateUrls: Record<string, string>;
  currentLocale: string;
}

export function HreflangTags({ alternateUrls, currentLocale }: HreflangTagsProps) {
  return (
    <>
      {Object.entries(alternateUrls).map(([locale, url]) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={url}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={alternateUrls[currentLocale]}
      />
    </>
  );
}
```

## Best Practices

### 1. Consistent Language Codes

```typescript
// Use standard ISO 639-1 codes
const languages = [
  { id: 'en', title: 'English' },      // ✅ Good
  { id: 'es', title: 'Spanish' },     // ✅ Good
  { id: 'es-ES', title: 'Spanish (Spain)' }, // ✅ Good for regional
  { id: 'spanish', title: 'Spanish' } // ❌ Avoid non-standard codes
];
```

### 2. Proper Fallbacks

```typescript
// Always provide fallbacks in queries
"title": coalesce(${language}.title, title, "Untitled")

// Handle missing translations gracefully
function getLocalizedText(content: any, language: string, field: string) {
  return content?.[language]?.[field] || 
         content?.[field] || 
         `[${field} not translated]`;
}
```

### 3. SEO Considerations

```typescript
// Generate proper alternate URLs
const alternateUrls = {
  'en': 'https://example.com/en/about',
  'es': 'https://example.com/es/acerca-de',
  'fr': 'https://example.com/fr/a-propos'
};

// Implement hreflang tags
<HreflangTags 
  alternateUrls={alternateUrls}
  currentLocale={locale}
/>
```

### 4. Content Strategy

- **Enable translation selectively**: Only translate content types that need it
- **Use consistent terminology**: Maintain translation glossaries
- **Plan URL structure**: Consider SEO implications of URL patterns
- **Handle RTL languages**: Plan for right-to-left languages if needed

### 5. Performance

```typescript
// Optimize queries by requesting only needed language
const optimizedQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    "title": coalesce(${language}.title, title),
    "body": coalesce(${language}.body, body)
    // Don't fetch unused language fields
  }
`;
```

## Troubleshooting

### Common Issues

1. **Missing language fields in Studio**
   - Check that `translate: true` is set on content type
   - Verify language filter configuration
   - Restart Studio after configuration changes

2. **Fallback not working**
   - Ensure proper `coalesce()` syntax in queries
   - Check that default language has content
   - Verify language codes match exactly

3. **Build errors with dynamic routes**
   - Ensure all locales are included in `generateStaticParams()`
   - Check that locale validation is correct

## Related Documentation

- [Configuration](./configuration.md) - Language configuration
- [Queries](./queries.md) - Language-aware queries
- [Components](./components.md) - Using translations in components
- [Examples](./examples.md) - Multi-language implementation examples