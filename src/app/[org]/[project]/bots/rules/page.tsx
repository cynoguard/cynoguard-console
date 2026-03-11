"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  addWhitelistEntry,
  fetchProjectApiKeys,
  removeWhitelistEntry,
  updateRules,
} from "@/lib/api/bot-management";
import {
  AlertTriangle,
  Bot, CheckCircle, ChevronRight,
  Cpu, Globe, Key, Plus,
  RefreshCw, Save, Search,
  Shield, ShieldAlert, ShieldCheck,
  Trash2, X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────
type WhitelistEntry = {
  name:  string;
  type:  string;
  value: string;
};

type ApiKeyRule = {
  strictness:  string;
  persistence: number;
  signals:     Record<string, boolean>;
  whitelist:   WhitelistEntry[];
};

type ApiKey = {
  id:         string;
  name:       string;
  status:     string;
  lastUsedAt: string | null;
  createdAt:  string;
  rule:       ApiKeyRule | null;
};

// ── Constants ──────────────────────────────────────────
const DEFAULT_RULE: ApiKeyRule = {
  strictness:  "balanced",
  persistence: 48,
  signals: {
    headless:         true,
    hardwareMismatch: true,
    mouseAnalysis:    false,
  },
  whitelist: [],
};

const SIGNALS = [
  {
    key:   "headless",
    label: "Headless Browser Detection",
    desc:  "Flag Selenium, Puppeteer, and Playwright signatures.",
    icon:  <Bot className="h-4 w-4" />,
  },
  {
    key:   "hardwareMismatch",
    label: "Hardware Mismatch",
    desc:  "Validate CPU cores against RAM and Canvas rendering.",
    icon:  <Cpu className="h-4 w-4" />,
  },
  {
    key:   "mouseAnalysis",
    label: "Mouse Path Analysis",
    desc:  "Detect non-human, linear cursor movements.",
    icon:  <Globe className="h-4 w-4" />,
  },
];

const STRICTNESS_OPTIONS = [
  {
    value:      "passive",
    label:      "Passive",
    desc:       "Log all threats but never block or challenge. Best for initial setup.",
    badge:      "MONITORING ONLY",
    badgeClass: "border-zinc-700 text-zinc-400",
    icon:       <Shield className="h-7 w-7 text-zinc-400" />,
    ring:       "hover:border-zinc-600",
    activeRing: "border-zinc-500 ring-1 ring-zinc-500",
  },
  {
    value:      "balanced",
    label:      "Balanced",
    desc:       "Challenge suspicious traffic. High accuracy with low human friction.",
    badge:      "RECOMMENDED",
    badgeClass: "border-blue-500/40 text-blue-400 bg-blue-500/5",
    icon:       <ShieldCheck className="h-7 w-7 text-blue-400" />,
    ring:       "hover:border-blue-500/30",
    activeRing: "border-blue-500/60 ring-1 ring-blue-500/40",
  },
  {
    value:      "aggressive",
    label:      "Aggressive",
    desc:       "Immediate block for medium-risk signals. Minimal false-positive tolerance.",
    badge:      "MAX SECURITY",
    badgeClass: "border-red-500/40 text-red-400 bg-red-500/5",
    icon:       <ShieldAlert className="h-7 w-7 text-red-400" />,
    ring:       "hover:border-red-500/30",
    activeRing: "border-red-500/60 ring-1 ring-red-500/40",
  },
];

const WHITELIST_TYPES = ["IP Address", "Subnet", "User Agent", "Search Crawler"];

const PRESET_CATEGORIES = ["All", "Search", "SEO", "Monitor", "Social", "Infra"];

const PRESET_BOTS: (WhitelistEntry & { category: string; trusted: boolean })[] = [
  // Search crawlers
  { name: "Googlebot",           type: "Search Crawler", value: "Googlebot/2.1",                   category: "Search",  trusted: true  },
  { name: "Bingbot",             type: "Search Crawler", value: "bingbot/2.0",                     category: "Search",  trusted: true  },
  { name: "DuckDuckBot",         type: "Search Crawler", value: "DuckDuckBot/1.0",                 category: "Search",  trusted: true  },
  { name: "Yandex Bot",          type: "Search Crawler", value: "YandexBot/3.0",                   category: "Search",  trusted: true  },
  { name: "Baiduspider",         type: "Search Crawler", value: "Baiduspider/2.0",                 category: "Search",  trusted: true  },
  // SEO
  { name: "Ahrefs Bot",          type: "User Agent",     value: "AhrefsBot/7.0",                   category: "SEO",     trusted: true  },
  { name: "SEMrush Bot",         type: "User Agent",     value: "SemrushBot/7",                    category: "SEO",     trusted: true  },
  { name: "Moz DotBot",          type: "User Agent",     value: "DotBot/1.2",                      category: "SEO",     trusted: true  },
  // Monitoring
  { name: "UptimeRobot",         type: "User Agent",     value: "UptimeRobot/2.0",                 category: "Monitor", trusted: true  },
  { name: "Pingdom Bot",         type: "User Agent",     value: "Pingdom.com_bot_version",         category: "Monitor", trusted: true  },
  { name: "StatusCake",          type: "User Agent",     value: "StatusCake/1.0",                  category: "Monitor", trusted: true  },
  // Social
  { name: "Twitterbot",          type: "User Agent",     value: "Twitterbot/1.0",                  category: "Social",  trusted: true  },
  { name: "LinkedInBot",         type: "User Agent",     value: "LinkedInBot/1.0",                 category: "Social",  trusted: true  },
  { name: "Slackbot",            type: "User Agent",     value: "Slackbot-LinkExpanding",          category: "Social",  trusted: true  },
  { name: "facebookexternalhit", type: "User Agent",     value: "facebookexternalhit/1.1",         category: "Social",  trusted: true  },
  // Infra
  { name: "AWS Health Checks",   type: "Subnet",         value: "54.183.255.128/26",               category: "Infra",   trusted: true  },
  { name: "Cloudflare IPs",      type: "Subnet",         value: "103.21.244.0/22",                 category: "Infra",   trusted: false },
  { name: "Vercel Deployment",   type: "Subnet",         value: "76.76.21.0/24",                   category: "Infra",   trusted: false },
];

// ── Helpers ────────────────────────────────────────────
const categoryColor = (cat: string) => {
  const map: Record<string, string> = {
    Search:  "border-blue-500/40 text-blue-400 bg-blue-500/5",
    SEO:     "border-purple-500/40 text-purple-400 bg-purple-500/5",
    Monitor: "border-green-500/40 text-green-400 bg-green-500/5",
    Social:  "border-yellow-500/40 text-yellow-400 bg-yellow-500/5",
    Infra:   "border-orange-500/40 text-orange-400 bg-orange-500/5",
  };
  return map[cat] ?? "border-zinc-700 text-zinc-400";
};

const StrictnessBadge = ({ mode }: { mode: string }) => {
  const map: Record<string, string> = {
    passive:    "border-zinc-700 text-zinc-400",
    balanced:   "border-blue-500/40 text-blue-400",
    aggressive: "border-red-500/40 text-red-400",
  };
  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-widest ${map[mode] ?? map.balanced}`}>
      {mode}
    </Badge>
  );
};

// ── Skeleton ───────────────────────────────────────────
const PageSkeleton = () => (
  <div className="flex gap-6">
    <div className="w-64 shrink-0 space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse" />
      ))}
    </div>
    <div className="flex-1 space-y-4">
      <div className="h-10 w-48 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
      <div className="h-52 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse" />
      <div className="h-36 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse" />
      <div className="h-48 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse" />
    </div>
  </div>
);

// ── Apply Rules Dialog ─────────────────────────────────
const ApplyDialog = ({
  open,
  onClose,
  allKeys,
  currentKeyId,
  onApply,
  saving,
}: {
  open:         boolean;
  onClose:      () => void;
  allKeys:      ApiKey[];
  currentKeyId: string;
  onApply:      (keyIds: string[]) => void;
  saving:       boolean;
}) => {
  // No useEffect — state initializes from props, key prop on parent resets on open
  const [selected, setSelected] = useState<string[]>([currentKeyId]);

  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const selectAll = () => setSelected(allKeys.map(k => k.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-4 w-4 text-zinc-400" />
            Apply Rules To
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Choose which API keys these rules should apply to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Apply to all shortcut */}
          <button
            onClick={selectAll}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Shield className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-200">Apply to all keys</p>
                <p className="text-xs text-zinc-500">Propagate rules across entire project</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>

          <div className="text-xs text-zinc-500 text-center">or select specific keys</div>

          {/* Key checkboxes */}
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {allKeys.map(key => (
              <button
                key={key.id}
                onClick={() => toggle(key.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  selected.includes(key.id)
                    ? "border-blue-500/40 bg-blue-500/5"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
              >
                <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                  selected.includes(key.id)
                    ? "bg-blue-500 border-blue-500"
                    : "border-zinc-600"
                }`}>
                  {selected.includes(key.id) && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Key className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="text-sm text-zinc-200 truncate">{key.name}</span>
                  <StrictnessBadge mode={key.rule?.strictness ?? "balanced"} />
                </div>
                {key.id === currentKeyId && (
                  <span className="ml-auto text-[10px] text-zinc-500 shrink-0">current</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-white text-black hover:bg-zinc-200"
              onClick={() => onApply(selected)}
              disabled={saving || selected.length === 0}
            >
              {saving
                ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                : <Save className="h-4 w-4 mr-2" />
              }
              Apply to {selected.length} {selected.length === 1 ? "key" : "keys"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Whitelist Manager Dialog ───────────────────────────
const WhitelistDialog = ({
  open,
  onClose,
  allKeys,
  currentKeyId,
  activeWhitelist,
  onAdd,
  onRemove,
  saving,
}: {
  open:            boolean;
  onClose:         () => void;
  allKeys:         ApiKey[];
  currentKeyId:    string;
  activeWhitelist: WhitelistEntry[];
  onAdd:           (keyIds: string[], entry: WhitelistEntry) => void;
  onRemove:        (entry: WhitelistEntry) => void;
  saving:          boolean;
}) => {
  // No useEffect — key prop on parent resets on open
  const [tab,          setTab]          = useState<"presets" | "manual">("presets");
  const [presetCat,    setPresetCat]    = useState("All");
  const [presetSearch, setPresetSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([currentKeyId]);
  const [form,         setForm]         = useState({ name: "", type: "IP Address", value: "" });

  const activeValues = new Set(activeWhitelist.map(e => e.value));

  const toggleKey = (id: string) =>
    setSelectedKeys(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const filteredPresets = PRESET_BOTS.filter(p => {
    const matchCat    = presetCat === "All" || p.category === presetCat;
    const matchSearch = !presetSearch ||
      p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
      p.value.toLowerCase().includes(presetSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const manualValid = form.name.trim() && form.value.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-xl max-h-[88vh] overflow-hidden flex flex-col gap-0 p-0">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0 border-b border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-zinc-400" />
              Whitelist Manager
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Enable trusted bots instantly or add custom IPs and user agents.
            </DialogDescription>
          </DialogHeader>
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit mt-4">
            {(["presets", "manual"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t === "presets" ? "Known Bots & Crawlers" : "Custom Entry"}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">

          {/* ── Presets tab ── */}
          {tab === "presets" && (
            <>
              {/* Sticky search + category */}
              <div className="space-y-3 sticky top-0 bg-zinc-950 pb-2 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search bots and crawlers..."
                    className="pl-10 bg-zinc-900 border-zinc-800 text-sm h-9 rounded-lg"
                    value={presetSearch}
                    onChange={e => setPresetSearch(e.target.value)}
                  />
                  {presetSearch && (
                    <button
                      onClick={() => setPresetSearch("")}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPresetCat(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        presetCat === cat
                          ? "bg-zinc-700 border-zinc-600 text-white"
                          : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot list */}
              <div className="rounded-xl border border-zinc-800 overflow-hidden divide-y divide-zinc-800/60">
                {filteredPresets.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-zinc-500">No matching bots found</p>
                  </div>
                ) : (
                  filteredPresets.map(bot => {
                    const isActive = activeValues.has(bot.value);
                    return (
                      <div
                        key={bot.value}
                        className={`flex items-center justify-between px-4 py-3 transition-colors ${
                          isActive ? "bg-green-500/5" : "hover:bg-zinc-800/20"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isActive ? "bg-green-500/10" : "bg-zinc-800"
                          }`}>
                            <Bot className={`h-3.5 w-3.5 ${
                              isActive ? "text-green-400" : "text-zinc-400"
                            }`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-zinc-200">
                                {bot.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] uppercase ${categoryColor(bot.category)}`}
                              >
                                {bot.category}
                              </Badge>
                              {bot.trusted && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] border-green-500/30 text-green-500/70"
                                >
                                  trusted
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate">
                              {bot.value}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            isActive
                              ? onRemove(bot)
                              : onAdd(selectedKeys, {
                                  name:  bot.name,
                                  type:  bot.type,
                                  value: bot.value,
                                })
                          }
                          disabled={saving}
                          className={`shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${
                            isActive
                              ? "border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10"
                              : "border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/10"
                          }`}
                        >
                          {isActive
                            ? <><X className="h-3 w-3" /> Remove</>
                            : <><Plus className="h-3 w-3" /> Enable</>
                          }
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ── Manual tab ── */}
          {tab === "manual" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block uppercase tracking-wider">
                    Name
                  </label>
                  <Input
                    placeholder="e.g. Office IP, Partner API"
                    className="bg-zinc-900 border-zinc-800 text-zinc-200 h-9 rounded-lg"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block uppercase tracking-wider">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {WHITELIST_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          form.type === t
                            ? "bg-zinc-700 border-zinc-600 text-white"
                            : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block uppercase tracking-wider">
                    Value
                  </label>
                  <Input
                    placeholder={
                      form.type === "IP Address" ? "e.g. 192.168.1.1"  :
                      form.type === "Subnet"     ? "e.g. 10.0.0.0/24"  :
                      form.type === "User Agent" ? "e.g. MyBot/1.0"    :
                      "e.g. Googlebot"
                    }
                    className="bg-zinc-900 border-zinc-800 text-zinc-200 h-9 rounded-lg font-mono text-xs"
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  />
                </div>
              </div>

              {/* Apply to keys */}
              <div>
                <label className="text-xs text-zinc-500 mb-2 block uppercase tracking-wider">
                  Apply to keys
                </label>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {allKeys.map(key => (
                    <button
                      key={key.id}
                      onClick={() => toggleKey(key.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                        selectedKeys.includes(key.id)
                          ? "border-blue-500/40 bg-blue-500/5"
                          : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                      }`}
                    >
                      <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                        selectedKeys.includes(key.id)
                          ? "bg-blue-500 border-blue-500"
                          : "border-zinc-600"
                      }`}>
                        {selectedKeys.includes(key.id) && (
                          <CheckCircle className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                      <Key className="h-3 w-3 text-zinc-500 shrink-0" />
                      <span className="text-xs text-zinc-300 truncate">{key.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-zinc-200"
                onClick={() => onAdd(selectedKeys, form)}
                disabled={saving || !manualValid || selectedKeys.length === 0}
              >
                {saving
                  ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  : <Plus className="h-4 w-4 mr-2" />
                }
                Add Custom Entry
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 shrink-0">
          <Button
            variant="outline"
            className="w-full border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Rules Editor ───────────────────────────────────────
const RulesEditor = ({
  apiKey,
  allKeys,
  onSaved,
}: {
  apiKey:  ApiKey;
  allKeys: ApiKey[];
  onSaved: () => void;
}) => {
  const rule = apiKey.rule ?? DEFAULT_RULE;

  const [strictness,  setStrictness]  = useState(rule.strictness);
  const [persistence, setPersistence] = useState(rule.persistence);
  const [signals,     setSignals]     = useState<Record<string, boolean>>(
    { ...DEFAULT_RULE.signals, ...rule.signals }
  );

const [whitelist, setWhitelist] = useState<WhitelistEntry[]>(() => {
  const raw = rule.whitelist;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as WhitelistEntry[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
});
  const [wlSearch,    setWlSearch]    = useState("");
  const [applyOpen,   setApplyOpen]   = useState(false);
  const [wlOpen,      setWlOpen]      = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [wlSaving,    setWlSaving]    = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab,   setActiveTab]   = useState<"rules" | "whitelist">("rules");

  const originalSignals = { ...DEFAULT_RULE.signals, ...rule.signals };

  const isDirty =
    strictness  !== rule.strictness  ||
    persistence !== rule.persistence ||
    JSON.stringify(signals) !== JSON.stringify(originalSignals);

  const handleApply = async (keyIds: string[]) => {
    setSaving(true);
    try {
      await updateRules({
        keyIds,
        rules: { strictness, persistence, signals, whitelist },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onSaved();
    } catch {
      // toast error here if needed
    } finally {
      setSaving(false);
      setApplyOpen(false);
    }
  };

const handleAddWhitelist = async (keyIds: string[], entry: WhitelistEntry) => {
  setWlSaving(true);
  try {
    await addWhitelistEntry({ keyIds, entry });
    // Safe append — guarantee prev is always an array
    setWhitelist(prev => (Array.isArray(prev) ? [...prev, entry] : [entry]));
    onSaved();
  } catch {
    // toast error
  } finally {
    setWlSaving(false);
  }
};

  const handleRemoveWhitelist = async (entry: WhitelistEntry) => {
    setWlSaving(true);
    try {
      await removeWhitelistEntry({ keyId: apiKey.id, entryValue: entry.value });
      setWhitelist(prev => prev.filter(e => e.value !== entry.value));
      onSaved();
    } catch {
      // toast error here
    } finally {
      setWlSaving(false);
    }
  };

  const filteredWhitelist = whitelist.filter(
    e =>
      e.name.toLowerCase().includes(wlSearch.toLowerCase()) ||
      e.value.toLowerCase().includes(wlSearch.toLowerCase())
  );

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit mb-6">
        {(["rules", "whitelist"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "whitelist"
              ? `Whitelist${whitelist.length > 0 ? ` (${whitelist.length})` : ""}`
              : "ML Rules"
            }
          </button>
        ))}
      </div>

      {/* ── ML Rules tab ── */}
      {activeTab === "rules" && (
        <div className="space-y-6">

          {/* Strictness */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-400" />
                Detection Mode
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                How aggressively bot traffic should be challenged or blocked.
              </p>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              {STRICTNESS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStrictness(opt.value)}
                  className={`relative text-left p-4 rounded-xl border transition-all ${
                    strictness === opt.value
                      ? opt.activeRing + " bg-zinc-900"
                      : `border-zinc-800 bg-zinc-900/30 ${opt.ring}`
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {opt.icon}
                    <Badge variant="outline" className={`text-[9px] uppercase ${opt.badgeClass}`}>
                      {opt.badge}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-zinc-200 mb-1">{opt.label}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{opt.desc}</p>
                  {strictness === opt.value && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Persistence */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-200">Session Persistence</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                How long a verified human session cookie stays valid.
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                  <Input
                    type="number"
                    min={1}
                    max={720}
                    value={persistence}
                    onChange={e => setPersistence(Number(e.target.value))}
                    className="w-16 bg-transparent border-0 text-zinc-200 text-sm font-mono p-0 h-auto focus-visible:ring-0"
                  />
                  <span className="text-xs text-zinc-500">hours</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[24, 48, 72, 168].map(h => (
                    <button
                      key={h}
                      onClick={() => setPersistence(h)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        persistence === h
                          ? "bg-zinc-700 border-zinc-600 text-white"
                          : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                      }`}
                    >
                      {h === 168 ? "7d" : `${h}h`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ML Signal toggles */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-zinc-400" />
                ML Signal Weights
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Toggle which behavioral signals the detection engine evaluates.
              </p>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {SIGNALS.map(sig => (
                <div
                  key={sig.key}
                  className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                      {sig.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{sig.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{sig.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={signals[sig.key] ?? false}
                    onCheckedChange={val =>
                      setSignals(prev => ({ ...prev, [sig.key]: val }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save bar */}
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            isDirty
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-zinc-800 bg-zinc-900/30"
          }`}>
            <div className="flex items-center gap-2.5">
              {isDirty ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">Unsaved changes</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Rules saved successfully</span>
                </>
              ) : (
                <span className="text-xs text-zinc-500">No unsaved changes</span>
              )}
            </div>
            <Button
              size="sm"
              className="bg-white text-black hover:bg-zinc-200 h-8"
              onClick={() => setApplyOpen(true)}
              disabled={!isDirty || saving}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Rules
            </Button>
          </div>
        </div>
      )}

      {/* ── Whitelist tab ── */}
      {activeTab === "whitelist" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">

            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search entries..."
                  className="pl-10 bg-zinc-950 border-zinc-800 text-sm h-9 rounded-lg"
                  value={wlSearch}
                  onChange={e => setWlSearch(e.target.value)}
                />
                {wlSearch && (
                  <button
                    onClick={() => setWlSearch("")}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                size="sm"
                className="bg-white text-black hover:bg-zinc-200 h-9 ml-auto"
                onClick={() => setWlOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Manage Whitelist
              </Button>
            </div>

            {/* List */}
            {filteredWhitelist.length === 0 ? (
              <div className="py-14 text-center">
                <Shield className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No whitelist entries</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Add trusted IPs, subnets, or known bots to bypass detection.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  onClick={() => setWlOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add first entry
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {filteredWhitelist.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-800">
                        <Bot className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-200">{entry.name}</p>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-zinc-700 text-zinc-500"
                          >
                            {entry.type}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono text-zinc-500 mt-0.5">{entry.value}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      onClick={() => handleRemoveWhitelist(entry)}
                      disabled={wlSaving}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialogs — key prop resets internal state on open/close, no useEffect needed */}
      <ApplyDialog
        key={`apply-${applyOpen}`}
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        allKeys={allKeys}
        currentKeyId={apiKey.id}
        onApply={handleApply}
        saving={saving}
      />
      <WhitelistDialog
        key={`wl-${wlOpen}`}
        open={wlOpen}
        onClose={() => setWlOpen(false)}
        allKeys={allKeys}
        currentKeyId={apiKey.id}
        activeWhitelist={whitelist}
        onAdd={handleAddWhitelist}
        onRemove={handleRemoveWhitelist}
        saving={wlSaving}
      />
    </>
  );
};

// ── Page ───────────────────────────────────────────────
export default function RulesPage() {
  const [apiKeys,       setApiKeys]       = useState<ApiKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [keySearch,     setKeySearch]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchProjectApiKeys();
      const keys   = (result ?? []) as ApiKey[];
      setApiKeys(keys);
      if (keys.length > 0 && !selectedKeyId) {
        setSelectedKeyId(keys[0].id);
      }
    } catch {
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  }, [selectedKeyId]);

  useEffect(() => { load(); }, [load]);

  const selectedKey    = apiKeys.find(k => k.id === selectedKeyId) ?? null;
  const filteredKeys   = apiKeys.filter(k =>
    k.name.toLowerCase().includes(keySearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col py-10 px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protection Rules</h1>
          <p className="text-muted-foreground mt-1">
            Configure detection sensitivity and manage trust lists per API key.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-green-500/40 text-green-400 bg-green-500/5 py-1.5 px-3"
          >
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse inline-block" />
            ML Engine Active
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-900 border-zinc-800"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <PageSkeleton />
      ) : apiKeys.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-16 text-center">
          <Key className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
          <p className="text-sm text-zinc-500">No API keys found for this project.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Create an API key first to configure protection rules.
          </p>
        </div>
      ) : (
        <div className="flex gap-6 items-start">

          {/* Left — key selector */}
          <div className="w-64 shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Filter keys..."
                className="pl-10 bg-zinc-900 border-zinc-800 text-sm h-9 rounded-lg"
                value={keySearch}
                onChange={e => setKeySearch(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              {filteredKeys.map(key => (
                <button
                  key={key.id}
                  onClick={() => setSelectedKeyId(key.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedKeyId === key.id
                      ? "border-zinc-600 bg-zinc-800/60"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-md shrink-0 ${
                      key.status === "active" ? "bg-green-500/10" : "bg-zinc-800"
                    }`}>
                      <Key className={`h-3 w-3 ${
                        key.status === "active" ? "text-green-400" : "text-zinc-500"
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {key.name}
                      </p>
                      <div className="mt-0.5">
                        <StrictnessBadge mode={key.rule?.strictness ?? "balanced"} />
                      </div>
                    </div>
                  </div>
                  {key.rule && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-600">
                      <span>{key.rule.persistence}h persist</span>
                      <span>
                        {Object.values(key.rule.signals as Record<string, boolean>)
                          .filter(Boolean).length} signals on
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right — editor */}
          <div className="flex-1 min-w-0">
            {selectedKey ? (
              <>
                {/* Selected key header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedKey.status === "active" ? "bg-green-500/10" : "bg-zinc-800"
                    }`}>
                      <Key className={`h-4 w-4 ${
                        selectedKey.status === "active" ? "text-green-400" : "text-zinc-500"
                      }`} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-zinc-200">
                        {selectedKey.name}
                      </h2>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {selectedKey.id.slice(0, 24)}…
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      selectedKey.status === "active"
                        ? "border-green-500/40 text-green-400 bg-green-500/5"
                        : "border-zinc-700 text-zinc-500"
                    }
                  >
                    <span className={`h-1.5 w-1.5 rounded-full mr-1.5 inline-block ${
                      selectedKey.status === "active"
                        ? "bg-green-400 animate-pulse"
                        : "bg-zinc-500"
                    }`} />
                    {selectedKey.status}
                  </Badge>
                </div>

                {/* key prop forces remount when selection changes, resetting all editor state */}
                <RulesEditor
                  key={selectedKey.id}
                  apiKey={selectedKey}
                  allKeys={apiKeys}
                  onSaved={load}
                />
              </>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-16 text-center">
                <Shield className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Select an API key to configure rules</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}