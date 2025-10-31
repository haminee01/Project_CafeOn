// src/api/index.ts

// community.ts에서 정의된 모든 함수 및 타입을 한 번에 내보냅니다.
export * from "./community";

// fetcher.ts에서 정의된 모든 함수 및 타입을 한 번에 내보냅니다.
export * from "./fetcher";

// 이 파일을 사용하면 컴포넌트에서 다음과 같이 임포트할 수 있습니다:
// import { fetcher, getPosts, createPostMutator } from "@/api";
// (대신 기존처럼 import { createPostMutator } from "@/api/community"; 를 사용해도 무방합니다.)
