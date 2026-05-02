import { TriangleAlert } from "lucide-react";

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
      <TriangleAlert className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
