import { AppShell } from "@/components/app-shell";
import { PortfolioBuilder } from "@/components/portfolio-builder";
import { getProjects } from "@/lib/content";

export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Hire-ready mode</p>
        <h1 className="text-3xl font-semibold">Portfolio project builder</h1>
        <p className="max-w-2xl text-muted-foreground">
          Build five mock implementation projects and turn each one into a case
          study, resume bullet, or freelance profile proof point.
        </p>
      </section>
      <PortfolioBuilder projects={projects} />
    </AppShell>
  );
}
