/* Partner's owned listings — shared source of truth for any portal page
   that needs to reference what the venue has. Mock data for now;
   will be replaced by the real listings API. */

const toSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const RAW = [
  { name: "Sunset Rooftop Bar",   category: "Restaurant & Bar", location: "Marrakech, Morocco",        status: "active"   },
  { name: "Desert Safari Tours",  category: "Activity & Tour",  location: "Dubai, UAE",                status: "active"   },
  { name: "Coastal Yoga Retreat", category: "Wellness & Spa",   location: "Bali, Indonesia",           status: "pending"  },
  { name: "Old Town Walking Tour", category: "Activity & Tour", location: "Prague, Czech Republic",    status: "active"   },
  { name: "Neon Night Market",    category: "Shopping & Market", location: "Bangkok, Thailand",         status: "inactive" },
];

export const PARTNER_LISTINGS = RAW.map((l) => ({ ...l, slug: toSlug(l.name) }));

export const listPartnerListings = () => PARTNER_LISTINGS;

export const getPartnerListing = (slug) =>
  PARTNER_LISTINGS.find((l) => l.slug === slug) || null;
