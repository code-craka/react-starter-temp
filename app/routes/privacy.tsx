import { type MetaFunction } from "react-router";
import { LegalLayout } from "~/components/legal/legal-layout";
import { TableOfContents, Section } from "~/components/legal/toc";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - Taskcoda by TechSci, Inc." },
    {
      name: "description",
      content:
        "Learn how TechSci, Inc. protects your privacy when using Taskcoda. GDPR, CCPA, and HIPAA compliant privacy policy.",
    },
    { name: "robots", content: "index, follow" },
  ];
};

const tocItems = [
  { id: "introduction", title: "Introduction" },
  { id: "information-collection", title: "Information We Collect" },
  { id: "information-usage", title: "How We Use Your Information" },
  { id: "information-sharing", title: "Information Sharing and Disclosure" },
  { id: "data-security", title: "Data Security" },
  { id: "cookies", title: "Cookies and Tracking Technologies" },
  { id: "user-rights", title: "Your Rights and Choices" },
  { id: "data-retention", title: "Data Retention" },
  { id: "international-transfers", title: "International Data Transfers" },
  { id: "children-privacy", title: "Children's Privacy" },
  { id: "california-rights", title: "California Privacy Rights (CCPA)" },
  { id: "gdpr-rights", title: "European Privacy Rights (GDPR)" },
  { id: "changes", title: "Changes to This Privacy Policy" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <LegalLayout title="Privacy Policy" lastUpdated={lastUpdated} breadcrumb="Privacy Policy">
      <TableOfContents items={tocItems} />

      <Section id="introduction" title="Introduction" number={1}>
        <p>
          Welcome to Taskcoda ("Service," "we," "us," or "our"), operated by TechSci, Inc. ("Company"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our task management and productivity platform accessible at taskcoda.com and our related services.
        </p>
        <p>
          We are committed to protecting your privacy and ensuring the security of your personal information. This policy is designed to comply with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), Health Insurance Portability and Accountability Act (HIPAA) where applicable, and other applicable privacy laws.
        </p>
        <p>
          By accessing or using Taskcoda, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
        </p>
      </Section>

      <Section id="information-collection" title="Information We Collect" number={2}>
        <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Information You Provide</h3>
        <p>We collect information that you voluntarily provide to us when you:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Register for an Account:</strong> Name, email address, password, organization name, and payment information</li>
          <li><strong>Use Our Service:</strong> Task data, project information, team member details, file uploads, and communications</li>
          <li><strong>Contact Us:</strong> Name, email address, phone number, and message content</li>
          <li><strong>Subscribe to Services:</strong> Billing address, payment card information (processed securely through our payment processor Polar.sh)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">2.2 Automatically Collected Information</h3>
        <p>When you access Taskcoda, we automatically collect certain information about your device and usage:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Device Information:</strong> IP address, browser type and version, operating system, device identifiers</li>
          <li><strong>Usage Data:</strong> Pages viewed, time spent on pages, click patterns, feature usage statistics</li>
          <li><strong>Log Data:</strong> Server logs, error reports, performance data</li>
          <li><strong>Cookies and Similar Technologies:</strong> See our Cookie Policy for details</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">2.3 Information from Third Parties</h3>
        <p>We may receive information from:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Authentication Providers:</strong> Clerk.com for identity verification</li>
          <li><strong>Payment Processors:</strong> Polar.sh for billing and subscription management</li>
          <li><strong>Analytics Services:</strong> Vercel Analytics for service improvement</li>
        </ul>
      </Section>

      <Section id="information-usage" title="How We Use Your Information" number={3}>
        <p>We use the collected information for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Service Provision:</strong> To create and maintain your account, process transactions, and deliver our core services</li>
          <li><strong>Communication:</strong> To send administrative information, service updates, security alerts, and respond to inquiries</li>
          <li><strong>Personalization:</strong> To customize your experience and provide features tailored to your preferences</li>
          <li><strong>Analytics and Improvement:</strong> To analyze usage patterns, improve our Service, and develop new features</li>
          <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and security vulnerabilities</li>
          <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
          <li><strong>Marketing:</strong> To send promotional communications (with your consent where required)</li>
        </ul>
        <p className="mt-4">
          <strong>Legal Basis for Processing (GDPR):</strong> We process your data based on consent, contractual necessity, legal obligations, and legitimate interests.
        </p>
      </Section>

      <Section id="information-sharing" title="Information Sharing and Disclosure" number={4}>
        <p>We do not sell your personal information. We may share your information in the following circumstances:</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Service Providers</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Convex:</strong> Database and backend services</li>
          <li><strong>Clerk:</strong> Authentication and identity management</li>
          <li><strong>Polar.sh:</strong> Payment processing</li>
          <li><strong>Vercel:</strong> Hosting and infrastructure</li>
          <li><strong>Resend:</strong> Email delivery</li>
        </ul>
        <p className="mt-2">These providers are contractually bound to protect your data and use it only for specified purposes.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">4.2 Business Transfers</h3>
        <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">4.3 Legal Requirements</h3>
        <p>We may disclose your information if required by law, court order, or to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Comply with legal obligations</li>
          <li>Protect our rights, property, or safety</li>
          <li>Prevent fraud or security threats</li>
          <li>Respond to government requests</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">4.4 With Your Consent</h3>
        <p>We may share information with third parties when you provide explicit consent.</p>
      </Section>

      <Section id="data-security" title="Data Security" number={5}>
        <p>We implement industry-standard security measures to protect your information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Encryption:</strong> Data in transit (TLS/SSL) and at rest (AES-256)</li>
          <li><strong>Access Controls:</strong> Role-based access control (RBAC) and multi-factor authentication</li>
          <li><strong>Monitoring:</strong> Continuous security monitoring and audit logging</li>
          <li><strong>Regular Audits:</strong> Periodic security assessments and penetration testing</li>
          <li><strong>Employee Training:</strong> Security awareness training for all personnel</li>
          <li><strong>Incident Response:</strong> Documented procedures for security breach management</li>
        </ul>
        <p className="mt-4">
          However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
        </p>
      </Section>

      <Section id="cookies" title="Cookies and Tracking Technologies" number={6}>
        <p>We use cookies and similar tracking technologies to enhance your experience. For detailed information, please review our Cookie Policy.</p>
        <p className="mt-2">You can control cookie preferences through your browser settings. Note that disabling cookies may limit functionality.</p>
      </Section>

      <Section id="user-rights" title="Your Rights and Choices" number={7}>
        <p>Depending on your location, you may have the following rights:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
          <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
          <li><strong>Restriction:</strong> Limit how we process your data</li>
          <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
          <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
          <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
        </ul>
        <p className="mt-4">
          To exercise these rights, contact us at <a href="mailto:hello@techsci.io" className="text-primary hover:underline">hello@techsci.io</a>. We will respond within 30 days (GDPR) or 45 days (CCPA).
        </p>
      </Section>

      <Section id="data-retention" title="Data Retention" number={8}>
        <p>We retain your information for as long as necessary to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide our Service and maintain your account</li>
          <li>Comply with legal, tax, and accounting obligations</li>
          <li>Resolve disputes and enforce agreements</li>
          <li>Maintain security and prevent fraud</li>
        </ul>
        <p className="mt-4">
          <strong>Retention Periods:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Account data: Duration of account plus 90 days</li>
          <li>Transaction records: 7 years (tax compliance)</li>
          <li>Audit logs: 3 years (security and compliance)</li>
          <li>Marketing data: Until you opt-out or 3 years of inactivity</li>
        </ul>
        <p className="mt-2">After retention periods expire, we securely delete or anonymize your data.</p>
      </Section>

      <Section id="international-transfers" title="International Data Transfers" number={9}>
        <p>
          TechSci, Inc. is based in Delaware, United States. If you access Taskcoda from outside the U.S., your information will be transferred to and processed in the United States.
        </p>
        <p className="mt-2">
          We comply with applicable data protection laws regarding international transfers, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
          <li>Adequacy decisions where applicable</li>
          <li>Other lawful transfer mechanisms as required</li>
        </ul>
        <p className="mt-2">
          By using our Service, you consent to the transfer of your information to the United States.
        </p>
      </Section>

      <Section id="children-privacy" title="Children's Privacy" number={10}>
        <p>
          Taskcoda is not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16.
        </p>
        <p className="mt-2">
          If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:hello@techsci.io" className="text-primary hover:underline">hello@techsci.io</a>. We will delete such information within 30 days.
        </p>
      </Section>

      <Section id="california-rights" title="California Privacy Rights (CCPA)" number={11}>
        <p>
          If you are a California resident, you have additional rights under the California Consumer Privacy Act:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Right to Know:</strong> Request disclosure of data collected, sources, purposes, and third parties</li>
          <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
          <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (Note: We do not sell personal information)</li>
          <li><strong>Right to Non-Discrimination:</strong> Exercise privacy rights without discrimination</li>
        </ul>
        <p className="mt-4">
          To submit a CCPA request, email <a href="mailto:hello@techsci.io" className="text-primary hover:underline">hello@techsci.io</a> or call +1 302 415 3171.
        </p>
        <p className="mt-2">
          <strong>Verification:</strong> We will verify your identity before processing requests to protect your privacy.
        </p>
        <p className="mt-2">
          <strong>Authorized Agents:</strong> You may designate an authorized agent to make requests on your behalf.
        </p>
      </Section>

      <Section id="gdpr-rights" title="European Privacy Rights (GDPR)" number={12}>
        <p>
          If you are in the European Economic Area (EEA), United Kingdom, or Switzerland, you have rights under the GDPR:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access your personal data</li>
          <li>Rectify inaccurate data</li>
          <li>Erase your data</li>
          <li>Restrict processing</li>
          <li>Data portability</li>
          <li>Object to processing</li>
          <li>Withdraw consent</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>
        <p className="mt-4">
          <strong>Data Protection Officer:</strong> For GDPR-related inquiries, contact our DPO at <a href="mailto:hello@techsci.io" className="text-primary hover:underline">hello@techsci.io</a>.
        </p>
      </Section>

      <Section id="changes" title="Changes to This Privacy Policy" number={13}>
        <p>
          We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors.
        </p>
        <p className="mt-2">
          We will notify you of material changes by:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Posting the updated policy on this page with a new "Last Updated" date</li>
          <li>Sending an email notification to your registered email address</li>
          <li>Displaying a prominent notice on our Service</li>
        </ul>
        <p className="mt-2">
          Your continued use of Taskcoda after changes become effective constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section id="contact" title="Contact Us" number={14}>
        <p>
          If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
        </p>
        <div className="mt-4 space-y-2 bg-muted/30 rounded-lg p-4">
          <p><strong>TechSci, Inc.</strong></p>
          <p>Attn: Privacy Department</p>
          <p>1111B S Governors Ave STE 34002</p>
          <p>Dover, DE 19904</p>
          <p>United States</p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a href="mailto:hello@techsci.io" className="text-primary hover:underline">
              hello@techsci.io
            </a>
          </p>
          <p>
            <strong>Phone:</strong> +1 302 415 3171
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a href="https://taskcoda.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              taskcoda.com
            </a>
          </p>
        </div>
        <p className="mt-4">
          <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 5 business days and resolve requests within 30 days.
        </p>
      </Section>
    </LegalLayout>
  );
}
