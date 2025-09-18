# Visual Editing and Preview

Complete guide to setting up live preview and visual editing with @webicient/sanity-kit.

## Overview

@webicient/sanity-kit provides seamless integration with Sanity's visual editing capabilities, allowing content editors to see live previews of their changes and edit content directly in the browser.

## Next.js Draft Mode Setup

### Draft Mode API Routes

Create API routes to enable and disable draft mode:

```typescript
// app/api/draft/enable/route.ts
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { serverClient } from "@webicient/sanity-kit/query";

const token = process.env.SANITY_API_TOKEN!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (!token) {
    return new Response("Missing SANITY_API_TOKEN", { status: 500 });
  }

  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    serverClient.withConfig({ token }),
    request.url,
  );

  if (!isValid) {
    return new Response("Invalid secret", { status: 401 });
  }

  // Enable draft mode
  draftMode().enable();

  // Redirect to the path from the search params or fallback to '/'
  redirect(redirectTo);
}
```

```typescript
// app/api/draft/disable/route.ts
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  // Disable draft mode
  draftMode().disable();

  // Redirect to the homepage
  redirect("/");
}
```

### Environment Variables

Add required environment variables:

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# Required for draft mode
SANITY_API_TOKEN=your-read-token

# Optional: Preview secret for validation
SANITY_PREVIEW_SECRET=your-preview-secret

# Studio configuration
SANITY_STUDIO_URL=/studio
```

## Visual Editing Components

### KitVisualEditing Component

Add visual editing capabilities to your application:

```typescript
// app/layout.tsx
import { KitVisualEditing } from '@webicient/sanity-kit/visual-editing';
import { draftMode } from 'next/headers';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { isEnabled } = draftMode();

  return (
    <html>
      <body>
        {children}

        {/* Only load in draft mode */}
        {isEnabled && <KitVisualEditing />}
      </body>
    </html>
  );
}
```

### Preview Mode Indicator

Create a visual indicator when in preview mode:

```typescript
// components/PreviewBanner.tsx
import { DisablePreviewMode } from '@webicient/sanity-kit/visual-editing';
import { draftMode } from 'next/headers';

export default async function PreviewBanner() {
  const { isEnabled } = draftMode();

  if (!isEnabled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-2 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="font-medium">Preview Mode</span>
          <span className="text-blue-200 text-sm">
            You are viewing unpublished content
          </span>
        </div>

        <DisablePreviewMode />
      </div>
    </div>
  );
}
```

## Data Fetching in Draft Mode

### Automatic Draft Content

The `loadQuery` function automatically handles draft mode:

```typescript
// Data fetching automatically uses draft perspective when enabled
export default async function Page({ params }: { params: { slug: string } }) {
  const { data: page } = await loadQuery(
    pageQuery(params.slug),
    { slug: params.slug }
  );

  // Automatically fetches draft content when draftMode().isEnabled is true
  // Falls back to published content in production

  return <PageComponent page={page} />;
}
```

### Manual Draft Mode Handling

For custom data fetching scenarios:

```typescript
import { draftMode } from 'next/headers';
import { serverClient } from '@webicient/sanity-kit/query';

export default async function CustomPage() {
  const { isEnabled } = draftMode();

  const client = isEnabled
    ? serverClient.withConfig({
        token: process.env.SANITY_API_TOKEN,
        perspective: 'previewDrafts'
      })
    : serverClient;

  const data = await client.fetch(`
    *[_type == "page"] {
      title,
      slug,
      _updatedAt
    }
  `);

  return (
    <div>
      {isEnabled && (
        <p className="bg-yellow-100 p-2">
          Draft mode enabled - showing unpublished changes
        </p>
      )}

      {/* Render content */}
    </div>
  );
}
```

## Sanity Studio Configuration

### Presentation Tool Setup

Configure the presentation tool in your Sanity Studio:

```typescript
// sanity.config.ts
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { sanityKit } from "@webicient/sanity-kit";

export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    sanityKit(kitConfig),

    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        draftMode: {
          enable: "/api/draft/enable",
          disable: "/api/draft/disable",
        },
      },

      // Optional: Custom locate function
      locate: (params, context) => {
        if (params.type === "page") {
          return {
            message: `Open page "${params.slug}"`,
            locations: [
              {
                title: params.title || "Page",
                href: `/${params.slug}`,
              },
            ],
          };
        }

        if (params.type === "post") {
          return {
            message: `Open post "${params.slug}"`,
            locations: [
              {
                title: params.title || "Post",
                href: `/blog/${params.slug}`,
              },
            ],
          };
        }

        return null;
      },
    }),
  ],
});
```

### Custom Preview URLs

Set up custom preview URLs for different content types:

```typescript
// plugins/productionUrl.ts
import { definePlugin } from "sanity";

export const productionUrl = definePlugin({
  name: "production-url",
  document: {
    productionUrl: async (prev, { document }) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      switch (document._type) {
        case "page":
          return `${baseUrl}/${document.slug?.current}`;

        case "post":
          return `${baseUrl}/blog/${document.slug?.current}`;

        case "product":
          return `${baseUrl}/products/${document.slug?.current}`;

        default:
          return prev;
      }
    },
  },
});
```

## Advanced Visual Editing

### Client-Side Live Updates

For real-time updates in the browser:

```typescript
// components/LivePreview.tsx
'use client';
import { useLiveQuery } from '@sanity/react-loader';

interface LivePreviewProps {
  initialData: any;
  query: string;
  params?: any;
}

export default function LivePreview({
  initialData,
  query,
  params = {}
}: LivePreviewProps) {
  const [data, loading] = useLiveQuery(initialData, query, params);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded w-2/3"></div>
      </div>
    );
  }

  return <ContentComponent data={data} />;
}

// Usage in page component
export default async function Page({ params }: { params: { slug: string } }) {
  const initialData = await loadQuery(pageQuery(params.slug));

  return (
    <LivePreview
      initialData={initialData}
      query={pageQuery(params.slug)}
      params={{ slug: params.slug }}
    />
  );
}
```

### Visual Editing Overlays

Add visual editing overlays to your components:

```typescript
// components/EditableSection.tsx
'use client';
import { useEditMode } from '@/hooks/useEditMode';

interface EditableSectionProps {
  documentId: string;
  documentType: string;
  children: React.ReactNode;
}

export function EditableSection({
  documentId,
  documentType,
  children
}: EditableSectionProps) {
  const { isEnabled, openInStudio } = useEditMode();

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}

      {/* Edit overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => openInStudio(documentType, documentId)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// Usage
<EditableSection documentId={page._id} documentType="page">
  <PageContent page={page} />
</EditableSection>
```

### Custom Edit Mode Hook

```typescript
// hooks/useEditMode.ts
"use client";
import { useEffect, useState } from "react";

export function useEditMode() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if we're in draft mode
    const checkDraftMode = async () => {
      try {
        const response = await fetch("/api/draft/check");
        const { isEnabled } = await response.json();
        setIsEnabled(isEnabled);
      } catch (error) {
        setIsEnabled(false);
      }
    };

    checkDraftMode();
  }, []);

  const openInStudio = (type: string, id: string) => {
    const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "/studio";
    const editUrl = `${studioUrl}/intent/edit/id=${id};type=${type}`;
    window.open(editUrl, "_blank");
  };

  const enablePreview = () => {
    window.location.href = "/api/draft/enable";
  };

  const disablePreview = () => {
    window.location.href = "/api/draft/disable";
  };

  return {
    isEnabled,
    openInStudio,
    enablePreview,
    disablePreview,
  };
}
```

## Webhook Integration

### Real-time Updates

Set up webhooks for real-time content updates:

```typescript
// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate webhook (implement your security here)
  const isValid = validateWebhookSignature(body, request.headers);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { _type, slug, _id } = body;

    // Revalidate specific pages
    switch (_type) {
      case "page":
        revalidateTag(`page:${slug?.current}`);
        revalidatePath(`/${slug?.current}`);
        break;

      case "post":
        revalidateTag(`post:${slug?.current}`);
        revalidatePath(`/blog/${slug?.current}`);
        break;

      case "generalSettings":
        revalidateTag("settings");
        revalidatePath("/");
        break;

      default:
        // Revalidate homepage for any other changes
        revalidatePath("/");
    }

    return NextResponse.json({
      revalidated: true,
      type: _type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 },
    );
  }
}

function validateWebhookSignature(body: any, headers: Headers): boolean {
  // Implement signature validation
  const signature = headers.get("sanity-webhook-signature");
  const secret = process.env.SANITY_WEBHOOK_SECRET;

  if (!signature || !secret) return false;

  // Validate signature against body and secret
  // Implementation depends on your security requirements
  return true;
}
```

### Webhook Configuration in Sanity

```typescript
// Configure webhook in Sanity Studio
// Go to: https://www.sanity.io/manage
// Navigate to: API > Webhooks
// Add webhook with:
// URL: https://yoursite.com/api/revalidate
// Dataset: production
// Trigger on: Create, Update, Delete
```

## Testing Visual Editing

### Development Setup

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    taint: true, // Enable for better debugging
  },

  // Allow Sanity Studio embedding
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Local Development

```typescript
// Development helper component
export function DevelopmentTools() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2">Dev Tools</h3>

        <div className="space-y-2">
          <a
            href="/api/draft/enable"
            className="block bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Enable Preview
          </a>

          <a
            href="/api/draft/disable"
            className="block bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Disable Preview
          </a>

          <a
            href="/studio"
            target="_blank"
            className="block bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Open Studio
          </a>
        </div>
      </div>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Preview not working**

   - Check SANITY_API_TOKEN is set
   - Verify token has read permissions
   - Ensure draft mode routes are properly configured

2. **Visual editing not loading**

   - Check that KitVisualEditing is only loaded in draft mode
   - Verify presentation tool configuration in Studio
   - Check for console errors related to CORS

3. **Stale content in preview**
   - Implement webhook revalidation
   - Check cache tags are properly set
   - Verify draft perspective is enabled

### Debug Draft Mode

```typescript
// app/api/draft/check/route.ts
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const { isEnabled } = draftMode();

  return NextResponse.json({
    isEnabled,
    timestamp: new Date().toISOString(),
    hasToken: !!process.env.SANITY_API_TOKEN,
  });
}
```

### Performance Considerations

```typescript
// Optimize for visual editing performance
export default async function Page({ params }: PageProps) {
  const { isEnabled } = draftMode();

  // Different caching strategy for draft mode
  const cacheOptions = isEnabled
    ? { next: { revalidate: 0 } } // No cache in draft
    : { next: { revalidate: 3600, tags: [`page:${params.slug}`] } };

  const { data: page } = await loadQuery(
    pageQuery(params.slug),
    { slug: params.slug },
    cacheOptions
  );

  return <PageComponent page={page} />;
}
```

## Best Practices

### 1. Security

- Never expose SANITY_API_TOKEN to client-side code
- Validate webhook signatures
- Implement proper CORS headers
- Use environment-specific tokens

### 2. Performance

```typescript
// Only load visual editing components when needed
{process.env.NODE_ENV === 'development' && <KitVisualEditing />}

// Use proper cache invalidation
revalidateTag(`page:${slug}`); // Specific
revalidatePath('/'); // Broader when needed
```

### 3. User Experience

- Provide clear visual indicators for preview mode
- Make it easy to exit preview mode
- Handle loading states during live updates
- Test with real content editors

### 4. Development Workflow

```typescript
// Environment-specific configuration
const previewUrl = {
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_SITE_URL,
  draftMode: {
    enable: "/api/draft/enable",
    disable: "/api/draft/disable",
  },
};
```

## Related Documentation

- [Data Fetching](./data-fetching.md) - Loading draft content
- [Configuration](./configuration.md) - Visual editing setup
- [Components](./components.md) - Preview components
- [API Reference](./api-reference.md) - Visual editing API
