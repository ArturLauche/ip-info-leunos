import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ErrorPanel({
  message,
  onRetry,
  retryLabel,
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertDescription className="flex flex-wrap items-center gap-3">
        <span className="min-w-0 flex-1">{message}</span>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onRetry}>
            {retryLabel || "Try again"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
