// app/community/[postId]/page.tsx
"use client";

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import PostDetail from "@/components/community/PostDetail";
import CommentSection from "@/components/community/CommentSection";
import { getPostDetail } from "@/api/community";
import { PostDetail as PostDetailType } from "@/types/Post";
import { Comment } from "@/types/Comment";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface PostDetailPageProps {
  params: Promise<{
    postId: string;
  }>;
}

// 클라이언트 컴포넌트로 변경
export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = Number(resolvedParams.postId);

  const [post, setPost] = useState<PostDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await getPostDetail(postId);
        setPost(postData);
      } catch (err) {
        console.error("게시글 조회 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "게시글을 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // 로딩 상태
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-10 pb-20 text-center text-xl text-gray-600">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6E4213]"></div>
            <span className="ml-3">게시글을 불러오는 중...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 에러 상태
  if (error || !post) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-10 pb-20 text-center text-xl text-gray-600">
          <h1 className="text-3xl font-bold mb-5">
            게시글을 찾을 수 없습니다.
          </h1>
          <p>
            {error || `존재하지 않거나 삭제된 게시글입니다. (ID: ${postId})`}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#6E4213] text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            이전 페이지로 돌아가기
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="max-w-4xl mx-auto p-4 pt-8 pb-20">
        {/* 1. 게시글 상세 내용 (PostDetail.tsx로 props 전달) */}
        <PostDetail post={post} />

        <div className="my-10 border-t border-gray-200"></div>

        {/* 2. 댓글 섹션 (CommentSection.tsx로 props 전달) */}
        <CommentSection postId={postId} initialComments={[]} />
      </main>

      <Footer />
    </>
  );
}
