// Helper: phân hạng theo ngưỡng point của badge (tuỳ bạn chỉnh)
const classifyBadgeTier = (point: number) => {
  if (point >= 1000) return 'diamond';
  if (point >= 500)  return 'platinum';
  if (point >= 250)  return 'gold';
  if (point >= 100)  return 'silver';
  return 'bronze';
};

type PrimaryBadge = {
  id: string;
  name: string;
  point: number;      // threshold đạt badge
  description?: string | null;
};

export function BadgePillFancy({ badge }: { badge?: PrimaryBadge | null }) {
  if (!badge) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground"
        title="Chưa có huy hiệu"
      >
        No badge
      </span>
    );
  }

  const tier = classifyBadgeTier(badge.point ?? 0);

  const tierStyles: Record<string, { wrap: string; iconWrap: string; icon: string; text: string }> = {
    bronze: {
      wrap: "bg-gradient-to-br from-amber-200/70 to-amber-300/60 dark:from-amber-900/30 dark:to-amber-700/40 border-amber-300/60 dark:border-amber-800/60 shadow-sm",
      iconWrap: "bg-amber-500/90",
      icon: "text-amber-50",
      text: "text-amber-900 dark:text-amber-100",
    },
    silver: {
      wrap: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-600/50 border-slate-300/70 dark:border-slate-500/60 shadow",
      iconWrap: "bg-slate-300",
      icon: "text-slate-900",
      text: "text-slate-900 dark:text-slate-100",
    },
    gold: {
      wrap: "bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-900/30 dark:to-yellow-700/40 border-yellow-400/70 dark:border-yellow-700/70 shadow-md",
      iconWrap: "bg-yellow-400",
      icon: "text-yellow-950",
      text: "text-yellow-900 dark:text-yellow-100",
    },
    platinum: {
      wrap: "bg-gradient-to-br from-violet-200/70 via-fuchsia-200/70 to-pink-200/70 dark:from-violet-800/40 dark:via-fuchsia-800/40 dark:to-pink-800/40 border-fuchsia-300/60 dark:border-fuchsia-700/60 shadow-lg animate-pulse",
      iconWrap: "bg-fuchsia-400",
      icon: "text-fuchsia-50",
      text: "text-fuchsia-900 dark:text-fuchsia-100",
    },
    diamond: {
      wrap: "bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200 dark:from-cyan-900/40 dark:via-blue-900/40 dark:to-indigo-900/40 border-cyan-300/70 dark:border-cyan-700/60 shadow-xl ring-1 ring-cyan-400/50 dark:ring-cyan-300/30 animate-pulse",
      iconWrap: "bg-cyan-400",
      icon: "text-white",
      text: "text-cyan-900 dark:text-cyan-100",
    },
  };

  const s = tierStyles[tier] ?? tierStyles.bronze;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        "backdrop-blur-[1px]", // nhẹ nhàng
        s.wrap,
      ].join(" ")}
      title={badge.description || badge.name}
    >
      <span className={`mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full ${s.iconWrap}`}>
        {/* Medal/Trophy glyph bằng emoji để nhẹ, hoặc dùng lucide-react <Trophy/> */}
        <span className={`text-[9px] leading-none ${s.icon}`}>★</span>
      </span>
      <span className={s.text}>{badge.name}</span>
    </span>
  );
}
