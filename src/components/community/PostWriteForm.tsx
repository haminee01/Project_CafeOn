"use client";

import { PostType } from "@/types/Post";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPostMutator, updatePostMutator } from "@/api/community";
import { useToastContext } from "@/components/common/ToastProvider";

const CATEGORY_OPTIONS: { value: PostType; label: string }[] = [
  { value: "GENERAL", label: "일반" },
  { value: "QUESTION", label: "질문" },
  { value: "INFO", label: "정보" },
];

interface PostWriteFormProps {
  // 수정 페이지에서 재사용할 경우 초기값 설정을 위해 사용
  initialData?: {
    postId?: number;
    title: string;
    type: PostType;
    content: string;
  };
  postId?: number;
}

export default function PostWriteForm({
  initialData,
  postId: propPostId,
}: PostWriteFormProps) {
  const router = useRouter();
  const { showToast } = useToastContext();

  // 폼 상태 관리
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<PostType>(initialData?.type || "GENERAL");
  const [content, setContent] = useState(initialData?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 수정 모드인지 확인
  const isEditMode = !!initialData?.postId || !!propPostId;
  const targetPostId = initialData?.postId || propPostId;

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const postData = {
        title,
        type,
        content,
        Image: images.length > 0 ? images : undefined,
      };

      let response;

      if (isEditMode && targetPostId) {
        // 수정 모드: PUT API 호출
        const apiEndpoint = `/api/posts/${targetPostId}`;
        response = await updatePostMutator(apiEndpoint, { arg: postData });
        showToast("게시글이 수정되었습니다.", "success");
        router.push(`/community/${targetPostId}`);
      } else {
        // 작성 모드: POST API 호출
        const apiEndpoint = "/api/posts";
        response = await createPostMutator(apiEndpoint, { arg: postData });
        showToast("게시글이 작성되었습니다.", "success");
        router.push(`/community/${response.id}`);
      }
    } catch (error) {
      console.error("게시글 제출 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "게시글 작성에 실패했습니다.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 이미지 첨부 핸들러 (리뷰와 동일)
  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - images.length); // 최대 5개까지
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));

      setImages((prev) => [...prev, ...newFiles]);
      setImagePreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // 이미지 영역 클릭 핸들러
  const handleImageAreaClick = () => {
    document.getElementById("file-upload")?.click();
  };

  // 컴포넌트 언마운트 시 메모리 정리 (리뷰와 동일)
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const actionText = isEditMode ? "수정" : "작성";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{`게시글 ${actionText}`}</h1>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 1. 제목 및 카테고리 */}
      <div className="flex space-x-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PostType)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-[#6E4213] focus:border-[#6E4213] bg-white"
          style={{ accentColor: "#6E4213" }}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="제목을 입력하세요 (필수)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-[#6E4213] focus:border-[#6E4213]"
          maxLength={100}
        />
      </div>

      {/* 2. 내용 */}
      <div>
        <textarea
          placeholder="내용을 입력하세요 (필수)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-[#6E4213] focus:border-[#6E4213] resize-y min-h-[300px]"
          rows={10}
          maxLength={5000}
        />
        <p className="text-right text-sm text-gray-500 mt-1">
          {content.length} / 5000
        </p>
      </div>

      {/* 3. 이미지 첨부 (리뷰와 동일한 UI) */}
      <div className="space-y-4">
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageAttach}
          className="hidden"
        />
        {imagePreviewUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={handleImageAreaClick}
            className="bg-gray-200 h-64 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400"
          >
            <svg
              className="w-12 h-12 text-gray-600 mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-gray-600 text-sm">
              사진을 첨부하려면 클릭하세요
            </p>
            <p className="text-gray-400 text-xs mt-1">최대 5장까지 첨부 가능</p>
          </div>
        )}

        {imagePreviewUrls.length > 0 && imagePreviewUrls.length < 5 && (
          <button
            type="button"
            onClick={handleImageAreaClick}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold border-2 border-dashed border-gray-400"
          >
            + 사진 더 추가하기
          </button>
        )}
      </div>

      {/* 4. 액션 버튼 */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isSubmitting || !title.trim() || !content.trim()
              ? "bg-[#999999] text-white cursor-not-allowed"
              : "bg-[#6E4213] text-white hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? "저장 중..." : `게시글 ${actionText}`}
        </button>
      </div>
    </form>
  );
}
