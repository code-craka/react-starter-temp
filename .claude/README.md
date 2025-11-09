# Claude Desktop Configuration for Taskcoda

This folder contains custom Claude Desktop settings and skills for the Taskcoda project by TechSci, Inc.

## Overview

These configuration files help Claude provide context-aware assistance for Taskcoda development by:
- Understanding the project architecture and patterns
- Providing accurate code examples from the actual codebase
- Following established conventions and best practices
- Maintaining security and compliance requirements

## Files

### settings.json
Project-level configuration including:
- Project name and description
- Custom instructions for Claude
- Code conventions and standards
- Key file references

### skills/
Custom skills directory containing specialized knowledge:

| Skill File | Description |
|------------|-------------|
| `taskcoda-architecture.md` | Complete architecture overview, database schema, and system design |
| `convex-development.md` | Convex backend patterns: queries, mutations, actions, schema design |
| `admin-panel-development.md` | Super admin features and backend implementation |
| `billing-integration.md` | Polar.sh payment integration and subscription management |
| `frontend-development.md` | React Router v7 patterns, components, and UI development |
| `security-compliance.md` | Security practices, RBAC, audit logging, compliance features |
| `deployment.md` | Deployment procedures, environment setup, CI/CD pipelines |

## Usage in Claude Desktop

1. **Automatic Loading**: When you open this project folder in Claude Desktop, these settings are automatically loaded

2. **Referencing Skills**: In your prompts, you can reference specific skills:
   ```
   "Using the convex-development skill, help me create a new mutation for..."
   "Based on the taskcoda-architecture skill, where should I add..."
   ```

3. **Context-Aware Responses**: Claude will use these skills to provide answers specific to Taskcoda's architecture and patterns

## Custom Instructions

When working with Taskcoda, Claude will:
- ✅ Follow established code patterns from convex/ and app/ directories
- ✅ Implement proper authentication checks with Clerk
- ✅ Add RBAC permission checks for protected operations
- ✅ Create audit logs for compliance-critical actions
- ✅ Track usage metrics for billing features
- ✅ Use structured logging with Pino
- ✅ Maintain TypeScript type safety
- ✅ Include tests for new features
- ✅ Consider security implications (OWASP top 10)
- ✅ Follow multi-tenancy patterns for organizations

## Code Conventions

### TypeScript
- Strict mode enabled
- Functional components with hooks
- Async/await for asynchronous operations
- Proper error handling with try/catch

### Naming
- `camelCase`: variables, functions, file names
- `PascalCase`: React components, TypeScript types/interfaces
- `UPPER_CASE`: constants, environment variables

### Imports
```typescript
// App imports use ~ alias
import { Button } from "~/components/ui/button";
import { logger } from "~/lib/logger";

// Convex imports use absolute paths
import { api } from "~/convex/_generated/api";
import { mutation } from "./_generated/server";
```

### File Organization
```
- Routes: app/routes/{feature}/{page}.tsx
- Components: app/components/{category}/{component}.tsx
- Convex: convex/{feature}.ts
- Tests: tests/{type}/{feature}.test.ts
```

## Example Workflows

### Adding a New Feature
1. Define database schema in `convex/schema.ts` if needed
2. Create Convex mutations/queries in `convex/`
3. Add frontend routes in `app/routes/`
4. Create UI components in `app/components/`
5. Add authentication and RBAC checks
6. Implement audit logging
7. Track usage metrics if applicable
8. Write tests (unit + E2E)
9. Update documentation

### Debugging Issues
1. Check Sentry for error reports
2. Review structured logs (Pino)
3. Query audit logs for recent actions
4. Inspect Convex dashboard for data
5. Test locally with `npm run dev`

### Deploying Changes
1. Run tests: `npm run test:all`
2. Type check: `npm run typecheck`
3. Build: `npm run build`
4. Deploy Convex: `npx convex deploy`
5. Deploy to Vercel (automatic on push)
6. Monitor Sentry for errors

## Skill Content

Each skill file contains:
- **Overview**: What the skill covers
- **Code Patterns**: Real examples from the codebase
- **Best Practices**: Established conventions
- **Common Tasks**: Step-by-step guides
- **Troubleshooting**: Common issues and solutions
- **References**: Links to relevant documentation

All code examples in skills are extracted from the actual Taskcoda codebase, ensuring accuracy and relevance.

## Updating Skills

When the codebase evolves significantly:
1. Review and update relevant skill files
2. Add new patterns and examples
3. Remove deprecated approaches
4. Update code examples to match current implementation
5. Keep security and compliance sections current

## Resources

- **Main Documentation**: `/Claude.md` - Complete project overview
- **Testing Guide**: `/docs/TESTING.md` - Testing infrastructure and patterns
- **Codebase**: Explore `app/` and `convex/` directories for implementation details

## Contact

- **Company**: TechSci, Inc.
- **Email**: hello@techsci.io
- **Product**: Taskcoda - Enterprise Task Management

---

**These skills help Claude provide expert, context-aware assistance tailored specifically to Taskcoda's architecture and requirements.**
