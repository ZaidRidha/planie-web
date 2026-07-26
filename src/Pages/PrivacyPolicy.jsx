/* Privacy policy — static, copy from "Planie Privacy.dc.html" (2026-07-24). */

import LegalArticle from "../Components/LegalArticle";

const SECTIONS = [
  { title: "The short version", paras: [
    "Planie helps you discover experiences and build itineraries. To do that well we collect only what we need, we never sell your personal data, and we give you control over it.",
    "This policy explains what we collect, why, and the choices you have.",
  ] },
  { title: "What we collect", paras: [
    "Account details you give us — your name, email and preferences.",
    "What you ask Planie to plan — the places, dates, budgets and occasions you describe, so we can build and improve your itineraries.",
    "Usage and device data — how you interact with the app, plus standard technical information needed to keep it running and secure.",
    "Approximate location, only when you grant permission, so recommendations are relevant to where you are.",
  ] },
  { title: "How we use it", paras: [
    "To generate and personalise your plans, remember your taste, and suggest experiences you are likely to enjoy.",
    "To operate, secure and improve the service, and to measure whether our recommendations are useful.",
    "To communicate with you about your account and, only with your consent, occasional product news.",
  ] },
  { title: "Sharing", paras: [
    "We share the minimum necessary with partners whose venues appear in your plans — for example, a booking request you choose to send. We never hand over your full profile.",
    "We use trusted service providers (hosting, analytics, payments) bound by contract to protect your data. We do not sell personal data to advertisers.",
  ] },
  { title: "Your choices and rights", paras: [
    "You can access, correct, export or delete your data from your account settings, or by contacting us.",
    "You can turn off location access, opt out of marketing, and close your account at any time.",
    "Depending on where you live, you may have additional rights under laws such as the GDPR or CCPA. We honour them all.",
  ] },
  { title: "Retention & security", paras: [
    "We keep your data only as long as your account is active or as needed to provide the service and meet legal obligations, then delete or anonymise it.",
    "We protect it with encryption in transit, access controls, and regular security review. No system is perfectly secure, but we treat your trust as the product.",
  ] },
  { title: "Changes to this policy", paras: [
    "If we make material changes we will let you know in the app or by email before they take effect. Continuing to use Planie after that means you accept the update.",
  ] },
];

export default function PrivacyPolicy() {
  return (
    <LegalArticle
      kicker="Legal"
      title="Privacy Policy"
      sections={SECTIONS}
      footerNote="Questions about your data? Reach us any time at"
    />
  );
}
