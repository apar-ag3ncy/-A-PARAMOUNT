/**
 * Site constants — grounded in PARAMOUNT_CONTENT.md (verbatim from the deck).
 */

export const SITE = {
  name: "A Paramount Engineering Works",
  shortName: "A Paramount",
  since: 1968,
  descriptor: "Makers of Temple Accessories",
  tagline: "Crafting Divine Elegance",
  subtitle:
    "Exquisite craftsmanship that blends devotion, tradition and timeless beauty.",
} as const;

const EMAILS = ["aparamount1968@gmail.com", "info@aparamount.com"] as const;

export const CONTACT = {
  /** The primary address — the contact page and the form's fallback link. */
  email: EMAILS[0],
  /** Every address, in the order the footer lists them. */
  emails: EMAILS,
  social: "A Paramount Engineering Works",
  addresses: [
    "K-11, Ansa Industrial Estate, Saki Vihar Road, Sakinaka, Andheri East, Mumbai 400072",
    "F-107, Ansa Industrial Estate, Saki Vihar Road, Sakinaka, Andheri East, Mumbai 400072",
  ],
  /* ONE ENTRY PER PERSON, even for someone with two numbers. The About page's
     "Generation" column lists these by NAME and is laid out for exactly four
     names off the deck, so a second number goes in `altPhones`, never in a
     second entry. */
  people: [
    { title: "Mr.", name: "Suresh Zaveri", phone: "+91 93242 45830" },
    {
      title: "Mr.",
      name: "Harshal Zaveri",
      phone: "+91 98210 44024",
      altPhones: ["+91 96534 92398"],
    },
    { title: "Mr.", name: "Nehal Zaveri", phone: "+91 98211 89666" },
    { title: "Mrs.", name: "Yesha Zaveri Shah", phone: "+91 98707 41412" },
  ],
} as const;

export const FAMILIES = [
  { slug: "architecture", title: "Temple Architecture", blurb: "Structural & built in pieces." },
  { slug: "symbols", title: "Sacred Symbols", blurb: "Ornamental sacred objects." },
  { slug: "ceremonial", title: "Ceremonial Pieces", blurb: "Processional & large scale." },
  { slug: "devotional", title: "Puja & Devotional", blurb: "Everyday puja & silverware." },
] as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/craftsmanship", label: "Craftsmanship" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;
