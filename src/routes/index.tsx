import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties } from "react";
import { Download, Palette, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Grille annuelle LMD | Délibération académique" },
    { name: "description", content: "Grille annuelle LMD imprimable avec décisions par UE et résumés des semestres 1 et 2." },
    { property: "og:title", content: "Grille annuelle de délibération LMD" },
    { property: "og:description", content: "Résultats par UE, moyennes des catégories A et B, résumés semestriels et décision annuelle." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

type View = "annual" | "s1" | "s2";
type Unit = { semester: 1 | 2; code: string; name: string; category: "A" | "B"; courses: { code: string; name: string; credits: number }[] };
type Student = { id: string; name: string; notes: number[] };
type UnitResult = { unit: Unit; mean: number; credits: number; valid: boolean; courseIndexes: number[] };
type SemesterResult = { units: UnitResult[]; categoryA: number; categoryB: number; mean: number; credits: number; decision: string };

const units: Unit[] = [
  { semester: 1, code: "INF111", name: "Algorithmique & programmation", category: "A", courses: [{ code: "INF1111", name: "Algorithmique avancée", credits: 4 }, { code: "INF1112", name: "Programmation orientée objet", credits: 4 }] },
  { semester: 1, code: "RES112", name: "Réseaux informatiques I", category: "A", courses: [{ code: "RES1121", name: "Architecture TCP/IP", credits: 3 }, { code: "RES1122", name: "Câblage & transmission", credits: 3 }] },
  { semester: 1, code: "GES113", name: "Gestion & communication", category: "B", courses: [{ code: "GES1131", name: "Gestion de projet", credits: 3 }, { code: "ANG1132", name: "Anglais technique I", credits: 3 }] },
  { semester: 1, code: "MAT114", name: "Mathématiques appliquées", category: "A", courses: [{ code: "MAT1141", name: "Analyse numérique", credits: 5 }, { code: "STA1142", name: "Statistique appliquée", credits: 5 }] },
  { semester: 2, code: "DEV121", name: "Génie logiciel", category: "A", courses: [{ code: "DEV1211", name: "Applications web", credits: 4 }, { code: "DEV1212", name: "Développement mobile", credits: 4 }] },
  { semester: 2, code: "SYS122", name: "Systèmes & données", category: "A", courses: [{ code: "SYS1221", name: "Administration Linux", credits: 3 }, { code: "BDD1222", name: "Bases de données avancées", credits: 3 }] },
  { semester: 2, code: "IA123", name: "Intelligence artificielle", category: "B", courses: [{ code: "IA1231", name: "Fondements de l’IA", credits: 4 }, { code: "IA1232", name: "Apprentissage automatique", credits: 4 }] },
  { semester: 2, code: "PRO124", name: "Projet & professionnalisation", category: "B", courses: [{ code: "PRO1241", name: "Projet tutoré", credits: 5 }, { code: "ANG1242", name: "Anglais technique II", credits: 3 }] },
];

const students: Student[] = [
  { id: "001", name: "Kabamba Mukadi Jonathan", notes: [14.5,12,13,15,11.5,14,12,13,16,14.5,12,13,15,14,16.5,15] },
  { id: "002", name: "Lumbala Tshilumba Sarah", notes: [10,7.5,11,10.5,9.5,10,11,10,10,10,8,9,12,12,11,13] },
  { id: "003", name: "Mbuyi Kalala Esther", notes: [16,17,14,15,13,16,15,14,17,16,15,14,16,17,18,16] },
  { id: "004", name: "Ilunga Mutombo Grâce", notes: [9,8,11,12,10,9,8,10,12,11,9,8,10,11,12,10] },
  { id: "005", name: "Kanku Nsimba Patrick", notes: [12,13,10,11,14,12,13,11,14,13,12,14,11,13,15,14] },
  { id: "006", name: "Mafuta Lukusa Diane", notes: [15,14,16,13,12,15,14,16,13,15,14,16,15,13,14,17] },
];

const allCourses = units.flatMap((unit) => unit.courses);
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const categoryMean = (results: UnitResult[], category: "A" | "B") => average(results.filter((result) => result.unit.category === category).map((result) => result.mean));
const unitTone = (code: string) => `ue-tone-${units.findIndex((unit) => unit.code === code) + 1}`;

function semesterResult(student: Student, semester: 1 | 2): SemesterResult {
  const semesterUnits = units.filter((unit) => unit.semester === semester);
  const results = semesterUnits.map((unit) => {
    const courseIndexes = unit.courses.map((course) => allCourses.findIndex((item) => item.code === course.code));
    const mean = average(courseIndexes.map((index) => student.notes[index] ?? 0));
    const valid = mean >= 10;
    return { unit, mean, valid, courseIndexes, credits: valid ? unit.courses.reduce((sum, course) => sum + course.credits, 0) : 0 };
  });
  const credits = results.reduce((sum, result) => sum + result.credits, 0);
  return {
    units: results,
    categoryA: categoryMean(results, "A"),
    categoryB: categoryMean(results, "B"),
    mean: average(results.map((result) => result.mean)),
    credits,
    decision: credits === 30 ? "VALIDÉ" : "NON VALIDÉ",
  };
}

function annualDecision(credits: number) {
  if (credits === 60) return "ADMIS";
  if (credits >= 45) return "ADMIS AVEC DETTE";
  return "AJOURNÉ";
}

function mention(mean: number) {
  if (mean >= 16) return "Distinction";
  if (mean >= 14) return "Bien";
  if (mean >= 12) return "Assez bien";
  if (mean >= 10) return "Satisfaction";
  return "—";
}

function Index() {
  const [view, setView] = useState<View>("annual");
  const [primary, setPrimary] = useState("#18324a");
  const [compact, setCompact] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const semesters = useMemo<(1 | 2)[]>(() => view === "annual" ? [1, 2] : [view === "s1" ? 1 : 2], [view]);
  const theme = { "--academic": primary } as CSSProperties;

  return (
    <main style={theme} className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="no-print mx-auto mb-5 flex max-w-[2200px] flex-col gap-3 border-b-2 border-academic pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-muted-foreground">Département d’Informatique de Gestion et des Affaires</p>
          <h1 className="mt-1 text-2xl font-extrabold uppercase text-academic">Délibération académique LMD</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {([['annual','Année complète'],['s1','Semestre 1'],['s2','Semestre 2']] as [View,string][]).map(([value,label]) => (
            <Button key={value} size="sm" variant={view === value ? "default" : "outline"} onClick={() => setView(value)}>{label}</Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => setConfigOpen(true)}><SlidersHorizontal /> Paramètres</Button>
          <Button size="sm" onClick={() => window.print()}><Download /> Télécharger en PDF</Button>
        </div>
      </div>

      {configOpen && <div className="no-print fixed inset-0 z-50 bg-foreground/55" onClick={() => setConfigOpen(false)}>
        <aside role="dialog" aria-modal="true" aria-labelledby="config-title" className="ml-auto h-full w-[min(90vw,24rem)] border-l border-grid bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0"><h2 id="config-title" className="text-lg font-semibold">Personnaliser la grille</h2><p className="mt-1 text-sm text-muted-foreground">Une seule couleur institutionnelle, conservée dans le PDF.</p></div>
            <Button size="icon" variant="ghost" aria-label="Fermer les paramètres" onClick={() => setConfigOpen(false)}><X /></Button>
          </div>
          <div className="mt-8 space-y-7">
            <ColorField label="Couleur principale" value={primary} onChange={setPrimary} />
            <label className="flex items-center justify-between gap-4 text-sm font-medium"><span>Affichage compact</span><input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} className="size-4 accent-academic" /></label>
            <Button variant="outline" className="w-full" onClick={() => { setPrimary("#18324a"); setCompact(true); }}><RotateCcw /> Réinitialiser</Button>
          </div>
        </aside>
      </div>}

      <article className="print-sheet mx-auto max-w-[2200px] overflow-hidden border border-grid bg-card shadow-lg">
        <header className="grid grid-cols-1 gap-5 border-b border-grid p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div><h2 className="text-xl font-extrabold uppercase text-academic">Université Révérend Kim</h2><p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">Faculté des sciences informatiques · Campus de Ndjili</p></div>
          <div className="md:text-right"><p className="text-base font-bold">Grille de délibération annuelle</p><p className="text-xs uppercase text-muted-foreground">Année académique 2025–2026 · L3 LMD Réseau · Session ordinaire</p></div>
        </header>
        <section className="grid grid-cols-2 border-b border-grid text-[10px] sm:grid-cols-4 lg:grid-cols-6">
          {[['Mention','Informatique'],['Parcours','Réseaux & systèmes'],['Promotion','L3'],['Crédits annuels','60 crédits'],['Effectif',`${students.length} étudiants`],['Catégories','A : fondamentale · B : complémentaire']].map(([label,value]) => <div key={label} className="border-r border-grid px-4 py-3"><span className="block uppercase text-muted-foreground">{label}</span><strong>{value}</strong></div>)}
        </section>

        <div className="print-scroll overflow-x-auto">
          <table className={`annual-grid w-full min-w-max border-collapse ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
            <thead>
              <tr className="bg-academic text-academic-foreground">
                <th rowSpan={3} className="w-10 border border-grid p-2">N°</th>
                <th rowSpan={3} className="min-w-52 border border-grid p-2 text-left">NOM, POSTNOM & PRÉNOM</th>
                {semesters.map((semester) => <th key={semester} colSpan={21} className={`semester-title semester-${semester} border border-grid p-2 uppercase`}>Semestre {semester} · 30 crédits</th>)}
                {view === "annual" && <th colSpan={4} className="annual-title border border-grid p-2 uppercase">Synthèse annuelle</th>}
              </tr>
              <tr className="bg-muted">
                {semesters.map((semester) => <SemesterGroupHeader key={semester} semester={semester} />)}
                {view === "annual" && <>
                  <th rowSpan={2} className="annual-band border border-grid px-2">Moy. annuelle</th>
                  <th rowSpan={2} className="annual-band border border-grid px-2">Crédits /60</th>
                  <th rowSpan={2} className="annual-band border border-grid px-2">Décision finale</th>
                  <th rowSpan={2} className="annual-band border border-grid px-2">Mention / dettes</th>
                </>}
              </tr>
              <tr className="bg-card">
                {semesters.map((semester) => <SemesterColumnHeader key={semester} semester={semester} />)}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => <StudentRow key={student.id} student={student} semesters={semesters} annual={view === "annual"} />)}
            </tbody>
          </table>
        </div>

        <section className="grid border-t border-grid md:grid-cols-[1.2fr_1fr]">
          <div className="grid grid-cols-2 gap-px bg-grid text-xs sm:grid-cols-4">
            {[['Moyenne promotion','12,31 / 20'],['Crédits visés',view === 'annual' ? '60 par étudiant' : '30 par étudiant'],['Admis','5 sur 6'],['Taux de réussite','83,3 %']].map(([label,value]) => <div key={label} className="bg-card p-4"><span className="block text-[9px] font-bold uppercase text-muted-foreground">{label}</span><strong className="mt-1 block text-lg text-academic">{value}</strong></div>)}
          </div>
          <div className="p-4 text-[10px]"><strong className="uppercase">Règles de lecture</strong><p className="mt-2 text-muted-foreground">Catégorie A : UE fondamentales · Catégorie B : UE complémentaires · UE validée : moyenne ≥ 10/20 · Les crédits d’une UE sont acquis uniquement lorsque l’UE est validée.</p></div>
        </section>
        <footer className="grid gap-8 border-t border-grid p-7 text-center text-[10px] sm:grid-cols-3">
          {[['Membre du jury','SCHICO ZANDI'],['Président du jury','Prof. KAPIAMBA Joël'],['Secrétaire du jury','INYEI Didider']].map(([role,name],index) => <div key={role}><p className="font-bold uppercase">{role}</p>{index === 1 && <p className="mt-2 text-muted-foreground">Fait à Kinshasa, le 25 septembre 2026</p>}<div className="mx-auto mt-10 w-40 border-b border-dashed border-foreground"/><p className="mt-2 font-semibold">{name}</p></div>)}
        </footer>
      </article>
      <p className="no-print mx-auto mt-4 max-w-[2200px] text-center text-[10px] text-muted-foreground">Exemple démonstratif — les noms, notes et décisions présentés sont fictifs.</p>
    </main>
  );
}

function SemesterGroupHeader({ semester }: { semester: 1 | 2 }) {
  return <>
    {units.filter((unit) => unit.semester === semester).map((unit) => <th key={unit.code} colSpan={4} className={`${unitTone(unit.code)} ue-band-strong border border-grid px-2 py-1.5`}>
      <span className="font-extrabold">{unit.code}</span>
      <span className="ml-1 font-extrabold">CAT. {unit.category}</span>
      <span className="block max-w-36 truncate text-[7px] font-medium opacity-80">{unit.name}</span>
    </th>)}
    <th colSpan={5} className={`summary-${semester} summary-strong border border-grid px-2 py-1.5 font-extrabold uppercase`}>Résumé S{semester}</th>
  </>;
}

function SemesterColumnHeader({ semester }: { semester: 1 | 2 }) {
  return <>
    {units.filter((unit) => unit.semester === semester).flatMap((unit) => [
      ...unit.courses.map((course) => <th key={course.code} className={`${unitTone(unit.code)} ue-band h-32 w-9 border border-grid p-1 align-bottom`}><span className="inline-block [writing-mode:vertical-rl] rotate-180 whitespace-nowrap font-bold">{course.name} · {course.credits} Cr</span></th>),
      <th key={`${unit.code}-mean`} className={`${unitTone(unit.code)} ue-band w-11 border border-grid px-1`}>Moy.<br/>UE</th>,
      <th key={`${unit.code}-decision`} className={`${unitTone(unit.code)} ue-band w-14 border border-grid px-1`}>Décision<br/>UE</th>,
    ])}
    <th className={`summary-${semester} summary-band w-11 border border-grid px-1`}>Moy.<br/>Cat. A</th>
    <th className={`summary-${semester} summary-band w-11 border border-grid px-1`}>Moy.<br/>Cat. B</th>
    <th className={`summary-${semester} summary-band w-11 border border-grid px-1`}>Moy.<br/>S{semester}</th>
    <th className={`summary-${semester} summary-band w-11 border border-grid px-1`}>Crédits<br/>/30</th>
    <th className={`summary-${semester} summary-band w-14 border border-grid px-1`}>Décision<br/>S{semester}</th>
  </>;
}

function StudentRow({ student, semesters, annual }: { student: Student; semesters: (1 | 2)[]; annual: boolean }) {
  const results = semesters.map((semester) => semesterResult(student, semester));
  const fullResults = [semesterResult(student, 1), semesterResult(student, 2)];
  const annualMean = average(fullResults.map((result) => result.mean));
  const annualCredits = fullResults.reduce((sum, result) => sum + result.credits, 0);
  const invalidUnits = fullResults.flatMap((result) => result.units).filter((result) => !result.valid).map((result) => result.unit.code);
  const finalDecision = annualDecision(annualCredits);

  return <tr className="hover:bg-muted/40">
    <td className="border border-grid p-2 text-center font-mono font-bold">{student.id}</td>
    <td className="border border-grid px-3 py-2 font-bold uppercase">{student.name}</td>
    {results.map((result, resultIndex) => <SemesterCells key={semesters[resultIndex]} student={student} result={result} />)}
    {annual && <>
      <td className="annual-cell border border-grid p-2 text-center font-extrabold">{annualMean.toFixed(2)}</td>
      <td className="annual-cell border border-grid p-2 text-center font-bold">{annualCredits}/60</td>
      <td className={`border border-grid p-2 text-center font-extrabold ${finalDecision === "AJOURNÉ" ? "status-fail" : finalDecision === "ADMIS AVEC DETTE" ? "status-warning" : "status-pass"}`}>{finalDecision}</td>
      <td className="annual-cell border border-grid px-2 text-center">{invalidUnits.length ? `Dettes : ${invalidUnits.join(", ")}` : mention(annualMean)}</td>
    </>}
  </tr>;
}

function SemesterCells({ student, result }: { student: Student; result: SemesterResult }) {
  return <>
    {result.units.flatMap((unitResult) => [
      ...unitResult.courseIndexes.map((index) => {
        const note = student.notes[index] ?? 0;
        return <td key={`${student.id}-${index}`} className={`${unitTone(unitResult.unit.code)} ue-cell border border-grid p-2 text-center font-mono ${note < 10 ? 'font-extrabold underline decoration-1 underline-offset-2' : ''}`}>{note.toFixed(1)}</td>;
      }),
      <td key={`${student.id}-${unitResult.unit.code}-mean`} className={`${unitTone(unitResult.unit.code)} ue-cell border border-grid p-2 text-center font-extrabold`}>{unitResult.mean.toFixed(2)}</td>,
      <td key={`${student.id}-${unitResult.unit.code}-decision`} className={`border border-grid p-2 text-center font-extrabold ${unitResult.valid ? "status-pass" : "status-fail"}`}>{unitResult.valid ? "VALIDÉE" : "NON VALIDÉE"}</td>,
    ])}
    <td className={`summary-${result.units[0]?.unit.semester ?? 1} summary-cell border border-grid p-2 text-center font-extrabold`}>{result.categoryA.toFixed(2)}</td>
    <td className={`summary-${result.units[0]?.unit.semester ?? 1} summary-cell border border-grid p-2 text-center font-extrabold`}>{result.categoryB.toFixed(2)}</td>
    <td className={`summary-${result.units[0]?.unit.semester ?? 1} summary-cell border border-grid p-2 text-center font-extrabold`}>{result.mean.toFixed(2)}</td>
    <td className={`summary-${result.units[0]?.unit.semester ?? 1} summary-cell border border-grid p-2 text-center font-bold`}>{result.credits}/30</td>
    <td className={`border border-grid p-2 text-center font-extrabold ${result.decision === "VALIDÉ" ? "status-pass" : "status-fail"}`}>{result.decision}</td>
  </>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex items-center justify-between gap-4 text-sm font-medium"><span className="flex items-center gap-2"><Palette className="size-4" />{label}</span><span className="flex items-center gap-2 font-mono text-xs text-muted-foreground"><input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 cursor-pointer rounded border border-input bg-background p-1" />{value}</span></label>;
}
