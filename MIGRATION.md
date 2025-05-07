# App Router Migration Plan

This document outlines the step-by-step plan for migrating the ConeDex Platform from the Pages Router to the App Router architecture.

## Why Migrate?

The App Router is the future of Next.js routing and offers several advantages:

- **Server Components**: Better performance and smaller bundle sizes
- **Nested Layouts**: More flexible and powerful layout system
- **Data Fetching**: Simplified data fetching with async/await
- **Streaming**: Improved loading states and partial rendering
- **Route Handlers**: More powerful API routes

## Migration Phases

### Phase 1: Preparation (Current)

- [x] Add runtime detection (`NEXT_PUBLIC_RUNTIME` environment variable)
- [x] Create file manifest and verification system
- [x] Define router boundaries
- [ ] Create router-agnostic shared components
- [ ] Document all Pages Router specific code

### Phase 2: Component Migration

- [ ] Create shared component library that works in both routers
- [ ] Migrate layout components to App Router
- [ ] Create App Router equivalents for all Pages components
- [ ] Update all imports to use the new components

### Phase 3: Route Migration

- [ ] Migrate public routes to App Router
- [ ] Migrate dashboard routes to App Router
- [ ] Migrate authentication routes to App Router
- [ ] Migrate admin routes to App Router
- [ ] Migrate shop owner routes to App Router

### Phase 4: API Migration

- [ ] Migrate API routes to Route Handlers
- [ ] Update client-side code to use new API routes
- [ ] Implement server actions where appropriate

### Phase 5: Data Fetching Migration

- [ ] Replace `getServerSideProps` with async Server Components
- [ ] Replace `getStaticProps` with async Server Components
- [ ] Update client-side data fetching to use React Query or SWR

### Phase 6: Testing and Validation

- [ ] Create comprehensive test suite for App Router routes
- [ ] Validate all features work correctly in App Router
- [ ] Ensure performance is equal or better than Pages Router

### Phase 7: Cleanup

- [ ] Remove Pages Router specific code
- [ ] Remove runtime detection logic
- [ ] Update documentation
- [ ] Remove duplicate routes

## Migration Helpers

We have created several tools to help with the migration:

- `npm run check-migration`: Check the status of the migration
- `npm run prepare-migration`: Prepare files for migration by creating the necessary directory structure
- `npm run verify-files`: Verify that all critical files exist

## Best Practices

1. **Migrate one route at a time**: Start with simple routes and gradually move to more complex ones
2. **Test thoroughly**: Ensure each migrated route works correctly before moving on
3. **Use feature flags**: Allow switching between old and new implementations
4. **Keep both implementations until ready**: Don't remove Pages Router code until App Router is fully tested
5. **Update documentation**: Document changes as you go

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
\`\`\`

## 5. Automated Testing for File Integrity
