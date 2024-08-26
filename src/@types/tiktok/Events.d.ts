type TikTokEvent = TikTokLikeEvent | TikTokGiftEvent | TikTokMemberEvent | TikTokFollowEvent;

interface UserDetails {
  createTime: string;
  bioDescription: string;
  profilePictureUrls: string[];
}

interface FollowInfo {
  followingCount: number;
  followerCount: number;
  followStatus: number;
  pushStatus: number;
}

interface Gift {
    gift_id: number;
    repeat_count: number;
    repeat_end: number;
    gift_type: number;
}

interface UserBadge {
  badgeSceneType: number;
  type: string;
  name?: string;
  displayType?: number;
  url?: string;
  privilegeId?: string;
  level?: number;
}

interface TikTokJoinEvent {
    eventType: 'join';
    actionId: number;
    userId: string;
    secUid: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    followRole: number;
    userBadges: UserBadge[];
    userSceneTypes: number[];
    userDetails: UserDetails;
    followInfo: FollowInfo;
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    topGifterRank: number | null;
    gifterLevel: number;
    teamMemberLevel: number;
    msgId: string;
    createTime: string;
    displayType: string;
    label: string;
}

interface TikTokChatEvent {
    eventType: 'chat';
    emotes: any[];
    comment: string;
    userId: string;
    secUid: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    followRole: number;
    userBadges: UserBadge[];
    userSceneTypes: number[];
    userDetails: UserDetails;
    followInfo: FollowInfo;
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    topGifterRank: number | null;
    gifterLevel: number;
    teamMemberLevel: number;
    msgId: string;
    createTime: string;
}

interface TikTokShareEvent {
    userId: string;
    secUid: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    followRole: number;
    userBadges: UserBadge[];
    userSceneTypes: number[];
    userDetails: UserDetails;
    followInfo: FollowInfo;
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    topGifterRank: number | null;
    gifterLevel: number;
    teamMemberLevel: number;
    msgId: string;
    createTime: string;
    displayType: string;
    label: string;
}

interface TikTokLikeEvent {
  eventType: 'like';
  totalLikeCount: number;
  likeCount: number;
  userId: string;
  secUid: string;
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
  followRole: number;
  userBadges: UserBadge[];
  userSceneTypes: number[];
  userDetails: UserDetails;
  followInfo: FollowInfo;
  isModerator: boolean;
  isNewGifter: boolean;
  isSubscriber: boolean;
  topGifterRank: number | null;
  gifterLevel: number;
  teamMemberLevel: number;
  createTime: string;
  msgId: string;
  displayType: string;
  label: string;
}

interface TikTokGiftEvent {
  eventType: 'gift';
  giftId: number;
  repeatCount: number;
  groupId: string;
  userId: string;
  secUid: string;
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
  followRole: number;
  userBadges: UserBadge[];
  userSceneTypes: number[];
  userDetails: UserDetails;
  followInfo: FollowInfo;
  isModerator: boolean;
  isNewGifter: boolean;
  isSubscriber: boolean;
  topGifterRank: number | null;
  gifterLevel: number;
  teamMemberLevel: number;
  msgId: string;
  createTime: string;
  displayType: string;
  label: string;
  repeatEnd: boolean;
  gift: Gift;
  describe: string;
  giftType: number;
  diamondCount: number;
  giftName: string;
  giftPictureUrl: string;
  timestamp: number;
  receiverUserId: string;
}

interface TikTokMemberEvent {
  eventType: 'member';
  uniqueId: string;
  nickname: string;
}

interface TikTokFollowEvent {
  eventType: 'follow';
  userId: string;
  secUid: string;
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
  followRole: number;
  userBadges: UserBadge[];
  userSceneTypes: number[];
  userDetails: UserDetails;
  followInfo: FollowInfo;
  isModerator: boolean;
  isNewGifter: boolean;
  isSubscriber: boolean;
  topGifterRank: number | null;
  gifterLevel: number;
  teamMemberLevel: number;
  msgId: string;
  createTime: string;
  displayType: string;
  label: string;
}

type ControlEvents =
  | "disconnected"
  | "streamEnd"
  | "rawData"
  | "websocketConnected"
  | "error";
  
type MessageEvents =
  | "member"
  | "chat"
  | "gift"
  | "roomUser"
  | "like"
  | "social"
  | "emote"
  | "envelope"
  | "questionNew"
  | "linkMicBattle"
  | "linkMicArmies"
  | "liveIntro"
  | "subscribe";

type CustomEvents = "follow" | "share";