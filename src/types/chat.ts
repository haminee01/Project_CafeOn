export interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
  messageType?: string; // 메시지 타입 추가 (TEXT, SYSTEM 등)
}

export interface UserProfile {
  id: string;
  name: string;
}

export type Participant = UserProfile;

export interface ProfileClickHandler {
  (
    senderId: string,
    senderName: string,
    event: React.MouseEvent<HTMLElement>
  ): void;
}

export interface ChatModalProps {
  onClose: () => void;
}

export interface ChatSidebarProps {
  participants: Participant[];
  currentUserId: string;
  isNotificationOn: boolean;
  onToggleNotification: () => void;
  onClose: () => void;
  onProfileClick?: (
    user: Participant,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  onLeave?: () => void;
  title?: string;
  subtitle?: string;
}

// 내 채팅방 목록 API 타입 정의
export interface MyChatRoom {
  roomId: number;
  displayName: string;
  type: "PRIVATE" | "GROUP";
  cafeId: number | null;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  memberCount: number;
}

export interface MyChatRoomsResponse {
  message: string;
  data: {
    content: MyChatRoom[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
}
