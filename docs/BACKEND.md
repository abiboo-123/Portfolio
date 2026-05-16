# Backend Guide

This document explains the current backend implementation, its completed improvements, remaining weaknesses, and recommended next steps.

## Current Backend Summary

The backend is implemented inside the Next.js application and is structured around:

- thin route handlers in `app/api/`
- shared validation in `lib/validation/`
- shared response helpers in `lib/api/`
- centralized business logic in `lib/services/`
- Supabase integration helpers in `lib/supabase-*`

This is now a clearer and more maintainable architecture than the original route-centric implementation.

## Major Backend Improvements Completed

The following backend refactors are now complete:

- shared Zod validation schemas for projects, sections, images, uploads, message updates, and contact input
- shared `safeParse` validation helper with typed field errors
- centralized service-layer CRUD logic for admin operations
- shared admin route auth wrapper
- role-based authorization using Supabase metadata/claims
- standardized admin API response helpers
- standardized admin error mapping
- service-layer image upload logic
- compensating rollback and cleanup for multi-step delete/upload flows

## Current Backend Structure

### `app/api/`

Responsibilities:

- expose HTTP endpoints
- parse request input
- validate payloads
- call shared services
- return API responses

### `lib/validation/`

Responsibilities:

- define shared Zod schemas
- normalize payloads
- return typed field validation errors

### `lib/api/`

Responsibilities:

- standardize admin API success and error response envelopes
- centralize validation error formatting

### `lib/services/`

Responsibilities:

- implement reusable business logic
- perform database and storage work
- centralize admin auth and authorization
- encapsulate multi-step mutation flows

### `lib/supabase-*`

Responsibilities:

- provide public/server reads
- support browser auth
- read session-aware server auth state
- perform privileged writes with the service-role client

## Completed vs Incomplete Areas

### Completed

- project CRUD service extraction
- section CRUD service extraction
- image CRUD service extraction
- message listing and status updates
- admin upload service extraction
- role-based admin authorization
- admin API response standardization
- admin payload validation standardization

### Still Incomplete

- contact route is not yet aligned to the admin API response envelope
- SQL migrations are not versioned in-repo
- RLS and policy documentation are not tracked in-repo
- no test suite verifies service-layer behavior
- no background job or queue model exists for heavier async tasks

## Security Improvements

Implemented improvements:

- admin APIs now require both authentication and role-based authorization
- page-level admin access is blocked in middleware
- payload validation is centralized
- file uploads validate content type and max size
- privileged writes remain server-side
- image cleanup is handled server-side

Remaining weaknesses:

- service-role env naming is unsafe-looking and should be renamed
- no explicit RLS policy documentation exists
- no anti-abuse rate limiting for admin routes
- no audit logging for admin changes
- role checks rely on metadata conventions rather than a dedicated role model

## Scalability Improvements

Implemented improvements:

- route handlers are thin and reusable
- business logic is centralized
- validation logic is reused
- delete/upload flows are safer than before

Remaining limitations:

- in-memory contact rate limiting does not scale across instances
- no pagination on admin list endpoints
- no queue/worker model for heavy async work
- no database transaction or RPC-based atomic mutation model

## Remaining Technical Debt

- duplicate role-normalization logic exists in both middleware and admin auth services
- contact route response formatting differs from admin routes
- no schema migration tooling in the repo
- no typed repository layer over Supabase tables
- no dedicated operational docs for backups, incident handling, or observability

## Recommended Future Backend Improvements

- add SQL migrations and Supabase policy setup files
- unify public and admin API response contracts
- add scalable rate limiting
- add pagination and query controls to admin APIs
- introduce transaction-oriented SQL/RPC paths for higher-risk operations
- add test coverage for services and route handlers
- add observability and structured logging
- rename `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` to a server-only env var
