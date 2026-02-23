
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Copy,
  Globe,
  Zap,
  Lock,
  Settings,
  Play
} from "lucide-react"

const setupSteps = [
  {
    id: 1,
    title: "Generate API Key",
    description: "Create a unique API key for your application",
    icon: <Key className="h-5 w-5" />,
    status: "completed"
  },
  {
    id: 2,
    title: "Configure Integration",
    description: "Add the CynoGuard script to your website",
    icon: <Settings className="h-5 w-5" />,
    status: "current"
  },
  {
    id: 3,
    title: "Verify Installation",
    description: "Test the integration and start monitoring",
    icon: <CheckCircle className="h-5 w-5" />,
    status: "pending"
  }
]

export default function BotSetupPage() {
  const [apiKey, setApiKey] = useState("cg_live_51f2a8b9c4d7e6f3a2b1c9d8e7f6a5b4")
  const [copied, setCopied] = useState(false)
  const [domain, setDomain] = useState("yourdomain.com")
  const [currentStep, setCurrentStep] = useState(2)

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

  const handleCopyScript = () => {
    navigator.clipboard.writeText(integrationScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const progressPercentage = (currentStep / setupSteps.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 bg-white">
      {/* Header */}
      <div className="text-center space-y-3 border-b pb-6">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-gray-900 p-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-normal">Setup CynoGuard Bot Protection</h1>
          <p className="text-gray-600 text-sm">
            Configure your bot detection in 3 simple steps
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="border rounded p-4">
        <h2 className="text-sm font-medium mb-3">Setup Progress</h2>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Step {currentStep} of {setupSteps.length}</span>
          <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded h-1">
          <div 
            className="bg-gray-900 h-1 rounded" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3 mt-4">
          {setupSteps.map((step) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 border ${
                step.status === "completed" ? "bg-white border-gray-300" :
                step.status === "current" ? "bg-gray-50 border-gray-400" :
                "bg-white border-gray-200"
              }`}
            >
              <div className={`p-1 ${
                step.status === "completed" ? "bg-gray-900 text-white" :
                step.status === "current" ? "bg-gray-700 text-white" :
                "bg-gray-300 text-gray-600"
              }`}>
                {step.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="border rounded p-4">
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Key className="h-4 w-4" />
          Your API Key
        </h2>
        <p className="text-xs text-gray-600 mb-4">
          Keep this key secure and never share it publicly
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input 
              value={apiKey} 
              readOnly 
              className="font-mono text-sm border-gray-300"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigator.clipboard.writeText(apiKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 border border-green-200">
              ACTIVE
            </span>
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 border border-gray-200">
              GLOBAL ACCESS
            </span>
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 border border-gray-200">
              ENCRYPTED
            </span>
          </div>
        </div>
      </div>

      {/* Integration Script */}
      <div className="border rounded p-4">
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Integration Script
        </h2>
        <p className="text-xs text-gray-600 mb-4">
          Add this script to &lt;head&gt; section of your website
        </p>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm">Domain Name</Label>
            <Input 
              id="domain"
              placeholder="yourdomain.com" 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="font-mono border-gray-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Generated Script</Label>
            <div className="relative">
              <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-xs overflow-x-auto font-mono">
                {integrationScript}
              </pre>
              <Button 
                variant="outline" 
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopyScript}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-2">Installation Instructions</p>
                <ol className="space-y-1 text-gray-700 list-decimal list-inside text-xs">
                  <li>Copy script above</li>
                  <li>Paste it in &lt;head&gt; section of your HTML</li>
                  <li>Replace "yourdomain.com" with your actual domain</li>
                  <li>Deploy your changes and wait 2-5 minutes</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border rounded p-4">
        <h2 className="text-sm font-medium mb-3">Quick Actions</h2>
        <p className="text-xs text-gray-600 mb-4">
          Common integration methods and tools
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="h-16 justify-start">
            <Globe className="h-4 w-4 mr-2" />
            WordPress Plugin
          </Button>
          <Button variant="outline" className="h-16 justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Google Tag Manager
          </Button>
          <Button variant="outline" className="h-16 justify-start">
            <Zap className="h-4 w-4 mr-2" />
            Segment Integration
          </Button>
          <Button variant="outline" className="h-16 justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Cloudflare Workers
          </Button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" size="lg">
          Previous Step
        </Button>
        <Button size="lg" className="bg-gray-900 hover:bg-gray-800">
          Test Integration
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}