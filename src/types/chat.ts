export interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
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
