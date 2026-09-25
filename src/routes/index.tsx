import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties } from "react";
import { Download, Palette, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Grille annuelle LMD | Délibération académique" },
    { name: "description", content: "Exemple complet et imprimable d’une grille de délibération LMD pour les semestres 1 et 2." },
    { property: "og:title", content: "Grille annuelle de délibération LMD" },
    { property: "og:description", content: "Résultats par UE et ECUE, crédits, dettes, décisions et signatures du jury." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

type View = "annual" | "s1" | "s2";
type Unit = { semester: 1 | 2; code: string; name: string; category: string; courses: { code: string; name: string; credits: number }[] };
type Student = { id: string; name: string; notes: number[]; credits: number; decision: string; mention: string; debt?: string };

const units: Unit[] = [
  { semester: 1, code: "INF111", name: "Algorithmique & programmation", category: "Fondamentale", courses: [{ code: "INF1111", name: "Algorithmique avancée", credits: 4 }, { code: "INF1112", name: "Programmation orientée objet", credits: 4 }] },
  { semester: 1, code: "RES112", name: "Réseaux informatiques I", category: "Fondamentale", courses: [{ code: "RES1121", name: "Architecture TCP/IP", credits: 3 }, { code: "RES1122", name: "Câblage & transmission", credits: 3 }] },
  { semester: 1, code: "GES113", name: "Gestion & communication", category: "Transversale", courses: [{ code: "GES1131", name: "Gestion de projet", credits: 3 }, { code: "ANG1132", name: "Anglais technique I", credits: 3 }] },
  { semester: 1, code: "MAT114", name: "Mathématiques appliquées", category: "Fondamentale", courses: [{ code: "MAT1141", name: "Analyse numérique", credits: 5 }, { code: "STA1142", name: "Statistique appliquée", credits: 5 }] },
  { semester: 2, code: "DEV121", name: "Génie logiciel", category: "Fondamentale", courses: [{ code: "DEV1211", name: "Applications web", credits: 4 }, { code: "DEV1212", name: "Développement mobile", credits: 4 }] },
  { semester: 2, code: "SYS122", name: "Systèmes & données", category: "Fondamentale", courses: [{ code: "SYS1221", name: "Administration Linux", credits: 3 }, { code: "BDD1222", name: "Bases de données avancées", credits: 3 }] },
  { semester: 2, code: "IA123", name: "Intelligence artificielle", category: "Optionnelle", courses: [{ code: "IA1231", name: "Fondements de l’IA", credits: 4 }, { code: "IA1232", name: "Apprentissage automatique", credits: 4 }] },
  { semester: 2, code: "PRO124", name: "Projet & professionnalisation", category: "Transversale", courses: [{ code: "PRO1241", name: "Projet tutoré", credits: 5 }, { code: "ANG1242", name: "Anglais technique II", credits: 3 }] },
];

const students: Student[] = [
  { id: "001", name: "Kabamba Mukadi Jonathan", notes: [14.5,12,13,15,11.5,14,12,13,16,14.5,12,13,15,14,16.5,15], credits: 60, decision: "ADMIS", mention: "Bien" },
  { id: "002", name: "Lumbala Tshilumba Sarah", notes: [10,7.5,11,10.5,9.5,10,11,10,10,10,8,9,12,12,11,13], credits: 52, decision: "ADMIS AVEC DETTE", mention: "Satisfaction", debt: "INF111" },
  { id: "003", name: "Mbuyi Kalala Esther", notes: [16,17,14,15,13,16,15,14,17,16,15,14,16,17,18,16], credits: 60, decision: "ADMIS", mention: "Distinction" },
  { id: "004", name: "Ilunga Mutombo Grâce", notes: [9,8,11,12,10,9,8,10,12,11,9,8,10,11,12,10], credits: 46, decision: "AJOURNÉ", mention: "—", debt: "INF111, SYS122" },
  { id: "005", name: "Kanku Nsimba Patrick", notes: [12,13,10,11,14,12,13,11,14,13,12,14,11,13,15,14], credits: 60, decision: "ADMIS", mention: "Assez bien" },
  { id: "006", name: "Mafuta Lukusa Diane", notes: [15,14,16,13,12,15,14,16,13,15,14,16,15,13,14,17], credits: 60, decision: "ADMIS", mention: "Bien" },
];

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

function Index() {
  const [view, setView] = useState<View>("annual");
  const [primary, setPrimary] = useState("#0f172a");
  const [accent, setAccent] = useState("#facc15");
  const [compact, setCompact] = useState(true);
  const visibleUnits = useMemo(() => units.filter((unit) => view === "annual" || unit.semester === (view === "s1" ? 1 : 2)), [view]);
  const visibleCourseIndexes = visibleUnits.flatMap((unit) => unit.courses.map((course) => units.flatMap((item) => item.courses).findIndex((item) => item.code === course.code)));
  const totalCredits = visibleUnits.reduce((sum, unit) => sum + unit.courses.reduce((n, course) => n + course.credits, 0), 0);
  const theme = { "--academic": primary, "--highlight": accent } as CSSProperties;

  return (
    <main style={theme} className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="no-print mx-auto mb-5 flex max-w-[1800px] flex-col gap-3 border-b-2 border-academic pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-muted-foreground">Département d’Informatique de Gestion et des Affaires</p>
          <h1 className="mt-1 text-2xl font-extrabold uppercase text-academic">Délibération académique LMD</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {([['annual','Année complète'],['s1','Semestre 1'],['s2','Semestre 2']] as [View,string][]).map(([value,label]) => (
            <Button key={value} size="sm" variant={view === value ? "default" : "outline"} onClick={() => setView(value)}>{label}</Button>
          ))}
          <Sheet>
            <SheetTrigger asChild><Button size="sm" variant="outline"><SlidersHorizontal /> Paramètres</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Personnaliser la grille</SheetTitle><SheetDescription>Ces choix sont conservés lors de l’impression en PDF.</SheetDescription></SheetHeader>
              <div className="mt-8 space-y-7">
                <ColorField label="Couleur principale" value={primary} onChange={setPrimary} />
                <ColorField label="Couleur d’accent" value={accent} onChange={setAccent} />
                <label className="flex items-center justify-between gap-4 text-sm font-medium"><span>Affichage compact</span><input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} className="size-4 accent-academic" /></label>
                <Button variant="outline" className="w-full" onClick={() => { setPrimary("#0f172a"); setAccent("#facc15"); setCompact(true); }}><RotateCcw /> Réinitialiser</Button>
              </div>
            </SheetContent>
          </Sheet>
          <Button size="sm" onClick={() => window.print()}><Download /> Télécharger en PDF</Button>
        </div>
      </div>

      <article className="print-sheet mx-auto max-w-[1800px] overflow-hidden border border-grid bg-card shadow-xl">
        <header className="grid grid-cols-1 gap-5 border-b border-grid p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div><h2 className="text-xl font-extrabold uppercase text-academic">Université Révérend Kim</h2><p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">Faculté des sciences informatiques · Campus de Ndjili</p></div>
          <div className="md:text-right"><p className="text-base font-bold">Grille de délibération annuelle</p><p className="text-xs uppercase text-muted-foreground">Année académique 2025–2026 · L3 LMD Réseau · Session ordinaire</p></div>
        </header>
        <section className="grid grid-cols-2 border-b border-grid text-[10px] sm:grid-cols-4 lg:grid-cols-6">
          {[['Mention','Informatique'],['Parcours','Réseaux & systèmes'],['Promotion','L3'],['Crédits visés',`${totalCredits} crédits`],['Effectif',`${students.length} étudiants`],['État','Prête pour jury']].map(([label,value]) => <div key={label} className="border-r border-grid px-4 py-3"><span className="block uppercase text-muted-foreground">{label}</span><strong>{value}</strong></div>)}
        </section>

        <div className="print-scroll overflow-x-auto">
          <table className={`w-full border-collapse ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
            <thead>
              <tr className="bg-academic text-academic-foreground">
                <th rowSpan={4} className="w-10 border border-grid p-2">N°</th><th rowSpan={4} className="min-w-56 border border-grid p-2 text-left">NOM, POSTNOM & PRÉNOM</th>
                {view === 'annual' && <><th colSpan={8} className="border border-grid p-2 uppercase">Semestre 1 · 30 crédits</th><th colSpan={8} className="border border-grid p-2 uppercase">Semestre 2 · 30 crédits</th></>}
                {view !== 'annual' && <th colSpan={8} className="border border-grid p-2 uppercase">{view === 's1' ? 'Semestre 1' : 'Semestre 2'} · 30 crédits</th>}
                <th colSpan={view === 'annual' ? 6 : 4} className="border border-grid p-2 uppercase">Synthèse {view === 'annual' ? 'annuelle' : 'semestrielle'}</th>
              </tr>
              <tr className="bg-muted">
                {visibleUnits.map((unit) => <th key={unit.code} colSpan={2} className="border border-grid px-2 py-1"><span className="font-extrabold">{unit.code}</span><span className="block text-[8px] font-medium text-muted-foreground">{unit.name}</span></th>)}
                <th rowSpan={3} className="border border-grid px-2">Moy.</th><th rowSpan={3} className="border border-grid px-2">Crédits</th>
                {view === 'annual' && <><th rowSpan={3} className="border border-grid px-2">S1</th><th rowSpan={3} className="border border-grid px-2">S2</th></>}
                <th rowSpan={3} className="border border-grid px-2">Décision</th><th rowSpan={3} className="border border-grid px-2">Mention / dette</th>
              </tr>
              <tr>
                {visibleUnits.flatMap((unit) => unit.courses).map((course) => <th key={course.code} className="h-36 w-12 border border-grid bg-highlight/15 p-1 align-bottom"><span className="inline-block [writing-mode:vertical-rl] rotate-180 whitespace-nowrap font-bold">{course.name}</span></th>)}
              </tr>
              <tr className="bg-muted/50 text-[8px] text-muted-foreground">{visibleUnits.flatMap((unit) => unit.courses).map((course) => <th key={course.code} className="border border-grid py-1">{course.credits} Cr</th>)}</tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const shownNotes = visibleCourseIndexes.map((index) => student.notes[index]);
                const s1 = average(student.notes.slice(0,8)); const s2 = average(student.notes.slice(8)); const mean = average(shownNotes);
                return <tr key={student.id} className="transition-colors hover:bg-highlight/10">
                  <td className="border border-grid p-2 text-center font-mono font-bold">{student.id}</td><td className="border border-grid px-3 py-2 font-bold uppercase">{student.name}</td>
                  {shownNotes.map((note,index) => <td key={`${student.id}-${visibleCourseIndexes[index]}`} className={`border border-grid p-2 text-center font-mono ${note < 10 ? 'font-bold text-warning' : ''}`}>{note.toFixed(1)}</td>)}
                  <td className="border border-grid bg-muted/50 p-2 text-center font-extrabold">{mean.toFixed(2)}</td><td className="border border-grid p-2 text-center font-bold">{view === 'annual' ? student.credits : Math.min(30, Math.round(student.credits / 2))}/{totalCredits}</td>
                  {view === 'annual' && <><td className="border border-grid p-2 text-center">{s1.toFixed(2)}</td><td className="border border-grid p-2 text-center">{s2.toFixed(2)}</td></>}
                  <td className={`border border-grid p-2 text-center font-extrabold ${student.decision === 'AJOURNÉ' ? 'text-warning' : 'text-success'}`}>{student.decision}</td><td className="border border-grid px-2 text-center">{student.debt ? `Dette : ${student.debt}` : student.mention}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>

        <section className="grid border-t border-grid md:grid-cols-[1.2fr_1fr]">
          <div className="grid grid-cols-2 gap-px bg-grid text-xs sm:grid-cols-4">
            {[['Moyenne promotion','12,31 / 20'],['Crédits validés','338 / 360'],['Admis','5 sur 6'],['Taux de réussite','83,3 %']].map(([label,value]) => <div key={label} className="bg-card p-4"><span className="block text-[9px] font-bold uppercase text-muted-foreground">{label}</span><strong className="mt-1 block text-lg text-academic">{value}</strong></div>)}
          </div>
          <div className="p-4 text-[10px]"><strong className="uppercase">Légende</strong><p className="mt-2 text-muted-foreground">UE validée : moyenne ≥ 10/20 · Compensation : note plancher ≥ 8/20 · Dette : UE non acquise · ABS : absent · DEF : défaillant.</p></div>
        </section>
        <footer className="grid gap-8 border-t border-grid p-7 text-center text-[10px] sm:grid-cols-3">
          {[['Membre du jury','SCHICO ZANDI'],['Président du jury','Prof. KAPIAMBA Joël'],['Secrétaire du jury','INYEI Didider']].map(([role,name],index) => <div key={role}><p className="font-bold uppercase">{role}</p>{index === 1 && <p className="mt-2 text-muted-foreground">Fait à Kinshasa, le 25 septembre 2026</p>}<div className="mx-auto mt-10 w-40 border-b border-dashed border-foreground"/><p className="mt-2 font-semibold">{name}</p></div>)}
        </footer>
      </article>
      <p className="no-print mx-auto mt-4 max-w-[1800px] text-center text-[10px] text-muted-foreground">Exemple démonstratif — les noms, notes et décisions présentés sont fictifs.</p>
    </main>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex items-center justify-between gap-4 text-sm font-medium"><span className="flex items-center gap-2"><Palette className="size-4" />{label}</span><span className="flex items-center gap-2 font-mono text-xs text-muted-foreground"><input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 cursor-pointer rounded border border-input bg-background p-1" />{value}</span></label>;
}
