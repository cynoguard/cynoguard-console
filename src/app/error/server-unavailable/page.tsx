"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ServerOff, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function ServerErrorPage() {
    const router = useRouter();

    const handleRetry = () => {
        router.back();
    };

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div className={cn(
            "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100",
            "flex items-center justify-center p-6"
        )}>
            <Card className={cn(
                "border-0 shadow-2xl shadow-black/10",
                "backdrop-blur-sm bg-white/90",
                "rounded-2xl overflow-hidden max-w-lg w-full"
            )}>
                <CardHeader className="text-center space-y-4 pb-4 pt-10">
                    {/* Animated Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="p-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 shadow-inner">
                                <ServerOff className="w-12 h-12 text-red-500" />
                            </div>
                            {/* Pulse ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-20" />
                        </div>
                    </div>

                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Server Unavailable
                    </CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-10 text-center space-y-6">
                    <div className="space-y-3">
                        <p className="text-slate-600 text-base leading-relaxed">
                            We couldn&apos;t connect to our servers. This might be because:
                        </p>
                        <ul className="text-sm text-slate-500 space-y-2">
                            <li className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                The server is temporarily down for maintenance
                            </li>
                            <li className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Your internet connection was interrupted
                            </li>
                            <li className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                The backend service is not running
                            </li>
                        </ul>
                    </div>

                    {/* Status indicator */}
                    <div className="py-4 px-6 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center justify-center gap-2 text-amber-700">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-sm font-medium">Awaiting connection</span>
                        </div>
                    </div>

                    {/* Developer note */}
                    <p className="text-xs text-slate-400 italic">
                        Check your browser console for detailed error information.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            onClick={handleRetry}
                            className={cn(
                                "flex-1 h-12 font-semibold",
                                "bg-black text-white hover:bg-slate-800",
                                "shadow-lg shadow-black/20 hover:shadow-xl"
                            )}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            variant="outline"
                            className="flex-1 h-12 font-semibold hover:bg-slate-50"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </div>

                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go back to previous page
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
