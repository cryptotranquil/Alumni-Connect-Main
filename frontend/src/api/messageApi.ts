import type { Conversation, Message } from "../types";
import { api, getErrorMessage } from "./client";

export async function getConversationsApi(): Promise<Conversation[]> {
  try {
    const { data } = await api.get<Conversation[]>("/messages/conversations");
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch conversations"));
  }
}

export async function getMessagesApi(userId: string): Promise<Message[]> {
  try {
    const { data } = await api.get<Message[]>(`/messages/${userId}`);
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch messages"));
  }
}

export async function sendMessageApi(
  receiverId: string,
  message: string,
): Promise<Message> {
  try {
    const { data } = await api.post<Message>("/messages", {
      receiverId,
      message,
    });
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to send message"));
  }
}
