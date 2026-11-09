"use client";

import { ClipboardCheck, Monitor, Folder, HardDrive, Calculator } from "lucide-react";
import { Session3Text as Text } from "./session3-translation";
import "./session3-revision.css";

const points = [
  {icon: ClipboardCheck, title: {fr: "Information et traitement", ar: "المعلومة والمعالجة"}, text: {fr: "Le traitement transforme les données reçues en un résultat.", ar: "تحول المعالجة المعطيات المستقبلة إلى نتيجة."}},
  {icon: HardDrive, title: {fr: "Matériel et logiciels", ar: "المعدات والبرمجيات"}, text: {fr: "Le matériel correspond aux éléments physiques. Les logiciels sont des programmes.", ar: "المعدات عناصر مادية، والبرمجيات برامج."}},
  {icon: Calculator, title: {fr: "Capacités de stockage", ar: "سعات التخزين"}, text: {fr: "1 octet = 8 bits. Entre Ko, Mo, Go et To, chaque passage utilise le facteur 1 000.", ar: "1 أوكتات = 8 بت. بين Ko وMo وGo وTo نستعمل العامل 1000 في كل انتقال."}},
  {icon: Monitor, title: {fr: "Système d’exploitation", ar: "نظام التشغيل"}, text: {fr: "Windows et Android permettent d’utiliser l’appareil et d’ouvrir les applications.", ar: "يتيح Windows وAndroid استعمال الجهاز وفتح التطبيقات."}},
  {icon: Folder, title: {fr: "Fichiers et dossiers", ar: "الملفات والمجلدات"}, text: {fr: "Un fichier contient une information ; un dossier range des fichiers. Copier garde l’original. Déplacer change son emplacement.", ar: "يحتوي الملف على معلومة، وينظم المجلد الملفات. يحتفظ النسخ بالأصل، ويغير النقل مكانه."}},
];

export function Session3WorkshopRecap() {
  return <section>
    <h3><Text value={{fr: "Les idées à retenir", ar: "الأفكار الأساسية"}} /></h3>
    <div className="s3-workshop-summary-points">{points.map(({icon: Icon, title, text}) => <article key={title.fr}><Icon size={25} /><h3><Text value={title} /></h3><p><Text value={text} /></p></article>)}</div>
    <p className="s3-workshop-summary-share"><Text value={{fr: "Avec ton binôme, explique la différence entre copier et déplacer, puis montre un geste appris sur Windows.", ar: "مع زميلك، اشرح الفرق بين النسخ والنقل، ثم طبق حركة تعلمتها في Windows."}} /></p>
  </section>;
}
