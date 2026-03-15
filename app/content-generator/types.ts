export type PlannerPlatform = "facebook" | "line" | "general";

export type ContentType =
  | "ให้ความรู้"
  | "สร้างความน่าสนใจ"
  | "สร้างความบันเทิง"
  | "สร้างความไว้วางใจ"
  | "กระตุ้นการมีส่วนร่วม";

export type RecommendedGeneratorType =
  | "social-post"
  | "line-broadcast"
  | "video-script";

export type StructuredAvatar = {
  shortSummary?: string;
  business?: string;
  product?: string;
  roughAvatar?: string;
  price?: string;
  country?: string;
  [key: string]: unknown;
};

export type ContentPlanner30Input = {
  platform: PlannerPlatform;
  tone: string;
  extraContext: string;
};

export type ContentPlannerDay = {
  day: number;
  contentType: ContentType;
  title: string;
  theme: string;
  format: string;
  recommendedGeneratorType: RecommendedGeneratorType;
  hookIdea: string;
  angle: string;
  summary: string;
  ctaDirection: string;
};

export type ContentPlanner30Plan = {
  platform: PlannerPlatform;
  tone: string;
  extraContext: string;
  avatarSummary: string;
  businessContext: string;
  days: ContentPlannerDay[];
};

export type SelectedPlannerDay = {
  planPlatform: PlannerPlatform;
  tone: string;
  extraContext: string;
  avatarSummary: string;
  businessContext: string;
  day: ContentPlannerDay;
};
