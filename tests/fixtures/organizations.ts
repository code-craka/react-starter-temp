export const mockOrganizations = {
  freePlan: {
    _id: "org_free_123" as any,
    _creationTime: Date.now(),
    name: "Free Organization",
    slug: "free-org",
    plan: "free" as const,
    ownerId: "user_owner_123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      quotas: {
        ai_messages: 100,
        api_calls: 1000,
      },
    },
  },
  proPlan: {
    _id: "org_pro_456" as any,
    _creationTime: Date.now(),
    name: "Pro Organization",
    slug: "pro-org",
    plan: "pro" as const,
    ownerId: "user_owner_123",
    subscriptionId: "sub_pro_789" as any,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      quotas: {
        ai_messages: 1000,
        api_calls: 10000,
      },
    },
  },
  enterprisePlan: {
    _id: "org_enterprise_789" as any,
    _creationTime: Date.now(),
    name: "Enterprise Organization",
    slug: "enterprise-org",
    plan: "enterprise" as const,
    ownerId: "user_owner_123",
    subscriptionId: "sub_enterprise_012" as any,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      quotas: {
        ai_messages: -1, // unlimited
        api_calls: -1, // unlimited
      },
    },
  },
};

export const createMockOrganization = (overrides: Record<string, any> = {}) => ({
  _id: `org_${Date.now()}` as any,
  _creationTime: Date.now(),
  name: `Test Organization ${Date.now()}`,
  slug: `test-org-${Date.now()}`,
  plan: "free" as const,
  ownerId: "user_owner_123",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: {
    quotas: {
      ai_messages: 100,
      api_calls: 1000,
    },
  },
  ...overrides,
});
