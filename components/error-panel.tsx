import { RotateCw, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorPanelProps {
  message: string;
  onRetry?: () => void;
  retryLabel: string;
}

export function ErrorPanel({ message, onRetry, retryLabel }: ErrorPanelProps) {
  return (
    <Alert variant="destructive">
      <TriangleAlert aria-hidden="true" />
      <AlertDescription>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span className="min-w-0">{message}</span>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="min-h-11 shrink-0 text-foreground sm:min-h-8"
            >
              <RotateCw aria-hidden="true" />
              {retryLabel}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
