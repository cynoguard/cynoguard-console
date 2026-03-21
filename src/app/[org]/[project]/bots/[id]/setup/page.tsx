"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Terminal
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function BotSetupPage() {
  const router = useRouter();
  const {id} = useParams();
  const [copied, setCopied] = useState(false)
  const apiKey = sessionStorage.getItem("onetime-api-key") || "xxxxxxxxxxxxxxxxxxxxxxxx"
  const [isVerifying, setIsVerifying] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'connected' | 'already-conected' | 'error'>('pending')
 const [loading,setLoading] = useState(true);
 const [keyData,setKeyData] = useState<Partial<{status:string}>>();

  useEffect(()=>{

    if(!apiKey){
      return;
    }

    const getAPIKeySetupInfo = async () => {
      try {
        const response = await axios.get(`https://api.cynoguard.com/api/bot-dtection/api-key/${id}`);
        if(response.data.status === "success"){
          console.log(response.data.data)
           setKeyData(response.data.data);
           if(response.data.data.status === "connected"){
           setConnectionStatus("already-conected")
           }else{
             setConnectionStatus(response.data.data.status)
           }
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error:any) {
        toast.error(error.message)
        router.back();
      }finally{
        setLoading(false);
      }
    }

   getAPIKeySetupInfo();

  },[apiKey, id, router])
  // New JS Snippet Pattern
  const integrationScript = `<script 
  src="https://cdn.cynoguard.com/v1/cyno-shield.js" 
  data-api-key="${apiKey}" 
  async 
  data-strictness="high" 
  data-presistence="48" 
/>`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Snippet copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const verifyConnection = async () => {
    setIsVerifying(true)
    // Simulate DB check for incoming session
    const response = await axios.get(`https://api.cynoguard.com/api/bot-dtection/api-key/${id}/connection/status`)
    console.log(response.data.data)
    if(response.data.status === "success" && response.data.data.connected){
      await axios.put(`https://api.cynoguard.com/api/bot-dtection/api-key/${id}`,{
        status:"connected"
      });
      setIsVerifying(false)
      setConnectionStatus('connected')
      toast.success("Signal detected! Integration active.")
      setTimeout(()=>{
      sessionStorage.removeItem("onetime-api-key");
      toast.success("Secured your API key, You can't see it again");
      router.back();
      },1500);

    }else{
      setIsVerifying(false)
      setConnectionStatus('pending')
      toast.warning("Not connected yet, Please make suer add html snippet to you site and refresh")
    }
  }

   if(loading){
     return <div className="flex h-screen w-full items-center justify-center bg-background">
         <p className="animate-pulse text-sm text-muted-foreground">Loading Secured Informations...</p>
      </div>    
    }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit text-zinc-500 hover:text-zinc-100 p-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Keys
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Setup & Integration</h1>
          <p className="text-zinc-500 max-w-2xl">
            Deploy the CynoGuard detector to your frontend. Once integrated, our engine will begin analyzing behavioral signals to detect automated threats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Technical Config */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step 1: Script Injection */}
          <Card className="bg-[#09090b] border-zinc-800 rounded-md shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Terminal className="h-4 w-4 text-zinc-400" /> 1. Install JS Snippet
                </CardTitle>
                <Badge variant="outline" className="text-[10px] uppercase border-zinc-700 text-zinc-400">Recommended</Badge>
              </div>
              <CardDescription className="text-zinc-500 text-xs">
                Copy and paste this script into the <code className="text-zinc-300">&lt;head&gt;</code> section of your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <div className="relative bg-zinc-950 rounded-md border border-zinc-800 p-4 pt-12 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">HTML Snippet</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-6 text-[10px] hover:bg-zinc-800 text-zinc-300"
                      onClick={() => handleCopy(integrationScript)}
                    >
                      {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="text-xs font-mono text-zinc-400 overflow-x-auto leading-relaxed">
                    {integrationScript}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Verification */}
          <Card className="bg-[#09090b] border-zinc-800 rounded-md shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <RefreshCw className="h-4 w-4 text-zinc-400" /> 2. Verify Connection
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                After deploying the script, refresh your website page to trigger the first detection session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-950/50  border-zinc-800 rounded-md p-6 flex flex-col items-center justify-center text-center space-y-4">
                {connectionStatus === 'pending' && (
                  <>
                    <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                      <Loader2 className={`h-6 w-6 text-zinc-600 ${isVerifying ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Waiting for signals...</p>
                      <p className="text-xs text-zinc-500">Refresh your application to establish a handshake with CynoGuard.</p>
                    </div>
                  </>
                )}

                {connectionStatus === 'connected' && (
                  <>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <ShieldCheck className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-500">System Integrated</p>
                      <p className="text-xs text-zinc-500">Handshake verified. Sessions are now being analyzed.</p>
                    </div>
                  </>
                )}

                <Button 
                  disabled={isVerifying || connectionStatus === 'connected'}
                  onClick={verifyConnection}
                  className="bg-zinc-100 text-black hover:bg-zinc-200 rounded-md"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking DB...
                    </>
                  ) : connectionStatus === 'connected' ? (
                    "Connection Verified"
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                
                {connectionStatus === 'connected' && (
                  <Button variant="ghost" size="sm" className="text-zinc-500 text-[11px]" onClick={() => setConnectionStatus('pending')}>
                    <RefreshCw className="mr-1 h-3 w-3" /> Re-test connection
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Details */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#09090b] border-zinc-800 rounded-md shadow-none">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase text-zinc-500 tracking-widest">Environment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-zinc-500">Active API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    value={apiKey} 
                    readOnly 
                    className="bg-zinc-950 border-zinc-800 font-mono text-[11px] text-zinc-400 h-8 rounded-md"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Security Level</span>
                  <span className="text-zinc-300 font-medium">Strict</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Session TTL</span>
                  <span className="text-zinc-300 font-medium">48 Hours</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Endpoint</span>
                  <span className="text-zinc-300 font-medium italic">secure.cynoguard.com</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-md border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[11px] leading-relaxed">
            <strong>Security Note:</strong> Your API Key is public-facing. Ensure you restrict domains in the &quot;Protection Rules&quot; settings to prevent unauthorized usage.
          </div>
        </div>
      </div>
    </div>
  )
}