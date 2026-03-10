import { DomainDetail } from "@/components/domain-monitoring/domain-detail";

interface DomainDetailPageProps {
    params: Promise<{ watchlistId: string }>;
}

export default async function DomainDetailPage({ params }: DomainDetailPageProps) {
    const { watchlistId } = await params;

    return (
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <DomainDetail watchlistId={watchlistId} />
        </main>
    );
}
