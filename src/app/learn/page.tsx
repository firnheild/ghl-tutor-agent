import { AppShell } from "@/components/app-shell";
import { RoadmapJourney } from "@/components/roadmap-journey";
import { getModules } from "@/lib/content";

export default async function LearnPage() {
  const modules = await getModules();

  return (
    <AppShell fullWidth>
      <RoadmapJourney modules={modules} />
    </AppShell>
  );
}
