import { WatchlistOverview } from "@/components/domain-monitoring/watchlist-overview";

export const metadata = {
    title: "Domain Monitoring – Cynoguard Console",
    description: "Monitor and protect your domains from typosquatting and phishing attacks.",
};

export default function DomainMonitoringPage() {
    return (
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <WatchlistOverview />
        </main>
    );
}
