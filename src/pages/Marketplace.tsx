import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CertificationBadge } from "@/components/shared/CertificationBadge";
import { StarRating } from "@/components/shared/StarRating";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { MARKETPLACE_LISTINGS, FARMERS, CROPS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type CertType = "organic" | "gradeA" | "govt" | null;

const PRICE_SPARKLINES: Record<string, { day: string; price: number }[]> = {
  Tomato: [{ day: "1", price: 22 }, { day: "2", price: 25 }, { day: "3", price: 24 }, { day: "4", price: 28 }, { day: "5", price: 32 }],
  Onion: [{ day: "1", price: 25 }, { day: "2", price: 23 }, { day: "3", price: 22 }, { day: "4", price: 20 }, { day: "5", price: 19 }],
  Chilli: [{ day: "1", price: 80 }, { day: "2", price: 88 }, { day: "3", price: 92 }, { day: "4", price: 95 }, { day: "5", price: 100 }],
};

const DRY_LISTINGS = [
  { crop: "Dried Red Chilli", farmer: "Prakash Rao", location: "Nizamabad", qty: "800 kg", price: "₹95/kg", shelf: "12 months", certified: "govt" as CertType },
  { crop: "Turmeric Powder", farmer: "Meena Bai", location: "Adilabad", qty: "1200 kg", price: "₹120/kg", shelf: "18 months", certified: "organic" as CertType },
  { crop: "Toor Dal", farmer: "Vijay Singh", location: "Khammam", qty: "500 kg", price: "₹85/kg", shelf: "9 months", certified: null },
  { crop: "Bajra / Millet", farmer: "Ramesh Kumar", location: "Warangal", qty: "2500 kg", price: "₹55/kg", shelf: "6 months", certified: "gradeA" as CertType },
  { crop: "Sorghum (Jowar)", farmer: "Sunita Devi", location: "Karimnagar", qty: "1800 kg", price: "₹48/kg", shelf: "6 months", certified: null },
  { crop: "Cumin Seeds", farmer: "Prakash Rao", location: "Nizamabad", qty: "300 kg", price: "₹210/kg", shelf: "24 months", certified: "gradeA" as CertType },
];

export default function Marketplace() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCrop, setFilterCrop] = useState("all");
  const [selectedListing, setSelectedListing] = useState<typeof MARKETPLACE_LISTINGS[0] | null>(null);
  const [bookQty, setBookQty] = useState("500");

  const filtered = MARKETPLACE_LISTINGS.filter((l) => {
    if (filterCrop !== "all" && l.crop.toLowerCase() !== filterCrop) return false;
    if (search && !l.crop.toLowerCase().includes(search.toLowerCase()) && !l.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const farmer = (id: number) => FARMERS.find((f) => f.id === id);

  return (
    <AppLayout title="Buyer Marketplace" subtitle="Browse fresh harvests · Pre-book crops · Secure escrow payments">
      <div className="space-y-6 animate-fade-in">
        {/* Search & filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input className="max-w-xs" placeholder="🔍 Search crop, location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex gap-2 flex-wrap">
            {["all", "tomato", "onion", "chilli", "turmeric", "potato"].map((c) => (
              <Button key={c} size="sm" variant={filterCrop === c ? "default" : "outline"} className={filterCrop === c ? "bg-primary" : ""} onClick={() => setFilterCrop(c)}>
                {c === "all" ? "All Crops" : c.charAt(0).toUpperCase() + c.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="fresh">
          <TabsList>
            <TabsTrigger value="fresh">🥬 Fresh Produce</TabsTrigger>
            <TabsTrigger value="dry">🌶️ Dry / Processed</TabsTrigger>
            <TabsTrigger value="trends">📈 Market Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="fresh" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((listing) => {
                const f = farmer(listing.farmerId);
                return (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow border-border">
                    <div className="bg-gradient-to-br from-primary/5 to-agro-sky/5 p-6 text-center">
                      <div className="text-5xl mb-2">{listing.image}</div>
                      <h3 className="font-bold text-lg">{listing.crop}</h3>
                      <p className="text-sm text-muted-foreground">{listing.location}</p>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-primary">₹{listing.price}/kg</div>
                          <div className="text-xs text-muted-foreground">{listing.quantity.toLocaleString()} kg available</div>
                        </div>
                        <CertificationBadge type={listing.certified as CertType} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Harvest</div><div className="font-medium">{listing.harvestDate}</div></div>
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Days Left</div><div className="font-medium text-primary">{listing.daysLeft} days</div></div>
                      </div>
                      {f && (
                        <div className="flex items-center gap-2 border-t border-border pt-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{f.avatar}</div>
                          <div>
                            <div className="text-xs font-medium">{f.name}</div>
                            <StarRating rating={f.rating} size="sm" />
                          </div>
                        </div>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-primary text-xs" size="sm" onClick={() => setSelectedListing(listing)}>
                            Pre-Book Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Pre-Book {listing.crop}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                            <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-muted-foreground">Crop</span><span className="font-medium">{listing.crop}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-medium text-primary">₹{listing.price}/kg</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Available</span><span className="font-medium">{listing.quantity.toLocaleString()} kg</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Harvest Date</span><span className="font-medium">{listing.harvestDate}</span></div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Quantity (kg)</label>
                              <Input value={bookQty} onChange={(e) => setBookQty(e.target.value)} type="number" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Offer Price (₹/kg)</label>
                              <Input defaultValue={listing.price} type="number" />
                            </div>
                            <div className="bg-agro-green-light/30 rounded-lg p-3 text-sm border border-primary/20">
                              <div className="font-medium text-primary mb-1">🔒 Smart Escrow Payment</div>
                              <p className="text-xs text-muted-foreground">Payment will be locked in escrow on booking. Released automatically after delivery confirmation.</p>
                              <div className="font-bold text-base mt-2">Total: ₹{(parseInt(bookQty || "0") * listing.price).toLocaleString()}</div>
                            </div>
                            <Button className="w-full bg-primary" onClick={() => { toast({ title: "Pre-booking confirmed! 🎉", description: `${bookQty}kg of ${listing.crop} booked. Payment locked in escrow.` }); }}>
                              Confirm Pre-Booking
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="dry" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DRY_LISTINGS.map((item) => (
                <Card key={item.crop} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm">{item.crop}</h3>
                        <p className="text-xs text-muted-foreground">{item.farmer} · {item.location}</p>
                      </div>
                      <CertificationBadge type={item.certified} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">{item.price}</span>
                      <Badge variant="outline" className="text-xs border-border">{item.qty}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Shelf life: {item.shelf}</span>
                      <Badge variant="outline" className="bg-agro-green-light text-primary border-primary/30">Long Shelf</Badge>
                    </div>
                    <Button size="sm" className="w-full bg-primary text-xs" onClick={() => toast({ title: `Inquiry sent for ${item.crop}` })}>
                      Bulk Order Inquiry
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(PRICE_SPARKLINES).map(([crop, data]) => {
                const last = data[data.length - 1].price;
                const first = data[0].price;
                const up = last > first;
                return (
                  <Card key={crop}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm">{crop}</span>
                        <Badge variant="outline" className={`text-xs ${up ? "bg-agro-green-light text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}>
                          {up ? "↑" : "↓"} {Math.abs(((last - first) / first) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-primary mb-2">₹{last}/kg</div>
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={data}>
                          <Line type="monotone" dataKey="price" stroke={up ? "hsl(123,45%,34%)" : "hsl(0,75%,55%)"} strokeWidth={2} dot={false} />
                          <Tooltip formatter={(v) => [`₹${v}/kg`]} contentStyle={{ fontSize: 10 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
