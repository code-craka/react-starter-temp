import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Health check endpoint for uptime monitoring
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const startTime = Date.now();

    try {
      // Check Convex database connection
      const dbHealthy = await checkDatabaseHealth(ctx);

      // Check Redis connection (rate limiting)
      const redisHealthy = await checkRedisHealth();

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Determine overall health
      const healthy = dbHealthy && redisHealthy;
      const status = healthy ? 200 : 503;

      return new Response(
        JSON.stringify({
          status: healthy ? "healthy" : "unhealthy",
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          checks: {
            database: {
              status: dbHealthy ? "healthy" : "unhealthy",
              type: "convex",
            },
            rateLimit: {
              status: redisHealthy ? "healthy" : "unhealthy",
              type: "upstash-redis",
            },
            authentication: {
              status: "healthy", // Clerk is external, assume healthy
              type: "clerk",
            },
            payments: {
              status: "healthy", // Polar.sh is external, assume healthy
              type: "polar.sh",
            },
          },
          service: "taskcoda",
          company: "TechSci, Inc.",
          environment: process.env.NODE_ENV || "production",
        }),
        {
          status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    } catch (error) {
      console.error("Health check failed:", error);

      return new Response(
        JSON.stringify({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
          service: "taskcoda",
          company: "TechSci, Inc.",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    }
  }),
});

// Helper function to check database health
async function checkDatabaseHealth(ctx: any): Promise<boolean> {
  try {
    // Try to query a small table
    await ctx.runQuery(async (ctx: any) => {
      await ctx.db.query("users").take(1);
    });
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Helper function to check Redis health
async function checkRedisHealth(): Promise<boolean> {
  try {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!upstashUrl || !upstashToken) {
      // Redis not configured, assume healthy
      return true;
    }

    // Ping Redis
    const response = await fetch(`${upstashUrl}/ping`, {
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
}

export default http;
