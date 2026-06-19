/**
 * Per-professional color coding for the agenda. Indexed by professional order
 * so "agenda por colaborador" reads at a glance. Static classes so Tailwind
 * keeps them in the build.
 */
export const PRO_COLORS = [
  {
    block: "border-l-info bg-info-soft text-info",
    dot: "bg-info",
    chip: "bg-info-soft text-info border-info/30",
  },
  {
    block: "border-l-primary bg-[oklch(0.96_0.04_47)] text-primary",
    dot: "bg-primary",
    chip: "bg-[oklch(0.96_0.04_47)] text-primary border-primary/30",
  },
  {
    block: "border-l-success bg-success-soft text-success",
    dot: "bg-success",
    chip: "bg-success-soft text-success border-success/30",
  },
  {
    block: "border-l-copper bg-[oklch(0.96_0.035_40)] text-copper",
    dot: "bg-copper",
    chip: "bg-[oklch(0.96_0.035_40)] text-copper border-copper/30",
  },
];
