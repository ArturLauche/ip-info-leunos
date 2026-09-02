import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ReactNode } from "react";

export function ErrorPanel({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertDescription>
        <span>{message}</span>
        {action}
      </AlertDescription>
    </Alert>
  );
}
