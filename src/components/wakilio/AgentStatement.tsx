import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, ChevronLeft, Printer, Search, Wallet, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AgentSummary, PassportAccount } from "@/lib/wakilio/engine";

export const fmt = (n: number) => n.toLocaleString("en-US");

export function Stat({ label, value, tone = "text-foreground", icon: Icon = Wallet }: { label: string; value: string; tone?: string; icon?: LucideIcon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon className="h-5 w-5" /></span></div>
      <div className={`num mt-5 text-[27px] font-extrabold ${tone}`}>{value}</div>
    </div>
  );
}

type FilterId = "all" | "single" | "multi" | "over" | "owing";
const FILTERS: { id: FilterId; label: string; test: (a: PassportAccount) => boolean }[] = [
  { id: "all", label: "الكل", test: () => true },
  { id: "single", label: "دفعة واحدة", test: (a) => a.records.length === 1 },
  { id: "multi", label: "دفعات متعددة", test: (a) => a.records.length > 1 },
  { id: "over", label: "مدفوع بزيادة (فائض)", test: (a) => a.remaining < 0 },
  { id: "owing", label: "متبقي عليه", test: (a) => a.remaining > 0 },
];

export function AgentStatement({ agent, onBack, onUnmerge }: { agent: AgentSummary; onBack: () => void; onUnmerge: (alias: string) => void }) {
  const [open, setOpen] = useState<PassportAccount | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const matches = (a: PassportAccount) => !term || a.name.toLowerCase().includes(term) || a.records.some((r) => [r.passport, r.receipt, r.profession, r.notes, r.status, r.destination].some((v) => String(v ?? "").toLowerCase().includes(term)));
  const rows = agent.accounts.filter(FILTERS.find((f) => f.id === filter)!.test).filter(matches);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowRight className="h-4 w-4" /> كل الوكلاء
        </Button>
        <Button variant="ghost" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-[11px] border border-border px-4 py-2 text-sm hover:border-primary/50">
          <Printer className="h-4 w-4" /> طباعة الكشف
        </Button>
      </div>
      <div className="border-b border-border pb-6">
        <div className="text-xs font-bold text-primary">كشف حساب وكيل</div>
        <h2 className="font-display mt-1 text-2xl font-bold">{agent.name}</h2>
        {agent.aliases.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground">أسماء مدمجة:</span>
            {agent.aliases.map((a) => (
              <Button variant="ghost" key={a} onClick={() => onUnmerge(a)} title="فك الدمج" className="rounded-[11px] bg-secondary px-2.5 py-0.5 hover:text-destructive">
                {a} ×
              </Button>
            ))}
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="إجمالي الجوازات" value={fmt(agent.passports)} />
          <Stat label="إجمالي المستحق" value={fmt(agent.total)} tone="text-accent" />
          <Stat label="الواصل" value={fmt(agent.paid)} tone="text-primary" />
          <Stat label="المتبقي الفعلي" value={fmt(agent.remaining)} tone="text-destructive" />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-[11px] border border-input bg-card px-3 py-2.5 print:hidden">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في الجوازات" placeholder="ابحث بالاسم، رقم السند، المهنة، الملاحظات..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        {q && <span className="num text-xs text-muted-foreground">{rows.length} نتيجة</span>}
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        {FILTERS.map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? "default" : "outline"} onClick={() => setFilter(f.id)} className="rounded-full">
            {f.label} <span className="num mr-1 opacity-70">{agent.accounts.filter(f.test).length}</span>
          </Button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="wakilio-table statement-table">
          <thead className="bg-secondary text-xs text-muted-foreground">
            <tr>
              {["#", "اسم الجواز", "المهنة", "الواصل", "الرصيد الفعلي", "الحالة / الجهة", ""].map((h, i) => (
                <th key={h || i} className={`whitespace-nowrap p-3 text-right font-semibold ${i === 5 ? "w-full" : "w-px"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((acc, i) => {
              const multi = acc.records.length > 1;
              const last = acc.records[acc.records.length - 1]!;
              return (
                <tr key={acc.key} onClick={() => setOpen(acc)} className="group cursor-pointer border-t border-border transition-colors hover:bg-secondary/60">
                  <td className="num p-3 text-muted-foreground">{i + 1}</td>
                  <td className="whitespace-nowrap p-3 font-medium">
                    <span className="group-hover:text-primary">{acc.name}</span>
                    <span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] font-semibold print:hidden ${multi ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>{multi ? `${acc.records.length} دفعات` : "دفعة واحدة"}</span>
                    {acc.remaining < 0 && <span className="mr-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary print:hidden">فائض: <span className="num">{fmt(-acc.remaining)}</span></span>}
                  </td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{acc.records[0]!.profession}</td>
                  <td className="num p-3 text-primary">{fmt(acc.paid)}</td>
                  <td className="num whitespace-nowrap p-3 font-semibold text-destructive">
                    {fmt(acc.remaining)}
                    {multi && acc.diff !== 0 && <span title={`فارق تدقيق ${fmt(acc.diff)}`} className="mr-1.5 inline-flex items-center rounded-full bg-chart-3/15 px-1.5 py-0.5 align-middle text-chart-3"><AlertTriangle className="h-3 w-3" /></span>}
                  </td>
                  <td className="p-3 text-muted-foreground">{[last.status, last.destination].filter(Boolean).join(" · ")}</td>
                  <td className="p-3 print:hidden"><Button size="icon" variant="ghost" aria-label={`تفاصيل ${acc.name}`} title="التفاصيل" onClick={(e) => { e.stopPropagation(); setOpen(acc); }} className="h-8 w-8 text-muted-foreground group-hover:text-primary"><ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /></Button></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-primary/40 bg-secondary font-bold">
            <tr>
              <td colSpan={3} className="p-3">الإجمالي ({fmt(agent.passports)} جواز)</td>
              <td className="num p-3 text-primary">{fmt(agent.paid)}</td>
              <td className="num p-3 text-destructive">{fmt(agent.remaining)}</td>
              <td />
              <td className="print:hidden" />
            </tr>
          </tfoot>
        </table>
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md" dir="rtl">
          {open && (() => {
            let paidSoFar = 0;
            return (
              <>
                <SheetHeader className="text-right">
                  <SheetTitle className="font-display">{open.name}</SheetTitle>
                  <SheetDescription>سجل الدفعات ({open.records.length}) · {open.records[0]!.profession}</SheetDescription>
                </SheetHeader>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-[11px] bg-secondary p-3"><div className="text-muted-foreground">المستحق</div><div className="num mt-1 font-bold">{fmt(open.due)}</div></div>
                  <div className="rounded-[11px] bg-secondary p-3"><div className="text-muted-foreground">الواصل</div><div className="num mt-1 font-bold text-primary">{fmt(open.paid)}</div></div>
                  <div className="rounded-[11px] bg-secondary p-3"><div className="text-muted-foreground">الرصيد</div><div className="num mt-1 font-bold text-destructive">{fmt(open.remaining)}</div></div>
                </div>
                <ol className="mt-5 space-y-3">
                  {open.records.map((r, j) => {
                    paidSoFar += r.paid;
                    return (
                      <li key={r.id} className="rounded-[12px] border border-border p-3 text-sm">
                        <div className="flex items-center justify-between"><span className="font-bold">دفعة {j + 1}</span><span className="num text-xs text-muted-foreground">{r.date || "—"}</span></div>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          <span>رقم السند: <span className="num text-foreground">{r.receipt || "—"}</span></span>
                          <span>المبلغ: <span className="num font-semibold text-primary">{fmt(r.paid)}</span></span>
                          <span>الرصيد التراكمي: <span className="num font-semibold text-destructive">{fmt(open.due - paidSoFar)}</span></span>
                          <span>المسجل بالملف: <span className="num">{fmt(r.remaining)}</span></span>
                        </div>
                        {(r.status || r.destination || r.notes) && <div className="mt-2 text-xs text-muted-foreground">{[r.status, r.destination, r.notes].filter(Boolean).join(" · ")}</div>}
                      </li>
                    );
                  })}
                </ol>
                {open.diff !== 0 && (
                  <div className="mt-5 rounded-[12px] border border-chart-3/40 bg-chart-3/10 p-3 text-xs">
                    <div className="mb-1 flex items-center gap-1.5 font-bold text-chart-3"><AlertTriangle className="h-3.5 w-3.5" /> تدقيق مالي</div>
                    المستحق <span className="num">{fmt(open.due)}</span> − الواصل <span className="num">{fmt(open.paid)}</span> = <span className="num font-semibold">{fmt(open.remaining)}</span>، والمسجل في الملف <span className="num">{fmt(open.recordedRemaining)}</span> (فارق <span className="num font-semibold">{fmt(open.diff)}</span>).
                  </div>
                )}
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
