import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export function InteractionLog() {
  const { data: interactions } = useQuery({
    queryKey: ["/api/interactions"],
  });

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {interactions?.map((interaction: any) => (
          <div
            key={interaction.id}
            className="flex items-center justify-between border-b pb-2"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {interaction.buttonId} - {interaction.eventType}
              </span>
              <span className="text-xs text-muted-foreground">
                Position: ({Math.round(interaction.cursorPosition.x)}, 
                {Math.round(interaction.cursorPosition.y)})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(interaction.timestamp), "HH:mm:ss")}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
