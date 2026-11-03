import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import logo from "@/assets/wakilio-logo.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "WAKILIO | تسجيل الدخول" }, { name: "description", content: "سجّل الدخول إلى وكيليو للوصول إلى حسابات الوكلاء المحفوظة سحابياً." },
    { property: "og:title", content: "WAKILIO | تسجيل الدخول" }, { property: "og:description", content: "الدخول إلى مساحة عمل وكيليو." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("تم إنشاء الحساب، تحقق من بريدك الإلكتروني لتأكيده");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally { setBusy(false); }
  }

  async function social(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) return toast.error("تعذر تسجيل الدخول");
    if (r.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="summary-panel w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={logo.url} alt="شعار وكيليو" className="h-12 w-12" />
          <h1 className="font-display text-xl font-extrabold">{mode === "in" ? "تسجيل الدخول" : "إنشاء حساب"}</h1>
          <p className="text-xs text-muted-foreground">بياناتك محفوظة سحابياً ومتاحة من أي جهاز</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" aria-label="البريد الإلكتروني" className="w-full rounded-[11px] border border-input bg-card px-3 py-2.5 text-sm outline-none" dir="ltr" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" aria-label="كلمة المرور" className="w-full rounded-[11px] border border-input bg-card px-3 py-2.5 text-sm outline-none" dir="ltr" />
          <Button type="submit" variant="wakilio" className="w-full" disabled={busy}>{mode === "in" ? "دخول" : "إنشاء الحساب"}</Button>
        </form>
        <div className="space-y-2">
          <Button type="button" variant="outline" className="w-full" onClick={() => social("google")}>المتابعة باستخدام Google</Button>
          <button type="button" className="lovable-auth-button w-full" onClick={() => social("lovable")}>Continue with Lovable</button>
        </div>
        <button type="button" className="w-full text-center text-xs text-muted-foreground hover:text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    </div>
  );
}
