import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Trash2, Users } from "lucide-react";
import { summarize } from "@/lib/wakilio/engine";
import { useWakilioStore } from "@/components/wakilio/useWakilioStore";
import { ImportPanel } from "@/components/wakilio/ImportPanel";
import { MergeSuggestions } from "@/components/wakilio/MergeSuggestions";
import { AgentStatement, Stat, fmt } from "@/components/wakilio/AgentStatement";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WAKILIO | استيراد وتحليل حسابات الوكلاء" },
      { name: "description", content: "استورد ملفات الإكسل، طابق أسماء الوكلاء، واعرض كشف حساب وملخصاً مالياً لكل وكيل." },
      { property: "og:title", content: "WAKILIO | استيراد وتحليل حسابات الوكلاء" },
      { property: "og:description", content: "محرك استيراد ذكي لملفات الوكلاء مع مطابقة الأسماء وكشوف الحساب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [state, setState] = useWakilioStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const agents = useMemo(() => summarize(state.records, state.aliases), [state.records, state.aliases]);
  const totals = useMemo(
    () => agents.reduce((t, a) => ({ p: t.p + a.passports, paid: t.paid + a.paid, rem: t.rem + a.remaining }), { p: 0, paid: 0, rem: 0 }),
    [agents],
  );
  const files = [...new Set(state.records.map((r) => r.file))];
  const current = agents.find((a) => a.name === selected);
  const shown = agents.filter((a) => a.name.includes(q.trim()));

  return (
    <div className="mx-auto w-[min(1200px,calc(100%-32px))] pb-20">
      <nav className="flex h-20 items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl font-num text-lg font-extrabold text-primary-foreground shadow-[var(--glow)]" style={{ backgroundImage: "var(--gradient-primary)" }}>W</div>
          <div className="leading-tight">
            <div className="font-display text-xl font-extrabold">وكيليو</div>
            <div className="num text-[9px] font-semibold tracking-[1.3px] opacity-70" dir="ltr">WAKILIO</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" /> محرك الاستيراد والمطابقة
        </div>
      </nav>

      {current ? (
        <div className="mt-8">
          <AgentStatement
            agent={current}
            onBack={() => setSelected(null)}
            onUnmerge={(alias) => setState((s) => { const a = { ...s.aliases }; delete a[alias]; return { ...s, aliases: a }; })}
          />
        </div>
      ) : (
        <>
          <header className="py-10">
            <h1 className="font-display text-3xl font-extrabold leading-snug md:text-5xl">
              استورد، طابق، <span className="text-primary">وحلّل</span> حسابات وكلائك
            </h1>
            <p className="mt-3 max-w-2xl leading-loose text-muted-foreground">
              ارفع أي ملف إكسل، وحدّد الأعمدة بمرونة، وسيقوم وكيليو بتجميع الحركات لكل وكيل مع الواصل والمتبقي.
            </p>
          </header>

          <ImportPanel
            onImport={(recs, file) => {
              setState((s) => ({ ...s, records: [...s.records.filter((r) => r.file !== file || !recs.some((x) => x.sheet === r.sheet)), ...recs] }));
              toast.success(`تم استيراد ${recs.length} حركة من ${file}`);
            }}
          />

          {agents.length > 0 && (
            <>
              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="عدد الوكلاء" value={fmt(agents.length)} />
                <Stat label="إجمالي الجوازات" value={fmt(totals.p)} tone="text-accent" />
                <Stat label="إجمالي الواصل" value={fmt(totals.paid)} tone="text-primary" />
                <Stat label="إجمالي المتبقي" value={fmt(totals.rem)} tone="text-destructive" />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-display font-bold">
                      <Users className="h-5 w-5 text-primary" /> الوكلاء
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-input bg-background px-3 py-1.5">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث عن وكيل" className="w-40 bg-transparent text-sm outline-none" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground">
                        <tr>
                          {["الوكيل", "الجوازات", "الواصل", "المتبقي", "نسبة السداد"].map((h) => (
                            <th key={h} className="p-2.5 text-right font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((a) => {
                          const pct = a.total ? Math.round((a.paid / a.total) * 100) : 100;
                          return (
                            <tr key={a.name} onClick={() => setSelected(a.name)} className="cursor-pointer border-t border-border hover:bg-secondary/50">
                              <td className="p-2.5 font-semibold">
                                {a.name}
                                {a.aliases.length > 0 && <span className="mr-2 rounded-full bg-chart-3/15 px-2 text-[10px] text-chart-3">+{a.aliases.length} مدمج</span>}
                              </td>
                              <td className="num p-2.5">{fmt(a.passports)}</td>
                              <td className="num p-2.5 text-primary">{fmt(a.paid)}</td>
                              <td className="num p-2.5 text-destructive">{fmt(a.remaining)}</td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="num text-xs text-muted-foreground">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-5">
                  <MergeSuggestions
                    agents={agents}
                    dismissed={state.dismissed}
                    onMerge={(from, into) => {
                      setState((s) => ({ ...s, aliases: { ...Object.fromEntries(Object.entries(s.aliases).map(([k, v]) => [k, v === from ? into : v])), [from]: into } }));
                      toast.success(`تم دمج «${from}» في «${into}»`);
                    }}
                    onDismiss={(k) => setState((s) => ({ ...s, dismissed: [...s.dismissed, k] }))}
                  />
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <div className="mb-3 font-display font-bold">الملفات المستوردة</div>
                    {files.map((f) => (
                      <div key={f} className="flex items-center justify-between border-t border-border py-2 text-sm first:border-0">
                        <span className="truncate">{f}</span>
                        <button aria-label="حذف" onClick={() => setState((s) => ({ ...s, records: s.records.filter((r) => r.file !== f) }))} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
