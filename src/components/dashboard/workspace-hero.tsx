import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function WorkspaceHero() {
  return (
    <section className="workspace-feature" aria-labelledby="feature-title">
      <Image src="/images/house.jpg" alt="Contemporary home and outdoor living space" fill sizes="(max-width: 800px) 100vw, 1200px" className="workspace-feature-image" />
      <div className="workspace-feature-copy">
        <span className="eyebrow">READY FOR A BETTER FIRST IMPRESSION</span>
        <h2 id="feature-title">Great open houses<br />start with the details.</h2>
        <p>Give every property the preparation it deserves.</p>
        <Link href="/properties/new">Prepare a property <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
