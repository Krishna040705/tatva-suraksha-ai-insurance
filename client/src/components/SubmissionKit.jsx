export default function SubmissionKit() {
  const artefacts = [
    {
      title: "Demo script",
      description:
        "A 5-minute walkthrough script showing disruption simulation, ML fraud checks, claim approval, and instant payout.",
      path: "docs/DEMO_SCRIPT.md",
    },
    {
      title: "Final pitch deck source",
      description:
        "Slide-ready content covering persona, AI and fraud architecture, weekly pricing viability, and social impact.",
      path: "docs/FINAL_PITCH_DECK.md",
    },
    {
      title: "Pitch deck PDF",
      description:
        "Exported PDF version of the final pitch deck, ready for submission packaging.",
      path: "docs/FINAL_PITCH_DECK.pdf",
    },
    {
      title: "Submission guide",
      description:
        "Deployment steps, demo flow, and the only remaining manual step: publishing the public demo video link.",
      path: "docs/FINAL_SUBMISSION_PACKAGE.md",
    },
  ];

  return (
    <section className="panel-surface">
      <div className="panel-heading">
        <span className="section-kicker">Final submission package</span>
        <h3>Week 6 artefacts staged inside the repo</h3>
        <p>
          The product demo, pitch narrative, and submission guidance now live in
          one place so the final judging package is easy to export and present.
        </p>
      </div>

      <div className="metric-grid three-up">
        {artefacts.map((artefact) => (
          <article className="metric-tile submission-card" key={artefact.path}>
            <span>{artefact.title}</span>
            <strong>{artefact.path}</strong>
            <small>{artefact.description}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
