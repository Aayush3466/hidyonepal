export type Route = {
  slug: string;
  name: string;
  region: string;
  difficulty: "Easy" | "Moderate" | "Hard" | "Extreme";
  duration: string;
  maxAltitude: string;
  distance: string;
  bestSeason: string;
  startPoint: string;
  endPoint: string;
  permit: string;
  costNepali: string;
  costInternational: string;
  costNote: string;
  description: string;
  highlights: string[];
  weatherLat: number;
  weatherLon: number;
  tags: string[];
  feedTags: string[]; // matches tags users use when posting
};

export const ROUTES: Route[] = [
  {
    slug: "everest-base-camp",
    name: "Everest Base Camp",
    region: "Khumbu, Solukhumbu",
    difficulty: "Hard",
    duration: "12–14 days",
    maxAltitude: "5,364m (Kala Patthar 5,555m)",
    distance: "~130 km",
    bestSeason: "Mar–May, Sep–Nov",
    startPoint: "Lukla (fly from Kathmandu/Ramechhap)",
    endPoint: "Lukla",
    permit:
      "Sagarmatha National Park: NPR 3,000 (foreign) / Free (Nepali) + Khumbu Pasang Lhamu Local Fee: NPR 2,000",
    costNepali: "NPR 60,000–120,000",
    costInternational: "$750–$1,200 (solo) · $1,200–$2,500 (with guide)",
    costNote:
      "Biggest cost for internationals is the Lukla flight: ~$180–220 one way. Teahouse rooms NPR 500–1,500/night. Dal bhat NPR 600–900 on trail. Licensed guide mandatory for foreigners since 2023.",
    description:
      "The most iconic trek in the world, leading through Sherpa villages, ancient monasteries and glacial landscapes to the foot of the world's highest peak. Demanding but life-changing.",
    highlights: [
      "Namche Bazaar",
      "Tengboche Monastery",
      "Khumbu Glacier",
      "Kala Patthar viewpoint",
      "Everest Base Camp 5,364m",
    ],
    weatherLat: 27.9881,
    weatherLon: 86.925,
    tags: ["iconic", "high-altitude", "sherpa", "glacier", "everest"],
    feedTags: ["ebc", "everest", "everestbasecamp", "khumbu", "lukla"],
  },
  {
    slug: "annapurna-circuit",
    name: "Annapurna Circuit",
    region: "Annapurna, Gandaki",
    difficulty: "Moderate",
    duration: "14–21 days",
    maxAltitude: "5,416m (Thorong La Pass)",
    distance: "160–230 km",
    bestSeason: "Mar–May, Oct–Nov",
    startPoint: "Besisahar (bus from Kathmandu/Pokhara)",
    endPoint: "Nayapul or Pokhara",
    permit:
      "ACAP: NPR 3,000 (foreign) / NPR 1,000 (SAARC) / Free (Nepali). TIMS no longer required as of 2026.",
    costNepali: "NPR 25,000–70,000",
    costInternational: "$500–$800 (independent) · $700–$1,500 (with guide)",
    costNote:
      "No ATMs on trail — carry all cash from Pokhara or Kathmandu. Budget NPR 3,000–5,000 per day on trail for food, lodge, WiFi. Prices rise with altitude.",
    description:
      "One of the world's greatest long-distance treks, circling the Annapurna massif through subtropical forests, high-altitude desert and over the famous Thorong La Pass.",
    highlights: [
      "Thorong La Pass 5,416m",
      "Muktinath Temple",
      "Poon Hill sunrise",
      "Manang Valley",
      "Tatopani Hot Springs",
      "Pisang village",
    ],
    weatherLat: 28.5455,
    weatherLon: 84.0124,
    tags: ["classic", "diverse", "high-pass", "cultural", "long"],
    feedTags: [
      "annapurna",
      "annapurnacircuit",
      "act",
      "thorongla",
      "muktinath",
    ],
  },
  {
    slug: "langtang-valley",
    name: "Langtang Valley",
    region: "Langtang, Bagmati",
    difficulty: "Moderate",
    duration: "7–10 days",
    maxAltitude: "4,984m (Tserko Ri)",
    distance: "~65 km",
    bestSeason: "Mar–May, Oct–Dec",
    startPoint: "Syabrubesi (bus from Kathmandu ~7hrs, NPR 600–900)",
    endPoint: "Syabrubesi",
    permit:
      "Langtang National Park: NPR 3,000 (foreign) / NPR 1,500 (SAARC) / Free (Nepali). No TIMS required.",
    costNepali: "NPR 10,000–20,000 total · NPR 2,500–4,000/day",
    costInternational: "$525–$820 (guide mandatory for foreigners)",
    costNote:
      "Closest major trek to Kathmandu — no flight needed. Nepali citizens pay no permit fee. Teahouse rooms NPR 500–800/night. Dal bhat NPR 500–800. Best value trek in Nepal.",
    description:
      "The closest major trek to Kathmandu and the best value in Nepal. Stunning views of Langtang Lirung, deep Tamang culture, a cheese factory, and peaceful trails with far fewer crowds than EBC or Annapurna.",
    highlights: [
      "Kyanjin Gompa",
      "Tserko Ri viewpoint",
      "Langtang Village",
      "Kyanjin Cheese Factory",
      "Langtang Lirung views",
      "Tamang Heritage",
    ],
    weatherLat: 28.2114,
    weatherLon: 85.5146,
    tags: ["hidden-gem", "tamang", "close-to-ktm", "value", "family"],
    feedTags: ["langtang", "langtangvalley", "kyanjin", "syabrubesi"],
  },
  {
    slug: "poon-hill",
    name: "Poon Hill",
    region: "Annapurna, Gandaki",
    difficulty: "Easy",
    duration: "4–5 days",
    maxAltitude: "3,210m",
    distance: "~40 km",
    bestSeason: "Year-round (best Oct–Apr)",
    startPoint: "Nayapul (bus from Pokhara NPR 300 / jeep NPR 700)",
    endPoint: "Nayapul",
    permit:
      "ACAP: NPR 3,000 (foreign) / NPR 1,000 (SAARC) / Free (Nepali). Poon Hill viewpoint entry: NPR 100.",
    costNepali: "NPR 5,000–8,000 total",
    costInternational: "$150–$300 total (under $200 budget possible)",
    costNote:
      "Best beginner trek in Nepal. Nepali trekkers: rooms often free if you eat at the teahouse. Dal bhat NPR 400–500. No guide required for Nepalis. International trekkers now need a licensed guide.",
    description:
      "The perfect first trek in Nepal and the most accessible from Pokhara. Famous for the most spectacular Himalayan sunrise view over Annapurna and Dhaulagiri. Easy trails through rhododendron forests.",
    highlights: [
      "Poon Hill sunrise 3,210m",
      "Ghorepani village",
      "Rhododendron forests (bloom Mar–Apr)",
      "Annapurna South views",
      "Tadapani",
    ],
    weatherLat: 28.4,
    weatherLon: 83.7,
    tags: ["beginner", "sunrise", "short", "popular", "pokhara"],
    feedTags: ["poonhill", "ghorepani", "annapurna", "sunrise"],
  },
  {
    slug: "manaslu-circuit",
    name: "Manaslu Circuit",
    region: "Gorkha, Gandaki",
    difficulty: "Hard",
    duration: "14–18 days",
    maxAltitude: "5,106m (Larkya La Pass)",
    distance: "~177 km",
    bestSeason: "Mar–May, Sep–Nov",
    startPoint: "Soti Khola (drive from Kathmandu ~7–8hrs)",
    endPoint: "Besisahar",
    permit:
      "Manaslu Restricted Area Permit + MCAP + ACAP (crossing Larkya La). Licensed guide mandatory. Permit costs ~$55–100 USD depending on season.",
    costNepali: "NPR 25,000–40,000",
    costInternational: "$950–$1,200 (group) · $1,500–$2,200 (private)",
    costNote:
      "Restricted area — licensed guide is legally mandatory for all trekkers including Nepalis. Less crowded than Annapurna Circuit but similar landscapes. Great alternative for experienced trekkers.",
    description:
      "A remote and spectacular circuit around the world's 8th highest mountain. Far fewer crowds than Annapurna with equally stunning scenery. Requires proper permits and a licensed guide.",
    highlights: [
      "Larkya La Pass 5,106m",
      "Birendra Lake",
      "Tsum Valley detour",
      "Tibetan border villages",
      "Manaslu views",
      "Budhi Gandaki Gorge",
    ],
    weatherLat: 28.55,
    weatherLon: 84.56,
    tags: ["remote", "restricted", "less-crowded", "experienced", "wilderness"],
    feedTags: ["manaslu", "manasluCircuit", "larkyala", "restricted"],
  },
  {
    slug: "upper-mustang",
    name: "Upper Mustang",
    region: "Mustang, Gandaki",
    difficulty: "Moderate",
    duration: "10–14 days",
    maxAltitude: "~4,000m (Lo Manthang)",
    distance: "~100 km",
    bestSeason: "Mar–Nov (monsoon-safe — rain shadow area)",
    startPoint: "Jomsom (fly from Pokhara ~$150–170 one way)",
    endPoint: "Jomsom",
    permit:
      "Upper Mustang Restricted Area Permit: USD 500 for first 10 days (USD 50/day after). ACAP also required. Licensed guide mandatory.",
    costNepali: "NPR 80,000–150,000 (permit cheaper for Nepalis)",
    costInternational: "$2,000–$3,500+ (permit alone is $500)",
    costNote:
      "Most expensive trek in Nepal due to the restricted area permit. Unique because it's in a rain shadow — you can trek during monsoon season when all other routes are wet. Ancient Tibetan culture completely preserved.",
    description:
      "The forbidden kingdom — a surreal high-altitude desert landscape with ancient cave monasteries, medieval walled cities and Tibetan culture untouched by modernity. Unlike anywhere else in Nepal.",
    highlights: [
      "Lo Manthang walled city",
      "Sky Caves of Mustang",
      "Chungsi Cave monastery",
      "Muktinath Temple",
      "Red cliff formations",
      "Ancient Bon monasteries",
    ],
    weatherLat: 29.1833,
    weatherLon: 83.9667,
    tags: [
      "restricted",
      "tibet",
      "desert",
      "cultural",
      "unique",
      "monsoon-safe",
    ],
    feedTags: ["mustang", "uppermustang", "lomanthang", "forbidden"],
  },
  {
    slug: "gokyo-lakes",
    name: "Gokyo Lakes",
    region: "Khumbu, Solukhumbu",
    difficulty: "Hard",
    duration: "12–15 days",
    maxAltitude: "5,483m (Gokyo Ri)",
    distance: "~110 km",
    bestSeason: "Mar–May, Oct–Nov",
    startPoint: "Lukla (fly from Kathmandu/Ramechhap)",
    endPoint: "Lukla",
    permit:
      "Sagarmatha National Park: NPR 3,000 (foreign) / Free (Nepali) + Khumbu Local Fee: NPR 2,000",
    costNepali: "NPR 60,000–110,000",
    costInternational: "$800–$2,000 (with guide)",
    costNote:
      "Same permit and Lukla flight cost as EBC. Often combined with EBC via Cho La Pass for a full Khumbu experience. Less crowded than EBC trail with arguably better panoramic views from Gokyo Ri.",
    description:
      "A stunning and less crowded alternative to EBC. The sacred turquoise Gokyo Lakes at 4,700m–5,000m sit beneath Ngozumpa Glacier — Nepal's longest. Gokyo Ri offers a 360° panorama of 4 eight-thousanders.",
    highlights: [
      "Gokyo Lakes series",
      "Gokyo Ri 5,483m",
      "Ngozumpa Glacier",
      "Cho La Pass",
      "Renjo La Pass",
      "Views of Everest + Cho Oyu + Makalu + Lhotse",
    ],
    weatherLat: 27.9617,
    weatherLon: 86.6833,
    tags: ["lakes", "glacier", "panoramic", "less-crowded", "khumbu"],
    feedTags: ["gokyo", "gokyolakes", "gokyori", "khumbu", "ngozumpa"],
  },
  {
    slug: "mardi-himal",
    name: "Mardi Himal",
    region: "Annapurna, Gandaki",
    difficulty: "Moderate",
    duration: "5–7 days",
    maxAltitude: "4,500m (High Camp)",
    distance: "~50 km",
    bestSeason: "Mar–May, Oct–Nov",
    startPoint: "Kande (jeep/bus from Pokhara)",
    endPoint: "Siding village",
    permit: "ACAP: NPR 3,000 (foreign) / NPR 1,000 (SAARC) / Free (Nepali)",
    costNepali: "NPR 15,000–35,000",
    costInternational: "$400–$900",
    costNote:
      "Best short trek for close-up views of Machhapuchhre (Fishtail) and Annapurna South. Very few crowds. No flight needed. Easy to combine with Pokhara trip. Perfect for a 1-week Nepal visit.",
    description:
      "A hidden trail through dense rhododendron and oak forests offering incredibly close views of Mardi Himal, the sacred Machhapuchhre (Fishtail Mountain), and the full Annapurna range. One of Nepal's best kept secrets.",
    highlights: [
      "High Camp panorama 4,500m",
      "Mardi Himal Base Camp",
      "Machhapuchhre close views",
      "Dense rhododendron forest",
      "Siding village homestays",
    ],
    weatherLat: 28.45,
    weatherLon: 83.9,
    tags: ["hidden", "short", "less-crowded", "pokhara", "beginner-friendly"],
    feedTags: ["mardihimal", "mardi", "machhapuchhre", "fishtail", "annapurna"],
  },
];

export function getRoute(slug: string): Route | undefined {
  return ROUTES.find((r) => r.slug === slug);
}

export const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "bg-green-900/50 text-green-400 border border-green-800",
  Moderate: "bg-blue-900/50 text-blue-400 border border-blue-800",
  Hard: "bg-orange-900/50 text-orange-400 border border-orange-800",
  Extreme: "bg-red-900/50 text-red-400 border border-red-800",
};
