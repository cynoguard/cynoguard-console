"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Key,
  Settings,
  Terminal,
  Zap
} from "lucide-react"
import { useState } from "react"

const setupSteps = [
  { id: 1, title: "API Key", status: "completed" },
  { id: 2, title: "Configuration", status: "current" },
  { id: 3, title: "Verification", status: "pending" }
]

export default function BotSetupPage() {
  const [apiKey] = useState("cg_live_51f2a8b9c4d7e6f3a2b1c9d8e7f6a5b4")
  const [copied, setCopied] = useState(false)
  const [domain, setDomain] = useState("yourdomain.com")

  const integrationScript = `<script>
  window.CYNOGUARD_CONFIG = {
    apiKey: "${apiKey}",
    domain: "${domain}",
    endpoint: "https://api.cynoguard.com/v1/bots"
  };
  
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.cynoguard.com/bot-detector.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700">
            <Settings className="h-6 w-6 text-zinc-100" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Setup & Integration</h1>
        </div>
        <p className="text-zinc-400 max-w-2xl">
          Deploy the CynoGuard lightweight detector to your frontend to start analyzing behavioral signals and blocking automated threats in real-time.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {setupSteps.map((step) => (
          <div 
            key={step.id} 
            className={`relative p-4 rounded-xl border flex items-center gap-4 transition-all ${
              step.status === 'current' 
                ? 'bg-zinc-900 border-zinc-500 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                : 'bg-zinc-900/50 border-zinc-800'
            }`}
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step.status === 'completed' ? 'bg-green-500 text-black' : 
              step.status === 'current' ? 'bg-zinc-100 text-black' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {step.status === 'completed' ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <div>
              <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-zinc-500' : 'text-zinc-100'}`}>
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config Forms */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-[#09090b] border-zinc-800 text-zinc-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-zinc-400" /> API Credentials
              </CardTitle>
              <CardDescription className="text-zinc-500">Your unique public key for client-side signal transmission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    value={apiKey} 
                    readOnly 
                    className="bg-zinc-950 border-zinc-800 font-mono text-zinc-300 pr-10"
                  />
                  <div className="absolute right-3 top-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Button variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800" onClick={() => handleCopy(apiKey)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Production</Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">behavior_write_only</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#09090b] border-zinc-800 text-zinc-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Terminal className="h-5 w-5 text-zinc-400" /> Integration Snippet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-400">Target Domain</Label>
                <Input 
                  placeholder="app.example.com" 
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-zinc-950 rounded-lg border border-zinc-800 p-4 overflow-hidden">
                  <pre className="text-xs font-mono text-zinc-400 overflow-x-auto leading-relaxed">
                    {integrationScript}
                  </pre>
                  <Button 
                    size="sm" 
                    className="absolute top-3 right-3 bg-zinc-100 text-black hover:bg-zinc-200"
                    onClick={() => handleCopy(integrationScript)}
                  >
                    {copied ? "Copied" : "Copy Code"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Guidance & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-zinc-950/50 border-zinc-800 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  "Place the snippet inside the <head> tag.",
                  "Ensure the domain matches your production URL.",
                  "Trigger a test visit to verify signal reception."
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="text-zinc-600 font-mono">{i + 1}.</span>
                    {text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
             <Button variant="outline" className="border-zinc-800 bg-zinc-900 py-8 flex flex-col gap-2 h-auto hover:border-zinc-600">
                <Globe className="h-5 w-5 text-zinc-400" />
                <span className="text-xs">React SDK</span>
             </Button>
             <Button variant="outline" className="border-zinc-800 bg-zinc-900 py-8 flex flex-col gap-2 h-auto hover:border-zinc-600">
                <Zap className="h-5 w-5 text-zinc-400" />
                <span className="text-xs">Next.js</span>
             </Button>
          </div>

          <Button className="w-full bg-white text-black hover:bg-zinc-200 py-6 text-lg font-bold group">
            Test Connection
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}