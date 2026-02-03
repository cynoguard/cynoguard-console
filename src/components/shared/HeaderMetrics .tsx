import { Activity, Bot, Globe } from "lucide-react";

const HeaderMetrics = () => {
  return (
    <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Globe className="h-3 w-3 text-blue-500" />
        <span className="text-xs font-medium text-foreground">128</span>
        <span className="text-xs">Domains</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Bot className="h-4 w-4 text-red-500" />
        <span className="text-xs font-medium text-foreground">20K+</span>
        <span className="text-xs">Bots Blocked</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Activity className="h-3 w-3 text-green-500" />
        <span className="text-xs font-medium text-foreground">1.2M</span>
        <span className="text-xs">Req/day</span>
      </div>
    </div>
  )
}

export default HeaderMetrics;
