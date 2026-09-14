import { STRYGONIA_EMAIL } from "@/config/env";

export const PRIVACY_POLICY_LAST_UPDATED = "June 26, 2026";

export type PrivacySection = {
  title: string;
  body: string;
};

export const PRIVACY_POLICY_INTRO =
  `This Privacy Notice for Strygonia ("we," "us," or "our") describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you visit our website at strygonia.com or any website of ours that links to this Privacy Notice, or engage with us in other related ways, including any marketing or events. If you have questions or concerns, contact us at ${STRYGONIA_EMAIL}.`;

export const PRIVACY_POLICY_SUMMARY = [
  "What personal information do we process? When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.",
  "Do we process any sensitive personal information? We do not process sensitive personal information.",
  "Do we collect any information from third parties? We do not collect any information from third parties.",
  "How do we process your information? We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.",
  "In what situations and with which parties do we share personal information? We may share information in specific situations and with specific third parties.",
  "What are your rights? Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.",
  `How do you exercise your rights? The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us at ${STRYGONIA_EMAIL}.`,
];

export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    title: "1. What Information Do We Collect?",
    body: `Personal information you disclose to us. We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us. The personal information we collect may include names, phone numbers, email addresses, mailing addresses, job titles, contact or authentication data, billing addresses, and debit/credit card numbers. We do not process sensitive information.

Payment Data. We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number and the security code associated with your payment instrument. All payment data is handled and stored by NOT DECIDED YET. All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.

Information automatically collected. Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. Like many businesses, we also collect information through cookies and similar technologies, including log and usage data, device data, and location data. Our use of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements.`,
  },
  {
    title: "2. How Do We Process Your Information?",
    body: `We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes only with your prior explicit consent. Depending on how you interact with our Services, we may process your personal information to deliver and facilitate delivery of services to the user; respond to user inquiries and offer support; fulfill and manage your orders, payments, returns, and exchanges; enable user-to-user communications where applicable; and save or protect an individual's vital interest when necessary.`,
  },
  {
    title: "3. What Legal Bases Do We Rely On to Process Your Personal Information?",
    body: `We only process your personal information when we believe it is necessary and we have a valid legal reason to do so under applicable law. If you are located in the EU or UK, we may rely on consent, performance of a contract, legal obligations, and vital interests. If you are located in Canada, we may process your information with express or implied consent, or in exceptional cases where permitted by applicable law without consent.`,
  },
  {
    title: "4. When and With Whom Do We Share Your Personal Information?",
    body: `We may need to share your personal information in the following situations: Business Transfers — in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company. Affiliates — with our affiliates, who will be required to honor this Privacy Notice. Business Partners — to offer you certain products, services, or promotions. Other Users — when you share personal information or otherwise interact with public areas of the Services, such personal information may be viewed by all users and may be publicly made available outside the Services.`,
  },
  {
    title: "5. Do We Use Cookies and Other Tracking Technologies?",
    body: `We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions. We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising. To the extent these online tracking technologies are deemed to be a "sale"/"sharing" under applicable US state laws, you can opt out by submitting a request as described in section 10 below.`,
  },
  {
    title: "6. How Long Do We Keep Your Information?",
    body: `We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law. When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible, securely store your personal information and isolate it from any further processing until deletion is possible.`,
  },
  {
    title: "7. Do We Collect Information From Minors?",
    body: `We do not knowingly collect, solicit data from, or market to children under 18 years of age or the equivalent age as specified by law in your jurisdiction. By using the Services, you represent that you are at least 18 or the equivalent age as specified by law in your jurisdiction, or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 has been collected, we will deactivate the account and take reasonable measures to promptly delete such data. Contact us at ${STRYGONIA_EMAIL} if you become aware of any such data.`,
  },
  {
    title: "8. What Are Your Privacy Rights?",
    body: `Depending on your state of residence in the US or in some regions such as the EEA, UK, Switzerland, and Canada, you may have rights that allow you greater access to and control over your personal information, including the right to request access, rectification, erasure, restriction, data portability, and to object to processing. If you are located in the EEA or UK and believe we are unlawfully processing your personal information, you have the right to complain to your Member State data protection authority or UK data protection authority. If you are located in Switzerland, you may contact the Federal Data Protection and Information Commissioner. You may withdraw your consent at any time by contacting us. Most web browsers are set to accept cookies by default; you can usually choose to remove or reject cookies, though this may affect certain features or services.`,
  },
  {
    title: "9. Controls for Do-Not-Track Features",
    body: `Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.`,
  },
  {
    title: "10. Do United States Residents Have Specific Privacy Rights?",
    body: `If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have the right to request access to and receive details about the personal information we maintain about you, correct inaccuracies, get a copy of, or delete your personal information, and withdraw your consent to our processing.

Categories of personal information we have collected in the past twelve (12) months include identifiers, California Customer Records personal information, protected classification characteristics, commercial information, biometric information, internet or similar network activity, geolocation data, audio/electronic/sensory information, professional or employment-related information, education information, inferences, and sensitive personal information — illustrative examples are listed in our full notice; we have not disclosed, sold, or shared personal information to third parties for a business or commercial purpose in the preceding twelve (12) months.

Your rights may include the right to know whether we are processing your personal data, access your personal data, correct inaccuracies, request deletion, obtain a copy, non-discrimination for exercising your rights, and opt out of targeted advertising, sale, or profiling. To exercise these rights, contact us by submitting a data subject access request or emailing ${STRYGONIA_EMAIL}. California residents may also exercise rights under the "Shine The Light" law (California Civil Code Section 1798.83).`,
  },
  {
    title: "11. Do We Make Updates to This Notice?",
    body: `Yes, we will update this notice as necessary to stay compliant with relevant laws. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. If we make material changes, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification.`,
  },
  {
    title: "12. How Can You Contact Us About This Notice?",
    body: `If you have questions or comments about this notice, you may email us at ${STRYGONIA_EMAIL} or contact us by post at: Strygonia, 6101 N 2nd Pl, 8705 E Remuda Dr, Scottsdale, AZ 85255, United States.`,
  },
  {
    title: "13. How Can You Review, Update, or Delete the Data We Collect From You?",
    body: `Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a data subject access request.`,
  },
];
