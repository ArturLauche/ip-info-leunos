import { RotateCw, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorPanelProps {
  message: string;
  /** Offers an in-place retry when repeating the request can help. */
  onRetry?: () => void;
  /** Required with onRetry: the localized button label. */
  retryLabel?: string;
}

export function ErrorPanel({ message, onRetry, retryLabel }: ErrorPanelProps) {
  const showRetry = Boolean(onRetry && retryLabel);
  return (
    <Alert variant="destructive" className="tool-section-reveal">
      <TriangleAlert />
      <AlertDescription
        className={
          showRetry
            ? "flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
            : undefined
        }
      >
        {showRetry ? <span className="min-w-0">{message}</span> : message}
        {showRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="min-h-11 text-foreground sm:min-h-8"
          >
            <RotateCw aria-hidden />
            {retryLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
