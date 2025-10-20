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
