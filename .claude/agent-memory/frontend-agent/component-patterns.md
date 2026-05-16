---
name: component-patterns
description: EPilots common patterns — auth guard, feature gating, API client, layout components
metadata:
  type: project
---

## Auth guard pattern
Every protected page uses:
```tsx
const { user, isAuthenticated, isLoading: authLoading } = useAuth()
if (!authLoading && !isAuthenticated) router.push('/auth/login')
```

## Feature gating
```tsx
const { gate, handleError, clearGate } = useFeatureGate()
// In API catch: if (handleError(err)) return
// Gate modal render: if (gate) return <SubscriptionRequiredModal ... />
```

## Layout
All student pages render `<Navbar>` + `<Breadcrumbs />` at top.

## API client
- Singleton `apiClient` from `src/lib/api.ts`
- `apiClient.request(endpoint, axiosConfig)` for JSON
- `apiClient.getBlob(endpoint)` for file downloads
- `apiClient.downloadMaterial(id)` returns Blob

## Key components
- `src/components/Navbar.tsx` — fixed header, red theme
- `src/components/Breadcrumbs.tsx` — sticky below navbar
- `src/components/SubscriptionRequiredModal.tsx` — gate modal
- `src/components/PdfViewerModal.tsx` — full-screen PDF viewer (blob URL approach)
- `src/components/Pagination.tsx` — reusable page nav
- `src/components/MaterialRow.tsx` — table row for materials list
- `src/components/MaterialsTableSkeleton.tsx` — loading skeleton

**Why:** Consistent patterns across all pages.
**How to apply:** Always follow these patterns when creating new student-facing pages.
