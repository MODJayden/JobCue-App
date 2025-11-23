import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { memo, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import {
  getChat,
  sendMessage,
  markMessagesAsRead,
  joinChat,
  leaveChat,
  emitTypingStart,
  emitTypingStop,
  clearCurrentChat,
  addOptimisticMessage,
  updateOptimisticMessage,
} from "@/store/chat";
import { uploadImageDirect } from "@/store/imageUpload";
import ChatSkeleton from "../../../components/ChatSkeleton";

// ========================
// Memoized Avatar Component
// ========================
const Avatar = memo(({ uri, name, size = 40, online = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <View style={{ position: "relative" }}>
      {uri && !imageError ? (
        <>
          {imageLoading && (
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#F3F4F6",
                position: "absolute",
              }}
            />
          )}
          <Image
            source={{ uri }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: "#F3F4F6",
            }}
            onError={() => setImageError(true)}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
        </>
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#6F4E37",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: size / 2.5,
            }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}
      {online && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: "#10B981",
            borderRadius: size * 0.15,
            borderWidth: 2,
            borderColor: "white",
          }}
        />
      )}
    </View>
  );
});

// ========================
// Main Chat Screen
// ========================
const InChat = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasMarkedAsReadRef = useRef(false);
  const cachedParticipantRef = useRef(null);

  const { currentChat, messages, isLoading } = useSelector(
    (state) => state.chat
  );
  const { user } = useSelector((state) => state.auth);

  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const userType = user?.role;

  // Load chat and manage lifecycle
  useEffect(() => {
    if (id) {
      dispatch(getChat(id));
      joinChat(id);
      return () => {
        leaveChat(id);
        dispatch(clearCurrentChat());
        hasMarkedAsReadRef.current = false;
      };
    }
  }, [id, dispatch]);

  // Cache participant
  useEffect(() => {
    if (!currentChat) return;

    const participant =
      userType === "customer"
        ? currentChat.participants?.artisan
        : currentChat.participants?.customer;

    if (participant && participant.userId) {
      const name = participant.userId.name;
      const avatar =
        participant.media?.profilePicture?.url ||
        participant.userId?.profilePicture; // ✅ use customer profile picture
      const isOnline = participant.availability?.isAvailable;

      cachedParticipantRef.current = {
        name: name || cachedParticipantRef.current?.name || "User",
        avatar: avatar || cachedParticipantRef.current?.avatar,
        isOnline:
          typeof isOnline === "boolean"
            ? isOnline
            : cachedParticipantRef.current?.isOnline ?? false,
      };
    }
  }, [currentChat, userType]);

  // Mark messages as read
  useEffect(() => {
    if (
      id &&
      messages?.length > 0 &&
      !hasMarkedAsReadRef.current &&
      cachedParticipantRef.current
    ) {
      const data = { userId: user?.userId, userRole: userType };
      dispatch(markMessagesAsRead({ id, data }));
      hasMarkedAsReadRef.current = true;
    }
  }, [id, messages?.length, dispatch, user?.userId, userType]);

  // Typing handler
  const handleTextChange = useCallback(
    (text) => {
      setMessageText(text);
      if (!isTyping && text.trim()) {
        setIsTyping(true);
        emitTypingStart(id, user._id);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          emitTypingStop(id, user._id);
        }
      }, 2000);
    },
    [isTyping, id, user?._id]
  );

  // Auto scroll to last message
  useEffect(() => {
    if (messages?.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 150);
    }
  }, [messages?.length]);

  const participantName = cachedParticipantRef.current?.name || "User";
  const participantAvatar = cachedParticipantRef.current?.avatar;
  const isOnline = cachedParticipantRef.current?.isOnline || false;

  const formatMessageTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const isMyMessage = useCallback(
    (message) => {
      const senderId =
        message.senderId || message.sender?._id || message.sender;
      const currentUserId = user?._id || user?.userId;
      return senderId?.toString() === currentUserId?.toString();
    },
    [user]
  );

  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    const groups = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();
      if (messageDate !== currentDate) {
        groups.push({
          type: "date",
          date: messageDate,
          id: `date-${messageDate}`,
        });
        currentDate = messageDate;
      }
      groups.push({ type: "message", ...message });
    });

    return groups;
  }, [messages]);

  // Image Picker
  const pickImage = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.7,
      });

      if (result && !result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
        setShowImageModal(true);
      }
    } catch {
      Alert.alert("Error", "Failed to open image picker.");
    }
  }, []);

  // Send text message
  const sendMessages = useCallback(async () => {
    if (!messageText.trim()) return;
    const tempId = `temp-${Date.now()}`;
    const content = messageText.trim();

    dispatch(
      addOptimisticMessage({
        tempId,
        content,
        messageType: "text",
        senderId: user.userId,
        senderType: userType,
      })
    );
    setMessageText("");

    try {
      const response = await dispatch(
        sendMessage({
          id,
          content,
          messageType: "text",
          senderId: user.userId,
          senderType: userType,
        })
      ).unwrap();

      if (response?.data?.message?._id) {
        dispatch(
          updateOptimisticMessage({
            tempId,
            serverId: response.data.message._id,
            status: "sent",
          })
        );
      }
    } catch {
      dispatch(updateOptimisticMessage({ tempId, status: "failed" }));
    }
  }, [messageText, id, user, userType, dispatch]);

  // Send image message
  const sendImage = useCallback(async () => {
    if (!selectedImage) return;
    setShowImageModal(false);

    const tempId = `temp-${Date.now()}`;
    const imageUri = selectedImage.uri;

    dispatch(
      addOptimisticMessage({
        tempId,
        content: imageUri,
        messageType: "image",
        senderId: user.userId,
        senderType: userType,
      })
    );

    try {
      const res = await dispatch(uploadImageDirect(imageUri)).unwrap();
      const imageUrl = res?.secure_url || res?.url;
      if (imageUrl) {
        const response = await dispatch(
          sendMessage({
            id,
            content: imageUrl,
            messageType: "image",
            senderId: user.userId,
            senderType: userType,
          })
        ).unwrap();

        if (response?.data?.message?._id) {
          dispatch(
            updateOptimisticMessage({
              tempId,
              serverId: response.data.message._id,
              status: "sent",
              content: imageUrl,
            })
          );
        }
        setSelectedImage(null);
      } else throw new Error("Upload returned no URL");
    } catch (error) {
      dispatch(updateOptimisticMessage({ tempId, status: "failed" }));
      Alert.alert("Error", error.message || "Failed to send image.");
    }
  }, [selectedImage, id, user, userType, dispatch]);

  // Status icon
  const MessageStatusIcon = memo(({ status, isRead }) => {
    if (status === "pending")
      return <Ionicons name="time-outline" size={14} color="#9CA3AF" />;
    if (status === "failed")
      return <Ionicons name="alert-circle" size={14} color="#EF4444" />;
    if (isRead)
      return <Ionicons name="checkmark-done" size={14} color="#3B82F6" />;
    return <Ionicons name="checkmark-done" size={14} color="#9CA3AF" />;
  });

  const MessageBubble = memo(({ message }) => {
    const isMine = isMyMessage(message);
    const imageUri = message.content || message.mediaUrl;

    return (
      <View className={`mb-3 ${isMine ? "items-end" : "items-start"} px-4`}>
        <View className={`max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
          {message.messageType === "image" ? (
            <TouchableOpacity
              onPress={() => setViewingImage(imageUri)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: imageUri }}
                className="w-52 h-52 rounded-2xl"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View
              className={`px-4 py-2.5 rounded-2xl ${
                isMine ? "bg-[#6F4E37]" : "bg-gray-200"
              }`}
              style={
                isMine
                  ? { borderBottomRightRadius: 4 }
                  : { borderBottomLeftRadius: 4 }
              }
            >
              <Text
                className={`text-sm leading-5 ${
                  isMine ? "text-white" : "text-gray-900"
                }`}
              >
                {message.content}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-500 mr-1">
              {formatMessageTime(message.timestamp)}
            </Text>
            {isMine && (
              <MessageStatusIcon
                status={message.status}
                isRead={message.isRead}
              />
            )}
          </View>
        </View>
      </View>
    );
  });

  const renderItem = useCallback(({ item }) => {
    if (item.type === "date") {
      return (
        <View className="items-center my-4">
          <View className="bg-gray-200 px-3 py-1 rounded-full">
            <Text className="text-xs text-gray-600 font-medium">
              {item.date}
            </Text>
          </View>
        </View>
      );
    }
    return <MessageBubble message={item} />;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center">
            <Avatar
              uri={participantAvatar}
              name={participantName}
              size={40}
              online={isOnline}
            />
            <View className="ml-3">
              <Text className="text-base font-bold text-gray-900">
                {participantName}
              </Text>
              <Text className="text-xs text-gray-500">
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      {isLoading && !currentChat ? (
        <View className="flex-1 items-center justify-center">
         <ChatSkeleton />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={groupedMessages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id || item._id}
            contentContainerStyle={{
              paddingVertical: 12,
              flexGrow: 1,
              justifyContent:
                groupedMessages.length === 0 ? "center" : "flex-end",
            }}
            showsVerticalScrollIndicator={false}
          />

          {/* Message Input */}
          <View className="flex-row items-center px-4 py-3 border-t border-gray-200 bg-white">
            <TouchableOpacity
              onPress={pickImage}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="image-outline" size={30} color="#6F4E37" />
            </TouchableOpacity>

            <View className="flex-1 mx-2">
              <TextInput
                placeholder="Type a message..."
                value={messageText}
                onChangeText={handleTextChange}
                className="bg-gray-100 rounded-full px-4 py-6 text-sm text-gray-900"
                multiline
              />
            </View>

            <TouchableOpacity
              onPress={sendMessages}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="send" size={22} color="#6F4E37" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Image Viewer */}
      <Modal visible={!!viewingImage} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center">
          <TouchableOpacity
            onPress={() => setViewingImage(null)}
            className="absolute top-10 right-6 z-10"
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: viewingImage }}
            style={{ width: "90%", height: "70%", borderRadius: 16 }}
            resizeMode="contain"
          />
        </View>
      </Modal>
      {/* Selected Image Preview Modal */}
      <Modal visible={showImageModal} transparent animationType="slide">
        <View className="flex-1 bg-black/70 items-center justify-center p-6">
          {selectedImage && (
            <Image
              source={{ uri: selectedImage.uri }}
              style={{ width: "90%", height: "70%", borderRadius: 12 }}
              resizeMode="contain"
            />
          )}

          <View className="flex-row justify-center mt-4 space-x-6">
            <TouchableOpacity
              onPress={() => {
                setShowImageModal(false);
                setSelectedImage(null);
              }}
              className="px-5 py-2 rounded-full bg-gray-300 mr-3"
            >
              <Text className="text-gray-800 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                sendImage();
              }}
              className="px-5 py-2 rounded-full bg-[#6F4E37]"
            >
              <Text className="text-white font-semibold">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default InChat;
