"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // admin 루트로 접속하면 카페관리 페이지로 리다이렉트
    router.replace("/admin/cafes");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">카페관리 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
