import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  RefreshControl,
  Modal,
  Animated,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RecordingModal from "../../../components/RecordingModal";

import NotificationModal from "../../../components/NotificationModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import FeaturedArtisans from "../../../components/FeaturedArtisans";
import LocationModal from "../../../components/LocationModal";
import RecentBookings from "../../../components/RecentBooking";
import NearbyArtisanModal from "../../../components/NearbyArtisanModal";
import OfflineFallBack from "../../../components/OfflineFallback";

const { height } = Dimensions.get("window");

export default function CustomerHomeScreen() {
  const [location, setLocation] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [nearbyArtisanModalVisible, setNearbyArtisanModalVisible] =
    useState(false);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [notifications, setNotifications] = useState([
    {
      _id: "507f1f77bcf86cd799439011",
      user: "507f1f77bcf86cd799439012",
      title: "Booking Confirmed",
      message: "Your booking #BK001 has been confirmed successfully",
      type: "booking",
      relatedEntity: {
        type: "booking",
        id: "507f1f77bcf86cd799439013",
      },
      isRead: false,
      pushSent: true,
      createdAt: new Date("2024-01-15T10:30:00Z"),
    },
    {
      _id: "507f1f77bcf86cd799439014",
      user: "507f1f77bcf86cd799439012",
      title: "Payment Received",
      message: "Payment of $150 for booking #BK001 has been processed",
      type: "payment",
      relatedEntity: {
        type: "payment",
        id: "507f1f77bcf86cd799439015",
      },
      isRead: true,
      pushSent: true,
      createdAt: new Date("2024-01-15T11:15:00Z"),
    },
    {
      _id: "507f1f77bcf86cd799439016",
      user: "507f1f77bcf86cd799439012",
      title: "New Message",
      message: "You have a new message from John Doe",
      type: "chat",
      relatedEntity: {
        type: "booking",
        id: "507f1f77bcf86cd799439013",
      },
      isRead: false,
      pushSent: false,
      createdAt: new Date("2024-01-15T14:20:00Z"),
    },
    {
      _id: "507f1f77bcf86cd799439017",
      user: "507f1f77bcf86cd799439012",
      title: "System Maintenance",
      message: "Scheduled maintenance on January 20th, 2:00 AM - 4:00 AM",
      type: "system",
      isRead: false,
      pushSent: true,
      createdAt: new Date("2024-01-14T09:00:00Z"),
    },
    {
      _id: "507f1f77bcf86cd799439018",
      user: "507f1f77bcf86cd799439012",
      title: "Special Offer",
      message: "Get 20% off on your next booking! Limited time offer",
      type: "promotion",
      isRead: true,
      pushSent: true,
      createdAt: new Date("2024-01-13T16:45:00Z"),
    },
    {
      _id: "507f1f77bcf86cd799439019",
      user: "507f1f77bcf86cd799439020",
      title: "Booking Reminder",
      message: "Your booking #BK002 starts in 2 hours",
      type: "booking",
      relatedEntity: {
        type: "booking",
        id: "507f1f77bcf86cd799439021",
      },
      isRead: false,
      pushSent: false,
      createdAt: new Date("2024-01-15T15:30:00Z"),
    },
  ]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      const saved = await AsyncStorage.getItem("location");
      if (saved) setLocation(JSON.parse(saved));
      else setLocation("Select Location");
    };
    loadLocation();
  }, []);

  // Fetch notifications from your API
  const fetchNotifications = async () => {
    const response = await fetch("YOUR_API_ENDPOINT/notifications", {
      headers: {
        Authorization: `Bearer ${yourToken}`,
      },
    });
    const data = await response.json();
    setNotifications(data);
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch(`YOUR_API_ENDPOINT/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleSendImage = () => {
    setImageUploadModalVisible(true);
  };

  const updateFormData = (value) => {
    setSearch(value);
  };

  const handleSendRecording = async (formData) => {
    // Send to your backend
    /* const response = await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
   */
    // const result = await response.json();
    // Handle the artisan recommendation result
    console.log("is recording");
  };
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* HEADER SECTION */}
        <View className="bg-white px-5 pt-3  ">
          <View className="flex-row justify-between items-center mb-4">
            {/* Location */}
            <TouchableOpacity
              onPress={() => setLocationModalVisible(true)}
              className="flex-row items-center flex-1"
            >
              <Ionicons name="location-sharp" size={20} color="#6F4E37" />
              <Text className="text-gray-900 text-base font-semibold ml-1.5 mr-1">
                {location}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#6F4E37" />
            </TouchableOpacity>

            {/* Profile & Notification */}
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(true)}
                className="relative mr-2"
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#6F4E37"
                />
                <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(customer)/profile")}
                className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name="person" size={20} color="#6F4E37" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* FIND NEARBY ARTISANS CARD */}
          <View className="px-5 mt-5">
            <TouchableOpacity
              onPress={() => setNearbyArtisanModalVisible(true)}
              activeOpacity={0.8}
              className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm border border-gray-200"
            >
              <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mr-3">
                <Ionicons name="navigate" size={24} color="#6F4E37" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-bold">
                  Find Artisans Near You
                </Text>
                <Text className="text-gray-500 text-sm">
                  Locate skilled artisans nearby
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* PROMOTIONAL BANNER */}
          <View className="px-5 mt-5 rounded-2xl">
            <LinearGradient
              colors={["#b18261", "#6F4E37"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-4 flex-row items-center"
              style={{
                borderRadius: 15,
                padding: 10,
                flexDirection: "row",
              }}
            >
              <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center mr-3">
                <Ionicons name="gift" size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold">
                  First-time user?
                </Text>
                <Text className="text-white/90 text-sm">
                  Get 20% off your first booking!
                </Text>
              </View>
              <TouchableOpacity className="bg-white px-4  rounded-lg">
                <Text className="text-[#6F4E37] font-bold text-sm">
                  Book Now
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Vertical SCROLLABLE SERVICES */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-5 px-5">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="text-gray-900 text-lg font-bold ml-2">
                  Popular Services
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(customer)/artisans/services")}
                className="bg-[#6F4E37] px-4 py-2.5 rounded-full"
              >
                <Text className="text-white text-sm font-semibold">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <ModernServicesList />
          </View>

          {/* FEATURED ARTISANS */}
          <View className="px-5 mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="text-gray-900 text-lg font-bold ml-2">
                  Popular Artisans
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(customer)/artisans/PopularArtisan")
                }
                className="flex-row items-center"
              >
                <Text className="text-[#6F4E37] text-sm font-semibold mr-1">
                  See More
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>
            <FeaturedArtisans />
          </View>

          {/* RECENT BOOKINGS */}
          <View className="px-5 mt-6 ">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#6B7280" />
                <Text className="text-gray-900 text-lg font-bold ml-2">
                  Recent Bookings
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(customer)/bookings")}
                className="flex-row items-center"
              >
                <Text className="text-[#6F4E37] text-sm font-semibold mr-1">
                  View All
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>
            <RecentBookings />
          </View>
        </ScrollView>

        {/* Recording  Modal */}
        <RecordingModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSendRecording={handleSendRecording}
        />

        {/* Image Upload Modal */}
        <NearbyArtisanModal
          visible={nearbyArtisanModalVisible}
          onClose={() => setNearbyArtisanModalVisible(false)}
        />
        {/* Notification Modal */}
        <NotificationModal
          visible={notificationModalVisible}
          onClose={() => setNotificationModalVisible(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onRefresh={fetchNotifications}
        />
        {/* Location Modal */}
        <LocationModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
          onLocationSelect={(loc) => setLocation(loc)}
        />
      </SafeAreaView>
  );
}

// ============================================
// HORIZONTAL SERVICE SCROLL COMPONENT
// ============================================

function ModernServicesList() {
  const handleServicePress = useCallback(
    (service) => {
      router.push(
        `/(customer)/artisans/serviceList?serviceId=${
          service._id
        }&name=${encodeURIComponent(service.name)}`
      );
    },
    [router]
  );
  const services = [
    {
      _id: "68f549194e9d1a6ff319ba3c",
      name: "Plumber",
      description:
        "General plumbing services including leak repairs, pipe installation...",
      icon: "tool",
      library: "Feather",
      bgColor: "#EFF6FF",
      color: "#1D4ED8",
    },
    {
      _id: "68f549194e9d1a6ff319ba3d",
      name: "Electrician",
      description:
        "Electrical wiring, installations, repairs, circuit breakers...",
      icon: "zap",
      library: "Feather",
      bgColor: "#FEF3C7",
      color: "#D97706",
    },
    {
      _id: "68f549194e9d1a6ff319ba3e",
      name: "Carpenter",
      description: "Furniture making, repairs, door and window installation...",
      icon: "package",
      library: "Feather",
      bgColor: "#F3E8FF",
      color: "#7C3AED",
    },

    {
      _id: "68f549194e9d1a6ff319ba3f",
      name: "Painter",
      category: "home_repair",
      description:
        "Interior and exterior painting, wall decoration, texture painting",
      icon: "pencil",
      library: "MaterialCommunityIcons",
      bgColor: "#F3E8FF",
      color: "#7C3AED",
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="px-5">
      {services.map((service) => {
        const IconComponent =
          service.library === "Ionicons"
            ? Ionicons
            : service.library === "MaterialCommunityIcons"
            ? MaterialCommunityIcons
            : Feather;

        return (
          <TouchableOpacity
            key={service._id}
            onPress={() => handleServicePress(service)}
            className="mb-3"
          >
            <View
              className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Icon Container */}
              <View
                className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: service.bgColor }}
              >
                <IconComponent
                  name={service.icon}
                  size={26}
                  color={service.color}
                />
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-bold mb-0.5">
                  {service.name}
                </Text>
                <Text className="text-gray-500 text-sm" numberOfLines={2}>
                  {service.description}
                </Text>
              </View>

              {/* Arrow */}
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
