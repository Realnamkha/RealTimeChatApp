export const SupportedMessage = {
  AddChat: "ADD_CHAT",
  UpdateChat: "UPDATE_CHAT",
};

export const createOutgoingAddChatMessage = (payload) => ({
  type: SupportedMessage.AddChat,
  payload,
});

export const createOutgoingUpdateChatMessage = (partialPayload) => ({
  type: SupportedMessage.UpdateChat,
  payload: partialPayload, // partialPayload can have some or all fields
});
