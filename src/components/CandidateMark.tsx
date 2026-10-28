import type { Candidate } from "@/lib/candidates";

type Props = {
  candidate: Candidate;
  size?: "sm" | "md";
};

/** Portrait from the TSE urna photo, plus the party mark. */
export function CandidateMark({ candidate, size = "md" }: Props) {
  const photo = size === "sm" ? "h-8 w-6" : "h-14 w-11";
  const logo = size === "sm" ? "h-6 w-8" : "h-8 w-10";
  const logoOnDark = candidate.sigla === "UP";

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <img
        src={candidate.foto}
        alt=""
        width={size === "sm" ? 24 : 44}
        height={size === "sm" ? 32 : 56}
        className={`${photo} rounded-md bg-zinc-200 object-cover object-top`}
      />
      <span
        className={`flex items-center justify-center overflow-hidden rounded-md p-0.5 ring-1 ring-zinc-200 ${logo} ${
          logoOnDark ? "bg-zinc-900" : "bg-white"
        }`}
      >
        <img
          src={candidate.logo}
          alt=""
          className="max-h-full max-w-full object-contain"
        />
      </span>
    </span>
  );
}
