import { Badge } from "@/components/ui";
import { VERIFICATION_LABEL, type Verification } from "@/lib/types";

const TONE: Record<Verification, "neutral" | "green" | "blue" | "amber"> = { provisional: "amber", reference: "green", supplementary: "blue", confirm: "neutral" };

export function VerificationBadge({ v }: { v: Verification }) {
  return <Badge tone={TONE[v]}>{VERIFICATION_LABEL[v]}</Badge>;
}
