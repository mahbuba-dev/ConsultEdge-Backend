import httpStatus from "http-status";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
  CallStatus,
  MessageType,
  Prisma,
  Role,
  UserRole,
  type Attachment,
} from "../../generated/client";

type AttachmentInput = Pick<
  Attachment,
  "fileUrl" | "fileName" | "fileType" | "fileSize"
>;

const reactionUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

const messageReactionInclude = {
  user: {
    select: reactionUserSelect,
  },
} as const;

type MessageReactionWithUser = Prisma.MessageReactionGetPayload<{
  include: typeof messageReactionInclude;
}>;

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: {
    attachment: true;
    reactions: {
      include: typeof messageReactionInclude;
    };
  };
}>;

const roomInclude = {
  client: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
  expert: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
  consultation: true,
  messages: {
    take: 1,
    orderBy: { createdAt: "desc" as const },
    include: {
      attachment: true,
      reactions: {
        include: messageReactionInclude,
      },
    },
  },
};

const messageInclude = {
  attachment: true,
  reactions: {
    include: messageReactionInclude,
  },
} as const;

const mapRoleToUserRole = (role: Role): UserRole => {
  if (role === Role.CLIENT) return UserRole.CLIENT;
  if (role === Role.EXPERT) return UserRole.EXPERT;
  return UserRole.ADMIN;
};

const getCurrentClientByUserId = async (userId: string) => {
  const client = await prisma.client.findUnique({
    where: { userId },
    select: { id: true, userId: true, isDeleted: true },
  });

  if (!client || client.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Client profile not found");
  }

  return client;
};

const getCurrentExpertByUserId = async (userId: string) => {
  const expert = await prisma.expert.findUnique({
    where: { userId },
    select: { id: true, userId: true, isDeleted: true },
  });

  if (!expert || expert.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Expert profile not found");
  }

  return expert;
};

const upsertRoomForParticipants = async (
  clientId: string,
  expertId: string,
  consultationId?: string | null
) => {
  return prisma.chatRoom.upsert({
    where: {
      clientId_expertId: {
        clientId,
        expertId,
      },
    },
    update: consultationId ? { consultationId } : {},
    create: {
      clientId,
      expertId,
      ...(consultationId ? { consultationId } : {}),
    },
    include: roomInclude,
  });
};

const resolveRoomFromConsultation = async (
  roomIdentifier: string,
  userId?: string,
  role?: Role
) => {
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: roomIdentifier,
      ...(role === Role.CLIENT ? { client: { userId } } : {}),
      ...(role === Role.EXPERT ? { expert: { userId } } : {}),
    },
    select: {
      id: true,
      clientId: true,
      expertId: true,
    },
  });

  if (!consultation?.expertId) {
    return null;
  }

  return upsertRoomForParticipants(
    consultation.clientId,
    consultation.expertId,
    consultation.id
  );
};

const resolveRoomByIdentifier = async (
  roomIdentifier: string,
  userId: string,
  role: Role
) => {
  const consultationRoom = await resolveRoomFromConsultation(
    roomIdentifier,
    userId,
    role
  );

  if (consultationRoom) {
    return consultationRoom;
  }

  if (role === Role.ADMIN) {
    return null;
  }

  if (role === Role.CLIENT) {
    const client = await getCurrentClientByUserId(userId);
    const expert = await prisma.expert.findFirst({
      where: {
        isDeleted: false,
        OR: [{ id: roomIdentifier }, { userId: roomIdentifier }],
      },
      select: { id: true },
    });

    if (!expert) {
      return null;
    }

    return upsertRoomForParticipants(client.id, expert.id);
  }

  const expert = await getCurrentExpertByUserId(userId);
  const client = await prisma.client.findFirst({
    where: {
      isDeleted: false,
      OR: [{ id: roomIdentifier }, { userId: roomIdentifier }],
    },
    select: { id: true },
  });

  if (!client) {
    return null;
  }

  return upsertRoomForParticipants(client.id, expert.id);
};

const getLatestRoomForUser = async (userId: string, role: Role) => {
  if (role === Role.ADMIN) {
    return null;
  }

  if (role === Role.CLIENT) {
    const client = await getCurrentClientByUserId(userId);

    return prisma.chatRoom.findFirst({
      where: { clientId: client.id },
      include: roomInclude,
      orderBy: { updatedAt: "desc" },
    });
  }

  const expert = await getCurrentExpertByUserId(userId);

  return prisma.chatRoom.findFirst({
    where: { expertId: expert.id },
    include: roomInclude,
    orderBy: { updatedAt: "desc" },
  });
};

const getRoomWithParticipants = async (
  roomId: string,
  userId?: string,
  role?: Role
) => {
  let room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: roomInclude,
  });

  if (!room) {
    room = await prisma.chatRoom.findFirst({
      where: { consultationId: roomId },
      include: roomInclude,
      orderBy: { updatedAt: "desc" },
    });
  }

  if (!room && userId && role) {
    room = await resolveRoomByIdentifier(roomId, userId, role);
  }

  if (!room && userId && role) {
    // Handle stale room identifiers by falling back to the latest room
    // accessible by the current user.
    room = await getLatestRoomForUser(userId, role);
  }

  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, "Chat room not found");
  }

  return room;
};
const getPresenceLookup = async (userIds: string[]) => {
  const presences = await prisma.userPresence.findMany({
    where: {
      userId: { in: userIds },
    },
  });

  return new Map(presences.map((presence) => [presence.userId, presence]));
};

const buildParticipants = async (room: Awaited<ReturnType<typeof getRoomWithParticipants>>) => {
  const presenceLookup = await getPresenceLookup([room.client.userId, room.expert.userId]);

  return [
    {
      id: room.client.id,
      userId: room.client.userId,
      role: UserRole.CLIENT,
      fullName: room.client.fullName,
      name: room.client.user?.name ?? room.client.fullName,
      email: room.client.email ?? room.client.user?.email,
      profilePhoto: room.client.profilePhoto ?? room.client.user?.image ?? null,
      avatarUrl: room.client.profilePhoto ?? room.client.user?.image ?? null,
      isOnline: presenceLookup.get(room.client.userId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.client.userId)?.lastSeen ?? null,
    },
    {
      id: room.expert.id,
      userId: room.expert.userId,
      role: UserRole.EXPERT,
      fullName: room.expert.fullName,
      name: room.expert.user?.name ?? room.expert.fullName,
      title: room.expert.title,
      email: room.expert.email ?? room.expert.user?.email,
      profilePhoto: room.expert.profilePhoto ?? room.expert.user?.image ?? null,
      avatarUrl: room.expert.profilePhoto ?? room.expert.user?.image ?? null,
      isOnline: presenceLookup.get(room.expert.userId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.expert.userId)?.lastSeen ?? null,
    },
  ];
};

const formatAttachment = (attachment: Attachment | null) => {
  if (!attachment) {
    return null;
  }

  return {
    ...attachment,
    url: attachment.fileUrl,
    mimeType: attachment.fileType,
    size: attachment.fileSize,
  };
};

const formatReactions = (
  reactions: MessageReactionWithUser[],
  currentUserId?: string
) => {
  const grouped = new Map<
    string,
    {
      emoji: string;
      count: number;
      reactedByCurrentUser: boolean;
      users: Array<{
        userId: string;
        name: string;
        email: string;
        image: string | null;
      }>;
    }
  >();

  for (const reaction of reactions) {
    const existing = grouped.get(reaction.emoji);

    if (existing) {
      existing.count += 1;
      existing.reactedByCurrentUser ||= reaction.userId === currentUserId;
      existing.users.push({
        userId: reaction.userId,
        name: reaction.user.name,
        email: reaction.user.email,
        image: reaction.user.image,
      });
      continue;
    }

    grouped.set(reaction.emoji, {
      emoji: reaction.emoji,
      count: 1,
      reactedByCurrentUser: reaction.userId === currentUserId,
      users: [
        {
          userId: reaction.userId,
          name: reaction.user.name,
          email: reaction.user.email,
          image: reaction.user.image,
        },
      ],
    });
  }

  return Array.from(grouped.values());
};

const formatMessage = (
  message: MessageWithRelations,
  participants: Awaited<ReturnType<typeof buildParticipants>> = [],
  currentUserId?: string
) => ({
  ...message,
  sender: participants.find(
    (participant) => participant.userId === message.senderId || participant.id === message.senderId
  ) ?? null,
  attachment: formatAttachment(message.attachment),
  reactions: formatReactions(message.reactions, currentUserId),
});

const formatRoom = async (
  room: Awaited<ReturnType<typeof getRoomWithParticipants>>,
  currentUserId?: string
) => {
  const participants = await buildParticipants(room);
  const latestMessage = room.messages[0]
    ? formatMessage(room.messages[0], participants, currentUserId)
    : null;

  return {
    ...room,
    participants,
    lastMessage: latestMessage,
    unreadCount: 0,
  };
};

const ensureRoomAccess = async (roomId: string, userId: string, role: Role) => {
  const room = await getRoomWithParticipants(roomId, userId, role);

  if (role === Role.ADMIN) return room;

  const allowedUserId = role === Role.CLIENT ? room.client.userId : room.expert.userId;
  if (allowedUserId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden access to this chat room");
  }

  return room;
};

const getRecipientUserIdForRoom = (
  room: Awaited<ReturnType<typeof getRoomWithParticipants>>,
  senderRole: Role
) => (senderRole === Role.CLIENT ? room.expert.userId : room.client.userId);

const getRoomRealtimeTargets = async (
  roomId: string,
  senderRole?: Role,
  userId?: string
) => {
  const room = await getRoomWithParticipants(roomId, userId, senderRole);

  return {
    roomId: room.id,
    clientUserId: room.client.userId,
    expertUserId: room.expert.userId,
    recipientUserId: senderRole ? getRecipientUserIdForRoom(room, senderRole) : null,
  };
};

const getMessageForRoom = async (roomId: string, messageId: string) => {
  const message = await prisma.message.findFirst({
    where: { id: messageId, roomId },
    include: messageInclude,
  });

  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, "Message not found");
  }

  return message;
};

const notifyRecipient = async (
  roomId: string,
  senderId: string,
  senderRole: Role,
  previewText: string,
  options?: {
    type?: string;
    always?: boolean;
  }
) => {
  const room = await getRoomWithParticipants(roomId);

  const recipientUserId = getRecipientUserIdForRoom(room, senderRole);

  if (!recipientUserId || recipientUserId === senderId) {
    return;
  }

  const recipientPresence = await prisma.userPresence.findUnique({
    where: { userId: recipientUserId },
  });

  if (!options?.always && recipientPresence?.isOnline) {
    return;
  }

  await prisma.notification.create({
    data: {
      type: options?.type ?? "CHAT_MESSAGE",
      message: previewText,
      userId: recipientUserId,
    },
  });
};

const getUserRooms = async (userId: string, role: Role, expertId?: string) => {
  if (role === Role.ADMIN) {
    const rooms = await prisma.chatRoom.findMany({
      where: expertId ? { expertId } : undefined,
      include: roomInclude,
      orderBy: { updatedAt: "desc" },
    });

    return Promise.all(rooms.map((room) => formatRoom(room, userId)));
  }

  if (role === Role.CLIENT) {
    const client = await getCurrentClientByUserId(userId);

    const rooms = await prisma.chatRoom.findMany({
      where: { clientId: client.id, ...(expertId ? { expertId } : {}) },
      include: roomInclude,
      orderBy: { updatedAt: "desc" },
    });

    return Promise.all(rooms.map((room) => formatRoom(room, userId)));
  }

  const expert = await getCurrentExpertByUserId(userId);

  const rooms = await prisma.chatRoom.findMany({
    where: { expertId: expert.id },
    include: roomInclude,
    orderBy: { updatedAt: "desc" },
  });

  return Promise.all(rooms.map((room) => formatRoom(room, userId)));
};

const createOrGetRoom = async (
  userId: string,
  role: Role,
  participantIdentifier: string
) => {
  if (!participantIdentifier) {
    throw new AppError(httpStatus.BAD_REQUEST, "Participant identifier is required");
  }

  if (role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Admins cannot create chat rooms directly");
  }

  const room = await resolveRoomByIdentifier(participantIdentifier, userId, role);

  if (!room) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      role === Role.CLIENT ? "Expert not found" : "Client not found"
    );
  }

  return formatRoom(room, userId);
};

const getRoomMessages = async (roomId: string, userId: string, role: Role) => {
  const room = await ensureRoomAccess(roomId, userId, role);
  const participants = await buildParticipants(room);

  // Only fetch messages sent by the logged-in user
  const messages = await prisma.message.findMany({
    where: { roomId: room.id, senderId: userId },
    include: messageInclude,
    orderBy: { createdAt: "asc" },
  });

  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messages: messages.map((message) => formatMessage(message, participants, userId)),
  };
};

const updateRoomTimestamp = async (roomId: string) => {
  return prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  });
};

const createTextMessage = async (
  roomId: string,
  senderId: string,
  senderRole: Role,
  text: string
) => {
  if (!text?.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Message text is required");
  }

  const room = await ensureRoomAccess(roomId, senderId, senderRole);

  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole: mapRoleToUserRole(senderRole),
      type: MessageType.TEXT,
      text: text.trim(),
    },
    include: messageInclude,
  });

  await updateRoomTimestamp(room.id);
  await notifyRecipient(room.id, senderId, senderRole, "You have a new chat message.");
  const participants = await buildParticipants(room);

  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId),
  };
};

const createFileMessage = async (
  roomId: string,
  senderId: string,
  senderRole: Role,
  attachmentData: AttachmentInput
) => {
  const room = await ensureRoomAccess(roomId, senderId, senderRole);

  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole: mapRoleToUserRole(senderRole),
      type: MessageType.FILE,
      text: attachmentData.fileName,
      attachment: {
        create: {
          fileUrl: attachmentData.fileUrl,
          fileName: attachmentData.fileName,
          fileType: attachmentData.fileType,
          fileSize: attachmentData.fileSize,
        },
      },
    },
    include: messageInclude,
  });

  await updateRoomTimestamp(room.id);
  await notifyRecipient(room.id, senderId, senderRole, "You received a file in chat.");
  const participants = await buildParticipants(room);

  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId),
  };
};

const toggleMessageReaction = async (
  roomId: string,
  messageId: string,
  userId: string,
  role: Role,
  emoji: string
) => {
  const normalizedEmoji = emoji.trim();

  if (!normalizedEmoji) {
    throw new AppError(httpStatus.BAD_REQUEST, "Emoji is required");
  }

  if (normalizedEmoji.length > 32) {
    throw new AppError(httpStatus.BAD_REQUEST, "Emoji is too long");
  }

  const room = await ensureRoomAccess(roomId, userId, role);
  const message = await getMessageForRoom(room.id, messageId);

  const existingReaction = await prisma.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji,
      },
    },
  });

  if (existingReaction) {
    await prisma.messageReaction.delete({
      where: { id: existingReaction.id },
    });
  } else {
    await prisma.messageReaction.create({
      data: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji,
      },
    });
  }

  const updatedMessage = await getMessageForRoom(room.id, message.id);
  const participants = await buildParticipants(room);

  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messageId: message.id,
    emoji: normalizedEmoji,
    action: existingReaction ? "removed" : "added",
    reactions: formatReactions(updatedMessage.reactions, userId),
    message: formatMessage(updatedMessage, participants, userId),
  };
};

const createCall = async (roomId: string, userId: string, role: Role) => {
  const room = await ensureRoomAccess(roomId, userId, role);

  const call = await prisma.call.create({
    data: {
      roomId: room.id,
      status: CallStatus.ACTIVE,
      startedAt: new Date(),
      participants: {
        create: {
          userId,
          role: mapRoleToUserRole(role),
          joinedAt: new Date(),
        },
      },
    },
    include: { participants: true },
  });

  await updateRoomTimestamp(room.id);
  await notifyRecipient(room.id, userId, role, "You have an incoming chat call.", {
    type: "CHAT_CALL",
    always: true,
  });

  return call;
};

const endCall = async (callId: string) => {
  const existing = await prisma.call.findUnique({ where: { id: callId } });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Call not found");
  }

  if (existing.status === CallStatus.ENDED) {
    return existing;
  }

  await prisma.callParticipant.updateMany({
    where: { callId, leftAt: null },
    data: { leftAt: new Date() },
  });

  return prisma.call.update({
    where: { id: callId },
    data: {
      status: CallStatus.ENDED,
      endedAt: new Date(),
    },
    include: { participants: true },
  });
};

const updateCallStatus = async (callId: string, statusValue: CallStatus) => {
  if (statusValue === CallStatus.ENDED) {
    return endCall(callId);
  }

  return prisma.call.update({
    where: { id: callId },
    data: {
      status: statusValue,
      startedAt: statusValue === CallStatus.ACTIVE ? new Date() : undefined,
    },
    include: { participants: true },
  });
};


  const deleteMessage = async (roomId: string, messageId: string, userId: string, role: Role) => {
    // Ensure user has access to the room
    await ensureRoomAccess(roomId, userId, role);
    // Ensure the message belongs to the user
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true },
    });
    if (!message || message.senderId !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own messages");
    }
    // Delete the message
    const deleted = await prisma.message.delete({
      where: { id: messageId },
    });
    return deleted;
  }


export const chatService = {
  getUserRooms,
  createOrGetRoom,
  getRoomMessages,
  createTextMessage,
  createFileMessage,
  toggleMessageReaction,
  updateRoomTimestamp,
  createCall,
  endCall,
  updateCallStatus,
  getRoomRealtimeTargets,
  deleteMessage,

};

