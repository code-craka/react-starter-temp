/**
 * Email System using Resend
 *
 * Handles all transactional emails for the platform.
 */

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { AUDIT_ACTIONS } from "./auditLogs";
import { internal } from "./_generated/api";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@yourdomain.com";

/**
 * Send welcome email when user signs up
 */
export const sendWelcomeEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, message: "Email not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.to,
        subject: "Welcome to Our Platform! 🎉",
        html: getWelcomeEmailTemplate(args.userName),
      });

      if (error) {
        console.error("Error sending welcome email:", error);
        return { success: false, error: error.message };
      }

      console.log("Welcome email sent:", data);
      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Send team invitation email
 */
export const sendTeamInvitationEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    inviterName: v.string(),
    role: v.string(),
    invitationLink: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, message: "Email not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.to,
        subject: `You've been invited to join ${args.organizationName}`,
        html: getTeamInvitationEmailTemplate(args),
      });

      if (error) {
        console.error("Error sending invitation email:", error);
        return { success: false, error: error.message };
      }

      console.log("Invitation email sent:", data);
      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Send quota warning email
 */
export const sendQuotaWarningEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    metricType: v.string(),
    percentage: v.number(),
    used: v.number(),
    limit: v.number(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, message: "Email not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.to,
        subject: `⚠️ ${args.organizationName}: ${args.percentage}% of ${args.metricType} quota used`,
        html: getQuotaWarningEmailTemplate(args),
      });

      if (error) {
        console.error("Error sending quota warning email:", error);
        return { success: false, error: error.message };
      }

      console.log("Quota warning email sent:", data);
      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error("Failed to send quota warning email:", error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Send organization created confirmation email
 */
export const sendOrganizationCreatedEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    plan: v.string(),
    dashboardLink: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, message: "Email not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.to,
        subject: `${args.organizationName} is ready! 🚀`,
        html: getOrganizationCreatedEmailTemplate(args),
      });

      if (error) {
        console.error("Error sending organization created email:", error);
        return { success: false, error: error.message };
      }

      console.log("Organization created email sent:", data);
      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error("Failed to send organization created email:", error);
      return { success: false, error: String(error) };
    }
  },
});

// ==================== EMAIL TEMPLATES ====================

function getWelcomeEmailTemplate(userName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Platform! 🎉</h1>
  </div>

  <div style="background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Thanks for joining us! We're excited to have you on board.
    </p>

    <h2 style="color: #667eea; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">🚀 Next Steps</h2>

    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <ol style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;"><strong>Create your organization</strong> - Set up your workspace and invite your team</li>
        <li style="margin-bottom: 10px;"><strong>Try the AI chat</strong> - Experience our powerful AI features</li>
        <li style="margin-bottom: 10px;"><strong>Explore the dashboard</strong> - Monitor your usage and manage your team</li>
      </ol>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Need help getting started? Check out our <a href="#" style="color: #667eea; text-decoration: none;">documentation</a> or reach out to our support team.
    </p>

    <p style="font-size: 16px; margin-bottom: 10px;">
      Best regards,<br>
      The Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

function getTeamInvitationEmailTemplate(args: {
  organizationName: string;
  inviterName: string;
  role: string;
  invitationLink: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited! 📧</h1>
  </div>

  <div style="background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>${args.inviterName}</strong> has invited you to join <strong>${args.organizationName}</strong> as a <strong>${args.role}</strong>.
    </p>

    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #666; font-size: 14px;"><strong>Organization:</strong> ${args.organizationName}</p>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;"><strong>Role:</strong> ${args.role}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${args.invitationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>This invitation link will expire in 7 days.</p>
    <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

function getQuotaWarningEmailTemplate(args: {
  organizationName: string;
  metricType: string;
  percentage: number;
  used: number;
  limit: number;
  plan: string;
}): string {
  const isExceeded = args.percentage >= 100;
  const isCritical = args.percentage >= 90;
  const warningColor = isExceeded ? "#dc2626" : isCritical ? "#ea580c" : "#f59e0b";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quota Warning</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${warningColor}; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${isExceeded ? "Quota Exceeded" : "Quota Warning"} ⚠️</h1>
  </div>

  <div style="background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your organization <strong>${args.organizationName}</strong> has ${isExceeded ? "exceeded" : "used"} <strong>${args.percentage}%</strong> of its ${args.metricType} quota.
    </p>

    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 14px; color: #666;">Usage</span>
          <span style="font-size: 14px; font-weight: 600;">${args.used.toLocaleString()} / ${args.limit.toLocaleString()}</span>
        </div>
        <div style="background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden;">
          <div style="background: ${warningColor}; height: 100%; width: ${Math.min(args.percentage, 100)}%; transition: width 0.3s ease;"></div>
        </div>
      </div>

      <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
        <strong>Current Plan:</strong> ${args.plan}
      </p>
    </div>

    ${
      isExceeded
        ? `<div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>Action Required:</strong> Your quota has been exceeded. Please upgrade your plan to continue using this feature.
            </p>
          </div>`
        : `<p style="font-size: 16px; margin-bottom: 20px;">
            To avoid service interruption, consider upgrading your plan.
          </p>`
    }

    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Upgrade Plan
      </a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Questions? Contact our support team for assistance.
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

function getOrganizationCreatedEmailTemplate(args: {
  organizationName: string;
  plan: string;
  dashboardLink: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Organization Created</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Your Organization is Ready! 🚀</h1>
  </div>

  <div style="background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Congratulations! <strong>${args.organizationName}</strong> has been successfully created on the <strong>${args.plan}</strong> plan.
    </p>

    <h2 style="color: #667eea; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">🎯 What's Next?</h2>

    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <ol style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;"><strong>Invite your team</strong> - Collaborate with your colleagues</li>
        <li style="margin-bottom: 10px;"><strong>Start using AI chat</strong> - Leverage powerful AI capabilities</li>
        <li style="margin-bottom: 10px;"><strong>Monitor usage</strong> - Track your consumption and quotas</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${args.dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>

    <p style="font-size: 16px; margin-top: 30px; margin-bottom: 10px;">
      Need help? Check out our documentation or contact support.
    </p>

    <p style="font-size: 16px; margin-bottom: 10px;">
      Happy building!<br>
      The Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}
