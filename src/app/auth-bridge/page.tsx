import AuthInitializer from "@/components/auth-initializer";
import { Suspense } from "react";

const Page = () => {
  
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <p className="animate-pulse text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AuthInitializer />
    </Suspense>
  );
};

export default Page;