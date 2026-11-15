/**
 * Downloads openly licensed photography for BHS Premier Pawn and Jewelry.
 *
 *   npm run fetch-images              download anything missing
 *   npm run fetch-images -- --plan    print every search query, no network
 *   npm run fetch-images -- --only=products,hero
 *   npm run fetch-images -- --force   re-download the selected groups
 *
 * Sources
 *   - PEXELS_API_KEY set in .env.local → Pexels for everything.
 *   - Otherwise, no key needed:
 *       products            → Wikimedia Commons, searched by the actual model name
 *       hero/categories/... → Openverse stock sources (StockSnap, rawpixel; CC0),
 *                             falling back to Wikimedia Commons
 *   Only licenses that allow commercial use are accepted (CC0, public domain,
 *   CC BY, CC BY-SA, Pexels License). Every photo is recorded with its creator
 *   and license in data/image-credits.json, which also drives the Photo
 *   Credits page — attribution is required for CC BY / CC BY-SA.
 *
 * Images land in public/images/{hero,categories,products,blog,about}/.
 * Safe to re-run: files already on disk and in the credits file are skipped.
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { BlogPost, Category, Product } from "../lib/types";

type Group = "hero" | "categories" | "products" | "blog" | "about";
type Orientation = "landscape" | "square";
type Provider = "pexels" | "commons" | "openverse";

type Job = {
  group: Group;
  subject: string; // product/category/post slug, or a fixed id
  label: string; // human name, used for alt text
  queries: string[]; // tried in order until `count` photos are found
  count: number;
  orientation: Orientation;
  hero: boolean; // bigger download
  noPeople: boolean;
};

export type ImageCredit = {
  key: string; // e.g. "products/rolex-datejust-36-steel-and-white-gold-1"
  group: Group;
  subject: string;
  index: number; // 1-based position within the subject
  file: string; // public URL, e.g. /images/products/…-1.jpg
  alt: string;
  query: string;
  source: string; // "pexels", "wikimedia", "stocksnap", "rawpixel"…
  sourceId: string;
  sourceUrl: string; // page the photo came from
  creator: string;
  creatorUrl: string | null;
  license: string; // e.g. "CC0", "CC BY-SA 4.0", "Pexels License"
  licenseUrl: string;
};

/** A search result from any provider, normalized. */
type Candidate = {
  id: string; // "<provider>-<id>"
  imageUrl: string;
  ext: "jpg" | "png";
  title: string;
  description: string; // title + tags, for the people / junk filters
  creator: string;
  creatorUrl: string | null;
  sourceUrl: string;
  source: string;
  license: string;
  licenseUrl: string;
};

/* ------------------------------------------------------------------ */
/* Search queries. Edit these to change what gets downloaded.          */
/* ------------------------------------------------------------------ */

/**
 * Per product: [exact model queries for Wikimedia Commons…, generic stock query for Pexels].
 * The last entry is always the generic description.
 */
const PRODUCT_QUERIES: Record<string, string[]> = {
  "rolex-datejust-36-steel-and-white-gold": ["Rolex Datejust", "luxury steel wristwatch"],
  "1-52-ct-round-diamond-solitaire-14k-white-gold": ["diamond solitaire ring", "diamond engagement ring", "diamond solitaire engagement ring"],
  "cuban-link-chain-10k-yellow-gold-22-in": ["Cuban link chain", "gold chain necklace", "gold chain necklace"],
  "omega-seamaster-diver-300m": ["Omega Seamaster Diver 300M", "Omega Seamaster", "diver watch blue dial"],
  "tennis-bracelet-4-00-ctw-14k-white-gold": ["diamond tennis bracelet", "diamond bracelet", "diamond bracelet jewelry"],
  "1-oz-gold-bar-pamp-suisse-fortuna": ["PAMP Suisse gold bar", "gold bar 1 oz", "gold bar bullion"],
  "10-oz-silver-bar-engelhard": ["Engelhard silver bar", "silver bullion bar", "silver bullion bar"],
  "1-10-oz-american-gold-eagle-random-year": ["American Gold Eagle coin", "American Gold Eagle", "gold coin close up"],
  "1893-s-morgan-silver-dollar-pcgs-vf20": ["1893-S Morgan dollar", "Morgan dollar", "old silver dollar coin"],
  "1924-saint-gaudens-20-double-eagle-ms63": ["Saint-Gaudens double eagle 1924", "Saint-Gaudens double eagle", "antique gold coin"],
  "2021-silver-proof-set-original-mint-packaging": ["United States Mint silver proof set", "proof set coins", "silver coins collection"],
  "louis-vuitton-neverfull-mm-monogram": ["Louis Vuitton Neverfull", "Louis Vuitton monogram bag", "designer leather tote bag"],
  "gucci-gg-marmont-small-shoulder-bag": ["Gucci Marmont", "Gucci handbag", "luxury leather shoulder bag"],
  "chanel-classic-flap-wallet-caviar": ["Chanel wallet", "Chanel quilted", "black leather wallet"],
  "ray-ban-aviator-classic-sunglasses": ["Ray-Ban Aviator", "aviator sunglasses", "aviator sunglasses"],
  "iphone-16-pro-256gb-unlocked": ["iPhone 16 Pro", "iPhone 15 Pro", "iphone smartphone"],
  "samsung-galaxy-s25-ultra-512gb": ["Samsung Galaxy S25 Ultra", "Samsung Galaxy S24 Ultra", "android smartphone"],
  "ipad-air-11-inch-m2-128gb-wi-fi": ["iPad Air", "iPad Air 2024", "ipad tablet"],
  "apple-watch-series-10-46mm-gps": ["Apple Watch Series 10", "Apple Watch Series 9", "apple watch smartwatch"],
  "macbook-pro-14-m3-pro-18gb-512gb": ["MacBook Pro M3", "MacBook Pro 14-inch", "macbook laptop"],
  "dell-xps-15-core-i7-rtx-4060": ["Dell XPS 15", "Dell XPS", "laptop computer on desk"],
  "lg-ultragear-27-1440p-165hz-monitor": ["LG UltraGear monitor", "gaming monitor", "computer monitor desk setup"],
  "playstation-5-slim-disc-edition-1tb": ["PlayStation 5 Slim", "PlayStation 5", "playstation 5 console"],
  "nintendo-switch-oled-white": ["Nintendo Switch OLED", "Nintendo Switch", "nintendo switch"],
  "xbox-series-x-1tb": ["Xbox Series X", "Xbox Series X controller", "xbox console controller"],
  "samsung-65-qled-4k-smart-tv": ["Samsung QLED television", "Samsung smart TV", "flat screen tv living room"],
  "sonos-arc-soundbar-black": ["Sonos Arc", "Sonos soundbar", "soundbar speaker"],
  "audio-technica-at-lp120x-turntable": ["Audio-Technica AT-LP120", "Audio-Technica turntable", "turntable vinyl record player"],
  "fender-american-professional-ii-stratocaster": ["Fender American Professional Stratocaster", "Fender Stratocaster", "electric guitar stratocaster"],
  "1978-gibson-les-paul-custom": ["Gibson Les Paul Custom", "Gibson Les Paul", "les paul electric guitar"],
  "yamaha-p-225-digital-piano": ["Yamaha P-225", "Yamaha digital piano", "digital piano keyboard"],
  "sony-alpha-a7-iv-body": ["Sony α7 IV", "Sony Alpha 7 IV", "Sony Alpha 7", "mirrorless camera"],
  "canon-rf-24-70mm-f-2-8l-is-usm": ["Canon RF 24-70mm", "Canon RF lens", "camera lens close up"],
  "leica-m6-film-camera-black-chrome": ["Leica M6", "Leica M6 TTL", "vintage rangefinder film camera"],
  "dji-mini-4-pro-fly-more-combo": ["DJI Mini 4 Pro", "DJI Mini", "camera drone"],
  "dewalt-20v-max-5-tool-combo-kit": ["DeWalt 20V MAX", "DeWalt cordless", "cordless power tools"],
  "milwaukee-m18-fuel-hammer-drill": ["Milwaukee M18", "Milwaukee drill", "cordless power drill"],
  "taylormade-qi10-driver-10-5": ["TaylorMade driver", "golf driver club head", "golf driver club"],
  "trek-fx-3-disc-hybrid-bike-medium": ["Trek FX hybrid bike", "Trek bicycle", "hybrid bicycle"],
  "yeti-tundra-45-cooler": ["Yeti Tundra cooler", "Yeti cooler", "camping cooler"],
  "iphone-15-128gb-unlocked": ["iPhone 15", "iPhone 15 Plus", "iphone smartphone"],
  "iphone-13-128gb-unlocked": ["iPhone 13", "iPhone 13 mini", "iphone smartphone"],
  "google-pixel-9-pro-256gb-unlocked": ["Pixel 9 Pro", "Google Pixel 9", "android smartphone"],
  "samsung-galaxy-z-flip6-256gb": ["Galaxy Z Flip6", "Galaxy Z Flip", "android smartphone"],
  "samsung-galaxy-tab-s9-128gb-wi-fi": ["Galaxy Tab S9", "Galaxy Tab S8", "android tablet"],
  "apple-airpods-pro-2nd-gen-usb-c": ["AirPods Pro", "wireless earbuds"],
  "kindle-paperwhite-16gb-12th-gen": ["Kindle Paperwhite", "e-reader"],
  "garmin-fenix-7-sapphire-solar": ["Garmin Fenix", "Garmin fenix 7", "sports watch"],
  "macbook-air-13-m2-8gb-256gb": ["MacBook Air M2", "macbook laptop"],
  "lenovo-thinkpad-x1-carbon-gen-11": ["ThinkPad X1 Carbon", "ThinkPad X1", "laptop computer on desk"],
  "asus-rog-zephyrus-g14-rtx-4070": ["ROG Zephyrus G14", "ASUS ROG Zephyrus", "gaming laptop"],
  "microsoft-surface-laptop-5-13-5": ["Surface Laptop", "Microsoft Surface Laptop", "laptop computer on desk"],
  "hp-spectre-x360-14-2-in-1": ["HP Spectre x360", "HP Spectre", "laptop computer on desk"],
  "apple-imac-24-m3-8gb-256gb": ["iMac M3", "iMac 24 M1", "imac desktop computer"],
  "steam-deck-oled-512gb": ["Steam Deck OLED", "Steam Deck", "handheld game console"],
  "xbox-series-s-512gb": ["Xbox Series S", "xbox console controller"],
  "nintendo-switch-lite-turquoise": ["Nintendo Switch Lite", "nintendo switch"],
  "playstation-4-pro-1tb": ["PlayStation 4 Pro", "PS4 Pro", "playstation controller"],
  "meta-quest-3-128gb": ["Meta Quest 3", "Oculus Quest 2", "virtual reality headset"],
  "super-nintendo-snes-console-with-2-controllers": ["Super Nintendo Entertainment System", "SNES controller", "retro video game console"],
  "playstation-dualsense-edge-controller": ["DualSense Edge", "DualSense controller", "game controller"],
  "canon-eos-r6-mark-ii-body": ["Canon EOS R6 Mark II", "Canon EOS R6", "mirrorless camera"],
  "nikon-z6-ii-body": ["Nikon Z6 II", "Nikon Z 6", "mirrorless camera"],
  "fujifilm-x-t5-body-silver": ["Fujifilm X-T5", "Fujifilm X-T4", "fujifilm camera"],
  "canon-eos-5d-mark-iv-body": ["Canon EOS 5D Mark IV", "dslr camera"],
  "nikon-d750-with-24-120mm-f-4-lens": ["Nikon D750", "nikon dslr camera"],
  "gopro-hero12-black": ["GoPro HERO12", "GoPro Hero", "action camera"],
  "sony-fe-85mm-f-1-8-lens": ["Sony FE 85mm F1.8", "Sony FE 85mm", "camera lens close up"],
  "makita-18v-lxt-6-1-2-circular-saw": ["Makita circular saw", "circular saw"],
  "dewalt-12-sliding-compound-miter-saw": ["DeWalt miter saw", "mitre saw", "miter saw"],
  "milwaukee-m18-fuel-impact-driver": ["Milwaukee impact driver", "impact driver", "impact driver"],
  "bosch-bulldog-sds-plus-rotary-hammer": ["Bosch rotary hammer", "Bosch hammer drill", "hammer drill"],
  "stihl-ms-250-chainsaw-18-bar": ["Stihl MS 250", "Stihl chainsaw", "chainsaw"],
  "honda-eu2200i-inverter-generator": ["Honda EU2200i", "Honda inverter generator", "portable generator"],
  "sony-wh-1000xm5-wireless-headphones": ["WH-1000XM5", "Sony WH-1000XM4", "wireless headphones"],
  "canada-goose-expedition-parka-men-s-l": ["Canada Goose parka", "parka jacket"],
  "burberry-kensington-heritage-trench-coat": ["Burberry trench coat", "trench coat"],
  "arc-teryx-beta-ar-jacket-men-s-m": ["Arc'teryx jacket", "rain jacket"],
  "air-jordan-1-retro-high-og-men-s-10": ["Air Jordan 1", "Air Jordan 1 Chicago", "sneakers"],
  "nike-dunk-low-panda-men-s-9-5": ["Nike Dunk Low", "sneakers"],
  "christian-louboutin-so-kate-120-pumps-size-38": ["Christian Louboutin shoes", "Louboutin", "red sole high heels"],
  "gucci-horsebit-leather-loafers-men-s-9": ["Gucci horsebit loafer", "Gucci loafers", "leather loafers"],
  "dr-martens-1460-smooth-leather-boots-size-9": ["Dr. Martens 1460", "Dr. Martens boots", "leather boots"],
  "levi-s-vintage-501-jeans-1990s-32-32": ["Levi's 501", "denim jeans"],
};

/** Stock-style queries (short ones match best on Openverse). */
const CATEGORY_QUERIES: Record<string, string[]> = {
  "jewelry-watches": ["jewelry", "watch"],
  "gold-bullion": ["gold bars", "gold bullion"],
  coins: ["coins", "old coins"],
  "designer-handbags": ["handbag", "leather bag"],
  "phones-tablets": ["smartphone", "iphone"],
  "laptops-computers": ["laptop", "macbook"],
  "video-gaming": ["game controller", "gaming"],
  "tvs-home-audio": ["television", "speaker"],
  "musical-instruments": ["guitar", "electric guitar"],
  "cameras-lenses": ["camera", "camera lens"],
  "power-tools": ["power tools", "drill"],
  "sporting-goods": ["bicycle", "bike"],
  "clothing-shoes": ["clothing rack", "clothes hanging"],
};

const HERO: Array<{ subject: string; label: string; queries: string[] }> = [
  { subject: "luxury", label: "Luxury watch", queries: ["watch", "luxury watch"] },
  { subject: "pawn", label: "Jewelry display", queries: ["jewelry", "jewelry store"] },
  { subject: "rare", label: "Gold coins", queries: ["gold coins", "coins"] },
];

const BLOG_QUERIES: Record<string, string[]> = {
  "how-pawn-loans-work": ["jeweler", "magnifying glass jewelry", "jeweler loupe appraisal"],
  "whats-your-gold-worth": ["gold jewelry", "gold", "gold jewelry pile"],
  "spotting-authentic-designer-bags": ["leather handbag", "handbag", "luxury handbag leather detail"],
};

const ABOUT: Array<{ subject: string; label: string; queries: string[] }> = [
  { subject: "store", label: "Jewelry display", queries: ["necklace display", "jewelry display", "jewelry store display"] },
  { subject: "how-pawning", label: "Appraising jewelry", queries: ["jeweler", "ring", "jeweler examining ring"] },
  { subject: "how-selling", label: "Cash payment", queries: ["cash", "money", "counting cash money"] },
];

/** Hand-written alt text for photos whose source titles aren't descriptive enough. */
const ALT_TEXT: Record<string, string> = {
  "hero/luxury": "Close-up of a steel dive watch with a dark dial",
  "hero/pawn": "Diamond necklace on a white bust in a jewelry case",
  "hero/rare": "Stack of gold coins",
  "categories/jewelry-watches": "Steel chronograph wristwatch",
  "categories/gold-bullion": "Rows of small gold bars",
  "categories/coins": "Stacks of coins on a wooden table",
  "categories/clothing-shoes": "Neutral-toned clothes on wooden hangers",
  "categories/designer-handbags": "Brown leather travel bag",
  "categories/phones-tablets": "Smartphone and notebook on a white desk",
  "categories/laptops-computers": "Laptop, glasses and coffee on a wooden desk",
  "categories/video-gaming": "Close-up of colored game controller buttons",
  "categories/tvs-home-audio": "Vintage television set",
  "categories/musical-instruments": "Acoustic guitar against a white wall",
  "categories/cameras-lenses": "Mirrorless camera beside a wristwatch on a white desk",
  "categories/power-tools": "Orange cordless power drill",
  "categories/sporting-goods": "Road bike handlebars with red bar tape",
  "blog/how-pawn-loans-work": "Magnifying glass on a gray surface",
  "blog/whats-your-gold-worth": "Gold rings and jewelry",
  "blog/spotting-authentic-designer-bags": "White leather handbag carried by its handle",
  "about/store": "Vintage pendant necklace on a display bust",
  "about/how-pawning": "Diamond ring with a blue center stone",
  "about/how-selling": "Pile of US dollar bills",
};

/** Product photos per item (3–4 asked for; 4 fills every gallery slot). */
const PHOTOS_PER_PRODUCT = 4;

/** Words that usually mean a person is in the shot. */
const PEOPLE = /\b(man|men|woman|women|person|people|girl|girls|boy|boys|guy|lady|child|children|kid|kids|face|portrait|model|smiling|couple|bride|groom|selfie|businessman|businesswoman|wearing|worn)\b/i;

/** Titles that are rarely a clean product photo. */
const JUNK = /\b(logo|diagram|terminology|map|chart|screenshot|drawing|illustration|label|catalog|advert|advertisement|patent|box art|packaging only|manual|teardown|disassembled|motherboard|x-ray|exploded|render|icon|scan of|stamp)\b/i;

/**
 * Photos ruled out after looking at them (wrong item, people, watermark, poor
 * quality). Format: "<provider>-<sourceId>" — e.g. "commons-Rolex_Datejust_1603.jpg".
 */
const REJECTED = new Set<string>([]);

/**
 * Hand-picked photos, in display order, chosen by reviewing contact sheets.
 * A pinned item is never searched: the script downloads exactly these (or
 * keeps them if already on disk). Delete an entry to let the script search
 * for that item again. Items not listed here (e.g. new products) are searched.
 */
const PINNED: Record<string, string[]> = {
  "hero/luxury": [
    "openverse-dd2ba7ca-830d-42b8-a785-6e973163dd6b",
  ],
  "hero/pawn": [
    "openverse-5b2230ed-278f-4938-895c-e01f7c188dc1",
  ],
  "hero/rare": [
    "openverse-863aeb3c-7022-46b4-8492-faa1181250bc",
  ],
  "categories/cameras-lenses": [
    "openverse-e7a51219-5af9-43d8-9b33-4b03a3b8007f",
  ],
  "categories/coins": [
    "openverse-82be6e33-7fa1-40b3-9661-f82890bb74f2",
  ],
  "categories/designer-handbags": [
    "openverse-3e413e9e-4570-4468-81ed-4579c1332f55",
  ],
  "categories/gold-bullion": [
    "openverse-9952ce15-d0db-4255-be11-86a8f52f67f1",
  ],
  "categories/jewelry-watches": [
    "openverse-ba6e536f-5dc7-4891-a98b-95c8f5860717",
  ],
  "categories/laptops-computers": [
    "openverse-be2d15cc-89b8-4041-bfb3-65ea646b2ef0",
  ],
  "categories/musical-instruments": [
    "openverse-4a1f646e-880c-4d3c-955a-af823b25ccb6",
  ],
  "categories/phones-tablets": [
    "openverse-89a7263a-ae30-4970-993d-7a9fd5bcf998",
  ],
  "categories/power-tools": [
    "openverse-8cf42569-36af-4a26-a7b8-c860fa69b974",
  ],
  "categories/sporting-goods": [
    "openverse-67b63454-4b76-41a5-8289-af9a2793f486",
  ],
  "categories/tvs-home-audio": [
    "openverse-ffb77723-88b4-42e4-8069-23b42cb00d1c",
  ],
  "categories/video-gaming": [
    "openverse-6277f67a-b258-4397-b617-36e88ebf7f87",
  ],
  "products/1-10-oz-american-gold-eagle-random-year": [
    "commons-Liberty_$50_Obverse.png",
    "commons-Liberty_$50_Reverse.png",
    "commons-Gold_Coins_(3119590886).jpg",
  ],
  "products/1-52-ct-round-diamond-solitaire-14k-white-gold": [
    "commons-Solitaer-Ring.jpg",
    "commons-Vintage_diamond_engagement_ring.jpg",
    "commons-Solitary_ring_and_diamond.JPG",
    "commons-Chelsea-solitaire-engagement-ring-oval-3-rows-pave-18k-white-gold.jpg",
  ],
  "products/1-oz-gold-bar-pamp-suisse-fortuna": [
    "commons-Enu-1-oz-Gold-Bar-9999-1009-20000-2.jpg",
    "commons-Gold_bar_400_oz.JPG",
    "commons-400-oz-Gold-Bars-AB-01.jpg",
  ],
  "products/10-oz-silver-bar-engelhard": [
    "commons-Johnson_Matthey_500_grammes_silver_bullion.jpg",
    "commons-100_Troy_oz._Silver_Bullion_Bar_from_Johnson_Matthey.jpg",
    "commons-Chip_silver_bullion_bar.jpg",
    "commons-1000oz.silver.bullion.bar.underneath.png",
  ],
  "products/1893-s-morgan-silver-dollar-pcgs-vf20": [
    "commons-1879S_Morgan_Dollar_NGC_MS67plus_Reverse.png",
    "commons-1879S_Morgan_Dollar_NGC_MS67plus_Obverse.png",
  ],
  "products/1924-saint-gaudens-20-double-eagle-ms63": [
    "commons-1924_double_eagle.jpg",
    "commons-Specimen1Obv.jpg",
    "commons-NNC-US-1907-G$20-Saint_Gaudens_(Roman,_high_relief)_\u2013_edge_detail.jpg",
    "commons-Specimen1Rev.jpg",
  ],
  "products/1978-gibson-les-paul-custom": [
    "commons-Les_Paul_2_(16525809832).jpg",
    "commons-1974_Gibson_Les_Paul_Custom.JPG",
  ],
  "products/2021-silver-proof-set-original-mint-packaging": [
    "commons-1995_U.S._Mint_silver_proof_set.jpg",
  ],
  "products/apple-watch-series-10-46mm-gps": [
    "commons-Apple_Watch_Series_10.png",
    "commons-Apple_Watch_10.png",
    "commons-Apple_Watch_Demo.jpg",
    "commons-Apple_Watch_Series_10.JPG",
  ],
  "products/audio-technica-at-lp120x-turntable": [
    "commons-Atlp120.jpg",
    "commons-Audio_Technica_AT-LP120_close-up.jpg",
    "commons-Audio-Technica_AT95E_cartridge.jpg",
  ],
  "products/canon-rf-24-70mm-f-2-8l-is-usm": [
    "commons-Canon_EOS_R5_with_Canon_RF_24-70mm_F2.8L_IS_USM_(50170662581).jpg",
    "commons-Canon_EOS_R5+RF_24-70mm_f2.8L_IS_USM_(3).jpg",
    "commons-Canon_EOS_R5+RF_24-70mm_f2.8L_IS_USM_(4).jpg",
    "commons-Canon_EOS_5D_Mark_IV+_EF_24-105mm_f4L_IS_II_USM_&_Canon_EOS_R5_+_RF_24-70mm_f2.8L_IS_USM.jpg",
  ],
  "products/chanel-classic-flap-wallet-caviar": [
    "openverse-5798eb79-75d5-4ae5-89dc-296c77a679df",
    "openverse-5da1a555-5622-403f-b933-cc7fc7cc5729",
    "openverse-0ffca88f-9f43-49db-8fc5-72e342d35a27",
  ],
  "products/cuban-link-chain-10k-yellow-gold-22-in": [
    "openverse-00c78125-7776-4b8b-a127-4b965628362b",
    "openverse-7cbbc13e-3dc1-4b1a-83d9-7595ce9144ba",
    "openverse-a56a19b0-b9ef-48e6-8bf9-5433bf8d5e17",
  ],
  "products/dell-xps-15-core-i7-rtx-4060": [
    "commons-Dell_XPS_15_(2017).png",
    "commons-Dell_XPS_15_(2015).png",
    "commons-Dell_XPS_13_(2017).png",
    "commons-DELL_XPS_13_and_15_(37080596413).jpg",
  ],
  "products/dewalt-20v-max-5-tool-combo-kit": [
    "commons-DeWalt_20_Volt_Max_Cordless_Drill.jpg",
    "commons-Cordless_screwdriver_(2)_(12486969543).jpg",
    "commons-DeWalt_DCD797_impact_drill_(51634743390).jpg",
  ],
  "products/dji-mini-4-pro-fly-more-combo": [
    "commons-2024_Dron_DJI_Mini_4_Pro_(14).jpg",
    "commons-2024_Dron_DJI_Mini_4_Pro_(01).jpg",
    "commons-2024_Dron_DJI_Mini_4_Pro_(17).jpg",
    "commons-2024_Dron_DJI_Mini_4_Pro_(15).jpg",
  ],
  "products/fender-american-professional-ii-stratocaster": [
    "commons-Fender_Stratocaster_Deluxe_Player_Series.JPG",
    "commons-Fender_stratocaster_black.jpg",
    "commons-Rear_fender_stratocaster_Starcaster.jpg",
  ],
  "products/gucci-gg-marmont-small-shoulder-bag": [
    "commons-Zwart_leren_dameshandtas_met_bamboe_hengsel_en_sluiting,_objectnr_69700-1-2(1).JPG",
    "commons-Gucci,_bamboo_bag,_1960-65_ca._(firenze,_archivio_storico_gucci).jpg",
  ],
  "products/ipad-air-11-inch-m2-128gb-wi-fi": [
    "commons-IPad_Air.png",
    "commons-Apple_iPad_Air_2_vs_iPad_Air_(15462494089).jpg",
  ],
  "products/iphone-16-pro-256gb-unlocked": [
    "commons-IPhone_16_Pro_Max_Desert_Titanium_Rear.png",
    "commons-IPhone_16_Pro_series.jpg",
    "commons-Compare_iPhone_16_Pro_with_the_iPhone_15_Pro.jpg",
  ],
  "products/leica-m6-film-camera-black-chrome": [
    "commons-Leica_M6_TTL_front.jpg",
    "commons-Leica_M6.jpg",
  ],
  "products/lg-ultragear-27-1440p-165hz-monitor": [
    "openverse-42f30356-c8c4-4eb0-b1c5-8bd4ca05e336",
    "openverse-86e11148-a40d-4887-b455-77b8e5024d18",
    "commons-Gaming_PC-Setup_-_Astaroth-_The_Completed_System.jpg",
  ],
  "products/louis-vuitton-neverfull-mm-monogram": [
    "commons-MC_\u8def\u6c39_Cotai_\u6fb3\u9580\u9280\u6cb3_Galaxy_Macau_mall_\u5546\u5834_The_Promenade_shop_March_2026_N13P_126_Louis_Vuitton_handbag.jpg",
    "commons-Hacking_bandouliere_sac_Louis_Vuitton_noe_Toile_monogram_avant_apres.jpg",
    "commons-Op_Gemini_-_Louis_Vuitton_-_handbags_(12517674034).jpg",
  ],
  "products/macbook-pro-14-m3-pro-18gb-512gb": [
    "commons-MacBook_Pro_13_(M1,_2020).jpg",
    "commons-Apple_MacBook_Pro_(M3).jpg",
    "commons-Backlit_MacBook_Pro_keyboard.jpg",
  ],
  "products/milwaukee-m18-fuel-hammer-drill": [
    "openverse-6885c28e-52d9-4005-8926-240693bf5fb0",
    "openverse-1dbb3784-6a01-4e79-8bd4-c800d7d68869",
    "openverse-06c86570-9e55-4332-967e-ea42ca315e7d",
  ],
  "products/nintendo-switch-oled-white": [
    "commons-Nintendo_Switch_\u2013_OLED-Modell,_Konsole_und_Dock_20230506.png",
    "openverse-f3ddbdfa-a7e4-40d3-a54e-6d723618addf",
    "openverse-7ea24083-faa7-4da3-90a1-f98b9c477559",
    "commons-Nintendo_Switch(handheld_game_system).jpg",
  ],
  "products/omega-seamaster-diver-300m": [
    "commons-Omega-Seamaster-p1020458.jpg",
    "commons-Omega_Seamaster_300_militare.jpg",
    "commons-Omega_seamaster_omegamatic_black.JPG",
  ],
  "products/playstation-5-slim-disc-edition-1tb": [
    "commons-PlayStation_5_and_DualSense_with_transparent_background.png",
    "commons-Immagine_Playstation_5.jpg",
    "commons-PS5Digitalprerefined.jpg",
    "commons-PlayStation_5_and_DualSense.jpg",
  ],
  "products/ray-ban-aviator-classic-sunglasses": [
    "openverse-56178397-0f6e-4395-a0d9-0ca60cd42b7d",
    "commons-B&L_Ray-Ban_Leathers_Outdoorsman_II.jpg",
    "commons-American_Optical_Original_Pilot_Aviator_sunglasses.jpg",
    "openverse-0531ec5d-b251-4eb0-93fb-c43ae3ef3edd",
  ],
  "products/rolex-datejust-36-steel-and-white-gold": [
    "commons-Rolex_Datejust_16013.jpg",
    "commons-Rolex_Datejust_16013_close-up.webp",
    "commons-Rolex_Datejust_1603.jpg",
    "commons-Rolex_Datejust_16200.jpg",
  ],
  "products/samsung-65-qled-4k-smart-tv": [
    "openverse-a0b64f74-4bc0-47bb-b831-b47f6f2998b4",
    "commons-Samsung_Smart_TV_2012_(E-Series).jpg",
    "commons-SamsungSmartTV.JPG",
  ],
  "products/samsung-galaxy-s25-ultra-512gb": [
    "commons-Samsung_Galaxy_S25_Ultra_Titanium_Silverblue.jpg",
    "commons-Samsung_Galaxy_S25_Ultra.jpg",
    "commons-Samsung_Galaxy_S25_Ultra_phone's_screen.jpg",
    "commons-S25_Ultra_Titanium_Silver_Blue.jpg",
  ],
  "products/sonos-arc-soundbar-black": [
    "openverse-9d96c150-6287-46a8-bc16-7b02eca8d7a7",
    "openverse-193b0922-f12c-428b-b779-05d1444ff95d",
    "openverse-e9b4ff87-f1c1-4792-a70b-59b8c80e95ae",
  ],
  "products/sony-alpha-a7-iv-body": [
    "commons-Sony_Alpha_7_Mark_IV.jpg",
    "commons-Sony_A7_IV_(ILCE-7M4)_-_by_Henry_S\u00f6derlund_(51739988735).jpg",
    "commons-Sony.alpha.7IV.G-Master.24-105mm.DSC00141.jpg",
    "commons-Sony_Alpha_7_IV_Memory_Card_Slots.jpg",
  ],
  "products/taylormade-qi10-driver-10-5": [
    "openverse-e748cf34-6a2b-47bf-b285-6d352759f2c2",
    "openverse-7bd17a06-7339-4891-a8a3-2b054f55a4d3",
    "openverse-77d18ce0-c04e-45bb-a40e-ce245359f694",
    "openverse-4365e12f-192e-449b-8eaa-4060358cfa06",
  ],
  "products/tennis-bracelet-4-00-ctw-14k-white-gold": [
    "commons-BR-1_4_67040497-b9b1-4a88-a9b8-92fabd33c18c.webp",
    "openverse-8e485ac8-d636-4ed6-a652-2b617f0ac7bd",
    "openverse-ea23b154-506d-4675-9de8-9e0fd2338c50",
  ],
  "products/trek-fx-3-disc-hybrid-bike-medium": [
    "openverse-020f62c1-beae-4718-8c8f-40d283c62bb4",
    "commons-2024_AGR_start_Lidl-Trek_bikes.jpg",
    "openverse-df5b78ef-5e1c-4bbb-b1b6-0d76f1607516",
    "commons-2024_AGR_start_Lidl-Trek_bike_Longo_Borghini.jpg",
  ],
  "products/xbox-series-x-1tb": [
    "commons-Xbox_series_X_(50648118708).jpg",
    "commons-Xbox_Series_X_mit_Controller.jpg",
  ],
  "products/yamaha-p-225-digital-piano": [
    "commons-Yamaha_P80_Digital_Piano_-_front.jpg",
    "openverse-a03f3900-b9ec-48c3-bb64-fc42977f73b8",
    "openverse-64f3b61c-2e69-4c4c-a6d6-0df3a41ec088",
    "commons-Yamaha_digital_piano_voice_effects.jpg",
  ],
  "products/yeti-tundra-45-cooler": [
    "commons-YETI_Hopper_Two_20_Soft-Sided_Cooler_Bag_(43141426871).jpg",
    "commons-Large_cooler_box.jpg",
  ],
  "blog/how-pawn-loans-work": [
    "openverse-3a498145-5c6f-4d37-a093-72f3aa42c254",
  ],
  "blog/spotting-authentic-designer-bags": [
    "openverse-b14ed625-7374-4350-bb78-c47978979b14",
  ],
  "blog/whats-your-gold-worth": [
    "openverse-33e4b698-e43c-4f51-891b-3975eaf4372e",
  ],
  "about/how-pawning": [
    "openverse-50c52c6a-12c4-442b-ab74-392076c33216",
  ],
  "about/how-selling": [
    "openverse-d98f9a22-1fa7-46dd-a87f-fe895cee721c",
  ],
  "about/store": [
    "openverse-1754206e-9fea-4bf6-93a8-b433420fa1ed",
  ],
  "categories/clothing-shoes": [
    "openverse-27f490cd-8dfe-476a-a923-6debf68d9fa0",
  ],
  "products/iphone-15-128gb-unlocked": [
    "commons-Back_of_iPhone_15.jpg",
    "commons-IPhone_(Plus).jpg",
    "commons-Apple_iPhone_15_Pink_(November_1,_2024).jpg",
    "commons-Apple_iPhone_15.jpeg",
  ],
  "products/iphone-13-128gb-unlocked": [
    "commons-IPhone_13_camera_lens_group.jpg",
    "commons-IPhone_13_and_iPhone_14_Plus.jpg",
    "commons-Apple_iPhone_13_Pro.jpg",
  ],
  "products/google-pixel-9-pro-256gb-unlocked": [
    "commons-Google_Pixel_9_Pro_XL_(back).jpg",
    "commons-Pixel_9_Pro_XL.jpg",
    "commons-Camera_of_Google_Pixel_9_-_5.jpg",
  ],
  "products/samsung-galaxy-z-flip6-256gb": [
    "commons-Samsung_Galaxy_Z_Flip_6_and_Buds3.jpg",
    "commons-Samsung-Galaxy-Z-Flip-5_vonkajsi-displej.jpg",
    "commons-Samsung-Galaxy-Z-Flip-5_predny-displej.jpg",
    "commons-Samsung_Galaxy_Z_Flip_6.jpg",
  ],
  "products/samsung-galaxy-tab-s9-128gb-wi-fi": [
    "commons-20230729_\uc0bc\uc131_\uac24\ub7ed\uc2dc_\ud0ed_S9.jpg",
    "commons-Samsung_Galaxy_Tab_S9.png",
    "commons-Samsung_Galaxy_Tab_S8.jpg",
  ],
  "products/apple-airpods-pro-2nd-gen-usb-c": [
    "commons-AirPods_Pro_(2nd_generation).jpg",
    "commons-AirPods_Pro_1.jpg",
    "commons-AirPods_Pro_case.jpg",
    "commons-Apple_airpods_pro_case.jpg",
  ],
  "products/kindle-paperwhite-16gb-12th-gen": [
    "commons-2023_Amazon_Kindle_Paperwhite_(2).jpg",
    "commons-Kindle_Paperwhite_3G.jpg",
    "commons-Kindle_Paperwhite_displaying_Japanese_Novel.jpg",
    "commons-Kindle_Paperwhite_2_(52668358605).jpg",
  ],
  "products/garmin-fenix-7-sapphire-solar": [
    "commons-GarminFenix6X.jpg",
    "commons-Garmin_Fenix_6x_Pro_Solar.jpg",
  ],
  "products/macbook-air-13-m2-8gb-256gb": [
    "commons-M2_Macbook_Air_Midnight_model_-_1.jpg",
    "commons-M2_Macbook_Air_Midnight_model_-_2.jpg",
    "commons-M2_Macbook_Air_Starlight_model.jpg",
    "commons-MacBook_Air_(A2681)_Interface.jpg",
  ],
  "products/lenovo-thinkpad-x1-carbon-gen-11": [
    "commons-Lenovo_ThinkPad_X1_Ultrabook_(Nov_16,_2012).png",
    "commons-Lenovo_ThinkPad_X1_Carbon_Ultrabook.jpg",
    "commons-Lenovo_ThinkPad_X1_Carbon_014_(10774123843).jpg",
    "commons-ThinkPad_X1_Carbon_Japanese_Keyboard.jpg",
  ],
  "products/asus-rog-zephyrus-g14-rtx-4070": [
    "commons-ASUS_ROG_Zephyrus_2026-08-15_G14.jpg",
    "commons-ASUS_ROG_Strix_G15_(G513QY-HQ012T)-front_oblique_PNr\u00b00884.jpg",
    "commons-ASUS_ROG_Strix_G15_(G513QY-HQ012T)-top_cover_PNr\u00b00885.jpg",
  ],
  "products/microsoft-surface-laptop-5-13-5": [
    "commons-A_platinum_Microsoft_Surface_Laptop_Go.jpg",
    "commons-Microsoft_Surface_Laptop_7.jpg",
    "commons-SurfaceLaptopBurgundy.png",
  ],
  "products/hp-spectre-x360-14-2-in-1": [
    "commons-Hp_Spectre_x360.jpg",
    "commons-Hp_Spectre_x360_13t.jpg",
    "commons-HP_Spectre_x360_2016_(32003550180).jpg",
    "commons-HP_Spectre_x360_2016_(31538364704).jpg",
  ],
  "products/apple-imac-24-m3-8gb-256gb": [
    "commons-M1_iMac_blue_model_(cropped).jpg",
    "commons-M1_iMac_blue_model_(cropped_&_brighter).jpg",
    "commons-M1_iMac_Green_model.jpg",
    "commons-IMac_(M4,_2024,_Silver).jpg",
  ],
  "products/steam-deck-oled-512gb": [
    "commons-System_7_on_the_Steamdeck_running_in_a_web_browser,_fullscreen.jpg",
    "commons-4K_Linux_desktop_on_Steam_Deck.jpg",
    "commons-Comparison_of_Nintendo_Switch,_Nintendo_Switch_OLED,_and_Steam_Deck.png",
  ],
  "products/xbox-series-s-512gb": [
    "commons-Xbox_Series_S_with_controller.jpg",
    "commons-Xbox_Series_S_with_controller_and_box.jpg",
    "commons-Xbox_series_s_controller.jpg",
    "commons-Xbox_Series_S_with_controller_on_box.jpg",
  ],
  "products/nintendo-switch-lite-turquoise": [
    "commons-Nintendo_switch_lite_blue.jpg",
    "commons-Nintendo_Switch_Lite_(turquoise)_-_1.jpg",
    "commons-Nintendo_Switch_Lite_samples_at_Taipei_City_Mall_20210411.jpg",
  ],
  "products/playstation-4-pro-1tb": [
    "commons-Sony-PlayStation4-Pro-Console-FL.png",
    "commons-Sony_PlayStation_4_Pro_CUH-72xx_(black,_modified_top_vent-fan_cutout)_-_top_view.jpg",
    "commons-Sony_PlayStation_4_Pro_CUH-72xx_(black,_modified_top_vent-fan_cutout)_-_front_three-quarter_view.jpg",
    "commons-Sony_PlayStation_4_Pro_CUH-72xx_(black,_modified_top_vent-fan_cutout)_-_rear_view.jpg",
  ],
  "products/meta-quest-3-128gb": [
    "commons-Meta_Quest_3_-_3.jpg",
    "commons-Meta_Quest_3_front_View.jpg",
    "commons-Meta_Quest_3_side_View.jpg",
    "commons-Controller_of_Meta_Quest_3_(right).jpg",
  ],
  "products/super-nintendo-snes-console-with-2-controllers": [
    "commons-Nintendo-Super-NES-Console-101-FL.jpg",
    "commons-Nintendo-Super-NES-Console-FR.jpg",
    "commons-Super_Nintendo_Entertainment_System_(Super_Famicom)_at_gamescom_2009-retro_games_section_PNr\u00b00243.JPG",
    "commons-Nintendo-Super-NES-Console-BL.jpg",
  ],
  "products/playstation-dualsense-edge-controller": [
    "commons-DualSense_Edge_Controller.jpg",
    "commons-Playstation_5_DualSense_controller_in_Midnight_Black,_2026-02-07_(front).jpg",
    "commons-Playstation_DualSense_Controller.png",
  ],
  "products/canon-eos-r6-mark-ii-body": [
    "commons-Canon_EOS_R6_Mark_II_-_by_Henry_S\u00f6derlund_(52546794891).jpg",
    "commons-Canon_EOS_R6_Mark_II_9_jan_2023d.jpg",
    "commons-Canon_EOS_R6_Mark_II_9_jan_2023c.jpg",
    "commons-Canon_EOS_R6_Mark_II_9_jan_2023f.jpg",
  ],
  "products/nikon-z6-ii-body": [
    "commons-Nikon_Z_6II_2.jpg",
    "commons-Nikon_Z_6_II_with_Nikkor_Z_24-70mm_F4_S_-_by_Henry_S\u00f6derlund_(50573312713).jpg",
    "commons-Nikon_Z_6II_4.jpg",
    "commons-Nikon_Z_6II_11.jpg",
  ],
  "products/fujifilm-x-t5-body-silver": [
    "commons-Fujifilm-X-T5.jpg",
    "commons-Fujifilm_X-T5.jpg",
    "commons-Fujifilm_X-T5_4_nov_2022a.jpg",
    "commons-Fujifilm_X-T5_4_nov_2022d.jpg",
  ],
  "products/canon-eos-5d-mark-iv-body": [
    "commons-Canon_EOS_5D_Mark_IV_(Front),_1803241116,_ako.jpg",
    "commons-Canon_EOS_5D_Mark_IV_(Rear),_1803241121,_ako.jpg",
    "commons-Canon_EOS-5D-Mark-IV-03.jpg",
    "commons-Canon_EOS_5D_Mark_IV_and_EF_11-24mm_F4L_USM.jpg",
  ],
  "products/nikon-d750-with-24-120mm-f-4-lens": [
    "commons-Nikon_D750_01.jpg",
    "commons-Nikon_d750_cap_on.jpg",
    "commons-Nikon_D750_1_2017-03-21.jpg",
    "commons-Nikon_d750_cap_off.jpg",
  ],
  "products/gopro-hero12-black": [
    "commons-GoPro_H\u00e9ro_13_Black_-_01.jpg",
    "commons-GoPro_H\u00e9ro_13_Black_-_03.jpg",
    "commons-GoPro_H\u00e9ro_13_Black_-_02.jpg",
  ],
  "products/sony-fe-85mm-f-1-8-lens": [
    "commons-Sony_SEL85F18_1.jpg",
    "commons-Sony_SEL85F18_3.jpg",
    "commons-Sony_SEL85F18_2.jpg",
    "commons-Sony_SEL85F18_A7_II.jpg",
  ],
  "products/makita-18v-lxt-6-1-2-circular-saw": [
    "commons-Makita_5007FK_loaded.jpg",
    "commons-Makita_5008NB_loaded.jpg",
    "commons-Makita_5008NB_unloaded.jpg",
    "commons-Makita_5057KB_loaded.jpg",
  ],
  "products/dewalt-12-sliding-compound-miter-saw": [
    "commons-DeWalt_DW706_loaded.jpg",
    "commons-DeWalt_DW706_unloaded.jpg",
    "commons-Compound_sliding_miter_saw_3_(51633919636).jpg",
  ],
  "products/milwaukee-m18-fuel-impact-driver": [
    "commons-Milwaukee_impact_driver.JPG",
    "commons-Dewalt_DCF885C2_Impact_Driver.jpg",
    "commons-Bosch_12V_Max_Lithium_Ion_Impact_Driver_(5073183037).jpg",
  ],
  "products/bosch-bulldog-sds-plus-rotary-hammer": [
    "commons-Bosch_11235EVS_unloaded.jpg",
    "commons-Bosch_11224VSR_unloaded.jpg",
    "commons-Boschhammer.jpg",
    "commons-Bosch_2-26_DFR.jpg",
  ],
  "products/stihl-ms-250-chainsaw-18-bar": [
    "commons-\u30c1\u30a7\u30f3\u30bd\u30fc_STIHL_MS170C_Chainsaw_(5290190254).jpg",
    "commons-Stihl_Farm_Boss_Chainsaw_(2117442386).jpg",
    "commons-Stihl_MS_192C_chainsaw_20190326.jpg",
  ],
  "products/honda-eu2200i-inverter-generator": [
    "commons-Honda_EU2000i_Inverter_Generator.jpg",
    "commons-Honda_EU3000is_Inverter_Generator.jpg",
  ],
  "products/sony-wh-1000xm5-wireless-headphones": [
    "commons-Sony-WH-1000XM3-kabellose-Bluetooth-Noise-Cancelling-Kopfhoerer.3.jpg",
    "commons-Sony-WH-1000XM3-kabellose-Bluetooth-Noise-Cancelling-Kopfhoerer.4.jpg",
    "commons-Sony-WH-1000XM3-kabellose-Bluetooth-Noise-Cancelling-Kopfhoerer.jpg",
  ],
  "products/canada-goose-expedition-parka-men-s-l": [
    "commons-Sled_Dog_Discovery_&_Musher's_Camp_34.jpg",
  ],
  "products/burberry-kensington-heritage-trench-coat": [
    "commons-Burberrys_Trenchcoat.jpg",
  ],
  "products/arc-teryx-beta-ar-jacket-men-s-m": [
    "commons-Arcteryx_AlphaSV_orange_jacket_men.jpg",
    "commons-Arcteryx_blue_CeriumLT_Hoody_men.jpg",
  ],
  "products/air-jordan-1-retro-high-og-men-s-10": [
    "commons-Air_Jordan_1_Retro_High_OG_CO._Japan_silver.jpg",
    "commons-Nike_Air_Jordan.jpg",
    "commons-Air_Jordan_1_Banned.jpg",
  ],
  "products/nike-dunk-low-panda-men-s-9-5": [
    "commons-Nike_Dunk_Low.jpg",
    "commons-Nike_dunk_low.jpg",
    "commons-Nike_Dunk_Low_Retro_\"Varsity_Green\".jpg",
    "commons-2023_Nike_SB_Dunk_Low_Pro_(2).jpg",
  ],
  "products/christian-louboutin-so-kate-120-pumps-size-38": [
    "commons-Louboutin_altadama140.jpg",
    "commons-Talon_haut_louboutin_150mm.jpg",
    "commons-Altadama_140mm_louboutin_peeptoe_2010.jpg",
  ],
  "products/gucci-horsebit-leather-loafers-men-s-9": [
    "openverse-03a3accb-a6a2-4bf4-8736-7dfa67e96e68",
  ],
  "products/dr-martens-1460-smooth-leather-boots-size-9": [
    "commons-Dr_Martens_10_Eyelet_Boots.JPG",
    "commons-Dr._Martens_1460_01.jpg",
    "commons-Dr_Martens_Eldritch_boots.jpg",
    "commons-Dr._Martens_1460_02.jpg",
  ],
  "products/levi-s-vintage-501-jeans-1990s-32-32": [
    "commons-Levi's_501_Two_Horses_patch_(2025-12-19)_6.jpg",
    "commons-Levi's_501_jeans_'small_e'_Red_Tab_(2025-12-19)_4.jpg",
    "commons-Levi's_501_Red_Tab_variants_(2026-01-24).jpg",
    "commons-Levi's_501_'big_E'_Red_Tab_(2025-12-30).jpg",
  ],
};

/* ------------------------------------------------------------------ */

const PROJECT_DIR = path.resolve(import.meta.dirname, "..");

const PUBLIC_DIR = path.join(PROJECT_DIR, "public");
const IMAGE_URL_BASE = "/images";
const CREDITS_FILE = path.join(PROJECT_DIR, "data/image-credits.json");
const PEXELS_API = "https://api.pexels.com/v1/search";
const OPENVERSE_API = "https://api.openverse.org/v1/images/";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "BeatriceExchangeImageFetcher/1.0 (local development script; Node fetch)";
/** Openverse and Commons are shared public services, so go gently. */
const REQUEST_GAP_MS: Record<Provider, number> = { pexels: 350, openverse: 1500, commons: 800 };
/** Longest edge after download (macOS `sips`); keeps originals from bloating the repo. */
const MAX_EDGE = { normal: 1200, hero: 2000 } as const;
const JPEG_QUALITY = "72";

const args = process.argv.slice(2);
const PLAN_ONLY = args.includes("--plan");
const FORCE = args.includes("--force");
const ONLY = args.find((a) => a.startsWith("--only="))?.slice(7).split(",") as Group[] | undefined;

const execFileAsync = promisify(execFile);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loadData() {
  // Variable specifiers keep tsc from requiring `.ts` extensions in imports.
  const load = (p: string) => import(path.join(PROJECT_DIR, p));
  const { products } = (await load("data/products.ts")) as { products: Product[] };
  const { categories } = (await load("data/categories.ts")) as { categories: Category[] };
  const { blogPosts } = (await load("data/blog.ts")) as { blogPosts: BlogPost[] };
  return { products, categories, blogPosts };
}

function buildJobs(data: Awaited<ReturnType<typeof loadData>>): Job[] {
  const jobs: Job[] = [];
  for (const h of HERO) {
    jobs.push({ group: "hero", ...h, count: 1, orientation: "landscape", hero: true, noPeople: true });
  }
  for (const c of data.categories) {
    const queries = CATEGORY_QUERIES[c.slug] ?? [c.shortName];
    jobs.push({ group: "categories", subject: c.slug, label: c.name, queries, count: 1, orientation: "square", hero: false, noPeople: true });
  }
  for (const p of data.products) {
    const queries = PRODUCT_QUERIES[p.slug] ?? [`${p.brand} ${p.subcategory}`, p.subcategory];
    jobs.push({ group: "products", subject: p.slug, label: p.name, queries, count: PHOTOS_PER_PRODUCT, orientation: "square", hero: false, noPeople: true });
  }
  for (const b of data.blogPosts) {
    jobs.push({ group: "blog", subject: b.slug, label: b.title, queries: BLOG_QUERIES[b.slug] ?? [b.title], count: 1, orientation: "landscape", hero: false, noPeople: false });
  }
  for (const a of ABOUT) {
    jobs.push({ group: "about", ...a, count: 1, orientation: "landscape", hero: true, noPeople: false });
  }
  return ONLY ? jobs.filter((j) => ONLY.includes(j.group)) : jobs;
}

/** Which providers (and which of the job's queries) to try, in order. */
function plan(job: Job, hasPexels: boolean): Array<{ provider: Provider; query: string }> {
  const generic = job.queries[job.queries.length - 1];
  if (hasPexels) return [{ provider: "pexels", query: generic }];
  if (job.group === "products") {
    const exact = job.queries.length > 1 ? job.queries.slice(0, -1) : job.queries;
    return [...exact.map((query) => ({ provider: "commons" as const, query })), { provider: "openverse", query: generic }];
  }
  return [
    ...job.queries.map((query) => ({ provider: "openverse" as const, query })),
    ...job.queries.map((query) => ({ provider: "commons" as const, query })),
  ];
}

function shapeOk(job: Job, width: number, height: number) {
  const ratio = width / height;
  const minEdge = job.hero ? 1000 : 600;
  if (Math.min(width, height) < minEdge) return false;
  return job.orientation === "square" ? ratio >= 0.6 && ratio <= 1.7 : ratio >= 1.25 && ratio <= 2.1;
}

async function readCredits(): Promise<ImageCredit[]> {
  try {
    const json = JSON.parse(await readFile(CREDITS_FILE, "utf8")) as { images?: ImageCredit[] };
    return json.images ?? [];
  } catch {
    return [];
  }
}

async function writeCredits(images: ImageCredit[]) {
  const order: Group[] = ["hero", "categories", "products", "blog", "about"];
  images.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.key.localeCompare(b.key, "en", { numeric: true }));
  await writeFile(CREDITS_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), images }, null, 2) + "\n");
}

async function getJson(url: URL, headers: Record<string, string>, provider: Provider): Promise<unknown> {
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(REQUEST_GAP_MS[provider]);
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, ...headers } });
    if (res.status === 429) {
      const wait = Math.max(Number(res.headers.get("retry-after") ?? 0), 30) * 1000;
      console.warn(`  ${provider} rate limit, waiting ${Math.round(wait / 1000)}s…`);
      await sleep(wait);
      continue;
    }
    if (res.status === 401 || res.status === 403) throw new Error(`${provider} rejected the request (${res.status}). Check the API key.`);
    if (!res.ok) throw new Error(`${provider} search failed (${res.status})`);
    return res.json();
  }
  throw new Error(`${provider} kept rate-limiting`);
}

/* ----------------------------- Pexels ------------------------------ */

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  alt: string;
  photographer: string;
  photographer_url: string;
  src: { large: string; large2x: string };
};

async function searchPexels(key: string, job: Job, query: string): Promise<Candidate[]> {
  const url = new URL(PEXELS_API);
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", job.orientation);
  url.searchParams.set("per_page", "40");
  const json = (await getJson(url, { Authorization: key }, "pexels")) as { photos: PexelsPhoto[] };
  return json.photos.map((p) => ({
    id: `pexels-${p.id}`,
    imageUrl: job.hero ? p.src.large2x : p.src.large,
    ext: "jpg",
    title: p.alt ?? "",
    description: p.alt ?? "",
    creator: p.photographer,
    creatorUrl: p.photographer_url,
    sourceUrl: p.url,
    source: "pexels",
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
  }));
}

/* ---------------------------- Openverse ---------------------------- */

type OpenverseImage = {
  id: string;
  title: string | null;
  url: string;
  width: number | null;
  height: number | null;
  filetype: string | null;
  creator: string | null;
  creator_url: string | null;
  license: string;
  license_version: string | null;
  license_url: string;
  foreign_landing_url: string;
  source: string;
  tags: Array<{ name: string }> | null;
};

async function searchOpenverse(job: Job, query: string): Promise<Candidate[]> {
  const url = new URL(OPENVERSE_API);
  url.searchParams.set("q", query);
  url.searchParams.set("source", "stocksnap,rawpixel"); // stock-quality, CC0
  url.searchParams.set("license", "cc0,pdm,by");
  url.searchParams.set("mature", "false");
  url.searchParams.set("page_size", "20");
  const json = (await getJson(url, {}, "openverse")) as { results: OpenverseImage[] };
  return json.results.filter((r) => r.width && r.height && shapeOk(job, r.width, r.height)).map(openverseCandidate);
}

function openverseCandidate(r: OpenverseImage): Candidate {
  return {
    id: `openverse-${r.id}`,
    imageUrl: r.url,
    ext: r.filetype === "png" ? "png" : "jpg",
    title: r.title ?? "",
    description: `${r.title ?? ""} ${(r.tags ?? []).map((t) => t.name).join(" ")}`,
    creator: r.creator?.trim() || "Unknown",
    creatorUrl: r.creator_url,
    sourceUrl: r.foreign_landing_url,
    source: r.source,
    license: r.license === "pdm" ? "Public Domain Mark" : `${r.license.toUpperCase()} ${r.license_version ?? ""}`.trim(),
    licenseUrl: r.license_url,
  };
}

async function lookupOpenverse(id: string): Promise<Candidate> {
  const json = (await getJson(new URL(`${OPENVERSE_API}${id}/`), {}, "openverse")) as OpenverseImage;
  return openverseCandidate(json);
}

/* ------------------------- Wikimedia Commons ----------------------- */

type CommonsPage = {
  index: number;
  title: string;
  imageinfo?: Array<{
    width: number;
    height: number;
    mime: string;
    thumburl?: string;
    url: string;
    descriptionurl: string;
    extmetadata?: Record<string, { value: string } | undefined>;
  }>;
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function commonsParams(url: URL, job: Job) {
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata");
  url.searchParams.set("iiurlwidth", job.hero ? "1920" : "1280"); // standard thumbnail widths
  url.searchParams.set("iiextmetadatafilter", "LicenseShortName|LicenseUrl|Artist|ObjectName|ImageDescription");
}

/** Normalizes a Commons file page; null when the format or license isn't usable. */
function commonsCandidate(page: CommonsPage): (Candidate & { width: number; height: number }) | null {
  const info = page.imageinfo?.[0];
  if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime)) return null;
  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value);
  if (!/^(CC0|CC BY(-SA)? \d(\.\d)?|Public domain|PDM)/i.test(license)) return null;
  const fileName = page.title.replace(/^File:/, "");
  const title = stripHtml(meta.ObjectName?.value) || fileName.replace(/\.[a-z]+$/i, "").replace(/_/g, " ");
  return {
    id: `commons-${fileName.replace(/ /g, "_")}`,
    imageUrl: info.thumburl ?? info.url,
    ext: info.mime === "image/jpeg" ? "jpg" : "png",
    title,
    description: `${title} ${stripHtml(meta.ImageDescription?.value).slice(0, 300)}`,
    creator: stripHtml(meta.Artist?.value).slice(0, 120) || "Wikimedia Commons contributor",
    creatorUrl: null,
    sourceUrl: info.descriptionurl,
    source: "wikimedia",
    license,
    licenseUrl: meta.LicenseUrl?.value || (/public domain|pdm/i.test(license) ? "https://creativecommons.org/publicdomain/mark/1.0/" : "https://creativecommons.org/licenses/"),
    width: info.width,
    height: info.height,
  };
}

async function searchCommons(job: Job, query: string): Promise<Candidate[]> {
  const url = new URL(COMMONS_API);
  commonsParams(url, job);
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "30");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  const json = (await getJson(url, {}, "commons")) as { query?: { pages?: Record<string, CommonsPage> } };
  return Object.values(json.query?.pages ?? {})
    .sort((a, b) => a.index - b.index)
    .map(commonsCandidate)
    .filter((c): c is NonNullable<typeof c> => c !== null && shapeOk(job, c.width, c.height));
}

async function lookupCommons(job: Job, fileName: string): Promise<Candidate> {
  const url = new URL(COMMONS_API);
  commonsParams(url, job);
  url.searchParams.set("titles", `File:${fileName.replace(/_/g, " ")}`);
  const json = (await getJson(url, {}, "commons")) as { query?: { pages?: Record<string, CommonsPage> } };
  const found = Object.values(json.query?.pages ?? {}).map(commonsCandidate)[0];
  if (!found) throw new Error(`Commons file not found or not freely licensed: ${fileName}`);
  return found;
}

function lookup(job: Job, id: string): Promise<Candidate> {
  if (id.startsWith("openverse-")) return lookupOpenverse(id.slice("openverse-".length));
  if (id.startsWith("commons-")) return lookupCommons(job, id.slice("commons-".length));
  throw new Error(`Can't look up pinned photo ${id} without searching (Pexels photos can't be pinned).`);
}

/* ------------------------------------------------------------------ */

function altFor(job: Job, candidate: Candidate, index: number) {
  if (job.group === "products") return index === 1 ? job.label : `${job.label}, photo ${index}`;
  const title = candidate.title
    .replace(/\b(free|public domain|cc0|image|photo|stock|png|jpe?g|location unknown)\b/gi, "")
    .replace(/[_|]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,.-]+|[\s,.-]+$/g, "");
  if (title.length >= 8 && title.length <= 90 && !/\d{4,}/.test(title)) return title.charAt(0).toUpperCase() + title.slice(1);
  return job.label;
}

/**
 * Downloads to `<destBase>.<ext>` and returns the extension actually used:
 * PNGs without transparency are converted to JPEG (much smaller).
 */
async function download(src: string, destBase: string, maxEdge: number, ext: "jpg" | "png"): Promise<"jpg" | "png"> {
  let res = await fetch(src, { headers: { "User-Agent": USER_AGENT } });
  for (let attempt = 1; res.status === 429 && attempt <= 4; attempt++) {
    const wait = Math.max(Number(res.headers.get("retry-after") ?? 0), 20 * attempt) * 1000;
    console.warn(`  image host rate limit, waiting ${Math.round(wait / 1000)}s…`);
    await sleep(wait);
    res = await fetch(src, { headers: { "User-Agent": USER_AGENT } });
  }
  if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) throw new Error(`Download failed (${res.status}) ${src}`);
  await mkdir(path.dirname(destBase), { recursive: true });
  const raw = `${destBase}.download`;
  await writeFile(raw, Buffer.from(await res.arrayBuffer()));
  try {
    // macOS `sips`: cap the longest edge and compress.
    let finalExt = ext;
    if (ext === "png") {
      const { stdout } = await execFileAsync("sips", ["-g", "hasAlpha", raw]);
      if (/hasAlpha: no/.test(stdout)) finalExt = "jpg";
    }
    const format = finalExt === "png" ? ["-s", "format", "png"] : ["-s", "format", "jpeg", "-s", "formatOptions", JPEG_QUALITY];
    await execFileAsync("sips", [...format, "-Z", String(maxEdge), raw, "--out", `${destBase}.${finalExt}`]);
    await rm(raw);
    return finalExt;
  } catch {
    await rename(raw, `${destBase}.${ext}`); // no sips (Linux/Windows): keep the original file
    return ext;
  }
}

function fileNameFor(job: Job, index: number) {
  return job.group === "products" ? `${job.subject}-${index}` : job.subject;
}

function creditFor(job: Job, photo: Candidate, index: number, name: string, file: string, query: string): ImageCredit {
  return {
    key: `${job.group}/${name}`,
    group: job.group,
    subject: job.subject,
    index,
    file,
    alt: ALT_TEXT[`${job.group}/${name}`] ?? altFor(job, photo, index),
    query,
    source: photo.source,
    sourceId: photo.id.replace(/^(pexels|openverse|commons)-/, ""),
    sourceUrl: photo.sourceUrl,
    creator: photo.creator,
    creatorUrl: photo.creatorUrl,
    license: photo.license,
    licenseUrl: photo.licenseUrl,
  };
}

/**
 * Makes the files for a pinned item match its list: keeps photos already on
 * disk (renaming them into position), downloads the rest. Returns the number
 * of downloads.
 */
async function applyPins(job: Job, pinned: string[], credits: ImageCredit[], idOf: (c: ImageCredit) => string) {
  const dir = path.join(PUBLIC_DIR, IMAGE_URL_BASE, job.group);
  // Phase 1: move kept files aside so swapping positions can't overwrite anything.
  const staged = new Map<string, { credit: ImageCredit; temp: string }>();
  for (const id of pinned) {
    const credit = credits.find((c) => idOf(c) === id && c.group === job.group && existsSync(path.join(PUBLIC_DIR, c.file)));
    if (!credit) continue;
    const temp = path.join(dir, `.pin-${staged.size}-${path.basename(credit.file)}`);
    await rename(path.join(PUBLIC_DIR, credit.file), temp);
    staged.set(id, { credit, temp });
  }
  // Phase 2: put every pinned photo at its position.
  let downloads = 0;
  for (const [i, id] of pinned.entries()) {
    const index = i + 1;
    const name = fileNameFor(job, index);
    const kept = staged.get(id);
    if (kept) {
      const ext = path.extname(kept.credit.file).slice(1);
      const file = `${IMAGE_URL_BASE}/${job.group}/${name}.${ext}`;
      await rename(kept.temp, path.join(PUBLIC_DIR, file));
      const label = job.group === "products" ? (index === 1 ? job.label : `${job.label}, photo ${index}`) : (ALT_TEXT[`${job.group}/${name}`] ?? kept.credit.alt);
      Object.assign(kept.credit, { key: `${job.group}/${name}`, index, file, alt: label });
      continue;
    }
    let photo: Candidate;
    let ext: "jpg" | "png";
    const base = `${IMAGE_URL_BASE}/${job.group}/${name}`;
    try {
      photo = await lookup(job, id);
      await sleep(REQUEST_GAP_MS.commons); // be gentle with the image hosts too
      ext = await download(photo.imageUrl, path.join(PUBLIC_DIR, base), job.hero ? MAX_EDGE.hero : MAX_EDGE.normal, photo.ext);
    } catch (error) {
      console.warn(`  ${job.group}/${name}: ${(error as Error).message} (re-run to retry)`);
      continue;
    }
    const file = `${base}.${ext}`;
    downloads++;
    // Replace any stale credit that pointed at this file name.
    for (let k = credits.length - 1; k >= 0; k--) if (credits[k].key === `${job.group}/${name}` && idOf(credits[k]) !== id) credits.splice(k, 1);
    credits.push(creditFor(job, photo, index, name, file, "hand-picked"));
    console.log(`  ✓ ${file}  ${photo.source} · ${photo.license} · ${photo.title.slice(0, 60)}`);
  }
  return downloads;
}

/** Deletes image files that no credit points at (replaced or rejected photos). */
async function removeOrphans(credits: ImageCredit[]) {
  const keep = new Set(credits.map((c) => path.join(PUBLIC_DIR, c.file)));
  const root = path.join(PUBLIC_DIR, IMAGE_URL_BASE);
  let removed = 0;
  for (const group of ["hero", "categories", "products", "blog", "about"]) {
    const dir = path.join(root, group);
    if (!existsSync(dir)) continue;
    for (const name of await readdir(dir)) {
      const full = path.join(dir, name);
      if (!keep.has(full)) {
        await rm(full);
        removed++;
      }
    }
  }
  return removed;
}

async function main() {
  const data = await loadData();
  const jobs = buildJobs(data);
  const apiKey = process.env.PEXELS_API_KEY?.trim();

  if (PLAN_ONLY) {
    let total = 0;
    for (const group of ["hero", "categories", "products", "blog", "about"] as Group[]) {
      const rows = jobs.filter((j) => j.group === group);
      if (!rows.length) continue;
      console.log(`\n${group.toUpperCase()}`);
      for (const j of rows) {
        total += j.count;
        const steps = plan(j, Boolean(apiKey)).map((s) => `${s.provider}:"${s.query}"`).join(" → ");
        console.log(`  ${j.label.padEnd(48)} ×${j.count}  ${steps}`);
      }
    }
    console.log(`\n${total} images.`);
    return;
  }

  console.log(apiKey ? "Using Pexels.\n" : "No PEXELS_API_KEY — using Wikimedia Commons + Openverse (no key needed).\n");

  let credits = await readCredits();
  if (FORCE) credits = credits.filter((c) => !jobs.some((j) => j.group === c.group && j.subject === c.subject));
  const idOf = (c: ImageCredit) => `${c.source === "pexels" ? "pexels" : c.source === "wikimedia" ? "commons" : "openverse"}-${c.sourceId}`;
  const used = new Set(credits.map(idOf));
  let downloaded = 0;
  const weak: string[] = [];

  for (const job of jobs) {
    const pinned = PINNED[`${job.group}/${job.subject}`];
    if (pinned) {
      downloaded += await applyPins(job, pinned, credits, idOf);
      credits = credits.filter((c) => !(c.group === job.group && c.subject === job.subject) || pinned.includes(idOf(c)));
      await writeCredits(credits);
      continue;
    }

    const have = credits.filter((c) => c.group === job.group && c.subject === job.subject && existsSync(path.join(PUBLIC_DIR, c.file)) && !REJECTED.has(idOf(c)));
    // Drop credits whose file was deleted or rejected so they get re-fetched.
    credits = credits.filter((c) => !(c.group === job.group && c.subject === job.subject) || have.includes(c));
    if (have.length >= job.count) continue;

    console.log(`${job.group}/${job.subject}`);
    const picks: Array<Candidate & { query: string }> = [];
    let skippedPeople = 0;
    for (const step of plan(job, Boolean(apiKey))) {
      if (have.length + picks.length >= job.count) break;
      let results: Candidate[] = [];
      try {
        results =
          step.provider === "pexels" ? await searchPexels(apiKey!, job, step.query) : step.provider === "commons" ? await searchCommons(job, step.query) : await searchOpenverse(job, step.query);
      } catch (error) {
        console.warn(`  ${(error as Error).message}`);
        continue;
      }
      for (const c of results) {
        if (have.length + picks.length >= job.count) break;
        if (used.has(c.id) || REJECTED.has(c.id) || JUNK.test(c.title)) continue;
        if (job.noPeople && PEOPLE.test(c.description)) {
          skippedPeople++;
          continue;
        }
        picks.push({ ...c, query: step.query });
        used.add(c.id);
      }
    }

    const taken = new Set(have.map((c) => c.index));
    for (const photo of picks) {
      let index = 1;
      while (taken.has(index)) index++;
      taken.add(index);
      const name = fileNameFor(job, index);
      const base = `${IMAGE_URL_BASE}/${job.group}/${name}`;
      let file: string;
      try {
        file = `${base}.${await download(photo.imageUrl, path.join(PUBLIC_DIR, base), job.hero ? MAX_EDGE.hero : MAX_EDGE.normal, photo.ext)}`;
      } catch (error) {
        console.warn(`  ${(error as Error).message}`);
        taken.delete(index);
        continue;
      }
      downloaded++;
      credits.push(creditFor(job, photo, index, name, file, photo.query));
      console.log(`  ✓ ${file}  ${photo.source} · ${photo.license} · ${photo.title.slice(0, 60)}`);
    }

    const got = credits.filter((c) => c.group === job.group && c.subject === job.subject).length;
    if (got < job.count) weak.push(`${job.group}/${job.subject}: ${got}/${job.count}${skippedPeople ? ` (${skippedPeople} skipped for people)` : ""}`);
    await writeCredits(credits); // save as we go so a crash loses nothing
  }

  await writeCredits(credits);
  const removed = ONLY ? 0 : await removeOrphans(credits);
  if (removed) console.log(`Removed ${removed} replaced image file(s).`);
  console.log(`\nDownloaded ${downloaded} new image(s). ${credits.length} image(s) recorded in data/image-credits.json.`);
  if (weak.length) console.log(`\nShort on photos:\n  ${weak.join("\n  ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
