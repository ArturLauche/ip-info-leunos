import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function ErrorPanel({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="tool-section-reveal">
      <TriangleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
