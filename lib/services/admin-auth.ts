import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { ServiceError } from "./errors";
import { handleServiceError } from "./http";
import { getUserRoles, isAuthorizedAdmin } from "./admin-roles";

export interface AdminAuthContext {
  currentUser: User;
  roles: string[];
}

export async function requireAuthorizedAdmin(): Promise<AdminAuthContext> {
  const supabase = await createSupabaseAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ServiceError("Unauthorized", 401);
  }

  const roles = getUserRoles(user);

  if (!isAuthorizedAdmin(user)) {
    throw new ServiceError("Forbidden", 403);
  }

  return {
    currentUser: user,
    roles,
  };
}

type RouteContext = {
  params: Record<string, string>;
};

type AdminRouteHandler<TContext extends RouteContext = RouteContext> = (
  request: NextRequest,
  context: TContext,
  auth: AdminAuthContext
) => Promise<NextResponse>;

export function withAdminRoute<TContext extends RouteContext = RouteContext>(
  logLabel: string,
  handler: AdminRouteHandler<TContext>
) {
  return async (request: NextRequest, context: TContext) => {
    try {
      const auth = await requireAuthorizedAdmin();
      return await handler(request, context, auth);
    } catch (error) {
      return handleServiceError(error, logLabel);
    }
  };
}
