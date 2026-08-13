# Pełna struktura projektu

```text
cinematic-photography-gallery/
├── app/
│   ├── (public)/
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── collections/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── gallery/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin/
│   │   ├── (protected)/
│   │   │   ├── collections/
│   │   │   │   └── page.tsx
│   │   │   ├── photos/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── actions.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── login/
│   │       ├── actions.ts
│   │       └── page.tsx
│   ├── api/
│   │   └── admin/
│   │       ├── collections/
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── route.ts
│   │       ├── photos/
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── route.ts
│   │       └── settings/
│   │           └── route.ts
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── opengraph-image.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   └── twitter-image.tsx
├── components/
│   ├── admin/
│   │   ├── admin-nav.tsx
│   │   ├── collection-manager.tsx
│   │   ├── delete-photo-button.tsx
│   │   ├── login-form.tsx
│   │   ├── photo-editor-form.tsx
│   │   └── settings-form.tsx
│   ├── gallery/
│   │   ├── collection-card.tsx
│   │   ├── gallery-grid.tsx
│   │   ├── pagination.tsx
│   │   ├── photo-card.tsx
│   │   └── search-filters.tsx
│   ├── photo/
│   │   ├── photo-map.tsx
│   │   ├── photo-viewer.tsx
│   │   └── share-button.tsx
│   ├── site/
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── hero.tsx
│   │   ├── mobile-nav.tsx
│   │   └── offline-notice.tsx
│   └── ui/
│       ├── resilient-image.tsx
│       └── reveal.tsx
├── lib/
│   ├── admin/
│   │   ├── auth.ts
│   │   ├── image-client.ts
│   │   └── security.ts
│   ├── i18n/
│   │   ├── en.ts
│   │   ├── index.ts
│   │   └── pl.ts
│   ├── supabase/
│   │   ├── browser.ts
│   │   ├── proxy.ts
│   │   ├── public.ts
│   │   └── server.ts
│   ├── validation/
│   │   └── photo.ts
│   ├── data.ts
│   ├── env.ts
│   └── utils.ts
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── portrait-placeholder.svg
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── types/
│   └── database.ts
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── PROJECT_STRUCTURE.md
├── proxy.ts
├── README.md
└── tsconfig.json
```

Pliki `node_modules/`, `.next/` i lokalne zmienne środowiskowe są celowo pominięte.
