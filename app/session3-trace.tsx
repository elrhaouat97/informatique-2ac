import { ArrowDown } from "lucide-react";
import type { LocalizedText } from "./course-data";
import { session3Trace } from "./session3-data";
import { Session3Text } from "./session3-translation";

function TraceText({ value }: { value: LocalizedText }) {
  return <Session3Text value={value} />;
}

export function Session3Trace() {
  return <div className="tab-content page-enter">
    <article className="notebook s3-os-notebook" dir="ltr" aria-labelledby="s3-trace-title">
      <div className="notebook-margin" aria-hidden="true" />
      <header className="s3-os-heading">
        <small><TraceText value={{ fr: "Séance 03", ar: "الحصة 3" }} /></small>
        <h2 id="s3-trace-title"><TraceText value={session3Trace.title} /></h2>
      </header>

      <section className="s3-os-section" aria-labelledby="s3-definition-title">
        <h3 id="s3-definition-title"><TraceText value={{ fr: "Qu’est-ce qu’un OS ?", ar: "ما نظام التشغيل؟" }} /></h3>
        <p className="s3-os-definition"><TraceText value={session3Trace.definition} /></p>
      </section>

      <section className="s3-os-section" aria-labelledby="s3-functions-title">
        <h3 id="s3-functions-title"><TraceText value={{ fr: "Les fonctions principales", ar: "الوظائف الأساسية" }} /></h3>
        <ul>{session3Trace.functions.map((item) => <li key={item.fr}><TraceText value={item} /></li>)}</ul>
      </section>

      <section className="s3-os-section" aria-labelledby="s3-examples-title">
        <h3 id="s3-examples-title"><TraceText value={{ fr: "Les principaux systèmes", ar: "أمثلة لأنظمة التشغيل" }} /></h3>
        <ul className="s3-os-examples">{session3Trace.examples.map((name) => <li key={name} dir="ltr">{name}</li>)}</ul>
      </section>

      <section className="s3-os-section s3-os-architecture" aria-labelledby="s3-architecture-title">
        <h3 id="s3-architecture-title"><TraceText value={{ fr: "Architecture informatique", ar: "البنية المعلوماتية" }} /></h3>
        <ol className="s3-os-chain">{session3Trace.architecture.map((item, index) => <li key={item.fr}>
          <div><TraceText value={item} /></div>
          {index < session3Trace.architecture.length - 1 && <ArrowDown size={21} aria-hidden="true" />}
        </li>)}</ol>
      </section>
    </article>
  </div>;
}
