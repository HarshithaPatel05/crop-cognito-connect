import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { LOANS, GOVT_SCHEMES, TRANSACTIONS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const KYC_FIELDS = [
  { label: "Aadhaar Card", key: "aadhaar", status: "verified", icon: "🪪" },
  { label: "Farmer ID / APAR", key: "farmerId", status: "verified", icon: "📋" },
  { label: "Bank Account Details", key: "bank", status: "pending", icon: "🏦" },
  { label: "Land Records", key: "land", status: "not_uploaded", icon: "📜" },
];

const ESCROW_STEPS = [
  { step: 1, label: "Buyer places order", done: true },
  { step: 2, label: "Payment locked in escrow", done: true },
  { step: 3, label: "Farmer ships crops", done: true },
  { step: 4, label: "Buyer confirms delivery", done: false },
  { step: 5, label: "Payment auto-released", done: false },
];

export default function Finance() {
  const { toast } = useToast();
  const [loanAmount, setLoanAmount] = useState("80000");
  const eligibilityScore = 87;

  return (
    <AppLayout title="Finance & Loans" subtitle="Loan eligibility · KYC · Government schemes · Escrow payments">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Loan Eligibility" value="87/100" subtext="Excellent score" icon="⭐" highlight />
          <StatCard title="Max Loan Amount" value="₹1.2 L" subtext="At 4% interest" icon="💰" />
          <StatCard title="Active Loans" value="1" subtext="₹80,000 approved" icon="📋" />
          <StatCard title="KYC Status" value="2/4" subtext="Verified documents" icon="🪪" />
        </div>

        <Tabs defaultValue="loan">
          <TabsList>
            <TabsTrigger value="loan">💰 Apply for Loan</TabsTrigger>
            <TabsTrigger value="kyc">🪪 KYC Verification</TabsTrigger>
            <TabsTrigger value="schemes">🏛️ Govt Schemes</TabsTrigger>
            <TabsTrigger value="escrow">🔒 Escrow Payments</TabsTrigger>
            <TabsTrigger value="history">📊 Loan History</TabsTrigger>
          </TabsList>

          <TabsContent value="loan" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score gauge */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Loan Eligibility Score</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="38" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                        <circle cx="48" cy="48" r="38" fill="none" stroke="hsl(123,45%,34%)" strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={`${(eligibilityScore / 100) * 239} 239`} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{eligibilityScore}</span>
                      </div>
                    </div>
                    <div>
                      <Badge className="bg-primary mb-1">Excellent</Badge>
                      <p className="text-xs text-muted-foreground">Your score qualifies you for premium loan products at lowest interest rates.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Pre-booking Orders", pct: 92 },
                      { label: "Predicted Yield", pct: 85 },
                      { label: "Farmer Rating", pct: 94 },
                      { label: "Repayment History", pct: 80 },
                    ].map((f) => (
                      <div key={f.label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">{f.label}</span>
                          <span className="font-medium">{f.pct}%</span>
                        </div>
                        <Progress value={f.pct} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Apply form */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Apply for Pre-Booking Loan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Loan Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Crop Loan", "Kisan Credit Card", "Farm Equipment", "Working Capital"].map((t) => (
                        <Button key={t} variant="outline" size="sm" className="text-xs border-border hover:border-primary hover:bg-agro-green-light/20">{t}</Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Loan Amount (₹)</Label>
                    <Input value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} type="number" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Collateral</Label>
                    <Input defaultValue="Pre-orders from BigMart + Predicted Yield 8.75T" readOnly className="text-xs bg-muted" />
                  </div>
                  <div className="bg-agro-green-light/30 rounded-lg p-3 text-xs border border-primary/20">
                    <div className="font-medium text-primary mb-1">💡 AI-Based Approval</div>
                    <div className="space-y-0.5 text-muted-foreground">
                      <div className="flex justify-between"><span>Interest Rate:</span><span className="font-medium text-foreground">4% p.a.</span></div>
                      <div className="flex justify-between"><span>Max Eligibility:</span><span className="font-medium text-foreground">₹1,20,000</span></div>
                      <div className="flex justify-between"><span>Repayment Period:</span><span className="font-medium text-foreground">12 months</span></div>
                    </div>
                  </div>
                  <Button className="w-full bg-primary" onClick={() => toast({ title: "Loan application submitted! ✅", description: "AI review in progress. Approval within 24 hours." })}>
                    Submit Application
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kyc" className="mt-4">
            <Card className="max-w-lg">
              <CardHeader><CardTitle className="text-sm">KYC Document Verification</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {KYC_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <span className="text-xl">{field.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{field.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {field.status === "verified" ? "Verified and active" : field.status === "pending" ? "Under review" : "Not yet uploaded"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${field.status === "verified" ? "bg-agro-green-light text-primary border-primary/30" : field.status === "pending" ? "bg-accent/20 text-accent-foreground border-accent/30" : "bg-muted text-muted-foreground"}`}>
                        {field.status === "verified" ? "✅ Verified" : field.status === "pending" ? "⏳ Pending" : "⬆️ Upload"}
                      </Badge>
                      {field.status !== "verified" && (
                        <Button size="sm" variant="outline" className="text-xs h-7 border-border" onClick={() => toast({ title: "Upload initiated" })}>
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schemes" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOVT_SCHEMES.map((s) => (
                <Card key={s.name} className={`border-2 ${s.eligible ? "border-primary/30" : "border-border"}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="text-2xl">{s.icon}</div>
                      {s.eligible ? (
                        <Badge className="bg-primary text-xs">✅ Eligible</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Not Eligible</Badge>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{s.name}</div>
                      <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                    </div>
                    <Button size="sm" variant={s.eligible ? "default" : "outline"} className={`w-full text-xs ${s.eligible ? "bg-primary" : ""}`} disabled={!s.eligible} onClick={() => toast({ title: `Applying for ${s.name}` })}>
                      {s.eligible ? "Apply Now" : "Not Eligible"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="escrow" className="mt-4 space-y-4">
            {TRANSACTIONS.map((tx) => {
              const currentStep = tx.status === "pending" ? 1 : tx.status === "in_escrow" ? 2 : tx.status === "shipped" ? 3 : 5;
              return (
                <Card key={tx.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center mb-4">
                      <span className="font-mono text-xs text-muted-foreground">{tx.id}</span>
                      <span className="font-medium text-sm">{tx.buyer} ← {tx.farmer}</span>
                      <span className="text-sm text-muted-foreground">{tx.crop}</span>
                      <span className="text-primary font-bold ml-auto">₹{tx.amount.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <div className="flex justify-between mb-2">
                        {ESCROW_STEPS.map((step) => (
                          <div key={step.step} className="flex flex-col items-center text-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${step.step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              {step.step <= currentStep ? "✓" : step.step}
                            </div>
                            <span className="text-[9px] text-muted-foreground leading-tight hidden sm:block">{step.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10">
                        <div className="h-0.5 bg-primary transition-all duration-700" style={{ width: `${((currentStep - 1) / (ESCROW_STEPS.length - 1)) * 100}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["ID", "Farmer", "Amount", "Type", "Collateral", "Status", "Score"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {LOANS.map((l) => (
                        <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs">LN-{String(l.id).padStart(4,"0")}</td>
                          <td className="px-4 py-3">{l.farmer}</td>
                          <td className="px-4 py-3 font-medium">₹{l.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-muted-foreground">{l.type}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{l.collateral}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${l.status === "approved" ? "bg-agro-green-light text-primary border-primary/30" : l.status === "pending" ? "bg-muted text-muted-foreground" : "bg-accent/20 text-accent-foreground border-accent/30"}`}>
                              {l.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium text-primary">{l.score}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
