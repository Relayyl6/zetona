/**
 * Photo & Collection Repository and DTO definitions
 * Source: docs/ARCHITECTURE.md §4 & docs/DATA-MODEL.md §6
 */

export interface PhotoDTO {
  id: string;
  alt: string;
  title?: string | null;
  caption?: string | null;
  width: number;
  height: number;
  displayKey: string;
  originalKey?: string | null;
  thumbhash?: string | null;
  dominantColor?: string | null;
  focal: { x: number; y: number };
  collection?: { id: string; slug: string; title: string } | null;
  collectionId?: string | null;
  featuredHome?: boolean;
  featuredAbout?: boolean;
  status?: "published" | "draft" | "trashed" | string;
  sortOrder?: number;
}

export interface CollectionDTO {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  coverPhotoId?: string | null;
  coverPhoto?: PhotoDTO | null;
  photoCount: number;
  sortOrder: number;
}

export interface SiteSettingsDTO {
  headline?: string | null;
  subline?: string | null;
  bio?: string | null;
  showStats: boolean;
  showAwards: boolean;
  showTestimonials: boolean;
  homeSelectorMode: "photos" | "collections";
  homeVariant: "collage" | "split";
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  xUrl?: string | null;
}

export interface TestimonialDTO {
  id: string;
  author: string;
  role?: string | null;
  location?: string | null;
  quote: string;
  sortOrder?: number;
  visible?: boolean;
}

export const mockTestimonials: TestimonialDTO[] = [
  {
    id: "test_01",
    author: "Laurent Shaha",
    role: "Creative Director",
    location: "Northline Studio",
    quote: "Zetona brings a very distinctive eye to every portrait session. What stood out most was the attention to natural light and small, almost unnoticed expressions that ultimately became the strongest images of the shoot. The process was thoughtful, collaborative, and incredibly well considered from beginning to end.",
    sortOrder: 1,
    visible: true,
  },
  {
    id: "test_02",
    author: "Osasere Ighodaro",
    role: "Editorial Lead",
    location: "Edo Contemporary Arts",
    quote: "Working with Zetona in Benin City was an extraordinary experience. She has this calm mastery that immediately puts you at ease. The resulting portraits captured an elegance and quiet dignity that went far beyond what we had envisioned for the editorial feature.",
    sortOrder: 2,
    visible: true,
  },
  {
    id: "test_03",
    author: "Chukwuemeka Obi",
    role: "Founder & Curator",
    location: "Atelier V",
    quote: "Every frame felt like fine art. Zetona didn't just document the session; she sculpted atmosphere and contrast with studio light. Our brand campaign was celebrated across Lagos and Accra for its sheer cinematic depth.",
    sortOrder: 3,
    visible: true,
  },
  {
    id: "test_04",
    author: "Aminat Bello",
    role: "Fashion Stylist",
    location: "Benin City",
    quote: "The precision with lighting and skin tone fidelity is unmatched. She understands the weight of a gaze and the poetry of shadow. We booked two full-day studio sessions and the results were gallery-grade.",
    sortOrder: 4,
    visible: true,
  },
  {
    id: "test_05",
    author: "Kouame Diop",
    role: "Managing Director",
    location: "Pan-African Design Hub",
    quote: "A photographer who truly listens and creates an intimate, refined atmosphere. Our executive portrait suite received unanimous acclaim from our board and clients alike.",
    sortOrder: 5,
    visible: true,
  },
  {
    id: "test_06",
    author: "Efe Osazee",
    role: "Architect & Collector",
    location: "Benin City, Nigeria",
    quote: "Zetona is a generational talent. The sensitivity she brings to natural form and personal storytelling creates images you hold onto for decades.",
    sortOrder: 6,
    visible: true,
  },
];

/**
 * High quality curated development mock data matching the Rabah editorial inspiration
 * (warm portraits, still-life flowers, glassware, pastries, editorial fashion)
 */
export const mockCollections: CollectionDTO[] = [
  {
    id: "col_portraits_01",
    slug: "portraits",
    title: "Portraits",
    description: "Personality, vulnerability, and presence captured in quiet studio light.",
    photoCount: 6,
    sortOrder: 1,
    coverPhoto: {
      id: "ph_portrait_hero",
      title: "Presence in Linen",
      alt: "Editorial portrait of a woman with curly hair wearing white linen against a deep black backdrop",
      caption: "Natural studio light study, Benin City.",
      width: 1200,
      height: 1500,
      displayKey: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      dominantColor: "#1a1a1a",
      focal: { x: 0.5, y: 0.35 },
      collection: { id: "col_portraits_01", slug: "portraits", title: "Portraits" },
    },
  },
  {
    id: "col_studio_02",
    slug: "studio",
    title: "Studio Sessions",
    description: "Controlled shadow, honest expressions, and timeless monochrome tones.",
    photoCount: 4,
    sortOrder: 2,
    coverPhoto: {
      id: "ph_studio_01",
      title: "Sculpted Light",
      alt: "Portrait of a man in deep shadow and high contrast rim light",
      caption: "High key studio lighting experiment.",
      width: 1200,
      height: 1500,
      displayKey: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      dominantColor: "#121212",
      focal: { x: 0.5, y: 0.3 },
      collection: { id: "col_studio_02", slug: "studio", title: "Studio Sessions" },
    },
  },
  {
    id: "col_editorial_03",
    slug: "editorial",
    title: "Editorial & Mood",
    description: "Botanicals, textures, glassware, and cinematic storytelling.",
    photoCount: 4,
    sortOrder: 3,
    coverPhoto: {
      id: "ph_flower_flask",
      title: "Botanical Still Life",
      alt: "Glass conical vase with floating red and white flowers on minimal background",
      caption: "Still life exploration.",
      width: 1000,
      height: 1300,
      displayKey: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7",
      dominantColor: "#222222",
      focal: { x: 0.5, y: 0.4 },
      collection: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
    },
  },
];

export const mockPhotos: PhotoDTO[] = [
  // 1. Hero right large portrait (matching Rabah)
  {
    id: "ph_rabah_portrait",
    title: "Radiance",
    alt: "Woman with voluminous wavy hair and statement white earring in white top",
    caption: "Editorial studio portrait with delicate natural catchlights.",
    width: 1200,
    height: 1500,
    displayKey: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    dominantColor: "#161616",
    focal: { x: 0.5, y: 0.35 },
    featuredHome: true,
    featuredAbout: true,
    collection: { id: "col_portraits_01", slug: "portraits", title: "Portraits" },
  },
  // 2. Conical vase with floating flowers (matching Rabah top center)
  {
    id: "ph_rabah_vase",
    title: "Suspended Bloom",
    alt: "Clear glass conical laboratory flask filled with water and fresh red floral stems",
    caption: "Organic stillness and transparency.",
    width: 800,
    height: 1100,
    displayKey: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7",
    dominantColor: "#242424",
    focal: { x: 0.5, y: 0.45 },
    featuredHome: true,
    collection: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
  },
  // 3. Close up with white petals on face (matching Rabah bottom-left)
  {
    id: "ph_rabah_face_petal",
    title: "Soft Focus",
    alt: "Extreme close-up of a freckled face behind translucent white floral blossoms",
    caption: "Intimate portrait framing.",
    width: 900,
    height: 1100,
    displayKey: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6",
    dominantColor: "#201c18",
    focal: { x: 0.5, y: 0.4 },
    featuredHome: true,
    featuredAbout: true,
    collection: { id: "col_portraits_01", slug: "portraits", title: "Portraits" },
  },
  // 4. White dessert with fruit on dark plate (matching Rabah top right)
  {
    id: "ph_rabah_dessert",
    title: "Pâtisserie",
    alt: "Elegantly plated delicate white pastry with glazed berries on a dark rimmed plate",
    caption: "Culinary still life study.",
    width: 1000,
    height: 1000,
    displayKey: "https://images.unsplash.com/photo-1551024709-8f23befc6f87",
    dominantColor: "#1a1917",
    focal: { x: 0.5, y: 0.5 },
    featuredHome: true,
    collection: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
  },
  // 5. Model in floral skirt (matching Rabah mid-left)
  {
    id: "ph_rabah_floral_model",
    title: "Floral Movement",
    alt: "Fashion model outdoors in white collared blouse and bold floral patterned full skirt against clear blue sky",
    caption: "Outdoor editorial sunlight.",
    width: 900,
    height: 1350,
    displayKey: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
    dominantColor: "#1d2a3a",
    focal: { x: 0.5, y: 0.3 },
    featuredHome: true,
    collection: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
  },
  // 6. Crystal glass stem on textured concrete (matching Rabah top middle-right)
  {
    id: "ph_rabah_glass",
    title: "Crystal Reflection",
    alt: "Carved crystal goblet base casting intricate refractions on warm raw concrete surface",
    caption: "Refraction and shadow geometry.",
    width: 1200,
    height: 800,
    displayKey: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
    dominantColor: "#202020",
    focal: { x: 0.5, y: 0.5 },
    featuredHome: true,
    collection: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
  },
  // 7. Vivid red flowers on dark background (matching Rabah right edge)
  {
    id: "ph_rabah_red_petals",
    title: "Crimson Hue",
    alt: "Macro photograph of deep vermilion poppy petals bathed in directional light",
    caption: "Color contrast exploration.",
    width: 900,
    height: 1300,
    displayKey: "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
    dominantColor: "#3a0e0e",
    focal: { x: 0.5, y: 0.5 },
    featuredHome: true,
    collection: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
  },
  // 8. Studio male portrait
  {
    id: "ph_studio_man",
    title: "Contemplation",
    alt: "Monochrome portrait of a serene man looking away from the camera in soft shadow",
    caption: "Black and white studio study.",
    width: 1100,
    height: 1400,
    displayKey: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    dominantColor: "#151515",
    focal: { x: 0.5, y: 0.35 },
    featuredHome: true,
    featuredAbout: true,
    collection: { id: "col_studio_02", slug: "studio", title: "Studio Sessions" },
  },
  // 9. Modern fashion portrait
  {
    id: "ph_fashion_woman",
    title: "Silhouette in Blue",
    alt: "Woman wearing deep indigo jacket posing in a moody studio setting with cobalt undertones",
    caption: "Zetona cobalt lighting concept.",
    width: 1000,
    height: 1300,
    displayKey: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    dominantColor: "#111827",
    focal: { x: 0.5, y: 0.3 },
    featuredHome: true,
    featuredAbout: true,
    collection: { id: "col_portraits_01", slug: "portraits", title: "Portraits" },
  },
  // 10. Warm golden portrait
  {
    id: "ph_golden_hour",
    title: "Golden Hour Glow",
    alt: "Warm portrait illuminated by golden sunset sidelight highlighting skin texture",
    caption: "Natural warm evening shoot.",
    width: 1000,
    height: 1300,
    displayKey: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04",
    dominantColor: "#271b12",
    focal: { x: 0.5, y: 0.35 },
    featuredHome: true,
    collection: { id: "col_portraits_01", slug: "portraits", title: "Portraits" },
  },
];

export const mockSettings: SiteSettingsDTO = {
  headline: "Beautiful moments of beautiful people.",
  subline: "Studio & portrait photography, Benin City.",
  bio: "I'm Zetona_E, a studio and portrait photographer based in Benin City. My aim is to capture beautiful moments of beautiful people.\n\nEvery session is an intimate conversation between light, presence, and emotion. Working with deliberate patience and bespoke lighting, I create portraits that honor who you are in this moment.",
  showStats: false, // Per AGENTS rule 2 & DECISIONS ADR-010: hidden until real data
  showAwards: false, // Hidden until real data
  showTestimonials: false, // Hidden until real data
  homeSelectorMode: "collections",
  homeVariant: "collage",
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  xUrl: null,
};
