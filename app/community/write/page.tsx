// app/community/write/page.tsx
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import PostWriteForm from "@/components/community/PostWriteForm";

// SEO 및 메타데이터 정의
export const metadata = {
  title: "게시글 작성 | 커뮤니티",
  description: "새로운 게시글을 작성합니다.",
};

// Next.js 서버 컴포넌트
export default function CommunityWritePage() {
  return (
    <>
      <Header />

      <main className="max-w-4xl mx-auto p-4 pt-8 pb-20">
        <PostWriteForm />
      </main>

      <Footer />
    </>
  );
}
