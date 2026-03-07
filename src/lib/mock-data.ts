export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertSentiment = 'positive' | 'negative' | 'neutral';
export type AlertType = 'phishing_link' | 'impersonation' | 'keyword_mention';
export type Platform = 'X';
export type AlertStatus = 'active' | 'resolved';

export interface SocialAlert {
  id: string;
  type: AlertType;
  platform: Platform;
  riskLevel: AlertSeverity;
  sentiment: AlertSentiment;
  content: string;
  author: string;
  keyword: string;
  createdAt: string;
  status: AlertStatus;
}

export const mockAlerts: SocialAlert[] = [
  {
    id: '1',
    type: 'phishing_link',
    platform: 'X',
    riskLevel: 'Critical',
    sentiment: 'negative',
    content: 'URGENT: Your CynoGuard account has been compromised. Reset your password immediately at cynoguard-security.xyz/reset to avoid suspension.',
    author: '@security_alerts_99',
    keyword: 'CynoGuard',
    createdAt: 'Feb 22, 2026, 01:45 PM',
    status: 'active',
  },
  {
    id: '2',
    type: 'impersonation',
    platform: 'X',
    riskLevel: 'Critical',
    sentiment: 'negative',
    content: 'Official CynoGuard Support here. DM us your login credentials and we will fix any issues with your account right away. We\'re here to help!',
    author: '@CynoGuard_Support',
    keyword: 'CynoGuard Support',
    createdAt: 'Feb 22, 2026, 01:12 PM',
    status: 'active',
  },
  {
    id: '3',
    type: 'keyword_mention',
    platform: 'X',
    riskLevel: 'Low',
    sentiment: 'positive',
    content: 'Just migrated our bot detection from Cloudflare to CynoGuard. The false positive rate dropped from 2.1% to 0.03%. Genuinely impressed with the ML model accuracy.',
    author: '@devops_eng',
    keyword: 'bot detection',
    createdAt: 'Feb 21, 2026, 11:32 AM',
    status: 'active',
  },
  {
    id: '4',
    type: 'phishing_link',
    platform: 'X',
    riskLevel: 'High',
    sentiment: 'negative',
    content: 'Free CynoGuard Enterprise licenses available! Click here: bit.ly/cyno-free-enterprise',
    author: '@ecommerce_deals',
    keyword: 'CynoGuard login',
    createdAt: 'Feb 20, 2026, 03:22 PM',
    status: 'active',
  },
  {
    id: '5',
    type: 'impersonation',
    platform: 'X',
    riskLevel: 'Medium',
    sentiment: 'negative',
    content: 'CynoGuard Dashboard down for maintenance. Use our backup dashboard at cyno-backup-dash.com for the next 2 hours.',
    author: '@CynoGuard_Status',
    keyword: 'CynoGuard dashboard',
    createdAt: 'Feb 20, 2026, 09:15 AM',
    status: 'active',
  },
  {
    id: '6',
    type: 'keyword_mention',
    platform: 'X',
    riskLevel: 'Low',
    sentiment: 'positive',
    content: 'The new CynoGuard API documentation is incredibly well-written. Integration took us less than 2 hours.',
    author: '@tech_solutions',
    keyword: 'CynoGuard API',
    createdAt: 'Feb 19, 2026, 02:45 PM',
    status: 'resolved',
  },
  {
    id: '7',
    type: 'phishing_link',
    platform: 'X',
    riskLevel: 'Medium',
    sentiment: 'negative',
    content: 'Free CynoGuard Enterprise licenses available! CynoGuard is now offering free enterprise licenses for a limited time.',
    author: '@free_software_deals',
    keyword: 'CynoGuard pricing',
    createdAt: 'Feb 18, 2026, 05:30 PM',
    status: 'active',
  },
  {
    id: '8',
    type: 'keyword_mention',
    platform: 'X',
    riskLevel: 'Low',
    sentiment: 'positive',
    content: 'Using CynoGuard for 6 months now. Best security investment we\'ve made. The threat detection accuracy is incredible.',
    author: '@security_first',
    keyword: 'CynoGuard',
    createdAt: 'Feb 17, 2026, 10:20 AM',
    status: 'active',
  },
];
