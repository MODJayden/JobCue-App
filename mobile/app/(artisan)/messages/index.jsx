import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  TextInput,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import {
  getUserChats,
  getUnreadCount,
  initializeSocket,
  setupSocketListeners,
  getSocket,
} from "@/store/chat";

const Chat = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const hasInitialized = useRef(false);
  const socketInitialized = useRef(false);
  const participantCacheRef = useRef({}); // ✅ store chatId → participant info

  const userType = user?.role;

  // Initial data fetch
  useEffect(() => {
    if (!hasInitialized.current && user?.userId) {
      hasInitialized.current = true;
      const data = { userId: user.userId, userRole: userType };
      Promise.all([dispatch(getUserChats(data)), dispatch(getUnreadCount(data))])
        .finally(() => setIsInitialLoading(false));
    }
  }, [user?.userId, userType, dispatch]);

  // Socket initialization
  useEffect(() => {
    if (!socketInitialized.current && user?.userId) {
      socketInitialized.current = true;
      initializeSocket(user.userId);
      setupSocketListeners(dispatch);

      return () => {
        const socketInstance = getSocket();
        if (socketInstance) {
          socketInstance.off("chat_updated");
          socketInstance.off("user_typing");
        }
        socketInitialized.current = false;
      };
    }
  }, [user?.userId, dispatch]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = { userId: user.userId, userRole: userType };
    await Promise.all([dispatch(getUserChats(data)), dispatch(getUnreadCount(data))]);
    setRefreshing(false);
  }, [dispatch, user?.userId, userType]);

  // Filtering helpers
  const filters = [
    { id: "all", label: "All", icon: "chatbubbles" },
    { id: "unread", label: "Unread", icon: "ellipse" },
    { id: "active", label: "Active", icon: "checkmark-done" },
  ];

  const formatTimestamp = useCallback((timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[messageDate.getDay()];
    }
    return messageDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  const getUnreadCountForChat = useCallback(
    (chat) =>
      userType === "customer"
        ? chat.customerUnreadCount || 0
        : chat.artisanUnreadCount || 0,
    [userType]
  );

  const getOtherParticipant = useCallback(
    (chat) => (userType === "customer" ? chat.participants?.artisan : chat.participants?.customer),
    [userType]
  );

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  // Avatar Component
  const Avatar = ({ uri, name, size = 56, online = false }) => (
    <View className="relative">
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#F3F4F6" }}
        />
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
          <Text style={{ color: "white", fontWeight: "bold", fontSize: size / 2.5 }}>
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
            width: size * 0.28,
            height: size * 0.28,
            backgroundColor: "#10B981",
            borderRadius: 100,
            borderWidth: 2,
            borderColor: "#fff",
          }}
        />
      )}
    </View>
  );

  // ✅ FIXED: Cache participant info with better profile picture handling
  useEffect(() => {
    if (Array.isArray(chats)) {
      chats.forEach((chat) => {
        const id = chat._id;
        const p = getOtherParticipant(chat);
        if (!id || !p?.userId) return;

        const name = p.userId.name;
        
        // ✅ FIXED: Better profile picture fallback chain
        const avatar = 
          p.userId?.profilePicture || // First try userId.profilePicture (for customers)
          p.media?.profilePicture?.url || // Then try media.profilePicture.url (for artisans)
          p.profilePicture || // Then try direct profilePicture
          participantCacheRef.current[id]?.avatar; // Finally use cached value
        
        const isOnline = p.availability?.isAvailable;

        participantCacheRef.current[id] = {
          name: name || participantCacheRef.current[id]?.name || "User",
          avatar: avatar || participantCacheRef.current[id]?.avatar,
          isOnline:
            typeof isOnline === "boolean"
              ? isOnline
              : participantCacheRef.current[id]?.isOnline ?? false,
        };
      });
    }
  }, [chats, getOtherParticipant]);

  // Filtered chat list
  const filteredChats = useMemo(() => {
    if (!Array.isArray(chats)) return [];
    let filtered = [...chats];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((chat) => {
        const p = getOtherParticipant(chat);
        const name = p?.userId?.name || "";
        const business = p?.businessName || "";
        const lastMsg = chat.messages?.[chat.messages.length - 1]?.content || "";
        return (
          name.toLowerCase().includes(q) ||
          business.toLowerCase().includes(q) ||
          lastMsg.toLowerCase().includes(q)
        );
      });
    }

    if (selectedFilter === "unread") {
      filtered = filtered.filter((c) => getUnreadCountForChat(c) > 0);
    } else if (selectedFilter === "active") {
      filtered = filtered.filter((c) => c.isActive);
    }

    return filtered.sort((a, b) => {
      const aTime = a.messages?.[a.messages.length - 1]?.timestamp || a.updatedAt;
      const bTime = b.messages?.[b.messages.length - 1]?.timestamp || b.updatedAt;
      return new Date(bTime) - new Date(aTime);
    });
  }, [chats, searchQuery, selectedFilter, getOtherParticipant, getUnreadCountForChat]);

  // Chat Item (uses cache)
  const ChatItem = useCallback(
    ({ chat }) => {
      const cache = participantCacheRef.current[chat._id];
      const p = getOtherParticipant(chat);
      const lastMsg = chat.messages?.[chat.messages.length - 1];
      const unreadCount = getUnreadCountForChat(chat);

      const name = cache?.name || p?.userId?.name || "User";
      const avatar = cache?.avatar || p?.userId?.profilePicture || p?.media?.profilePicture?.url;
      const isOnline = cache?.isOnline || p?.availability?.isAvailable;
      const businessName = p?.businessName;

      const preview =
        !lastMsg
          ? "No messages yet"
          : lastMsg.messageType === "image"
          ? "📷 Photo"
          : lastMsg.messageType === "location"
          ? "📍 Location"
          : lastMsg.messageType === "system"
          ? lastMsg.content
          : lastMsg.content;

      return (
        <TouchableOpacity
          onPress={() => router.push(`/messages/${chat._id}`)}
          className="bg-white px-5 py-4 border-b border-gray-100"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <View className="mr-3">
              <Avatar uri={avatar} name={name} size={56} online={isOnline} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-1 mr-2">
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {name}
                  </Text>
                  {businessName && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {businessName}
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-gray-500">
                  {formatTimestamp(lastMsg?.timestamp || chat.updatedAt)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text
                  className={`flex-1 text-sm mr-2 ${
                    unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-500"
                  }`}
                  numberOfLines={1}
                >
                  {lastMsg?.sender?.toString() === user?._id ? "You: " : ""}
                  {preview}
                </Text>

                <View className="flex-row items-center">
                  {lastMsg?.isRead && lastMsg?.sender?.toString() === user?._id && (
                    <Ionicons name="checkmark-done" size={16} color="#3B82F6" />
                  )}
                  {unreadCount > 0 && (
                    <View className="bg-[#6F4E37] rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 ml-2">
                      <Text className="text-white text-xs font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [getOtherParticipant, getUnreadCountForChat, formatTimestamp, router, user]
  );

  // UI skeleton and render
  const SkeletonItem = () => (
    <View className="bg-white px-5 py-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-full bg-gray-200 mr-3" />
        <View className="flex-1">
          <View className="h-4 bg-gray-200 rounded mb-2" style={{ width: "60%" }} />
          <View className="h-3 bg-gray-200 rounded" style={{ width: "80%" }} />
        </View>
      </View>
    </View>
  );

  const renderItem = useCallback(({ item }) => <ChatItem chat={item} />, [ChatItem]);
  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="border-b border-gray-200">
        <View className="px-5 pt-4 pb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">Messages</Text>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="create-outline" size={24} color="#6F4E37" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search messages..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-5 pb-3">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedFilter(item.id)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedFilter === item.id ? "bg-[#6F4E37]" : "bg-gray-100"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={selectedFilter === item.id ? "white" : "#6B7280"}
                  />
                  <Text
                    className={`ml-2 text-sm font-semibold ${
                      selectedFilter === item.id ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Body */}
      {isInitialLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonItem />}
          keyExtractor={(i) => i.toString()}
        />
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6F4E37"
              colors={["#6F4E37"]}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-6">
              <Ionicons name="chatbubbles-outline" size={64} color="#6F4E37" />
              <Text className="text-lg font-semibold mt-4 text-gray-800">
                No conversations found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Chat;