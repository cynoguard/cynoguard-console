"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ExternalLink,
  Filter,
  RefreshCw,
  Search
} from "lucide-react"

// 1. Data Structure based on your verifyHuman logic
type DetectionLog = {
  id: string
  timestamp: string
  ip: string
  action: "allow" | "challenge" | "uncertain"
  score: number
  ua: string
  signals: {
    webdriver: boolean
    canvas: boolean
    webgl: boolean
    hardwareConcurrency: number
  }
}

// 2. Dummy Data
const data: DetectionLog[] = [
  {
    id: "det_8k2f9s",
    timestamp: "2024-05-20 14:30:05",
    ip: "192.168.1.45",
    action: "allow",
    score: 95,
    ua: "Mozilla/5.0 (Windows NT 10.0...)",
    signals: { webdriver: false, canvas: true, webgl: true, hardwareConcurrency: 8 }
  },
  {
    id: "det_1m4n6p",
    timestamp: "2024-05-20 14:31:12",
    ip: "45.77.12.180",
    action: "challenge",
    score: 25,
    ua: "HeadlessChrome/114.0.0.0",
    signals: { webdriver: true, canvas: false, webgl: false, hardwareConcurrency: 1 }
  },
]

export default function RealtimeLogsPage() {
  const columns: ColumnDef<DetectionLog>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => <span className="text-zinc-500 font-mono text-xs">{row.getValue("timestamp")}</span>,
    },
    {
      accessorKey: "ip",
      header: "IP Address",
      cell: ({ row }) => <span className="font-medium text-zinc-300">{row.getValue("ip")}</span>,
    },
    {
  accessorKey: "country",
  header: "Origin",
  cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <span className="text-lg">🇱🇰</span> {/* Replace with dynamic flag based on country code */}
      <span className="text-xs text-zinc-400 uppercase tracking-widest">LKA</span>
    </div>
  ),
},
    {
      accessorKey: "action",
      header: "Result",
      cell: ({ row }) => {
        const action = row.getValue("action") as string
        return (
          <Badge 
            variant="outline" 
            className={
              action === "allow" ? "border-green-500/50 text-green-400 bg-green-500/5" :
              action === "challenge" ? "border-red-500/50 text-red-400 bg-red-500/5" :
              "border-yellow-500/50 text-yellow-400 bg-yellow-500/5"
            }
          >
            {action.toUpperCase()}
          </Badge>
        )
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const score = row.getValue("score") as number
        return (
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${score > 70 ? 'bg-green-500' : score > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${score}%` }} 
              />
            </div>
            <span className="text-xs text-zinc-400">{score}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Signals",
      cell: ({ row }) => (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-zinc-800">
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Detection Metadata</SheetTitle>
              <SheetDescription className="text-zinc-500">
                Detailed browser fingerprints for ID: {row.original.id}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
               <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase">Heuristics Trace</h4>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <span className="text-zinc-400">Webdriver:</span>
                    <span className={row.original.signals.webdriver ? "text-red-400" : "text-green-400"}>
                        {row.original.signals.webdriver ? "DETEÇTED" : "CLEAN"}
                    </span>
                    <span className="text-zinc-400">WebGL/Canvas:</span>
                    <span className={row.original.signals.webgl ? "text-green-400" : "text-red-400"}>
                        {row.original.signals.webgl ? "SUPPORTED" : "MISSING"}
                    </span>
                    <span className="text-zinc-400">CPU Cores:</span>
                    <span className="text-zinc-100">{row.original.signals.hardwareConcurrency} Cores</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase">Raw User Agent</h4>
                  <pre className="p-3 bg-black rounded border border-zinc-800 text-[10px] font-mono text-zinc-400 break-all whitespace-pre-wrap">
                    {row.original.ua}
                  </pre>
               </div>
            </div>
          </SheetContent>
        </Sheet>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Real-time Logs
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Monitoring live traffic for {data[0].ip}...
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800">
                <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search IP or Request ID..." className="pl-10 bg-zinc-950 border-zinc-800" />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-zinc-800/30 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}