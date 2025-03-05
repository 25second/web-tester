import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { Interaction } from "@shared/schema";
import { Loader2 } from "lucide-react";

export function InteractionLog() {
  const { data: interactions, isLoading } = useQuery<Interaction[]>({
    queryKey: ["/api/interactions"],
  });

  if (isLoading) {
    return (
      <div className="h-[400px] w-full rounded-md border p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {interactions && interactions.length > 0 ? (
          interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {interaction.buttonId} - {interaction.eventType}
                </span>
                <span className="text-xs text-muted-foreground">
                  Position: ({Math.round(interaction.cursorPosition?.x ?? 0)}, 
                  {Math.round(interaction.cursorPosition?.y ?? 0)})
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(interaction.timestamp), "HH:mm:ss")}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No interactions recorded yet. Try clicking some buttons!
          </div>
        )}
      </div>
    </ScrollArea>
  );
}