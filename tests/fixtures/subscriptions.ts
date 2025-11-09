export const mockSubscriptions = {
  proMonthly: {
    _id: "sub_pro_monthly_123" as any,
    _creationTime: Date.now(),
    userId: "user_owner_123",
    organizationId: "org_pro_456" as any,
    polarSubscriptionId: "polar_sub_123",
    status: "active" as const,
    plan: "pro",
    amount: 2900, // $29.00
    currency: "usd",
    interval: "month" as const,
    currentPeriodStart: Date.now(),
    currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  proYearly: {
    _id: "sub_pro_yearly_456" as any,
    _creationTime: Date.now(),
    userId: "user_owner_123",
    organizationId: "org_pro_456" as any,
    polarSubscriptionId: "polar_sub_456",
    status: "active" as const,
    plan: "pro",
    amount: 29000, // $290.00 (10 months price)
    currency: "usd",
    interval: "year" as const,
    currentPeriodStart: Date.now(),
    currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // 365 days
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  enterpriseMonthly: {
    _id: "sub_enterprise_789" as any,
    _creationTime: Date.now(),
    userId: "user_owner_123",
    organizationId: "org_enterprise_789" as any,
    polarSubscriptionId: "polar_sub_789",
    status: "active" as const,
    plan: "enterprise",
    amount: 9900, // $99.00
    currency: "usd",
    interval: "month" as const,
    currentPeriodStart: Date.now(),
    currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  canceled: {
    _id: "sub_canceled_012" as any,
    _creationTime: Date.now(),
    userId: "user_owner_123",
    organizationId: "org_pro_456" as any,
    polarSubscriptionId: "polar_sub_012",
    status: "canceled" as const,
    plan: "pro",
    amount: 2900,
    currency: "usd",
    interval: "month" as const,
    currentPeriodStart: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    currentPeriodEnd: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    canceledAt: Date.now() - 35 * 24 * 60 * 60 * 1000, // 35 days ago
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
  },
};

export const createMockSubscription = (overrides: Record<string, any> = {}) => ({
  _id: `sub_${Date.now()}` as any,
  _creationTime: Date.now(),
  userId: "user_owner_123",
  organizationId: "org_123" as any,
  polarSubscriptionId: `polar_sub_${Date.now()}`,
  status: "active" as const,
  plan: "pro",
  amount: 2900,
  currency: "usd",
  interval: "month" as const,
  currentPeriodStart: Date.now(),
  currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});
