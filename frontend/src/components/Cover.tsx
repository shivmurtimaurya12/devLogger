import type { Cover as CoverType } from "../types";

export default function Cover({
  cover,
  className = "",
}: {
  cover: CoverType;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${cover.from}, ${cover.to})`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(237,230,214,0.05) 0px, rgba(237,230,214,0.05) 1px, transparent 1px, transparent 12px)",
        }}
      />
    </div>
  );
}
