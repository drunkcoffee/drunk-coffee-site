const labelUrl = "/labels/fazendal-pinhal-label.svg";

export default function LabelPreview() {
  return (
    <main className="label-preview" aria-label="Fazendal Pinhal label preview">
      <div className="label-preview__paper" aria-hidden="true" />
      <section className="label-preview__bag">
        <img
          className="label-preview__label"
          src={labelUrl}
          alt="Drunk Coffee Roasters Fazendal Pinhal coffee label"
        />
      </section>
      <p className="label-preview__caption">Fazendal Pinhal / kraft bag label preview</p>
    </main>
  );
}
