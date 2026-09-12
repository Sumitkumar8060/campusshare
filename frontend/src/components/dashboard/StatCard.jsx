import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
};

export function StatCard({ icon: Icon, label, value, tone = "brand" }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
    </Card>
  );
}
