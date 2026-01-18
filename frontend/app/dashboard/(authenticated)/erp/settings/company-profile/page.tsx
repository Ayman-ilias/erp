"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompanyProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new companies list page
    router.replace("/dashboard/erp/settings/companies");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground">Redirecting to Companies page...</p>
    </div>
  );
}
