import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
  ChefHat,
  Users as UsersIcon,
  Heart,
  MapPin,
  Globe,
  X,
  ExternalLink,
  Flame,
  Star,
  Crown,
  Zap,
  Search,
} from "lucide-react";
import { formatDate } from "../../../utils/timeUtils";

// ─── Dummy data (compact) ─────────────────────────────────────────────────────
const CREATORS = [
  {
    _id: "c1",
    fullName: "Aarav Mehta",
    username: "aaravcooks",
    badge: "top-chef",
    specialty: "North Indian & Mughlai",
    location: "Delhi, India",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    bio: "Reviving lost Mughlai recipes. 12 years in professional kitchens.",
    website: "https://aaravcooks.in",
    createdAt: "2023-04-12",
    followersCount: 12480,
    recipeCount: 87,
    likesReceived: 34200,
    avgRating: 4.8,
    topRecipes: [
      { _id: "r1", title: "Butter Chicken", likes: 2400, rating: 4.9 },
      { _id: "r2", title: "Nihari Gosht", likes: 1850, rating: 4.8 },
    ],
  },
  {
    _id: "c2",
    fullName: "Meera Iyer",
    username: "meera.kitchen",
    badge: "top-chef",
    specialty: "South Indian & Fusion",
    location: "Chennai, India",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    bio: "Third-generation cook from Chennai. Featured in The Hindu Food Blog.",
    website: "https://meeraskitchen.com",
    createdAt: "2022-11-03",
    followersCount: 18920,
    recipeCount: 124,
    likesReceived: 52100,
    avgRating: 4.9,
    topRecipes: [
      { _id: "r4", title: "Chettinad Chicken", likes: 3100, rating: 4.9 },
      { _id: "r5", title: "Kerala Parotta", likes: 1850, rating: 4.9 },
    ],
  },
  {
    _id: "c3",
    fullName: "Rohan Kapoor",
    username: "chefrohan",
    badge: "rising-star",
    specialty: "Street Food & Snacks",
    location: "Mumbai, India",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    bio: "Mumbai street food enthusiast. Thecha, vada pav, misal — all here.",
    website: null,
    createdAt: "2024-01-15",
    followersCount: 6320,
    recipeCount: 54,
    likesReceived: 12800,
    avgRating: 4.6,
    topRecipes: [
      { _id: "r7", title: "Bombay Vada Pav", likes: 980, rating: 4.7 },
      { _id: "r9", title: "Pav Bhaji", likes: 1250, rating: 4.6 },
    ],
  },
  {
    _id: "c4",
    fullName: "Priya Sharma",
    username: "priyabakes",
    badge: "top-chef",
    specialty: "Desserts & Baking",
    location: "Bengaluru, India",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
    bio: "Pastry chef turned home baker. French techniques, Indian flavors.",
    website: "https://priyabakes.in",
    createdAt: "2023-06-20",
    followersCount: 9450,
    recipeCount: 71,
    likesReceived: 21600,
    avgRating: 4.7,
    topRecipes: [
      { _id: "r10", title: "Rose Pistachio Cake", likes: 1580, rating: 4.8 },
      { _id: "r11", title: "Cardamom Crème Brûlée", likes: 1320, rating: 4.7 },
    ],
  },
  {
    _id: "c5",
    fullName: "Karan Verma",
    username: "karanfitfood",
    badge: "rising-star",
    specialty: "Healthy & High Protein",
    location: "Pune, India",
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop&crop=faces",
    bio: "Fitness coach who cooks. Macro-friendly Indian meals that taste good.",
    website: null,
    createdAt: "2024-08-02",
    followersCount: 3210,
    recipeCount: 38,
    likesReceived: 5900,
    avgRating: 4.5,
    topRecipes: [
      { _id: "r13", title: "Paneer Protein Bowl", likes: 620, rating: 4.5 },
      { _id: "r14", title: "Chicken Tikka Salad", likes: 540, rating: 4.6 },
    ],
  },
  {
    _id: "c6",
    fullName: "Ananya Reddy",
    username: "ananya.veg",
    badge: "top-chef",
    specialty: "Vegetarian & Vegan",
    location: "Hyderabad, India",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
    bio: "Plant-based since 2015. Making vegetables the hero of every plate.",
    website: "https://ananyaveg.com",
    createdAt: "2023-02-08",
    followersCount: 11200,
    recipeCount: 96,
    likesReceived: 28400,
    avgRating: 4.8,
    topRecipes: [
      { _id: "r16", title: "Hyderabadi Veg Biryani", likes: 2100, rating: 4.9 },
      { _id: "r17", title: "Vegan Butter Tofu", likes: 1640, rating: 4.7 },
    ],
  },
  {
    _id: "c7",
    fullName: "Dev Patel",
    username: "devgrills",
    badge: "rising-star",
    specialty: "BBQ & Grilling",
    location: "Ahmedabad, India",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces",
    bio: "Weekend griller turned obsession. Smoked, charred, always delicious.",
    website: null,
    createdAt: "2024-03-22",
    followersCount: 4780,
    recipeCount: 42,
    likesReceived: 8900,
    avgRating: 4.6,
    topRecipes: [
      { _id: "r19", title: "Tandoori Chicken", likes: 890, rating: 4.7 },
      { _id: "r21", title: "BBQ Corn Ribs", likes: 640, rating: 4.5 },
    ],
  },
  {
    _id: "c8",
    fullName: "Nisha Gupta",
    username: "nishasweets",
    badge: "top-chef",
    specialty: "Traditional Sweets",
    location: "Jaipur, India",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    bio: "Preserving grandma's mithai recipes. Halwai family since 1947.",
    website: "https://nishasweets.in",
    createdAt: "2022-09-14",
    followersCount: 15300,
    recipeCount: 68,
    likesReceived: 41200,
    avgRating: 4.9,
    topRecipes: [
      { _id: "r22", title: "Kesar Ghevar", likes: 2900, rating: 4.9 },
      { _id: "r23", title: "Motichoor Ladoo", likes: 2350, rating: 4.8 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const compact = (n) =>
  n == null
    ? "0"
    : n >= 1e6
      ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
      : n >= 1e3
        ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
        : String(n);

const BADGES = {
  "top-chef": {
    label: "Top Chef",
    Icon: Crown,
    cls: "text-warning bg-warning/10 border-warning/30",
  },
  "rising-star": {
    label: "Rising Star",
    Icon: Zap,
    cls: "text-primary bg-primary/10 border-primary/30",
  },
};

const Badge = ({ type }) => {
  const b = BADGES[type];
  if (!b) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${b.cls}`}
    >
      <b.Icon className="w-3 h-3" />
      {b.label}
    </span>
  );
};

const Avatar = ({ creator, size = "lg" }) => {
  const cls =
    size === "lg"
      ? "w-20 h-20 rounded-full border-4"
      : "w-24 h-24 rounded-2xl border-4";
  const initials = creator.fullName?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="relative shrink-0">
      {creator.avatar ? (
        <img
          src={creator.avatar}
          alt={creator.fullName}
          className={`${cls} object-cover border-card shadow-warm`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/images/no_image.png";
          }}
        />
      ) : (
        <div
          className={`${cls} bg-primary/15 text-primary flex items-center justify-center font-bold text-2xl border-card shadow-warm`}
        >
          {initials}
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 bg-card rounded-full p-0.5">
        <CheckCircle2 className="w-4 h-4 text-primary" />
      </span>
    </div>
  );
};

// ─── Creator Card ─────────────────────────────────────────────────────────────
const CreatorCard = ({ creator, onOpen }) => (
  <button
    onClick={() => onOpen(creator)}
    className="text-left bg-card border border-border rounded-2xl overflow-hidden shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
  >
    <div className="relative h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
      <div className="absolute top-3 right-3">
        {creator.badge && <Badge type={creator.badge} />}
      </div>
    </div>

    <div className="flex flex-col items-center px-4 pb-4 -mt-10 text-center">
      <Avatar creator={creator} />
      <h3 className="mt-3 text-base font-heading font-bold text-foreground truncate max-w-[180px] group-hover:text-primary transition-colors">
        {creator.fullName}
      </h3>
      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
        @{creator.username}
      </p>

      {creator.specialty && (
        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <Flame className="w-3 h-3" />
          {creator.specialty}
        </p>
      )}

      <div className="grid w-full grid-cols-3 gap-2 pt-3 mt-4 border-t border-border">
        {[
          { v: compact(creator.recipeCount), l: "Recipes" },
          { v: compact(creator.followersCount), l: "Followers" },
          { v: creator.avgRating, l: "Rating", star: true },
        ].map((s, i) => (
          <div key={i}>
            <p className="flex items-center justify-center gap-1 text-sm font-bold text-foreground">
              {s.star && <Star className="w-3 h-3 text-warning fill-warning" />}
              {s.v}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </div>
  </button>
);

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ creator, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!creator) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-warm-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0">
          <div className="h-28 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
          <button
            onClick={onClose}
            className="absolute p-2 text-white transition-colors rounded-full top-3 right-3 bg-black/30 backdrop-blur-sm hover:bg-black/50"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-end gap-4 px-6 -mt-12">
            <Avatar creator={creator} size="xl" />
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold truncate font-heading text-foreground">
                  {creator.fullName}
                </h2>
                {creator.badge && <Badge type={creator.badge} />}
              </div>
              <p className="text-sm truncate text-muted-foreground">
                @{creator.username}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            {creator.specialty && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5" />
                {creator.specialty}
              </span>
            )}
            {creator.location && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5" />
                {creator.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Joined {formatDate(creator.createdAt)}
            </span>
          </div>

          {creator.bio && (
            <p className="text-sm leading-relaxed text-foreground">
              {creator.bio}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Recipes", value: compact(creator.recipeCount) },
              { label: "Followers", value: compact(creator.followersCount) },
              { label: "Likes", value: compact(creator.likesReceived) },
              { label: "Avg Rating", value: creator.avgRating },
            ].map((s, i) => (
              <div
                key={i}
                className="p-3 border rounded-xl border-border bg-muted/30"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  {s.label}
                </p>
                <p className="text-base font-bold font-heading text-foreground">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Top recipes */}
          {creator.topRecipes?.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-heading font-bold text-foreground mb-2.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Popular Recipes
              </h4>
              <div className="space-y-2">
                {creator.topRecipes.map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                  >
                    <div className="flex items-center min-w-0 gap-3">
                      <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-primary/10 text-primary shrink-0">
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium truncate text-foreground">
                        {r.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {compact(r.likes)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        {r.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {creator.website && (
            <a
              href={creator.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Globe className="w-4 h-4" />
              {creator.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t shrink-0 border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
              <Heart className="w-4 h-4" />
              Follow
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <ExternalLink className="w-4 h-4" />
              View Recipes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="overflow-hidden border bg-card border-border rounded-2xl shadow-warm animate-pulse">
    <div className="h-20 bg-muted" />
    <div className="flex flex-col items-center px-4 pb-4 -mt-10">
      <div className="w-20 h-20 border-4 rounded-full bg-muted border-card" />
      <div className="w-32 h-4 mt-3 rounded bg-muted" />
      <div className="w-24 h-3 mt-2 rounded bg-muted" />
      <div className="grid w-full grid-cols-3 gap-2 pt-3 mt-4 border-t border-border">
        <div className="h-8 rounded bg-muted" />
        <div className="h-8 rounded bg-muted" />
        <div className="h-8 rounded bg-muted" />
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FeaturedCreators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setCreators(CREATORS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = creators;
    if (filter === "verified")
      list = list.filter((c) => c.isVerified !== false);
    else if (filter !== "all") list = list.filter((c) => c.badge === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        [c.fullName, c.username, c.specialty].some((v) =>
          v?.toLowerCase().includes(q),
        ),
      );
    }
    return list;
  }, [creators, filter, search]);

  const counts = useMemo(
    () => ({
      all: creators.length,
      "top-chef": creators.filter((c) => c.badge === "top-chef").length,
      "rising-star": creators.filter((c) => c.badge === "rising-star").length,
      verified: creators.filter((c) => c.isVerified !== false).length,
    }),
    [creators],
  );

  const TABS = [
    { key: "all", label: "All", Icon: Sparkles },
    { key: "top-chef", label: "Top Chefs", Icon: Crown },
    { key: "rising-star", label: "Rising Stars", Icon: Zap },
    { key: "verified", label: "Verified", Icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative p-6 overflow-hidden border rounded-2xl border-border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent sm:p-8 shadow-warm">
        <div className="absolute w-40 h-40 rounded-full -top-8 -right-8 bg-primary/10 blur-2xl" />
        <div className="absolute rounded-full -bottom-10 -left-10 w-52 h-52 bg-warning/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 text-primary shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl font-heading text-foreground">
              Featured Creators
            </h1>
            <p className="max-w-lg mt-1 text-sm text-muted-foreground">
              Popular chefs and community members who make RecipeHub delicious.
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <UsersIcon className="w-3.5 h-3.5" />
                {counts.all} creators
              </span>
              <span className="inline-flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-warning" />
                {counts["top-chef"]} top chefs
              </span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                {counts["rising-star"]} rising stars
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === key
                  ? "bg-primary text-primary-foreground border-primary shadow-warm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span
                className={`text-[10px] font-bold px-1.5 rounded-full ${filter === key ? "bg-primary-foreground/20" : "bg-muted-foreground/15"}`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search creators…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 pr-3 text-sm border rounded-lg pl-9 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No creators match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <CreatorCard key={c._id} creator={c} onOpen={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <DetailModal creator={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
