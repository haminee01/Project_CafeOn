import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getPosts,
  getPostDetail,
  getComments,
  createPostMutator,
  updatePostMutator,
  deletePostMutator,
  togglePostLike,
  createCommentMutator,
  updateCommentMutator,
  deleteCommentMutator,
  toggleCommentLike,
} from "@/api/community";
import {
  PostListItem,
  PostCreateResponse,
  PostUpdateResponse,
  PostDeleteResponse,
  PostLikeResponse,
  CommentCreateRequest,
  CommentCreateResponse,
  CommentUpdateResponse,
  CommentDeleteResponse,
  CommentLikeResponse,
  PostUpdateRequest,
} from "@/types/Post";

type PostsQueryParams = Parameters<typeof getPosts>[0];
type PostsQueryResult = Awaited<ReturnType<typeof getPosts>>;
type PostDetailResult = Awaited<ReturnType<typeof getPostDetail>>;
type PostCommentsResult = Awaited<ReturnType<typeof getComments>>;

type CreatePostVariables = {
  title: string;
  content: string;
  type: PostListItem["type"];
  Image?: File[];
};

type UpdatePostVariables = PostUpdateRequest & {
  postId: number;
};

type CreateCommentVariables = {
  postId: number;
  data: CommentCreateRequest;
};

type UpdateCommentVariables = {
  postId: number;
  commentId: number;
  data: { content: string };
};

export const communityKeys = {
  all: ["community"] as const,
  posts: () => [...communityKeys.all, "posts"] as const,
  postList: (params?: PostsQueryParams) =>
    [...communityKeys.posts(), { params }] as const,
  post: (postId: number | string) =>
    [...communityKeys.posts(), postId] as const,
  comments: (postId: number | string) =>
    [...communityKeys.post(postId), "comments"] as const,
};

export function usePostsQuery(
  params: PostsQueryParams,
  options?: UseQueryOptions<PostsQueryResult, Error>
) {
  return useQuery<PostsQueryResult, Error>({
    queryKey: communityKeys.postList(params),
    queryFn: () => getPosts(params),
    ...options,
  });
}

export function usePostDetailQuery(
  postId?: number,
  options?: UseQueryOptions<PostDetailResult, Error>
) {
  return useQuery<PostDetailResult, Error>({
    queryKey: communityKeys.post(postId ?? "unknown"),
    queryFn: () => getPostDetail(postId as number),
    enabled: Boolean(postId),
    ...options,
  });
}

export function usePostCommentsQuery(
  postId?: number,
  options?: UseQueryOptions<PostCommentsResult, Error>
) {
  return useQuery<PostCommentsResult, Error>({
    queryKey: communityKeys.comments(postId ?? "unknown"),
    queryFn: () => getComments(postId as number),
    enabled: Boolean(postId),
    ...options,
  });
}

export function useCreatePostMutation(
  options?: UseMutationOptions<
    PostCreateResponse,
    Error,
    CreatePostVariables,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<PostCreateResponse, Error, CreatePostVariables, unknown>({
    mutationFn: (variables) =>
      createPostMutator("/api/posts", { arg: variables }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}

export function useUpdatePostMutation(
  options?: UseMutationOptions<
    PostUpdateResponse,
    Error,
    UpdatePostVariables,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<PostUpdateResponse, Error, UpdatePostVariables, unknown>({
    mutationFn: ({ postId, ...payload }) =>
      updatePostMutator(`/api/posts/${postId}`, { arg: payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.postList(undefined),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.post(variables.postId),
      });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}

export function useDeletePostMutation(
  options?: UseMutationOptions<PostDeleteResponse, Error, number, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation<PostDeleteResponse, Error, number, unknown>({
    mutationFn: (postId) => deletePostMutator(postId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}

export function useTogglePostLikeMutation(
  options?: UseMutationOptions<PostLikeResponse, Error, number, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation<PostLikeResponse, Error, number, unknown>({
    mutationFn: (postId) => togglePostLike(postId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.post(variables),
      });
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}

export function useCreateCommentMutation(
  options?: UseMutationOptions<
    CommentCreateResponse,
    Error,
    CreateCommentVariables,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    CommentCreateResponse,
    Error,
    CreateCommentVariables,
    unknown
  >({
    mutationFn: ({ postId, data }) => createCommentMutator(postId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.comments(variables.postId),
      });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}

export function useUpdateCommentMutation(
  options?: UseMutationOptions<
    CommentUpdateResponse,
    Error,
    UpdateCommentVariables,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    CommentUpdateResponse,
    Error,
    UpdateCommentVariables,
    unknown
  >({
    mutationFn: ({ postId, commentId, data }) =>
      updateCommentMutator(postId, commentId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.comments(variables.postId),
      });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}

export function useDeleteCommentMutation(
  options?: UseMutationOptions<
    CommentDeleteResponse,
    Error,
    { postId: number; commentId: number },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    CommentDeleteResponse,
    Error,
    { postId: number; commentId: number },
    unknown
  >({
    mutationFn: ({ postId, commentId }) =>
      deleteCommentMutator(postId, commentId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.comments(variables.postId),
      });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}

export function useToggleCommentLikeMutation(
  options?: UseMutationOptions<
    CommentLikeResponse,
    Error,
    { postId: number; commentId: number },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    CommentLikeResponse,
    Error,
    { postId: number; commentId: number },
    unknown
  >({
    mutationFn: ({ commentId }) => toggleCommentLike(commentId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.comments(variables.postId),
      });
      options?.onSuccess?.(data, variables, undefined, context as never);
    },
    ...options,
  });
}
