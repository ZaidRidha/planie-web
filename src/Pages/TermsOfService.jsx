/* Terms of service — static, copy from "Planie Terms.dc.html" (2026-07-24). */

import LegalArticle from "../Components/LegalArticle";

const SECTIONS = [
  { title: "Acceptance", paras: [
    "By creating an account or using Planie, you agree to these terms. If you are using Planie on behalf of a business, you confirm you are authorised to accept them for that business.",
  ] },
  { title: "What Planie does", paras: [
    "Planie helps you discover experiences and builds personalised itineraries. Recommendations, timings and availability are provided in good faith but are suggestions — always confirm details such as opening hours, prices and bookings directly with the venue.",
  ] },
  { title: "Your account", paras: [
    "You are responsible for keeping your login details secure and for activity under your account. Tell us promptly if you suspect unauthorised use.",
    "You must be old enough to form a binding contract in your country to use Planie.",
  ] },
  { title: "Partner terms", paras: [
    "Businesses that list on Planie agree to keep their information accurate, honour the offers and availability they publish, and treat customers Planie sends fairly.",
    "Paid placements, promotions and campaigns are billed per the pricing shown at purchase. Placement improves prominence within relevant plans; it never guarantees a specific ranking, volume of visits, or that a venue appears where it does not fit.",
  ] },
  { title: "Acceptable use", paras: [
    "Do not misuse Planie: no scraping, reverse engineering, attempts to disrupt the service, or uploading unlawful, misleading or infringing content.",
    "We may suspend or remove accounts or listings that break these rules or harm other users.",
  ] },
  { title: "Payments", paras: [
    "Subscriptions and fees are described at the point of purchase and billed on a recurring basis until cancelled. Taxes may apply. Except where required by law, fees already incurred are non-refundable.",
  ] },
  { title: "Liability", paras: [
    "Planie is provided “as is”. To the fullest extent permitted by law, we are not liable for indirect or consequential losses, or for the acts of third-party venues. Nothing in these terms limits liability that cannot be limited by law.",
  ] },
  { title: "Changes & contact", paras: [
    "We may update these terms; material changes will be notified in the app or by email before they take effect. Continued use means you accept the update.",
    "These terms are governed by the laws of England and Wales, unless local law requires otherwise.",
  ] },
];

export default function TermsOfService() {
  return (
    <LegalArticle
      kicker="Legal"
      title="Terms of Service"
      sections={SECTIONS}
      footerNote="Anything unclear? Reach us any time at"
    />
  );
}
