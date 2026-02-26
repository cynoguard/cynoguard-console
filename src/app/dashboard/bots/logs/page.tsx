import { ChartAreaInteractive } from "@/components/charts/area-chart-interactive";
import { ChartPieDonutText } from "@/components/charts/pie-chart-donut-text";
import KpiCard from "@/components/dashboard/kpi-card";

// 

const Page = () => {

  return (
    // Added mx-auto and max-w-7xl to keep it centered and clean
    <div className="w-full max-w-7xl mx-auto flex flex-col py-10 px-4 sm:px-6 lg:px-8">
       {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">  
                       Bot Realtime Logs
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor your domains for look-alikes, typosquatting, and phishing threats.
                    </p>
                </div>
        {/* Body */}
        <div className="w-full py-8">
        {/* Placeholder for the bot overview content */} 
        <div className="w-full flex gap-6">
          {/* KPI Cards */}

          {/* Total Requests */}
          <KpiCard/> 
          {/* Total Bots Blocked */}
          <KpiCard/>
          {/* Total Human Traffic */}
          <KpiCard/>
          {/*Avg. Risk Score */}
          <KpiCard/>
        </div>

        <div className="grid gap-6 grid-cols-7 py-8">

          <div className="col-span-4">
          <ChartAreaInteractive/>
          </div>
           <div className="col-span-3">
           <ChartPieDonutText/>
          </div>

        </div>



        </div>
    </div>
  )
}

export default Page;