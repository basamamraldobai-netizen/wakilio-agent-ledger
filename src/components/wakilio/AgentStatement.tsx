import { Button } from "@/components/ui/button";
import { ArrowRight, Printer, Wallet, type LucideIcon } from "lucide-react";
import type { AgentSummary } from "@/lib/wakilio/engine";

export const fmt = (n: number) => n.toLocaleString("en-US");

export function Stat({ label, value, tone = "text-foreground", icon: Icon = Wallet }: { label: string; value: string; tone?: string; icon?: LucideIcon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon className="h-5 w-5" /></span></div>
      <div className={`num mt-5 text-[27px] font-extrabold ${tone}`}>{value}</div>
    </div>
  );
}

export function AgentStatement({ agent, onBack, onUnmerge }: { agent: AgentSummary; onBack: () => void; onUnmerge: (alias: string) => void }) {
  let running = 0;
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
          <Stat label="المتبقي" value={fmt(agent.remaining)} tone="text-destructive" />
        </div>
      </div>
      <div className="table-wrap">
        <table className="wakilio-table statement-table">
          <thead className="bg-secondary text-xs text-muted-foreground">
            <tr>
              {["#", "اسم الجواز", "المهنة", "رقم السند", "التاريخ", "الحالة / الجهة", "الواصل", "المتبقي", "الرصيد التراكمي", "ملاحظات"].map((h) => (
                <th key={h} className="whitespace-nowrap p-3 text-right font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agent.records.map((r, i) => {
              running += r.remaining;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="num p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-medium">{r.passport}</td>
                  <td className="p-3 text-muted-foreground">{r.profession}</td>
                  <td className="num p-3">{r.receipt}</td>
                  <td className="num whitespace-nowrap p-3">{r.date}</td>
                  <td className="p-3 text-muted-foreground">{[r.status, r.destination].filter(Boolean).join(" · ")}</td>
                  <td className="num p-3 text-primary">{fmt(r.paid)}</td>
                  <td className="num p-3 text-destructive">{fmt(r.remaining)}</td>
                  <td className="num p-3 font-semibold">{fmt(running)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{r.notes}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-primary/40 bg-secondary font-bold">
            <tr>
              <td colSpan={6} className="p-3">الإجمالي ({fmt(agent.passports)} جواز)</td>
              <td className="num p-3 text-primary">{fmt(agent.paid)}</td>
              <td className="num p-3 text-destructive">{fmt(agent.remaining)}</td>
              <td className="num p-3">{fmt(agent.remaining)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
