import { type MetaFunction } from "react-router";
import { LegalLayout } from "~/components/legal/legal-layout";
import { TableOfContents, Section } from "~/components/legal/toc";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms of Service - Taskcoda by TechSci, Inc." },
    { name: "description", content: "Terms of Service for using Taskcoda task management platform operated by TechSci, Inc." },
  ];
};

const tocItems = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "description", title: "Service Description" },
  { id: "accounts", title: "User Accounts and Registration" },
  { id: "payments", title: "Payments and Subscriptions" },
  { id: "conduct", title: "User Conduct and Prohibited Activities" },
  { id: "ip", title: "Intellectual Property" },
  { id: "disclaimers", title: "Disclaimers and Warranties" },
  { id: "limitation", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "termination", title: "Termination" },
  { id: "governing-law", title: "Governing Law and Dispute Resolution" },
  { id: "changes", title: "Changes to Terms" },
];

export default function TermsOfService() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <LegalLayout title="Terms of Service" lastUpdated={lastUpdated}>
      <TableOfContents items={tocItems} />

      <Section id="acceptance" title="Acceptance of Terms" number={1}>
        <p>
          These Terms of Service ("Terms") constitute a legally binding agreement between you and TechSci, Inc. ("Company," "we," "us," or "our") regarding your use of Taskcoda ("Service"), a task management and productivity platform available at taskcoda.com and through our mobile applications.
        </p>
        <p className="mt-2">
          BY ACCESSING OR USING OUR SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS. If you do not agree to these Terms, do not use the Service.
        </p>
      </Section>

      <Section id="description" title="Service Description" number={2}>
        <p>
          Taskcoda provides cloud-based task management, project collaboration, team coordination, and productivity tools. Our Service includes:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Task creation, assignment, and tracking</li>
          <li>Project management and organization</li>
          <li>Team collaboration features</li>
          <li>File storage and sharing</li>
          <li>Real-time notifications and updates</li>
          <li>Analytics and reporting tools</li>
        </ul>
        <p className="mt-2">
          We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
        </p>
      </Section>

      <Section id="accounts" title="User Accounts and Registration" number={3}>
        <p><strong>Account Creation:</strong> You must create an account to use Taskcoda. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.</p>
        <p className="mt-2"><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access.</p>
        <p className="mt-2"><strong>Eligibility:</strong> You must be at least 16 years old to use our Service. By using Taskcoda, you represent that you meet this requirement.</p>
        <p className="mt-2"><strong>Organization Accounts:</strong> If you create an account on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>
      </Section>

      <Section id="payments" title="Payments and Subscriptions" number={4}>
        <p><strong>Subscription Plans:</strong> Taskcoda offers Free, Pro, and Enterprise plans. Pricing details are available at taskcoda.com/pricing.</p>
        <p className="mt-2"><strong>Payment Processing:</strong> Payments are processed securely through our third-party payment processor, Polar.sh. You agree to provide accurate payment information and authorize us to charge your payment method.</p>
        <p className="mt-2"><strong>Billing Cycles:</strong> Subscriptions are billed monthly or annually as selected. Billing begins immediately upon subscription.</p>
        <p className="mt-2"><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date.</p>
        <p className="mt-2"><strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.</p>
        <p className="mt-2"><strong>Refunds:</strong> We offer refunds within 14 days of initial purchase for annual subscriptions. Monthly subscriptions are non-refundable. Contact hello@techsci.io for refund requests.</p>
        <p className="mt-2"><strong>Price Changes:</strong> We may change subscription prices with 30 days' notice. Continued use after price changes constitutes acceptance.</p>
      </Section>

      <Section id="conduct" title="User Conduct and Prohibited Activities" number={5}>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Upload malicious code, viruses, or harmful content</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use automated systems to access the Service without permission</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Transmit spam or unsolicited communications</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Resell or redistribute the Service without authorization</li>
        </ul>
        <p className="mt-2">Violation of these rules may result in suspension or termination of your account. See our Acceptable Use Policy for details.</p>
      </Section>

      <Section id="ip" title="Intellectual Property" number={6}>
        <p><strong>Our Rights:</strong> Taskcoda, including all software, designs, logos, and content, is owned by TechSci, Inc. and protected by copyright, trademark, and other intellectual property laws.</p>
        <p className="mt-2"><strong>Your Content:</strong> You retain ownership of content you submit to Taskcoda ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display the content as necessary to provide the Service.</p>
        <p className="mt-2"><strong>License to Use:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the Service for its intended purpose.</p>
        <p className="mt-2"><strong>Feedback:</strong> Any feedback, suggestions, or ideas you provide become our property and may be used without compensation.</p>
      </Section>

      <Section id="disclaimers" title="Disclaimers and Warranties" number={7}>
        <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>
        <p className="mt-2">WE DISCLAIM ALL WARRANTIES, INCLUDING:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>MERCHANTABILITY</li>
          <li>FITNESS FOR A PARTICULAR PURPOSE</li>
          <li>NON-INFRINGEMENT</li>
          <li>ACCURACY OR RELIABILITY</li>
          <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
        </ul>
        <p className="mt-2">We do not guarantee that the Service will meet your requirements or that defects will be corrected.</p>
      </Section>

      <Section id="limitation" title="Limitation of Liability" number={8}>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, TECHSCI, INC. SHALL NOT BE LIABLE FOR:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
          <li>LOSS OF PROFITS, DATA, USE, OR GOODWILL</li>
          <li>SERVICE INTERRUPTIONS OR ERRORS</li>
          <li>UNAUTHORIZED ACCESS TO YOUR DATA</li>
        </ul>
        <p className="mt-2">OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
        <p className="mt-2">Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.</p>
      </Section>

      <Section id="indemnification" title="Indemnification" number={9}>
        <p>
          You agree to indemnify, defend, and hold harmless TechSci, Inc., its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your User Content</li>
          <li>Your violation of any rights of another party</li>
        </ul>
      </Section>

      <Section id="termination" title="Termination" number={10}>
        <p><strong>By You:</strong> You may terminate your account at any time through account settings or by contacting us.</p>
        <p className="mt-2"><strong>By Us:</strong> We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.</p>
        <p className="mt-2"><strong>Effect of Termination:</strong> Upon termination, your right to use the Service ceases immediately. We may delete your account and data after 90 days.</p>
        <p className="mt-2"><strong>Survival:</strong> Sections regarding intellectual property, disclaimers, limitation of liability, and indemnification survive termination.</p>
      </Section>

      <Section id="governing-law" title="Governing Law and Dispute Resolution" number={11}>
        <p><strong>Governing Law:</strong> These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law provisions.</p>
        <p className="mt-2"><strong>Arbitration:</strong> Any dispute arising from these Terms shall be resolved through binding arbitration in accordance with the American Arbitration Association rules, conducted in Dover, Delaware.</p>
        <p className="mt-2"><strong>Class Action Waiver:</strong> You agree to resolve disputes on an individual basis and waive the right to participate in class actions.</p>
        <p className="mt-2"><strong>Exceptions:</strong> Either party may seek injunctive relief in court to protect intellectual property rights.</p>
      </Section>

      <Section id="changes" title="Changes to Terms" number={12}>
        <p>
          We may modify these Terms at any time. Material changes will be notified via email and posted on this page. Continued use after changes constitutes acceptance.
        </p>
        <p className="mt-2">Last modified: {lastUpdated}</p>
      </Section>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Contact Us</h3>
        <p className="text-sm">Questions about these Terms? Contact us at:</p>
        <p className="text-sm mt-2"><strong>TechSci, Inc.</strong><br/>
        1111B S Governors Ave STE 34002<br/>
        Dover, DE 19904, United States<br/>
        Email: hello@techsci.io<br/>
        Phone: +1 302 415 3171</p>
      </div>
    </LegalLayout>
  );
}
