"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Download, Star, Zap, Shield, Target, Globe } from "lucide-react"

const ruleTemplates = [
  {
    id: "tpl-001",
    name: "WordPress Protection",
    description: "Comprehensive protection for WordPress sites against common bot attacks",
    category: "CMS Protection",
    difficulty: "Easy",
    popularity: 4.8,
    downloads: 15234,
    rating: 4.9,
    author: "CynoGuard Team",
    tags: ["WordPress", "CMS", "Login Protection"],
    rules: [
      "Block wp-admin brute force attempts",
      "Protect XML-RPC endpoints",
      "Limit comment spam attempts"
    ]
  },
  {
    id: "tpl-002",
    name: "API Rate Limiting",
    description: "Advanced rate limiting rules for REST APIs and GraphQL endpoints",
    category: "API Protection",
    difficulty: "Medium",
    popularity: 4.6,
    downloads: 12450,
    rating: 4.7,
    author: "Security Experts",
    tags: ["API", "Rate Limiting", "GraphQL"],
    rules: [
      "Tiered rate limiting by endpoint",
      "Burst protection for high-traffic APIs",
      "User-based quota management"
    ]
  },
  {
    id: "tpl-003",
    name: "E-commerce Bot Protection",
    description: "Specialized rules for protecting online stores from scraping and fraud",
    category: "E-commerce",
    difficulty: "Advanced",
    popularity: 4.7,
    downloads: 9876,
    rating: 4.8,
    author: "E-commerce Security",
    tags: ["E-commerce", "Scraping", "Fraud"],
    rules: [
      "Block price scraping bots",
      "Prevent cart abandonment abuse",
      "Protect checkout processes"
    ]
  },
  {
    id: "tpl-004",
    name: "DDoS Mitigation",
    description: "Essential rules for mitigating common DDoS attack patterns",
    category: "Network Security",
    difficulty: "Advanced",
    popularity: 4.9,
    downloads: 18765,
    rating: 4.9,
    author: "Network Security Team",
    tags: ["DDoS", "Network", "Mitigation"],
    rules: [
      "SYN flood protection",
      "HTTP flood detection",
      "Amplification attack prevention"
    ]
  }
]

const categoryIcons: Record<string, React.ReactNode> = {
  "CMS Protection": <Shield className="h-4 w-4" />,
  "API Protection": <Target className="h-4 w-4" />,
  "E-commerce": <Zap className="h-4 w-4" />,
  "Network Security": <Globe className="h-4 w-4" />
}

const difficultyColors: Record<string, "default" | "secondary" | "destructive"> = {
  "Easy": "default",
  "Medium": "secondary",
  "Advanced": "destructive"
}

export function RuleTemplates() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Rule Templates
            </CardTitle>
            <CardDescription>
              Pre-built rule templates for common security scenarios
            </CardDescription>
          </div>
          <Button variant="outline">
            Browse All Templates
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {ruleTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {categoryIcons[template.category]}
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{template.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={difficultyColors[template.difficulty]}>
                  {template.difficulty}
                </Badge>
                <Badge variant="outline">{template.category}</Badge>
                <span className="text-muted-foreground">
                  {template.downloads.toLocaleString()} downloads
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  {template.rules.slice(0, 2).map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                  {template.rules.length > 2 && (
                    <li>+{template.rules.length - 2} more rules</li>
                  )}
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">by {template.author}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
