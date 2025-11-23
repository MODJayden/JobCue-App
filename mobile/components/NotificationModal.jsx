import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NotificationModal = ({
  visible,
  onClose,
  notifications = [],
  onMarkAsRead,
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return "calendar";
      case "payment":
        return "card";
      case "chat":
        return "chatbubbles";
      case "promotion":
        return "pricetag";
      case "system":
        return "notifications";
      default:
        return "notifications";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text
                  className="text-xl font-bold"
                  style={{ color: "#6F4E37" }}
                >
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: "#6F4E37" }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6F4E37" />
              </TouchableOpacity>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={() => {
                  notifications.forEach((n) => {
                    if (!n.isRead) onMarkAsRead?.(n._id);
                  });
                }}
                className="self-start"
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: "#6F4E37" }}
                >
                  Mark all as read
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications list */}
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6F4E37"
              />
            }
          >
            {notifications.length === 0 ? (
              <View className="flex-1 items-center justify-center p-8">
                <View
                  className="w-24 h-24 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: "#6F4E3710" }}
                >
                  <Ionicons
                    name="notifications-off"
                    size={48}
                    color="#6F4E37"
                  />
                </View>
                <Text className="text-gray-400 text-center text-base">
                  No notifications yet
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-2">
                  We'll notify you when something important happens
                </Text>
              </View>
            ) : (
              <View className="p-2">
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification._id}
                    onPress={() => onMarkAsRead?.(notification._id)}
                    className={`mx-2 mb-3 p-4 rounded-2xl ${
                      notification.isRead ? "bg-gray-50" : "bg-white border-2"
                    }`}
                    style={
                      !notification.isRead ? { borderColor: "#6F4E3720" } : {}
                    }
                  >
                    <View className="flex-row">
                      {/* Icon */}
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: notification.isRead
                            ? "#F5F5F5"
                            : "#6F4E37",
                        }}
                      >
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={24}
                          color={notification.isRead ? "#6F4E37" : "white"}
                        />
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-1">
                          <Text
                            className={`text-base font-bold flex-1 ${
                              notification.isRead
                                ? "text-gray-600"
                                : "text-gray-900"
                            }`}
                            style={
                              !notification.isRead ? { color: "#6F4E37" } : {}
                            }
                          >
                            {notification.title}
                          </Text>
                          {!notification.isRead && (
                            <View
                              className="w-2 h-2 rounded-full ml-2 mt-1"
                              style={{ backgroundColor: "#6F4E37" }}
                            />
                          )}
                        </View>

                        <Text
                          className={`text-sm mb-2 ${
                            notification.isRead
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </Text>

                        <View
                          className="flex-row items-center"
                          style={{ gap: 8 }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#9CA3AF"
                          />
                          <Text className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </Text>

                          {notification.type && (
                            <>
                              <View className="w-1 h-1 rounded-full bg-gray-300" />
                              <Text className="text-xs text-gray-400 capitalize">
                                {notification.type}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;
