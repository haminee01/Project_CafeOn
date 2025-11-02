"use client";

import { PostType } from "@/types/Post";
import { useState } from "react";
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
      console.log("=== 게시글 제출 시작 ===");
      console.log("현재 images state:", images.length, "개");

      // 1. 데이터 객체 구성
      // 유효한 이미지만 필터링
      const validImages = images.filter(
        (file) => file && file.size > 0 && file.type.startsWith("image/")
      );

      console.log("유효한 이미지:", validImages.length, "개");
      validImages.forEach((file, idx) => {
        console.log(`전송할 이미지 ${idx + 1}:`, file.name, file.size, "bytes");
      });

      const postData = {
        title,
        type,
        content,
        Image: validImages.length > 0 ? validImages : undefined,
      };

      console.log(
        "postData.Image:",
        postData.Image ? `${postData.Image.length}개` : "없음"
      );

      let response;

      if (isEditMode && targetPostId) {
        // 2-1. 수정 모드: PUT API 호출
        const apiEndpoint = `/api/posts/${targetPostId}`;
        response = await updatePostMutator(apiEndpoint, { arg: postData });
        console.log("게시글 수정 성공:", response);

        showToast("게시글이 수정되었습니다.", "success");

        // 수정 후 상세 페이지로 이동
        router.push(`/community/${targetPostId}`);
      } else {
        // 2-2. 작성 모드: POST API 호출
        const apiEndpoint = "/api/posts";
        response = await createPostMutator(apiEndpoint, { arg: postData });
        console.log("게시글 작성 성공:", response);

        showToast("게시글이 작성되었습니다.", "success");

        // 작성 후 상세 페이지로 이동
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

  // 이미지 첨부 핸들러
  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== 이미지 첨부 시작 ===");
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log("선택된 파일 개수:", files.length);

      // 유효한 이미지 파일만 필터링
      const validFiles = files.filter(
        (file) =>
          file &&
          file.size > 0 &&
          file.type.startsWith("image/") &&
          file.size <= 10 * 1024 * 1024 // 10MB 제한
      );

      console.log("유효한 파일 개수:", validFiles.length);
      validFiles.forEach((file, idx) => {
        console.log(`파일 ${idx + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      });

      // 최대 3장 제한
      if (validFiles.length > 3) {
        setError("이미지는 최대 3장까지 첨부할 수 있습니다.");
        return;
      }

      // 유효하지 않은 파일이 있으면 경고
      if (validFiles.length < files.length) {
        setError("일부 파일이 유효하지 않아 제외되었습니다.");
      } else {
        setError(null);
      }

      setImages(validFiles);
      console.log("✅ 이미지 state 업데이트 완료:", validFiles.length, "개");
    }
  };

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

      {/* 3. 이미지 첨부 (Mock) */}
      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          이미지 첨부 (최대 3장)
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageAttach}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#CDCDCD] file:text-white hover:file:bg-[#C19B6C]"
        />

        {images.length > 0 && (
          <div className="mt-3">
            <div className="text-sm text-gray-600">
              첨부된 파일: {images.map((file) => file.name).join(", ")}
            </div>
            <button
              type="button"
              onClick={() => setImages([])}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              이미지 제거
            </button>
          </div>
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
