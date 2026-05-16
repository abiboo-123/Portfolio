# AI Contract

This document defines the engineering rules that any AI assistant, automation agent, or contributor must follow when making changes to this project.

The goal is simple:

- preserve code quality
- protect maintainability
- avoid fragile shortcuts
- extend the system using reusable patterns only

These rules are mandatory for all future code changes.

## Core Principles

- Build for maintainability, not just immediate success
- Prefer clarity over cleverness
- Keep solutions consistent with the existing architecture
- Reuse established patterns before introducing new ones
- Make code easier to extend after every change
- Do not ship temporary fixes disguised as final solutions

## No Quick Hacks

Quick hacks are explicitly forbidden.

This includes:

- patching symptoms without addressing the root cause
- hardcoding values that should be configurable or derived
- duplicating logic to avoid proper abstraction
- bypassing validation, typing, or error handling
- adding one-off conditionals that do not generalize
- introducing special-case code without architectural justification
- silencing TypeScript or lint issues instead of resolving them correctly

If a requested change appears to require a shortcut, the implementation must pause and choose a maintainable design instead.

## Reusable Patterns Only

Every meaningful change should either:

- reuse an existing project pattern, or
- introduce a clearly reusable pattern that can support future work

Avoid:

- feature-specific micro-patterns
- isolated helper functions with no architectural home
- UI logic embedded in unrelated components
- repeated fetch, validation, or transformation logic across files

New abstractions should be introduced only when they improve consistency, readability, or extensibility.

## Coding Standards

- Use clear, descriptive naming for variables, functions, components, and files
- Prefer small, focused functions with a single responsibility
- Keep modules cohesive and avoid mixing unrelated concerns
- Remove dead code instead of leaving commented-out fragments behind
- Keep comments rare and useful
- Write code that explains itself before adding comments
- Favor explicit control flow over hidden behavior
- Handle error states intentionally
- Preserve accessibility and semantic HTML when editing UI
- Do not introduce unnecessary dependencies when the project already has a suitable pattern

### File and Module Discipline

- A file should have one clear purpose
- Shared logic belongs in `lib/` or another clearly shared layer
- UI primitives and reusable presentation logic belong in `components/`
- Admin-only UI logic should remain inside admin-specific components or routes
- API-related parsing, validation, and transformation logic should not be scattered across multiple unrelated files

## Architecture Rules

- Respect the current separation between public pages, admin UI, API routes, and shared utilities
- Do not move business logic into presentation components unless the logic is purely view-related
- Keep privileged operations on the server only
- Do not expose secrets, service-role access, or trusted mutations to the browser
- Prefer server-side data loading for page rendering when the data is needed at render time
- Prefer API routes for authenticated mutations and side effects
- Keep middleware focused on routing and access control, not business logic
- Avoid introducing coupling between unrelated route areas
- When adding a new pattern, ensure it fits the existing Next.js App Router structure

### Layer Responsibilities

- `app/` is responsible for routing, layouts, page composition, and route handlers
- `components/` is responsible for reusable UI
- `lib/` is responsible for shared logic, integration helpers, validation, and data utilities
- `types/` is responsible for shared domain typing

No layer should absorb responsibilities that belong to another.

## TypeScript Rules

- Maintain strict TypeScript quality
- Do not use `any` unless there is no reasonable alternative and the use is explicitly justified
- Prefer explicit domain types over loosely shaped objects
- Reuse shared types from `types/` or shared modules before introducing duplicates
- Narrow unknown data at the boundary, especially for request payloads and external responses
- Validate runtime input instead of assuming TypeScript types guarantee runtime safety
- Prefer discriminated or constrained unions where they improve correctness
- Keep function return types predictable
- Do not suppress errors with unsafe casts unless the cast is truly justified and contained

### Type Boundaries

- External input should be treated as `unknown` until parsed or validated
- API request and response shapes should be explicit
- Database records used across multiple modules should have shared types
- Nullable fields must be handled intentionally, not ignored

## Component Conventions

- Components should be focused, readable, and composable
- Prefer presentational components that receive explicit props
- Keep data fetching out of client components unless interactivity requires it
- Keep client components limited to browser-only behavior such as event handlers, local state, effects, uploads, and auth interactions
- Avoid oversized components that mix layout, business logic, validation, data access, and state orchestration
- Reuse existing UI conventions for spacing, typography, and interaction patterns
- Preserve responsive behavior when editing layouts
- Use semantic HTML and accessible labels for forms and controls

### Server and Client Component Expectations

- Default to server components unless client behavior is required
- Add `"use client"` only when necessary
- Do not convert a server component to a client component just for convenience
- Keep server/client boundaries deliberate and minimal

### Props and Composition

- Use explicit prop interfaces
- Avoid prop shapes that are too broad or ambiguous
- Prefer composition over deeply nested conditional rendering
- Do not pass raw backend response objects through the tree if a narrower UI shape would be clearer

## API Conventions

- Keep API routes consistent in structure and response style
- Authenticate and authorize before privileged operations
- Validate and sanitize incoming data at the route boundary
- Return clear HTTP status codes
- Return stable JSON response shapes
- Log server-side failures with enough context for debugging, without leaking secrets
- Keep route handlers thin when possible by extracting reusable logic into `lib/`
- Do not duplicate request parsing and validation logic across routes if it can be shared safely

### API Design Rules

- Use nouns and nested resources consistently
- Keep route behavior aligned with HTTP method semantics
- Reject malformed or incomplete input early
- Avoid hidden side effects
- Multi-step mutations should be implemented carefully to reduce inconsistency risk
- File uploads must validate content type, size, and storage destination

### Security Rules

- Never trust client input
- Never expose service-role credentials to the client
- Never move privileged writes into browser-side code
- Protect admin-only functionality with both route protection and server-side checks
- Treat authentication as necessary but not sufficient when authorization boundaries matter

## Data and Validation Rules

- Data access should remain explicit and understandable
- Shared queries and transformations should live in reusable helpers when used in more than one place
- Validation should happen at system boundaries, especially in API routes
- Sanitization should be applied where user input enters the system
- Do not rely on UI validation alone
- Preserve data consistency when updating related records
- Reordering logic, batch updates, and destructive actions must be handled carefully and predictably

## Refactoring Expectations

- Leave touched code cleaner than you found it
- If you must work around an existing weakness, reduce the weakness rather than deepening it
- Consolidate duplication when it is directly relevant to the change
- Do not perform broad speculative refactors unrelated to the task
- If an architectural issue is discovered but cannot be fixed within scope, document it clearly instead of burying it

## Definition of Done

A change is not complete unless it:

- fits the project’s architectural boundaries
- uses consistent naming and structure
- maintains or improves type safety
- avoids duplication where reuse is appropriate
- handles edge cases and failures intentionally
- preserves security boundaries
- is understandable by the next engineer without extra explanation

## Final Rule

Do not optimize for the fastest possible patch.

Optimize for the most maintainable correct solution that still fits the size and style of this project.
