import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import io from "socket.io-client";

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/chat`;

let socket = null;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io(process.env.EXPO_PUBLIC_API_URL, {
      transports: ["websocket"],
      auth: { userId },
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("join_user_room", userId);
    });

    socket.on("disconnect", () => console.log("❌ Socket disconnected"));
    socket.on("connect_error", (error) =>
      console.error("Socket connection error:", error)
    );
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Async Thunks
export const getUserChats = createAsyncThunk(
  "chat/getUserChats",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/all`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch chats" }
      );
    }
  }
);

export const getChat = createAsyncThunk(
  "chat/getChat",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/${chatId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch chat" }
      );
    }
  }
);

export const getChatByBooking = createAsyncThunk(
  "chat/getChatByBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch chat" }
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${messageData.id}/messages`,
        messageData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to send message" }
      );
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "chat/markMessagesAsRead",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}/read`, data);
      return { chatId: id, userRole: data.userRole, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to mark messages as read" }
      );
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "chat/getUnreadCount",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/unread-count`,data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch unread count" }
      );
    }
  }
);

export const uploadChatImage = createAsyncThunk(
  "chat/uploadChatImage",
  async (imageUri, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "chat-image.jpg",
      });

      const response = await axios.post(
        `${BASE_URL}/upload/chat-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to upload image" }
      );
    }
  }
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async ({ bookingId, customerId, artisanId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}`, {
        booking: bookingId,
        participants: { customer: customerId, artisan: artisanId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create chat" }
      );
    }
  }
);

export const closeChat = createAsyncThunk(
  "chat/closeChat",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/chats/${chatId}/close`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to close chat" }
      );
    }
  }
);

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  isUploading: false,
  error: null,
  typingUsers: {},
  pagination: { currentPage: 1, totalPages: 1, totalChats: 0 },
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Optimistic message handling (WhatsApp-like)
    addOptimisticMessage: (state, action) => {
      const { tempId, content, messageType, senderId, senderType, mediaUrl } =
        action.payload;

      const optimisticMsg = {
        _id: tempId,
        content,
        messageType,
        senderId,
        sender: senderId,
        senderType,
        timestamp: new Date().toISOString(),
        isRead: false,
        status: "pending",
        isOptimistic: true,
        mediaUrl,
      };

      state.messages.push(optimisticMsg);
    },

    updateOptimisticMessage: (state, action) => {
      const { tempId, serverId, status } = action.payload;
      const msgIndex = state.messages.findIndex((m) => m._id === tempId);

      if (msgIndex !== -1) {
        if (serverId) {
          // Replace temp ID with server ID
          state.messages[msgIndex]._id = serverId;
          state.messages[msgIndex].isOptimistic = false;
        }
        if (status) {
          state.messages[msgIndex].status = status;
        }
      }
    },

    removeOptimisticMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },

    chatUpdated: (state, action) => {
      const { eventType, chat, message } = action.payload;

      switch (eventType) {
        case "chat_created":
          if (!state.chats.find((c) => c._id === chat._id)) {
            state.chats.unshift(chat);
          }
          break;

        case "message_sent":
          const chatIndex = state.chats.findIndex((c) => c._id === chat._id);
          if (chatIndex !== -1) {
            state.chats[chatIndex] = chat;
            const [updatedChat] = state.chats.splice(chatIndex, 1);
            state.chats.unshift(updatedChat);
          }

          if (state.currentChat?._id === chat._id) {
            state.currentChat = chat;
            // Merge server messages, avoiding duplicates
            const newMessages = chat.messages || [];
            const existingIds = new Set(
              state.messages.filter((m) => !m.isOptimistic).map((m) => m._id)
            );
            const uniqueNewMessages = newMessages.filter(
              (m) => !existingIds.has(m._id)
            );

            // Remove optimistic messages that match server messages
            state.messages = state.messages.filter((m) => {
              if (!m.isOptimistic) return true;
              return !newMessages.some(
                (serverMsg) =>
                  serverMsg.content === m.content &&
                  Math.abs(
                    new Date(serverMsg.timestamp) - new Date(m.timestamp)
                  ) < 5000
              );
            });

            state.messages = [...state.messages, ...uniqueNewMessages];
          }
          break;

        case "messages_read":
          const readChatIndex = state.chats.findIndex(
            (c) => c._id === chat._id
          );
          if (readChatIndex !== -1) {
            state.chats[readChatIndex] = chat;
          }

          if (state.currentChat?._id === chat._id) {
            state.currentChat = chat;
            state.messages = state.messages.map((msg) => ({
              ...msg,
              isRead: true,
            }));
          }
          break;

        case "chat_closed":
          const closedChatIndex = state.chats.findIndex(
            (c) => c._id === chat._id
          );
          if (closedChatIndex !== -1) {
            state.chats[closedChatIndex] = chat;
          }
          if (state.currentChat?._id === chat._id) {
            state.currentChat = chat;
          }
          break;

        case "system_message_sent":
          const sysChatIndex = state.chats.findIndex((c) => c._id === chat._id);
          if (sysChatIndex !== -1) {
            state.chats[sysChatIndex] = chat;
            const [updatedChat] = state.chats.splice(sysChatIndex, 1);
            state.chats.unshift(updatedChat);
          }

          if (state.currentChat?._id === chat._id) {
            state.currentChat = chat;
            state.messages = chat.messages || [];
          }
          break;
      }
    },

    userTyping: (state, action) => {
      const { chatId, userId, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = {};
      }
      state.typingUsers[chatId][userId] = isTyping;
    },

    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },

    clearError: (state) => {
      state.error = null;
    },

    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserChats.pending, (state) => {
        if (state.chats.length === 0) state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload.data || [];
        state.unreadCount = action.payload.summary?.totalUnread || 0;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getUserChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch chats";
      })

      .addCase(getChat.pending, (state) => {
        if (!state.currentChat) state.isLoading = true;
        state.error = null;
      })
      .addCase(getChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChat = action.payload.data;
        state.messages = action.payload.data?.messages || [];
      })
      .addCase(getChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch chat";
      })

      .addCase(getChatByBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChatByBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChat = action.payload.data;
        state.messages = action.payload.data?.messages || [];
      })
      .addCase(getChatByBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch chat";
      })

      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chat, message } = action.payload.data;

        // Update current chat and messages
        if (state.currentChat?._id === chat._id) {
          state.currentChat = chat;

          // Remove optimistic message and add server message
          const tempMsg = state.messages.find(
            (m) =>
              m.isOptimistic &&
              m.content === message.content &&
              Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) <
                5000
          );

          if (tempMsg) {
            state.messages = state.messages.filter(
              (m) => m._id !== tempMsg._id
            );
          }

          if (!state.messages.find((m) => m._id === message._id)) {
            state.messages.push(message);
          }
        }

        // Update chats list
        const chatIndex = state.chats.findIndex((c) => c._id === chat._id);
        if (chatIndex !== -1) {
          state.chats[chatIndex] = chat;
          const [updatedChat] = state.chats.splice(chatIndex, 1);
          state.chats.unshift(updatedChat);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to send message";
      })

      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { chatId, userRole } = action.payload;

        const chatIndex = state.chats.findIndex((c) => c._id === chatId);
        if (chatIndex !== -1) {
          if (userRole === "customer") {
            state.chats[chatIndex].customerUnreadCount = 0;
          } else {
            state.chats[chatIndex].artisanUnreadCount = 0;
          }
        }

        if (state.currentChat?._id === chatId) {
          if (userRole === "customer") {
            state.currentChat.customerUnreadCount = 0;
          } else {
            state.currentChat.artisanUnreadCount = 0;
          }
          state.messages = state.messages.map((msg) => ({
            ...msg,
            isRead: true,
          }));
        }

        const markedCount = action.payload.data?.markedAsRead || 0;
        state.unreadCount = Math.max(0, state.unreadCount - markedCount);
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        console.error("Failed to mark messages as read:", action.payload);
      })

      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data?.totalUnread || 0;
      })

      .addCase(uploadChatImage.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadChatImage.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(uploadChatImage.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload?.message || "Failed to upload image";
      })

      .addCase(createChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.isLoading = false;
        const newChat = action.payload.data;
        state.chats.unshift(newChat);
        state.currentChat = newChat;
        state.messages = newChat.messages || [];
      })
      .addCase(createChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to create chat";
      })

      .addCase(closeChat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(closeChat.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedChat = action.payload.data;

        const chatIndex = state.chats.findIndex(
          (c) => c._id === updatedChat._id
        );
        if (chatIndex !== -1) {
          state.chats[chatIndex] = updatedChat;
        }

        if (state.currentChat?._id === updatedChat._id) {
          state.currentChat = updatedChat;
        }
      })
      .addCase(closeChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to close chat";
      });
  },
});

export const {
  addOptimisticMessage,
  updateOptimisticMessage,
  removeOptimisticMessage,
  chatUpdated,
  userTyping,
  clearCurrentChat,
  clearError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

// Socket event listeners
export const setupSocketListeners = (dispatch) => {
  const socketInstance = getSocket();
  if (!socketInstance) return;

  socketInstance.on("chat_updated", (data) => {
    dispatch(chatUpdated(data));
  });

  socketInstance.on("user_typing", (data) => {
    dispatch(userTyping(data));
  });

  socketInstance.on("error", (error) => {
    console.error("Socket error:", error);
  });
};

// Socket actions
export const joinChat = (chatId) => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.emit("join_chat", chatId);
  }
};

export const leaveChat = (chatId) => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.emit("leave_chat", chatId);
  }
};

export const emitTypingStart = (chatId, userId) => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.emit("typing_start", { chatId, userId });
  }
};

export const emitTypingStop = (chatId, userId) => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.emit("typing_stop", { chatId, userId });
  }
};
