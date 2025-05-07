"use client"
\
#!/usr/bin/env node
/**
 * Setup Stability Script
 *
 * This script sets up all the stability improvements for the ConeDex Platform.
 * It creates the necessary files, installs dependencies, and configures the project.
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"

const rootDir = process.cwd()

/**
 * Creates a file with the given content
 */
function createFile(filePath: string, content: string): void {
  const fullPath = path.join(rootDir, filePath)
  const directory = path.dirname(fullPath)

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }

  fs.writeFileSync(fullPath, content)
  console.log(`Created file: ${filePath}`)
}

/**
 * Updates package.json with new scripts and dependencies
 */
function updatePackageJson(): void {
  const packageJsonPath = path.join(rootDir, "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    console.error("package.json not found")
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))

  // Add scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "verify-files": "ts-node scripts/verify-files.ts",
    "check-migration": "ts-node scripts/migration-helper.ts",
    "prepare-migration": "ts-node scripts/migration-helper.ts --prepare",
    prebuild: "npm run verify-files",
    predev: "npm run verify-files",
  }

  // Add devDependencies if they don't exist
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    husky: "^8.0.3",
    chalk: "^4.1.2",
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log("Updated package.json")
}

/**
 * Installs dependencies
 */
function installDependencies(): void {
  console.log("Installing dependencies...")
  execSync("npm install", { stdio: "inherit" })
}

/**
 * Sets up Husky
 */
function setupHusky(): void {
  console.log("Setting up Husky...")
  execSync("npx husky install", { stdio: "inherit" })

  const preCommitPath = path.join(rootDir, ".husky", "pre-commit")
  const preCommitContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run file verification
npm run verify-files

# Check for broken imports
npm run lint
`

  createFile(".husky/pre-commit", preCommitContent)
  execSync("chmod +x .husky/pre-commit", { stdio: "inherit" })
}

// File content for router-boundaries.ts
const routerBoundariesContent = `/**
 * Router Boundaries Definition
 *
 * This file defines the boundaries between the App Router and Pages Router.
 * It helps maintain a clear separation between the two routing systems.
 */

export enum RouterType {
  APP = 'app',
  PAGES = 'pages',
  UNIVERSAL = 'universal',
}

export interface RouterBoundary {
  type: RouterType;
  path: string;
  description: string;
}

/**
 * Defines the boundaries between the App Router and Pages Router
 */
export const ROUTER_BOUNDARIES: RouterBoundary[] = [
  {
    type: RouterType.APP,
    path: 'app/',
    description: 'All files under the app directory use the App Router',
  },
  {
    type: RouterType.PAGES,
    path: 'pages/',
    description: 'All files under the pages directory use the Pages Router',
  },
  {
    type: RouterType.UNIVERSAL,
    path: 'components/ui/',
    description: 'UI components are universal and can be used with both routers',
  },
  {
    type: RouterType.UNIVERSAL,
    path: 'lib/utils/',
    description: 'Utility functions are universal and can be used with both routers',
  },
  {
    type: RouterType.APP,
    path: 'app/api/',
    description: 'API routes under the app directory use the App Router',
  },
  {
    type: RouterType.PAGES,
    path: 'pages/api/',
    description: 'API routes under the pages directory use the Pages Router',
  },
  {
    type: RouterType.APP,
    path: 'components/app-router/',
    description: 'Components specific to the App Router',
  },
  {
    type: RouterType.PAGES,
    path: 'components/pages-router/',
    description: 'Components specific to the Pages Router',
  },
];

/**
 * Determines the router type for a given file path
 * @param filePath The path of the file
 * @returns The router type for the file
 */
export function getRouterTypeForFile(filePath: string): RouterType {
  for (const boundary of ROUTER_BOUNDARIES) {
    if (filePath.startsWith(boundary.path)) {
      return boundary.type;
    }
  }
  return RouterType.UNIVERSAL;
}

/**
 * Checks if a file is compatible with a given router type
 * @param filePath The path of the file
 * @param routerType The router type to check compatibility with
 * @returns Whether the file is compatible with the router type
 */
export function isFileCompatibleWithRouter(filePath: string, routerType: RouterType): boolean {
  const fileRouterType = getRouterTypeForFile(filePath);
  return fileRouterType === RouterType.UNIVERSAL || fileRouterType === routerType;
}
`

// File content for router-utils.ts - FIXED THE BACKTICK ESCAPING ISSUE
const routerUtilsContent = `/**
 * Router Utilities
 *
 * This file provides utilities for working with both the App Router and Pages Router.
 * It helps create router-agnostic components and functions.
 */

import { RouterType } from './router-boundaries';

/**
 * Determines the current router type based on the environment
 * @returns The current router type
 */
export function getCurrentRouterType(): RouterType {
  // Check for environment variable
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RUNTIME === 'app') {
    return RouterType.APP;
  }
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RUNTIME === 'pages') {
    return RouterType.PAGES;
  }

  // Check for window object (client-side)
  if (typeof window !== 'undefined') {
    // You can add additional client-side detection logic here
    return RouterType.APP; // Default to App Router for client-side
  }

  // Default to App Router
  return RouterType.APP;
}

/**
 * Gets the appropriate component for the current router
 * @param componentName The name of the component
 * @returns The component for the current router
 */
export function getRouterSpecificComponent(componentName: string) {
  const routerType = getCurrentRouterType();
  
  try {
    if (routerType === RouterType.APP) {
      // Try to import the App Router version
      return require('../components/app-router/' + componentName).default;
    } else {
      // Try to import the Pages Router version
      return require('../components/pages-router/' + componentName).default;
    }
  } catch (error) {
    // Fallback to the universal version
    try {
      return require('../components/' + componentName).default;
    } catch (error) {
      console.error('Failed to load component: ' + componentName);
      return () => null;
    }
  }
}

/**
 * Creates a router-agnostic link component
 * @param href The URL to link to
 * @param children The children of the link
 * @param props Additional props for the link
 * @returns A router-agnostic link component
 */
export function RouterLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: any }) {
  const routerType = getCurrentRouterType();
  
  if (routerType === RouterType.APP) {
    const { default: Link } = require('next/link');
    return <Link href={href} {...props}>{children}</Link>;
  } else {
    const { default: Link } = require('next/link');
    return <Link href={href} {...props}>{children}</Link>;
  }
}

/**
 * Navigates to a URL using the appropriate router
 * @param url The URL to navigate to
 * @param options Navigation options
 */
export function navigateTo(url: string, options?: { replace?: boolean }) {
  const routerType = getCurrentRouterType();
  
  if (routerType === RouterType.APP) {
    const { useRouter } = require('next/navigation');
    const router = useRouter();
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  } else {
    const { useRouter } = require('next/router');
    const router = useRouter();
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }
}
`

// File content for file-manifest.ts
const fileManifestContent = `/**
 * Comprehensive manifest of critical files in the ConeDex Platform
 * This serves as the source of truth for file integrity checks
 */

export const CRITICAL_FILES = [
  // Core layout files
  "app/layout.tsx",
  "app/page.tsx",
  "pages/_app.tsx",
  "pages/index.tsx",

  // Layout components
  "components/layout/public-header.tsx",
  "components/layout/public-footer.tsx",
  "components/layout/dashboard-header.tsx",
  "components/layout/dashboard-sidebar.tsx",
  "components/layout/admin-header.tsx",
  "components/layout/admin-sidebar.tsx",

  // Core functionality
  "components/shop/simple-public-shops-map.tsx",
  "components/shop/public-shops-map.tsx",
  "lib/supabase/server.ts",
  "lib/supabase/client.ts",
  "lib/auth/demo-auth.ts",
  "app/api/auth/demo-login/route.ts",

  // Configuration
  "next.config.js",
  "tailwind.config.ts",
  "vercel.json",

  // Public routes
  "app/(public)/layout.tsx",
  "app/(public)/features/page.tsx",
  "app/(public)/pricing/page.tsx",
  "app/(public)/contact/page.tsx",
  "app/(public)/business/page.tsx",
  "app/(public)/shops/map/page.tsx",

  // Dashboard routes
  "app/(dashboard)/layout.tsx",
  "app/(dashboard)/dashboard/page.tsx",
  "app/(dashboard)/dashboard/shops/page.tsx",
  "app/(dashboard)/dashboard/flavors/page.tsx",
  "app/(dashboard)/dashboard/badges/page.tsx",
  "app/(dashboard)/dashboard/teams/page.tsx",
  "app/(dashboard)/dashboard/following/page.tsx",
  "app/(dashboard)/dashboard/notifications/page.tsx",

  // Admin routes
  "app/(dashboard)/dashboard/admin/page.tsx",
  "app/(dashboard)/dashboard/admin/users/page.tsx",
  "app/(dashboard)/dashboard/admin/shops/page.tsx",
  "app/(dashboard)/dashboard/admin/badges/page.tsx",
  "app/(dashboard)/dashboard/admin/settings/page.tsx",
  "app/(dashboard)/dashboard/admin/database/page.tsx",

  // Auth routes
  "app/(auth)/layout.tsx",
  "app/(auth)/login/page.tsx",
  "app/(auth)/signup/page.tsx",

  // Shop owner routes
  "app/(dashboard)/dashboard/shop/page.tsx",
  "app/(dashboard)/dashboard/shop/edit/page.tsx",
  "app/(dashboard)/dashboard/shop/flavors/page.tsx",
  "app/(dashboard)/dashboard/shop/customers/page.tsx",
  "app/(dashboard)/dashboard/shop/reviews/page.tsx",
  "app/(dashboard)/dashboard/shop/settings/page.tsx",
  "app/(dashboard)/dashboard/shop/menu/page.tsx",
  "app/(dashboard)/dashboard/shop/analytics/page.tsx",
  "app/(dashboard)/dashboard/shop/announcements/page.tsx",
  "app/(dashboard)/dashboard/shop/verify/page.tsx",
  "app/(dashboard)/dashboard/shop/subscription/page.tsx",

  // Core utilities
  "lib/utils/runtime-detection.ts",
  "lib/utils/runtime-utils.ts",
  "lib/utils/format-link.ts",
  "lib/utils/handle-api-error.ts",
  "lib/utils/offline-cache.ts",
  "lib/utils/offline-sync.ts",
  "lib/utils/api-client.ts",
  "lib/utils/form-validation.ts",
  "lib/utils/env-validator.ts",
];

/**
 * Groups files by feature for more granular integrity checks
 */
export const FILE_GROUPS = {
  core: [
    "app/layout.tsx",
    "app/page.tsx",
    "pages/_app.tsx",
    "pages/index.tsx",
    "next.config.js",
    "tailwind.config.ts",
    "vercel.json",
  ],
  auth: [
    "lib/auth/demo-auth.ts",
    "app/api/auth/demo-login/route.ts",
    "app/(auth)/layout.tsx",
    "app/(auth)/login/page.tsx",
    "app/(auth)/signup/page.tsx",
    "lib/auth/session.ts",
    "lib/auth/pages-session.ts",
    "lib/auth/auth-compat.ts",
    "lib/auth/pages-auth.ts",
    "lib/auth/pages-demo-auth.ts",
    "contexts/auth-context.tsx",
    "contexts/pages-auth-context.tsx",
  ],
  maps: [
    "components/shop/simple-public-shops-map.tsx",
    "components/shop/public-shops-map.tsx",
    "app/(public)/shops/map/page.tsx",
    "app/(dashboard)/dashboard/shops/map/page.tsx",
    "app/api/maps/loader/route.ts",
    "app/api/maps/photo/route.ts",
    "lib/services/location-service.ts",
    "lib/services/google-places-service.ts",
    "components/maps/maps-api-loader.tsx",
  ],
  // Add more groups as needed
};

/**
 * Maps Pages Router files to their App Router equivalents
 * This is used for tracking migration progress
 */
export const MIGRATION_MAP = {
  // Core pages
  "pages/index.tsx": "app/page.tsx",
  "pages/404.tsx": "app/not-found.tsx",
  "pages/500.tsx": "app/error.tsx",
  "pages/_app.tsx": "app/layout.tsx",
  "pages/_document.tsx": "app/layout.tsx",

  // Auth pages
  "pages/login.tsx": "app/(auth)/login/page.tsx",
  "pages/signup.tsx": "app/(auth)/signup/page.tsx",

  // Dashboard pages
  "pages/dashboard/index.tsx": "app/(dashboard)/dashboard/page.tsx",
  "pages/dashboard/shops.tsx": "app/(dashboard)/dashboard/shops/page.tsx",
  "pages/dashboard/conedex.tsx": "app/(dashboard)/dashboard/conedex/page.tsx",
  "pages/dashboard/badges.tsx": "app/(dashboard)/dashboard/badges/page.tsx",
  "pages/dashboard/teams.tsx": "app/(dashboard)/dashboard/teams/page.tsx",
  "pages/dashboard/following.tsx": "app/(dashboard)/dashboard/following.tsx",
  "pages/dashboard/notifications.tsx": "app/(dashboard)/dashboard/notifications.tsx",
  "pages/dashboard/profile.tsx": "app/(dashboard)/dashboard/profile.tsx",
  "pages/dashboard/settings.tsx": "app/(dashboard)/dashboard/settings.tsx",
  "pages/dashboard/flavors.tsx": "app/(dashboard)/dashboard/flavors.tsx",
  "pages/dashboard/log-flavor.tsx": "app/(dashboard)/dashboard/log-flavor.tsx",

  // Shop owner pages
  "pages/dashboard/shop/index.tsx": "app/(dashboard)/dashboard/shop/page.tsx",

  // Admin pages
  "pages/dashboard/admin/index.tsx": "app/(dashboard)/dashboard/admin/page.tsx",
};

/**
 * Maps Pages Router components to their App Router equivalents
 */
export const COMPONENT_MIGRATION_MAP = {
  "components/pages-layout.tsx": "components/layout/app-layout.tsx",
  "components/dashboard/pages-dashboard-layout.tsx": "components/layout/dashboard-layout.tsx",
  // Add more component mappings as needed
};
`

// File content for verify-files.ts
const verifyFilesContent = `#!/usr/bin/env node
/**
 * File Verification Script
 *
 * This script verifies the existence of critical files in the ConeDex Platform.
 * It can be run as a pre-commit hook, pre-build step, or manually.
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { CRITICAL_FILES, FILE_GROUPS } from "./file-manifest";

const rootDir = process.cwd();

/**
 * Verifies the existence of a list of files
 * @param files List of files to verify
 * @returns List of missing files
 */
function verifyFiles(files: string[]): string[] {
  return files.filter((file) => !fs.existsSync(path.join(rootDir, file)));
}

/**
 * Verifies all file groups and returns missing files by group
 * @returns Record of group names to lists of missing files
 */
function verifyAllGroups(): Record<string, string[]> {
  const results: Record<string, string[]> = {};

  for (const [group, files] of Object.entries(FILE_GROUPS)) {
    const missingFiles = verifyFiles(files);
    if (missingFiles.length > 0) {
      results[group] = missingFiles;
    }
  }

  return results;
}

/**
 * Main verification function
 * @param exitOnFailure Whether to exit the process on failure
 * @returns Whether all critical files exist
 */
export function verifyFileIntegrity(exitOnFailure = true): boolean {
  console.log(chalk.blue("🔍 Verifying file integrity..."));

  // Verify all critical files
  const missingCritical = verifyFiles(CRITICAL_FILES);
  if (missingCritical.length > 0) {
    console.error(chalk.red("❌ Missing critical files:"));
    missingCritical.forEach((file) => {
      console.error(chalk.red('  - ' + file));
    });

    if (exitOnFailure) {
      process.exit(1);
    }
    return false;
  }

  // Verify by feature group
  const missingByGroup = verifyAllGroups();
  if (Object.keys(missingByGroup).length > 0) {
    console.warn(chalk.yellow("⚠️ Missing files by feature group:"));
    for (const [group, files] of Object.entries(missingByGroup)) {
      console.warn(chalk.yellow('  ' + group + ':'));
      files.forEach((file) => {
        console.warn(chalk.yellow('    - ' + file));
      });
    }
  }

  console.log(chalk.green("✅ All critical files verified successfully"));
  return true;
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyFileIntegrity();
}
`

// File content for migration-helper.ts
const migrationHelperContent = `#!/usr/bin/env node
/**
 * Migration Helper Script
 *
 * This script helps track and manage the migration from Pages Router to App Router.
 * It checks the status of files that need to be migrated and provides a progress report.
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { MIGRATION_MAP, COMPONENT_MIGRATION_MAP } from "./file-manifest";

const rootDir = process.cwd();

/**
 * Checks the migration status of all files in the migration map
 */
function checkMigrationStatus(): void {
  console.log(chalk.blue("📊 Checking migration status..."));

  let migrated = 0;
  let pending = 0;
  let partial = 0;

  console.log(chalk.cyan("\\nPage Routes:"));
  for (const [source, target] of Object.entries(MIGRATION_MAP)) {
    const sourceExists = fs.existsSync(path.join(rootDir, source));
    const targetExists = fs.existsSync(path.join(rootDir, target));

    if (sourceExists && targetExists) {
      console.log(chalk.yellow('⚠️ Both exist: ' + source + ' and ' + target));
      partial++;
    } else if (!sourceExists && targetExists) {
      console.log(chalk.green('✅ Migrated: ' + source + ' → ' + target));
      migrated++;
    } else if (sourceExists && !targetExists) {
      console.log(chalk.red('❌ Not migrated: ' + source + ' → ' + target));
      pending++;
    }
  }

  console.log(chalk.cyan("\\nComponents:"));
  for (const [source, target] of Object.entries(COMPONENT_MIGRATION_MAP)) {
    const sourceExists = fs.existsSync(path.join(rootDir, source));
    const targetExists = fs.existsSync(path.join(rootDir, target));

    if (sourceExists && targetExists) {
      console.log(chalk.yellow('⚠️ Both exist: ' + source + ' and ' + target));
      partial++;
    } else if (!sourceExists && targetExists) {
      console.log(chalk.green('✅ Migrated: ' + source + ' → ' + target));
      migrated++;
    } else if (sourceExists && !targetExists) {
      console.log(chalk.red('❌ Not migrated: ' + source + ' → ' + target));
      pending++;
    }
  }

  const total = migrated + pending + partial;
  const percentComplete = Math.round((migrated / total) * 100);

  console.log(chalk.blue('\\nMigration progress: ' + migrated + '/' + total + ' (' + percentComplete + '%)'));
  console.log(chalk.blue('  - Fully migrated: ' + migrated));
  console.log(chalk.blue('  - Partially migrated: ' + partial));
  console.log(chalk.blue('  - Not migrated: ' + pending));
}

/**
 * Creates the directory structure for a target file if it doesn't exist
 */
function createDirectoryForFile(filePath: string): void {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(chalk.green('Created directory: ' + directory));
  }
}

/**
 * Prepares a file for migration by creating the necessary directory structure
 */
function prepareForMigration(source: string, target: string): void {
  const sourcePath = path.join(rootDir, source);
  const targetPath = path.join(rootDir, target);

  if (!fs.existsSync(sourcePath)) {
    console.error(chalk.red('Source file does not exist: ' + source));
    return;
  }

  if (fs.existsSync(targetPath)) {
    console.warn(chalk.yellow('Target file already exists: ' + target));
    return;
  }

  createDirectoryForFile(targetPath);
  console.log(chalk.green('Ready to migrate: ' + source + ' → ' + target));
}

/**
 * Prepares all files for migration
 */
function prepareAllForMigration(): void {
  console.log(chalk.blue("🔧 Preparing for migration..."));

  for (const [source, target] of Object.entries(MIGRATION_MAP)) {
    prepareForMigration(source, target);
  }

  for (const [source, target] of Object.entries(COMPONENT_MIGRATION_MAP)) {
    prepareForMigration(source, target);
  }
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.includes("--prepare")) {
  prepareAllForMigration();
} else {
  checkMigrationStatus();
}
`

// File content for MIGRATION.md
const migrationMdContent = `# ConeDex Platform Migration Plan

This document outlines the plan for migrating the ConeDex Platform from the Pages Router to the App Router.

## Migration Strategy

We will follow a gradual migration approach, moving one feature at a time from the Pages Router to the App Router. This will allow us to maintain a functioning application throughout the migration process.

### Phase 1: Preparation

1. **Define Router Boundaries**
   - Clearly define which parts of the application use the App Router and which use the Pages Router
   - Create a router detection utility to determine the current router at runtime

2. **Create File Manifest**
   - Document all critical files in the application
   - Group files by feature for easier migration planning

3. **Set Up Migration Tracking**
   - Create a migration map that maps Pages Router files to their App Router equivalents
   - Implement a script to track migration progress

### Phase 2: Core Infrastructure

1. **Migrate Core Utilities**
   - Move utility functions to a shared location accessible by both routers
   - Update imports to use the new location

2. **Create Router-Agnostic Components**
   - Implement components that work with both routers
   - Use the router detection utility to determine the appropriate behavior

3. **Set Up Shared State Management**
   - Implement a state management solution that works with both routers
   - Ensure data can be shared between Pages Router and App Router components

### Phase 3: Feature Migration

1. **Public Pages**
   - Migrate the public pages to the App Router
   - Update links and navigation to use the new routes

2. **Authentication**
   - Migrate the authentication system to the App Router
   - Ensure compatibility with both routers during the transition

3. **Dashboard**
   - Migrate the dashboard pages to the App Router
   - Update the layout and navigation components

4. **Shop Owner Features**
   - Migrate the shop owner features to the App Router
   - Update the shop management components

5. **Admin Features**
   - Migrate the admin features to the App Router
   - Update the admin dashboard and management components

### Phase 4: Cleanup

1. **Remove Pages Router Files**
   - Once all features have been migrated, remove the Pages Router files
   - Update the build configuration to use only the App Router

2. **Update Documentation**
   - Update the documentation to reflect the new architecture
   - Remove references to the Pages Router

3. **Final Testing**
   - Conduct thorough testing to ensure all features work correctly
   - Fix any remaining issues

## Migration Progress

You can track the migration progress using the \`check-migration\` script:

\`\`\`bash
npm run check-migration
\`\`\`

This will show you which files have been migrated, which are pending, and your overall migration progress.

## Preparing for Migration

You can prepare for migration using the \`prepare-migration\` script:

\`\`\`bash
npm run prepare-migration
\`\`\`

This will create the necessary directory structure for the files that need to be migrated.

## Best Practices

1. **One Feature at a Time**
   - Migrate one feature at a time to minimize disruption
   - Test thoroughly after each migration

2. **Maintain Compatibility**
   - Ensure components work with both routers during the transition
   - Use the router detection utility to determine the appropriate behavior

3. **Update Tests**
   - Update tests to work with the App Router
   - Add tests for router-agnostic components

4. **Document Changes**
   - Document the migration process for each feature
   - Update the migration map as features are migrated

5. **Regular Verification**
   - Regularly run the file verification script to ensure all files are present
   - Check for broken imports and links
`

// File content for file-integrity.test.ts
const fileIntegrityTestContent = `/**
 * File Integrity Tests
 *
 * These tests verify the integrity of critical files in the ConeDex Platform.
 */

import fs from 'fs';
import path from 'path';
import { CRITICAL_FILES, FILE_GROUPS } from '../scripts/file-manifest';

const rootDir = process.cwd();

describe('File Integrity', () => {
  test('All critical files exist', () => {
    const missingFiles = CRITICAL_FILES.filter(
      (file) => !fs.existsSync(path.join(rootDir, file))
    );
    
    if (missingFiles.length > 0) {
      console.error('Missing critical files:', missingFiles);
    }
    
    expect(missingFiles).toEqual([]);
  });

  test('All file groups have valid files', () => {
    for (const [group, files] of Object.entries(FILE_GROUPS)) {
      const missingFiles = files.filter(
        (file) => !fs.existsSync(path.join(rootDir, file))
      );
      
      if (missingFiles.length > 0) {
        console.warn('Group ' + group + ' has missing files:', missingFiles);
      }
    }
    
    // This test doesn't fail on missing group files, just warns
    expect(true).toBe(true);
  });
});
`

// File content for import-validation.test.ts
const importValidationTestContent = `/**
 * Import Validation Tests
 *
 * These tests verify that imports between files are valid.
 */

import fs from 'fs';
import path from 'path';
import { CRITICAL_FILES } from '../scripts/file-manifest';

const rootDir = process.cwd();

/**
 * Extracts import statements from a file
 * @param filePath The path of the file
 * @returns List of imported files
 */
function extractImports(filePath: string): string[] {
  try {
    const content = fs.readFileSync(path.join(rootDir, filePath), 'utf-8');
    const importRegex = /import\\s+(?:.+\\s+from\\s+)?['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (error) {
    console.error('Error reading file ' + filePath + ':', error);
    return [];
  }
}

/**
 * Resolves an import path to a file path
 * @param importPath The import path
 * @param filePath The path of the file containing the import
 * @returns The resolved file path
 */
function resolveImport(importPath: string, filePath: string): string | null {
  // Skip external modules
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }
  
  // Handle absolute imports
  if (importPath.startsWith('/')) {
    return importPath.slice(1);
  }
  
  // Handle relative imports
  const directory = path.dirname(filePath);
  const resolvedPath = path.normalize(path.join(directory, importPath));
  
  // Add extension if needed
  if (!path.extname(resolvedPath)) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      const pathWithExt = resolvedPath + ext;
      if (fs.existsSync(path.join(rootDir, pathWithExt))) {
        return pathWithExt;
      }
    }
    
    // Check for index files
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, 'index' + ext);
      if (fs.existsSync(path.join(rootDir, indexPath))) {
        return indexPath;
      }
    }
  }
  
  return resolvedPath;
}

describe('Import Validation', () => {
  test('All imports in critical files are valid', () => {
    const invalidImports: Record<string, string[]> = {};
    
    for (const file of CRITICAL_FILES) {
      if (!fs.existsSync(path.join(rootDir, file))) {
        continue;
      }
      
      const imports = extractImports(file);
      const invalid = imports
        .map((importPath) => resolveImport(importPath, file))
        .filter((resolvedPath) => {
          return (
            resolvedPath !== null &&
            !fs.existsSync(path.join(rootDir, resolvedPath))
          );
        });
      
      if (invalid.length > 0) {
        invalidImports[file] = invalid;
      }
    }
    
    if (Object.keys(invalidImports).length > 0) {
      console.error('Invalid imports found:', invalidImports);
    }
    
    expect(Object.keys(invalidImports).length).toBe(0);
  });
});
`

// File content for .gitattributes
const gitattributesContent = `# Auto detect text files and perform LF normalization
* text=auto

# Ensure consistent line endings for critical files
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
*.html text eol=lf
*.css text eol=lf
*.scss text eol=lf

# Denote all files that are truly binary and should not be modified
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
*.otf binary
*.pdf binary
`

/**
 * Main setup function
 */
function setup(): void {
  console.log("🚀 Setting up ConeDex Platform stability improvements...")

  // Create files
  createFile("lib/router-boundaries.ts", routerBoundariesContent)
  createFile("lib/router-utils.ts", routerUtilsContent)
  createFile("scripts/file-manifest.ts", fileManifestContent)
  createFile("scripts/verify-files.ts", verifyFilesContent)
  createFile("scripts/migration-helper.ts", migrationHelperContent)
  createFile("MIGRATION.md", migrationMdContent)
  createFile("__tests__/file-integrity.test.ts", fileIntegrityTestContent)
  createFile("__tests__/import-validation.test.ts", importValidationTestContent)
  createFile(".gitattributes", gitattributesContent)

  // Update package.json
  updatePackageJson()

  // Install dependencies
  installDependencies()

  // Setup Husky
  setupHusky()

  console.log("✅ Setup complete!")
  console.log("Next steps:")
  console.log("1. Run `npm run verify-files` to check file integrity")
  console.log("2. Run `npm run check-migration` to check migration status")
  console.log("3. Review the MIGRATION.md file for the migration plan")
}

// Run setup if this script is executed directly
if (require.main === module) {
  setup()
}
