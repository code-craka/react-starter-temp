import { type MetaFunction } from "react-router";
import { LegalLayout } from "~/components/legal/legal-layout";
import { TableOfContents, Section } from "~/components/legal/toc";

export const meta: MetaFunction = () => {
  return [
    { title: "Acceptable Use Policy - Taskcoda by TechSci, Inc." },
    { name: "description", content: "Acceptable Use Policy defining prohibited activities and user conduct on Taskcoda." },
  ];
};

const tocItems = [
  { id: "introduction", title: "Introduction" },
  { id: "prohibited-content", title: "Prohibited Content" },
  { id: "prohibited-actions", title: "Prohibited Actions" },
  { id: "security", title: "Security and Technical Requirements" },
  { id: "enforcement", title: "Enforcement and Violations" },
  { id: "reporting", title: "Reporting Violations" },
];

export default function AcceptableUsePolicy() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <LegalLayout title="Acceptable Use Policy" lastUpdated={lastUpdated}>
      <TableOfContents items={tocItems} />

      <Section id="introduction" title="Introduction" number={1}>
        <p>
          This Acceptable Use Policy ("AUP") defines prohibited uses of Taskcoda and our Service. This policy applies to all users and is incorporated by reference into our Terms of Service.
        </p>
        <p className="mt-2">
          By using Taskcoda, you agree to comply with this AUP. Violation may result in suspension or termination of your account and legal action if necessary.
        </p>
      </Section>

      <Section id="prohibited-content" title="Prohibited Content" number={2}>
        <p>You may not upload, post, transmit, or store content that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Is Illegal:</strong> Violates any applicable laws or regulations, including copyright, trademark, patent, or trade secret laws</li>
          <li><strong>Is Harmful:</strong> Contains viruses, malware, spyware, or any malicious code designed to interrupt, destroy, or limit functionality</li>
          <li><strong>Is Harassing:</strong> Threatens, harasses, defames, or bullies others; promotes hate speech or violence</li>
          <li><strong>Is Sexually Explicit:</strong> Contains pornography, obscenity, or sexually explicit material</li>
          <li><strong>Violates Privacy:</strong> Contains personal information of others without consent; doxxing or unauthorized disclosure</li>
          <li><strong>Is Deceptive:</strong> Contains misleading, false, or fraudulent information</li>
          <li><strong>Infringes Rights:</strong> Violates intellectual property, privacy, publicity, or other rights of any party</li>
          <li><strong>Is Spam:</strong> Unsolicited commercial messages, chain letters, or mass mailings</li>
        </ul>
      </Section>

      <Section id="prohibited-actions" title="Prohibited Actions" number={3}>
        <p>You may not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Unauthorized Access:</strong> Attempt to access accounts, systems, or networks not belonging to you</li>
          <li><strong>Interfere with Service:</strong> Disrupt, interrupt, or degrade the Service or server networks</li>
          <li><strong>Bypass Security:</strong> Circumvent authentication, security measures, or access controls</li>
          <li><strong>Data Mining:</strong> Use automated systems (bots, scrapers, crawlers) to access or extract data without permission</li>
          <li><strong>Reverse Engineering:</strong> Decompile, disassemble, or reverse engineer our software</li>
          <li><strong>Resale:</strong> Resell, redistribute, or provide access to the Service without authorization</li>
          <li><strong>Impersonation:</strong> Impersonate another person, entity, or falsify your identity</li>
          <li><strong>Excessive Use:</strong> Use resources in a manner that unreasonably burdens our infrastructure</li>
          <li><strong>Competitive Analysis:</strong> Use the Service to build competitive products or services</li>
        </ul>
      </Section>

      <Section id="security" title="Security and Technical Requirements" number={4}>
        <p><strong>Account Security:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Maintain the confidentiality of your credentials</li>
          <li>Use strong, unique passwords</li>
          <li>Enable multi-factor authentication when available</li>
          <li>Notify us immediately of unauthorized access</li>
        </ul>

        <p className="mt-4"><strong>Prohibited Security Actions:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Conducting security vulnerability scans without written permission</li>
          <li>Performing penetration testing without authorization</li>
          <li>Attempting to exploit security vulnerabilities</li>
          <li>Launching denial-of-service (DoS) attacks</li>
          <li>Engaging in brute-force attacks on authentication systems</li>
        </ul>

        <p className="mt-4"><strong>Responsible Disclosure:</strong> If you discover a security vulnerability, report it to hello@techsci.io. Do not exploit or publicly disclose vulnerabilities.</p>
      </Section>

      <Section id="enforcement" title="Enforcement and Violations" number={5}>
        <p><strong>Investigation:</strong> We reserve the right to investigate suspected violations of this AUP. We may review account data, user content, and usage patterns.</p>

        <p className="mt-4"><strong>Consequences of Violation:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Warning:</strong> First-time minor violations may result in a warning</li>
          <li><strong>Content Removal:</strong> We may remove violating content</li>
          <li><strong>Feature Restriction:</strong> Temporary limitation of account features</li>
          <li><strong>Account Suspension:</strong> Temporary suspension of access</li>
          <li><strong>Account Termination:</strong> Permanent deletion of account for serious or repeat violations</li>
          <li><strong>Legal Action:</strong> We may pursue civil or criminal action for severe violations</li>
        </ul>

        <p className="mt-4"><strong>No Refunds:</strong> Violations resulting in suspension or termination do not entitle you to refunds.</p>

        <p className="mt-4"><strong>Cooperation with Law Enforcement:</strong> We cooperate with law enforcement agencies and may disclose information in response to lawful requests.</p>
      </Section>

      <Section id="reporting" title="Reporting Violations" number={6}>
        <p>If you become aware of any violation of this AUP, please report it immediately to:</p>

        <div className="mt-4 bg-muted/30 rounded-lg p-4 space-y-2">
          <p><strong>Email:</strong> <a href="mailto:hello@techsci.io" className="text-primary hover:underline">hello@techsci.io</a></p>
          <p><strong>Subject Line:</strong> "AUP Violation Report"</p>
        </div>

        <p className="mt-4"><strong>Include the following information:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your name and contact information</li>
          <li>Description of the violation</li>
          <li>Location of the violating content (URL, user account, etc.)</li>
          <li>Date and time of observation</li>
          <li>Any supporting evidence or screenshots</li>
        </ul>

        <p className="mt-4">We review all reports within 24-48 hours and take appropriate action.</p>

        <p className="mt-4"><strong>False Reports:</strong> Submitting false or malicious reports may result in account suspension.</p>
      </Section>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Updates to This Policy</h3>
        <p className="text-sm">
          We may update this Acceptable Use Policy to reflect changes in our Service, technology, or legal requirements. Continued use after changes constitutes acceptance.
        </p>
        <p className="text-sm mt-2">Last updated: {lastUpdated}</p>
      </div>
    </LegalLayout>
  );
}
