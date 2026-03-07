export interface Keyword {
  id: string
  value: string
  isActive: boolean
  mentionCount: number
  createdAt: string
}

export const mockKeywords: Keyword[] = [
  {
    id: "kw-1",
    value: "CynoGuard",
    isActive: true,
    mentionCount: 432,
    createdAt: "2026-01-15",
  },
  {
    id: "kw-2",
    value: "bot detection",
    isActive: true,
    mentionCount: 287,
    createdAt: "2026-01-15",
  },
  {
    id: "kw-3",
    value: "CynoGuard API",
    isActive: true,
    mentionCount: 156,
    createdAt: "2026-01-20",
  },
  {
    id: "kw-4",
    value: "CynoGuard Support",
    isActive: true,
    mentionCount: 98,
    createdAt: "2026-01-22",
  },
  {
    id: "kw-5",
    value: "CynoGuard pricing",
    isActive: false,
    mentionCount: 45,
    createdAt: "2026-02-01",
  }
]