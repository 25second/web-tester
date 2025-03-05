import { ButtonCollection } from "@/components/button-lab/ButtonCollection";
import { CursorTrail } from "@/components/button-lab/CursorTrail";
import { InteractionLog } from "@/components/button-lab/InteractionLog";
import { MultiStepForm } from "@/components/button-lab/MultiStepForm";
import { SimpleForm } from "@/components/button-lab/SimpleForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <CursorTrail />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              Button Interaction Laboratory
            </h1>
            <p className="text-muted-foreground">
              Test and visualize different button interactions
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Button Collection</h2>
              <div className="rounded-lg border bg-card">
                <ButtonCollection />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Interaction Log</h2>
              <InteractionLog />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Multi-step Form</h2>
              <MultiStepForm />
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Simple Form</h2>
              <SimpleForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}