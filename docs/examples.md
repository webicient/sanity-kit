# Examples and Use Cases

Common patterns and complete examples for using @webicient/sanity-kit in real-world scenarios.

## Basic Blog Setup

Complete blog implementation with categories and multi-language support.

### Kit Configuration

```typescript
// kit.config.ts
import {
  kitConfig,
  defineContentType,
  defineTaxonomy,
} from "@webicient/sanity-kit";

export default kitConfig({
  languages: [
    { id: "en", title: "English", isDefault: true },
    { id: "es", title: "Spanish" },
  ],

  schema: {
    contentTypes: [
      defineContentType({
        name: "blogPost",
        title: "Blog Post",
        pluralTitle: "Blog Posts",
        supports: [
          "title",
          "slug",
          "publishedAt",
          "featuredImage",
          "excerpt",
          "body",
          "seo",
        ],
        rewrite: "/blog/:slug",
        translate: true,
        taxonomies: [
          { name: "category", multiple: true, required: true },
          { name: "tag", multiple: true, required: false },
        ],
      }),
    ],

    taxonomies: [
      defineTaxonomy({
        name: "tag",
        title: "Tag",
        pluralTitle: "Tags",
        supports: ["title", "slug", "description"],
        translate: true,
      }),
    ],
  },
});
```

### Blog Post Page

```typescript
// app/blog/[slug]/page.tsx
import { loadQuery } from '@webicient/sanity-kit/query';
import { ImageResolver } from '@webicient/sanity-kit/resolvers';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';

const blogPostQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    title,
    slug,
    publishedAt,
    excerpt,
    body,
    featuredImage,
    categories[]-> {
      title,
      slug
    },
    tags[]-> {
      title,
      slug
    },
    seo
  }
`;

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { data: post } = await loadQuery(
    blogPostQuery,
    { slug: params.slug },
    { next: { tags: [`blogPost:${params.slug}`] } }
  );

  if (!post) notFound();

  return (
    <article className=\"max-w-4xl mx-auto px-4 py-8\">
      {post.featuredImage && (
        <ImageResolver
          {...post.featuredImage}
          alt={post.title}
          className=\"w-full h-64 object-cover rounded-lg mb-8\"
        />
      )}

      <header className=\"mb-8\">
        <h1 className=\"text-4xl font-bold mb-4\">{post.title}</h1>

        {post.publishedAt && (
          <time className=\"text-gray-600\">
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
        )}

        <div className=\"flex flex-wrap gap-2 mt-4\">
          {post.categories?.map((category: any) => (
            <span key={category.slug.current} className=\"bg-blue-100 px-3 py-1 rounded\">
              {category.title}
            </span>
          ))}
        </div>
      </header>

      <div className=\"prose prose-lg max-w-none\">
        <PortableText value={post.body} />
      </div>

      {post.tags?.length > 0 && (
        <footer className=\"mt-8 pt-8 border-t\">
          <h3 className=\"text-lg font-semibold mb-2\">Tags:</h3>
          <div className=\"flex flex-wrap gap-2\">
            {post.tags.map((tag: any) => (
              <span key={tag.slug.current} className=\"bg-gray-100 px-2 py-1 rounded text-sm\">
                #{tag.title}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
```

## E-commerce Product Catalog

Product catalog with categories, filters, and multi-language support.

### Schema Configuration

```typescript
// kit.config.ts
import {
  kitConfig,
  defineContentType,
  defineTaxonomy,
  defineModule,
} from "@webicient/sanity-kit";

export default kitConfig({
  languages: [
    { id: "en", title: "English", isDefault: true },
    { id: "fr", title: "French" },
  ],

  schema: {
    contentTypes: [
      defineContentType({
        name: "product",
        title: "Product",
        pluralTitle: "Products",
        supports: ["title", "slug", "featuredImage", "seo"],
        rewrite: "/products/:slug",
        translate: true,
        taxonomies: [
          { name: "productCategory", multiple: true, required: true },
          { name: "brand", multiple: false, required: false },
        ],
        fields: [
          defineField({
            name: "price",
            title: "Price",
            type: "number",
            validation: (Rule) => Rule.required().positive(),
          }),
          defineField({
            name: "compareAtPrice",
            title: "Compare at Price",
            type: "number",
            validation: (Rule) => Rule.positive(),
          }),
          defineField({
            name: "sku",
            title: "SKU",
            type: "string",
            validation: (Rule) => Rule.required(),
          }),
          defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 4,
          }),
          defineField({
            name: "gallery",
            title: "Image Gallery",
            type: "array",
            of: [{ type: "image", options: { hotspot: true } }],
          }),
          defineField({
            name: "specifications",
            title: "Specifications",
            type: "array",
            of: [
              defineField({
                name: "spec",
                type: "object",
                fields: [
                  defineField({
                    name: "name",
                    title: "Name",
                    type: "string",
                  }),
                  defineField({
                    name: "value",
                    title: "Value",
                    type: "string",
                  }),
                ],
              }),
            ],
          }),
          defineField({
            name: "inStock",
            title: "In Stock",
            type: "boolean",
            initialValue: true,
          }),
        ],
      }),
    ],

    taxonomies: [
      defineTaxonomy({
        name: "productCategory",
        title: "Product Category",
        pluralTitle: "Product Categories",
        supports: ["title", "slug", "description", "featuredImage"],
        translate: true,
        fields: [
          defineField({
            name: "parent",
            title: "Parent Category",
            type: "reference",
            to: [{ type: "productCategory" }],
          }),
        ],
      }),

      defineTaxonomy({
        name: "brand",
        title: "Brand",
        pluralTitle: "Brands",
        supports: ["title", "slug", "featuredImage"],
      }),
    ],

    modules: [
      defineModule({
        name: "module.productGrid",
        title: "Product Grid",
        fields: [
          defineField({
            name: "title",
            title: "Section Title",
            type: "string",
          }),
          defineField({
            name: "products",
            title: "Products",
            type: "array",
            of: [
              {
                type: "reference",
                to: [{ type: "product" }],
              },
            ],
          }),
          defineField({
            name: "columns",
            title: "Columns",
            type: "number",
            initialValue: 3,
            validation: (Rule) => Rule.min(1).max(6),
          }),
        ],
        renderer: ProductGridModule,
        imageUrl: "/modules/product-grid.png",
      }),
    ],
  },
});
```

### Product Grid Module Component

```typescript
// components/modules/ProductGrid.tsx
import { ImageResolver, LinkResolver } from '@webicient/sanity-kit/resolvers';

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  compareAtPrice?: number;
  featuredImage: any;
  inStock: boolean;
}

interface ProductGridProps {
  title?: string;
  products: Product[];
  columns: number;
}

export default function ProductGridModule({ title, products, columns = 3 }: ProductGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <section className=\"py-12\">
      {title && (
        <h2 className=\"text-3xl font-bold text-center mb-8\">{title}</h2>
      )}

      <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
        {products?.map((product) => (
          <div key={product._id} className=\"bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow\">
            <LinkResolver
              _type=\"reference\"
              _ref={product._id}
              slug={product.slug}
              className=\"block\"
            >
              {product.featuredImage && (
                <ImageResolver
                  {...product.featuredImage}
                  alt={product.title}
                  className=\"w-full h-48 object-cover\"
                />
              )}

              <div className=\"p-4\">
                <h3 className=\"font-semibold text-lg mb-2\">{product.title}</h3>

                <div className=\"flex items-center justify-between\">
                  <div className=\"flex items-center space-x-2\">
                    <span className=\"text-xl font-bold\">${product.price}</span>
                    {product.compareAtPrice && (
                      <span className=\"text-gray-500 line-through\">${product.compareAtPrice}</span>
                    )}
                  </div>

                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </LinkResolver>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Multi-language Website

Complete multi-language website with language switching and SEO.

### Language Configuration

```typescript
// kit.config.ts
export default kitConfig({
  languages: [
    { id: "en", title: "English", isDefault: true },
    { id: "fr", title: "Français" },
    { id: "de", title: "Deutsch" },
    { id: "es", title: "Español" },
  ],

  schema: {
    contentTypes: [
      defineContentType({
        name: "page",
        translate: true, // Enable translation
        // ... other properties
      }),
    ],
  },
});
```

### Layout with Language Switcher

```typescript
// app/[locale]/layout.tsx
import { KitProvider } from '@webicient/sanity-kit/provider';
import { loadSettings } from '@webicient/sanity-kit/query';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { notFound } from 'next/navigation';

const locales = ['en', 'fr', 'de', 'es'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale)) {
    notFound();
  }

  const settings = await loadSettings(params.locale);

  return (
    <html lang={params.locale}>
      <body>
        <KitProvider settings={settings}>
          <header className=\"border-b\">
            <nav className=\"container mx-auto px-4 py-4 flex justify-between items-center\">
              <h1 className=\"text-xl font-bold\">
                {settings.generalSettings?.siteName}
              </h1>
              <LanguageSwitcher currentLocale={params.locale} />
            </nav>
          </header>

          <main>{children}</main>
        </KitProvider>
      </body>
    </html>
  );
}
```

### Language Switcher Component

```typescript
// components/LanguageSwitcher.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';

const languages = [
  { id: 'en', title: 'English', flag: '🇺🇸' },
  { id: 'fr', title: 'Français', flag: '🇫🇷' },
  { id: 'de', title: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', title: 'Español', flag: '🇪🇸' }
];

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className=\"relative group\">
      <button className=\"flex items-center space-x-2 px-3 py-2 rounded border hover:bg-gray-50\">
        <span>{languages.find(lang => lang.id === currentLocale)?.flag}</span>
        <span>{languages.find(lang => lang.id === currentLocale)?.title}</span>
        <svg className=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 9l-7 7-7-7\" />
        </svg>
      </button>

      <div className=\"absolute top-full right-0 mt-1 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10\">
        {languages.map((language) => (
          <button
            key={language.id}
            onClick={() => switchLanguage(language.id)}
            className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left ${
              currentLocale === language.id ? 'bg-gray-50' : ''
            }`}
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

## Advanced Module with Custom Fields

Complex module with conditional fields and custom validation.

```typescript
// modules/testimonials.ts
import { defineModule } from "@webicient/sanity-kit";
import { defineField } from "sanity";
import TestimonialsModule from "@/components/modules/Testimonials";

export const testimonialsModule = defineModule({
  name: "module.testimonials",
  title: "Testimonials Section",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
    }),

    defineField({
      name: "layout",
      title: "Layout Style",
      type: "string",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Carousel", value: "carousel" },
          { title: "Single Featured", value: "featured" },
        ],
      },
      initialValue: "grid",
    }),

    defineField({
      name: "columns",
      title: "Columns (Grid Only)",
      type: "number",
      hidden: ({ parent }) => parent?.layout !== "grid",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.layout === "grid" && !value) {
            return "Columns required for grid layout";
          }
          return true;
        })
          .min(1)
          .max(4),
      initialValue: 3,
    }),

    defineField({
      name: "autoplay",
      title: "Autoplay (Carousel Only)",
      type: "boolean",
      hidden: ({ parent }) => parent?.layout !== "carousel",
      initialValue: true,
    }),

    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        defineField({
          name: "testimonial",
          type: "object",
          fields: [
            defineField({
              name: "quote",
              title: "Quote",
              type: "text",
              rows: 4,
              validation: (Rule) => Rule.required().max(500),
            }),

            defineField({
              name: "author",
              title: "Author",
              type: "object",
              fields: [
                defineField({
                  name: "name",
                  title: "Name",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),

                defineField({
                  name: "title",
                  title: "Job Title",
                  type: "string",
                }),

                defineField({
                  name: "company",
                  title: "Company",
                  type: "string",
                }),

                defineField({
                  name: "photo",
                  title: "Photo",
                  type: "image",
                  options: { hotspot: true },
                }),
              ],
            }),

            defineField({
              name: "rating",
              title: "Rating",
              type: "number",
              validation: (Rule) => Rule.min(1).max(5),
              initialValue: 5,
            }),
          ],
          preview: {
            select: {
              quote: "quote",
              name: "author.name",
              company: "author.company",
            },
            prepare({ quote, name, company }) {
              return {
                title: name || "Anonymous",
                subtitle: company || quote?.substring(0, 100) + "...",
              };
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(10),
    }),

    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Light Gray", value: "gray-50" },
          { title: "Blue", value: "blue-50" },
        ],
      },
      initialValue: "white",
    }),
  ],

  renderer: TestimonialsModule,
  imageUrl: "/modules/testimonials.png",

  query: (language) => `
    title,
    subtitle,
    layout,
    columns,
    autoplay,
    backgroundColor,
    testimonials[] {
      quote,
      author {
        name,
        title,
        company,
        photo
      },
      rating
    }
  `,
});
```

## Custom Hook for Settings

React hook for accessing specific settings with fallbacks.

```typescript
// hooks/useSettings.ts
import { useKit } from "@webicient/sanity-kit/provider";

export function useSettings() {
  const { settings } = useKit();

  return {
    // General settings
    siteName: settings.generalSettings?.siteName || "My Website",
    siteUrl: settings.generalSettings?.siteUrl || "https://example.com",
    logo: settings.generalSettings?.logo,

    // Social settings
    socialLinks: settings.socialSettings?.links || [],
    socialProfiles: {
      twitter: settings.socialSettings?.twitter,
      facebook: settings.socialSettings?.facebook,
      instagram: settings.socialSettings?.instagram,
      linkedin: settings.socialSettings?.linkedin,
    },

    // SEO settings
    seo: {
      defaultTitle: settings.seoSettings?.defaultTitle || "My Website",
      defaultDescription: settings.seoSettings?.defaultDescription || "",
      defaultImage: settings.seoSettings?.defaultImage,
      twitterCard: settings.seoSettings?.twitterCard || "summary_large_image",
    },

    // Integration settings
    analytics: {
      gtmId: settings.integrationSettings?.gtmId,
      gtagId: settings.integrationSettings?.gtagId,
    },

    // Custom helper methods
    getSocialLink: (platform: string) => {
      return settings.socialSettings?.links?.find(
        (link: any) => link.platform === platform,
      )?.url;
    },

    getMetaTitle: (pageTitle?: string) => {
      const siteTitle = settings.seoSettings?.defaultTitle || "My Website";
      return pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
    },
  };
}
```

## SEO Metadata Generation

Utility for generating complete SEO metadata.

```typescript
// utils/seo.ts
import { Metadata } from "next";
import { loadSettings } from "@webicient/sanity-kit/query";
import { urlForImage } from "@webicient/sanity-kit/utils";

interface SEOProps {
  title?: string;
  description?: string;
  image?: any;
  path?: string;
  locale?: string;
  alternates?: { [key: string]: string };
}

export async function generateSEOMetadata({
  title,
  description,
  image,
  path = "",
  locale = "en",
  alternates,
}: SEOProps): Promise<Metadata> {
  const settings = await loadSettings(locale);
  const seoSettings = settings.seoSettings || {};

  const metaTitle = title
    ? `${title} | ${seoSettings.siteName || "Website"}`
    : seoSettings.defaultTitle || "Website";

  const metaDescription = description || seoSettings.defaultDescription || "";

  const metaImage = image || seoSettings.defaultImage;
  const imageUrl = metaImage
    ? urlForImage(metaImage).width(1200).height(630).url()
    : undefined;

  const siteUrl = seoSettings.siteUrl || "https://example.com";
  const fullUrl = `${siteUrl}${path}`;

  return {
    title: metaTitle,
    description: metaDescription,

    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: fullUrl,
      siteName: seoSettings.siteName,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title || metaTitle,
            },
          ]
        : undefined,
      locale: locale,
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: imageUrl ? [imageUrl] : undefined,
      site: seoSettings.twitterHandle,
    },

    alternates: alternates
      ? {
          canonical: fullUrl,
          languages: alternates,
        }
      : undefined,

    robots: {
      index: seoSettings.allowIndexing !== false,
      follow: seoSettings.allowFollowing !== false,
      googleBot: {
        index: seoSettings.allowIndexing !== false,
        follow: seoSettings.allowFollowing !== false,
      },
    },
  };
}
```

## Performance Optimization

Optimized data fetching with caching strategies.

```typescript
// lib/sanity.ts
import { loadQuery } from "@webicient/sanity-kit/query";
import { cache } from "react";

// Cache expensive queries
export const getCachedPage = cache(
  async (slug: string, locale: string = "en") => {
    return loadQuery(
      `*[_type == \"page\" && slug.current == $slug][0]`,
      { slug },
      {
        next: {
          revalidate: 60 * 60, // Revalidate every hour
          tags: [`page:${slug}`, "page"],
        },
      },
    );
  },
);

export const getCachedSettings = cache(async (locale: string = "en") => {
  return loadQuery(
    `{
      \"generalSettings\": *[_type == \"generalSettings\"][0],
      \"seoSettings\": *[_type == \"seoSettings\"][0],
      \"socialSettings\": *[_type == \"socialSettings\"][0]
    }`,
    {},
    {
      next: {
        revalidate: 60 * 60 * 24, // Revalidate daily
        tags: ["settings"],
      },
    },
  );
});

// ISR with on-demand revalidation
export async function revalidatePage(slug: string) {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`page:${slug}`);
}
```

These examples demonstrate real-world usage patterns and best practices for implementing @webicient/sanity-kit in production applications. Each example builds upon the core concepts while showing practical implementation details.
