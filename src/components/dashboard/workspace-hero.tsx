import Link from "next/link";
import { ArrowUpRight, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { ArchitectureScene } from "@/components/architecture-scene";
import { Button } from "@/components/ui/button";

export function WorkspaceHero() {
  return (
    <section className="workspace-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="hero-kicker"><Sparkles size={13} aria-hidden="true" /> A NEW PERSPECTIVE ON PROPERTY</span>
        <h2 id="hero-title">Exceptional homes.<br /><span>Extraordinary possibilities.</span></h2>
        <p>From the first detail to the final walkthrough.<br className="hero-linebreak" /> Bring your next open house into focus.</p>
        <div className="hero-actions">
          <Button asChild><Link href="/properties/new">Create a property <ArrowUpRight aria-hidden="true" /></Link></Button>
          <Link className="hero-secondary" href="/properties">Explore portfolio <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="hero-assurances"><span><ShieldCheck size={13} aria-hidden="true" /> Private by design</span><span><Layers3 size={13} aria-hidden="true" /> Every detail, connected</span></div>
      </div>
      <div className="hero-visual"><ArchitectureScene /><div className="scene-label"><span className="signal-dot" /><span>Your next chapter<br /><strong>Starts with a vision.</strong></span><ArrowUpRight size={17} /></div></div>
    </section>
  );
}
