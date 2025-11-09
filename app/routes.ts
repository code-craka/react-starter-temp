import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("success", "routes/success.tsx"),
  route("subscription-required", "routes/subscription-required.tsx"),
  // Legal Pages
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),
  route("cookies", "routes/cookies.tsx"),
  route("aup", "routes/aup.tsx"),
  route("contact", "routes/contact.tsx"),
  // Dashboard
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/team", "routes/dashboard/team.tsx"),
    route("dashboard/usage", "routes/dashboard/usage.tsx"),
    route("dashboard/billing", "routes/dashboard/billing.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),
  // Admin Panel
  layout("routes/admin/layout.tsx", [
    route("admin", "routes/admin/index.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/organizations", "routes/admin/organizations.tsx"),
    route("admin/health", "routes/admin/health.tsx"),
    route("admin/features", "routes/admin/features.tsx"),
    route("admin/analytics", "routes/admin/analytics.tsx"),
  ]),
] satisfies RouteConfig;
