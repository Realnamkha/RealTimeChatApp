import { z } from "zod";

// Constants
export const JOIN_ROOM = "JOIN_ROOM";
export const SEND_MESSAGE = "SEND_MESSAGE";
export const UPVOTE_MESSAGE = "UPVOTE_MESSAGE";

export const SupportedMessage = {
  JoinRoom: JOIN_ROOM,
  SendMessage: SEND_MESSAGE,
  UpvoteMessage: UPVOTE_MESSAGE,
};

// Define payload schemas
export const InitMessage = z.object({
  name: z.string(),
  userId: z.string(),
  roomId: z.string(),
});

export const UserMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  message: z.string(),
});

export const UpvoteMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  chatId: z.string(),
});

// Define the incoming message schema using discriminated union
export const IncomingMessage = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SupportedMessage.JoinRoom),
    payload: InitMessage,
  }),
  z.object({
    type: z.literal(SupportedMessage.SendMessage),
    payload: UserMessage,
  }),
  z.object({
    type: z.literal(SupportedMessage.UpvoteMessage),
    payload: UpvoteMessage,
  }),
]);
