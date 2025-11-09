import { type MetaFunction } from "react-router";
import { LegalLayout } from "~/components/legal/legal-layout";
import { TableOfContents, Section } from "~/components/legal/toc";

export const meta: MetaFunction = () => {
  return [
    { title: "Cookie Policy - Taskcoda by TechSci, Inc." },
    { name: "description", content: "Learn about how Taskcoda uses cookies and similar tracking technologies." },
  ];
};

const tocItems = [
  { id: "what-are-cookies", title: "What Are Cookies" },
  { id: "how-we-use", title: "How We Use Cookies" },
  { id: "cookie-types", title: "Types of Cookies We Use" },
  { id: "cookie-table", title: "Cookie Table" },
  { id: "manage", title: "Managing Cookies" },
];

export default function CookiePolicy() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <LegalLayout title="Cookie Policy" lastUpdated={lastUpdated}>
      <TableOfContents items={tocItems} />

      <Section id="what-are-cookies" title="What Are Cookies" number={1}>
        <p>
          Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences, improve functionality, and analyze usage patterns.
        </p>
        <p className="mt-2">
          Taskcoda uses cookies and similar technologies (web beacons, pixels, local storage) to enhance your experience and improve our Service.
        </p>
      </Section>

      <Section id="how-we-use" title="How We Use Cookies" number={2}>
        <p>We use cookies to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Keep you signed in and remember your preferences</li>
          <li>Analyze how you use Taskcoda and improve performance</li>
          <li>Provide personalized content and features</li>
          <li>Detect and prevent security threats</li>
          <li>Comply with legal and regulatory requirements</li>
        </ul>
      </Section>

      <Section id="cookie-types" title="Types of Cookies We Use" number={3}>
        <h3 className="text-lg font-semibold mt-4 mb-2">Strictly Necessary Cookies</h3>
        <p>These cookies are essential for the Service to function. They enable core functionality like authentication, security, and session management. You cannot opt out of these cookies.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Performance Cookies</h3>
        <p>These cookies collect anonymous information about how visitors use Taskcoda, helping us improve performance and user experience.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Functional Cookies</h3>
        <p>These cookies remember your preferences and settings, providing enhanced, personalized features.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Targeting/Advertising Cookies</h3>
        <p>Currently, Taskcoda does not use advertising cookies. We do not serve targeted ads.</p>
      </Section>

      <Section id="cookie-table" title="Cookie Table" number={4}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Cookie Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 text-sm">__session</td>
                <td className="px-4 py-3 text-sm">Clerk</td>
                <td className="px-4 py-3 text-sm">Authentication and session management</td>
                <td className="px-4 py-3 text-sm">Session</td>
                <td className="px-4 py-3 text-sm">Necessary</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">__clerk_*</td>
                <td className="px-4 py-3 text-sm">Clerk</td>
                <td className="px-4 py-3 text-sm">User authentication state</td>
                <td className="px-4 py-3 text-sm">1 year</td>
                <td className="px-4 py-3 text-sm">Necessary</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">convex_*</td>
                <td className="px-4 py-3 text-sm">Convex</td>
                <td className="px-4 py-3 text-sm">Database connection and real-time sync</td>
                <td className="px-4 py-3 text-sm">Session</td>
                <td className="px-4 py-3 text-sm">Necessary</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">_vercel_analytics</td>
                <td className="px-4 py-3 text-sm">Vercel</td>
                <td className="px-4 py-3 text-sm">Anonymous usage analytics</td>
                <td className="px-4 py-3 text-sm">1 year</td>
                <td className="px-4 py-3 text-sm">Performance</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">theme</td>
                <td className="px-4 py-3 text-sm">Taskcoda</td>
                <td className="px-4 py-3 text-sm">Remember dark/light mode preference</td>
                <td className="px-4 py-3 text-sm">1 year</td>
                <td className="px-4 py-3 text-sm">Functional</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="manage" title="Managing Cookies" number={5}>
        <p><strong>Browser Settings:</strong> Most browsers allow you to control cookies through settings. You can:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Block all cookies</li>
          <li>Block third-party cookies only</li>
          <li>Delete cookies after each session</li>
          <li>View and delete existing cookies</li>
        </ul>

        <p className="mt-4"><strong>Browser-Specific Instructions:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
          <li><strong>Firefox:</strong> Settings &gt; Privacy & Security &gt; Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies and website data</li>
          <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions</li>
        </ul>

        <p className="mt-4"><strong>Impact of Disabling Cookies:</strong></p>
        <p>Disabling strictly necessary cookies will prevent you from using Taskcoda. Disabling other cookies may limit functionality and personalization.</p>

        <p className="mt-4"><strong>Third-Party Services:</strong></p>
        <p>Our third-party providers (Clerk, Convex, Vercel) may set cookies. Review their privacy policies:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Clerk: https://clerk.com/privacy</li>
          <li>Convex: https://convex.dev/privacy</li>
          <li>Vercel: https://vercel.com/privacy</li>
        </ul>

        <p className="mt-4"><strong>Updates:</strong> We may update this Cookie Policy to reflect changes in technology or regulations. Check this page periodically.</p>

        <p className="mt-4">For more information, see our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.</p>
      </Section>
    </LegalLayout>
  );
}
