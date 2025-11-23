import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { getArtisanByUserId } from "../../store/artisan";
import { LinearGradient } from "expo-linear-gradient";
import { getBookingForArtisan } from "@/store/booking";
import { updateSingleArtisanBooking, proposePrice } from "@/store/booking";
import { socket } from "@/socket/serviceSocket";
const { width } = Dimensions.get("window");
import ArtisanPriceProposalModal from "../../components/ArtisanPriceProposalModal";
import ArtisanProblemImagePreviewModal from "../../components/ArtisanProblemImagePreviewModal";

const ArtisanDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { artisan, isLoading: artisanLoading } = useSelector(
    (state) => state.artisan
  );
  const { user } = useSelector((state) => state.auth);
  const { artisanBookings, isLoading: bookingsLoading } = useSelector(
    (state) => state.booking
  );
  const [refreshing, setRefreshing] = useState(false);

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proposedPrice, setProposedPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load data on component mount - FIXED
  useEffect(() => {
    const loadData = async () => {
      if (user?.userId) {
        try {
          const artisanRes = await dispatch(getArtisanByUserId(user.userId));
          if (artisanRes.payload?.data?._id) {
            await dispatch(getBookingForArtisan(artisanRes.payload.data._id));
          }
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };

    loadData();
  }, [dispatch, user?.userId]);

  // Socket connection
  useEffect(() => {
    if (!artisan?._id) return;

    socket.emit("join_user_room", artisan._id);

    const handleBookingUpdated = ({ booking }) => {
      dispatch(updateSingleArtisanBooking(booking));
    };

    socket.on("booking_updated", handleBookingUpdated);

    return () => {
      socket.off("booking_updated", handleBookingUpdated);
      socket.emit("leave_user_room", artisan._id);
    };
  }, [artisan?._id, dispatch]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.userId) {
        const artisanRes = await dispatch(getArtisanByUserId(user.userId));
        if (artisanRes.payload?.data?._id) {
          await dispatch(getBookingForArtisan(artisanRes.payload.data._id));
        }
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, user?.userId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Format time slot
  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot || !timeSlot.start || !timeSlot.end) return "Time not set";
    return `${timeSlot.start} - ${timeSlot.end}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
      price_proposed: { bg: "bg-blue-100", text: "text-blue-700" },
      accepted: { bg: "bg-green-100", text: "text-green-700" },
      price_rejected: { bg: "bg-orange-100", text: "text-orange-700" },
      rejected: { bg: "bg-red-100", text: "text-red-700" },
      en_route: { bg: "bg-purple-100", text: "text-purple-700" },
      in_progress: { bg: "bg-indigo-100", text: "text-indigo-700" },
      completed: { bg: "bg-green-100", text: "text-green-700" },
      cancelled: { bg: "bg-gray-100", text: "text-gray-700" },
      disputed: { bg: "bg-red-100", text: "text-red-700" },
    };
    return statusColors[status] || statusColors.pending;
  };

  // Get status display text
  const getStatusText = (status) => {
    const statusText = {
      pending: "PENDING",
      price_proposed: "PRICE PROPOSED",
      accepted: "ACCEPTED",
      price_rejected: "PRICE REJECTED",
      rejected: "REJECTED",
      en_route: "EN ROUTE",
      in_progress: "IN PROGRESS",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
      disputed: "DISPUTED",
    };
    return statusText[status] || "PENDING";
  };

  // Check if bookings are empty or undefined
  const hasBookings = useMemo(() => {
    return (
      artisanBookings &&
      Array.isArray(artisanBookings) &&
      artisanBookings.length > 0
    );
  }, [artisanBookings]);

  // Check if booking has problem photos
  const hasProblemPhotos = (booking) => {
    return (
      booking?.problemPhotos &&
      Array.isArray(booking.problemPhotos) &&
      booking.problemPhotos.length > 0
    );
  };

  // Handle image preview
  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
    setShowImageModal(true);
  };

  // Stats calculation - FIXED
  const stats = useMemo(() => {
    if (!artisan) {
      return {
        totalEarnings: 0,
        completedJobs: 0,
        rating: 0,
        pendingBookings: 0,
      };
    }

    let completedJobs = 0;
    let pendingBookings = 0;
    let totalEarnings = 0;

    if (hasBookings && Array.isArray(artisanBookings)) {
      completedJobs = artisanBookings.filter(
        (booking) => booking?.status === "completed"
      ).length;

      pendingBookings = artisanBookings.filter(
        (booking) =>
          booking?.status === "pending" || booking?.status === "price_proposed"
      ).length;

      totalEarnings = artisanBookings
        .filter(
          (booking) => booking?.status === "completed" && booking?.proposedPrice
        )
        .reduce(
          (sum, booking) => sum + (Number(booking.proposedPrice?.total) || 0),
          0
        );
    }

    return {
      totalEarnings: totalEarnings || artisan.earnings?.total || 0,
      completedJobs: completedJobs || artisan.completedJobs || 0,
      rating: artisan.rating?.average || 0,
      pendingBookings: pendingBookings || artisan.pendingBookings || 0,
    };
  }, [artisanBookings, artisan, hasBookings]);

  // Recent bookings - FIXED
  const recentBookings = useMemo(() => {
    if (!hasBookings || !Array.isArray(artisanBookings)) return [];

    return artisanBookings
      .slice(0, 3)
      .filter((booking) => booking && typeof booking === "object")
      .map((booking) => ({
        ...booking,
        displayName:
          booking.customer?.name || booking.customer?.firstName || "Customer",
        serviceName: booking.service?.name || "Service",
        locationText:
          booking.location?.address ||
          booking.location?.city ||
          "Location not specified",
        dateText: formatDate(booking.scheduledDate),
        timeText: formatTimeSlot(booking.timeSlot),
        isEmergency: booking.isEmergency || false,
        statusColor: getStatusColor(booking.status),
        statusText: getStatusText(booking.status),
        estimatedBudget: booking.proposedPrice?.total || "Not set",
        problemDescription:
          booking.problemDescription || "No description provided",
        hasPhotos: hasProblemPhotos(booking),
        photoCount: booking.problemPhotos?.length || 0,
      }));
  }, [artisanBookings, hasBookings]);

  // Quick actions
  const quickActions = [
    {
      id: "bookings",
      icon: "calendar",
      label: "Bookings",
      color: "#3B82F6",
      gradient: ["#3B82F6", "#2563EB"],
      route: "/bookings",
    },
    {
      id: "earnings",
      icon: "wallet",
      label: "Earnings",
      color: "#10B981",
      gradient: ["#10B981", "#059669"],
      route: "/earnings",
    },
    {
      id: "profile",
      icon: "person",
      label: "Profile",
      color: "#8B5CF6",
      gradient: ["#8B5CF6", "#7C3AED"],
      route: "/profile",
    },
    {
      id: "reviews",
      icon: "star",
      label: "Reviews",
      color: "#F59E0B",
      gradient: ["#F59E0B", "#D97706"],
      route: "/reviews",
    },
  ];

  // Recent activities based on actual bookings - FIXED
  const recentActivities = useMemo(() => {
    const activities = [];

    if (hasBookings && Array.isArray(artisanBookings)) {
      // Add activities from recent bookings
      artisanBookings.slice(0, 3).forEach((booking) => {
        if (booking && typeof booking === "object") {
          activities.push({
            id: `booking-${booking._id}`,
            type: "booking",
            title: `${
              booking.status === "pending" ? "New" : "Updated"
            } booking`,
            subtitle: `${booking.service?.name || "Service"} for ${
              booking.customer?.name || "Customer"
            }`,
            time: formatDate(booking.createdAt),
            icon: "calendar",
            iconColor: "#3B82F6",
            iconBg: "#EFF6FF",
          });
        }
      });
    }

    // Add default activities if no bookings
    if (activities.length === 0) {
      activities.push(
        {
          id: "welcome-1",
          type: "welcome",
          title: "Welcome to FixIt!",
          subtitle: "Complete your profile to get started",
          time: "Just now",
          icon: "ribbon",
          iconColor: "#6F4E37",
          iconBg: "#F5F0EC",
        },
        {
          id: "welcome-2",
          type: "tip",
          title: "Get Your First Booking",
          subtitle: "Update your services and availability",
          time: "Just now",
          icon: "bulb",
          iconColor: "#F59E0B",
          iconBg: "#FFFBEB",
        }
      );
    }

    return activities;
  }, [artisanBookings, hasBookings]);

  // Handle booking modal open
  const handleViewBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setProposedPrice(booking.proposedPrice?.total?.toString() || "");
    setNotes(booking.proposedPrice?.note || "");
    setShowBookingModal(true);
  }, []);

  // Handle booking approval
  const handleApproveBooking = useCallback(async () => {
    if (!proposedPrice.trim()) {
      Alert.alert("Required", "Please enter your proposed price");
      return;
    }

    if (!notes.trim()) {
      Alert.alert("Required", "Please provide notes or reason for the price");
      return;
    }

    setSubmitting(true);

    try {
      dispatch(
        proposePrice({
          bookingId: selectedBooking._id,
          proposedPrice: {
            labor: parseFloat(proposedPrice) * 0.7,
            parts: parseFloat(proposedPrice) * 0.2,
            transport: parseFloat(proposedPrice) * 0.1,
            emergencyFee: selectedBooking.isEmergency ? 50 : 0,
            total: parseFloat(proposedPrice),
            currency: "GHS",
            note: notes,
          },
          artisanId: artisan._id,
        })
      ).then((res) => {
        if (res.payload.success) {
          Alert.alert(
            "Success",
            "Price proposal sent! Customer will be notified.",
            [
              {
                text: "OK",
                onPress: () => {
                  setShowBookingModal(false);
                  setSelectedBooking(null);
                  setProposedPrice("");
                  setNotes("");
                },
              },
            ]
          );
        }
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send price proposal");
    } finally {
      setSubmitting(false);
    }
  }, [proposedPrice, notes, selectedBooking]);

  // Stat Card Component
  const StatCard = ({ title, value, icon, color, suffix = "" }) => (
    <View
      className="bg-white rounded-2xl p-4 flex-1 mr-3"
      style={{ minWidth: (width - 60) / 2 }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {value}
        {suffix && <Text className="text-base text-gray-500"> {suffix}</Text>}
      </Text>
      <Text className="text-sm text-gray-500">{title}</Text>
    </View>
  );

  // Quick Action Button
  const QuickActionButton = ({ action }) => (
    <TouchableOpacity
      onPress={() => router.push(action.route)}
      className="items-center "
      style={{ width: (width - 80) / 4 }}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={action.gradient}
        className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
        style={{
          shadowColor: action.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
          borderRadius: 100,
        }}
      >
        <Ionicons name={action.icon} size={28} color="white" />
      </LinearGradient>
      <Text className="text-xs font-semibold text-gray-700 text-center">
        {action.label}
      </Text>
    </TouchableOpacity>
  );

  // Problem Photos Grid Component
  const ProblemPhotosGrid = ({ photos }) => {
    if (!photos || photos.length === 0) return null;

    return (
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          Problem Photos ({photos.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(photo)}
                className="relative"
              >
                <Image
                  source={{ uri: photo }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
                {index === 0 && photos.length > 1 && (
                  <View className="absolute top-1 right-1 bg-black/50 px-2 py-1 rounded">
                    <Text className="text-white text-xs">
                      +{photos.length - 1}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Updated Booking Card Component to show photo indicator
  const BookingCard = ({ booking }) => (
    <TouchableOpacity
      onPress={() => handleViewBooking(booking)}
      className="bg-white rounded-2xl p-4 mb-3"
      activeOpacity={0.7}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start mb-3">
        <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 items-center justify-center">
          <Ionicons name="person" size={20} color="#6B7280" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-gray-900">
              {booking.displayName}
            </Text>
            {booking.isEmergency && (
              <View className="bg-red-100 px-2 py-1 rounded-full">
                <Text className="text-red-700 text-xs font-bold">URGENT</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-600">{booking.serviceName}</Text>
        </View>
      </View>

      {/* Status Badge */}
      <View
        className={`${booking.statusColor.bg} px-3 py-1 rounded-full self-start mb-3`}
      >
        <Text className={`${booking.statusColor.text} text-xs font-bold`}>
          {booking.statusText}
        </Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-3 mb-3">
        <Text className="text-sm text-gray-700 mb-2" numberOfLines={2}>
          {booking.problemDescription}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="construct" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {booking.serviceName}
            </Text>
          </View>
          {booking.hasPhotos && (
            <View className="flex-row items-center">
              <Ionicons name="images" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">
                {booking.photoCount} photo{booking.photoCount !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
            {booking.locationText}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">{booking.dateText}</Text>
        </View>
      </View>

      {booking.timeSlot && (
        <View className="flex-row items-center mb-3">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">{booking.timeText}</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View>
          <Text className="text-xs text-gray-500 mb-1">
            {booking.proposedPrice ? "Proposed Price" : "Estimated Budget"}
          </Text>
          <Text className="text-base font-bold text-green-600">
            {booking.estimatedBudget === "Not set"
              ? "Not set"
              : `GHS ${booking.estimatedBudget}`}
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => handleViewBooking(booking)}
            className="bg-[#6F4E37] px-6 py-2.5 rounded-full flex-row items-center"
          >
            <Ionicons name="eye" size={16} color="white" />
            <Text className="text-white font-semibold ml-2">
              {booking.status === "pending" ? "View & Quote" : "View Details"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Activity Item
  const ActivityItem = ({ activity }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
      activeOpacity={0.7}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: activity.iconBg }}
      >
        <Ionicons name={activity.icon} size={22} color={activity.iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {activity.title}
        </Text>
        <Text className="text-sm text-gray-500">{activity.subtitle}</Text>
      </View>
      <Text className="text-xs text-gray-400">{activity.time}</Text>
    </TouchableOpacity>
  );

  // Combined loading state
  const isLoading = artisanLoading || bookingsLoading;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <LinearGradient
          colors={["#6F4E37", "#8B6F47"]}
          className="pt-12 pb-8 px-5"
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Welcome back,</Text>
              <Text className="text-white text-2xl font-bold">
                {artisan?.businessName || user?.name || "Artisan"}
              </Text>
              <Text className="text-white/70 text-sm mt-1">
                {artisan?.profession || "Professional Service Provider"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="notifications" size={24} color="white" />
              <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </TouchableOpacity>
          </View>

          {/* Availability Toggle */}
          <View className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-3 h-3 rounded-full bg-green-400 mr-3" />
                <View>
                  <Text className="text-white font-semibold text-base">
                    Available for Work
                  </Text>
                  <Text className="text-white/70 text-xs mt-0.5">
                    You're visible to customers
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="w-14 h-8 rounded-full bg-green-500 justify-center"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <View className="w-6 h-6 rounded-full bg-white shadow self-end mr-1" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View className="px-5 -mt-6 mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <StatCard
              title="Total Earnings"
              value={`GHS ${stats.totalEarnings.toLocaleString()}`}
              icon="wallet"
              color="#10B981"
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedJobs}
              icon="checkmark-circle"
              color="#3B82F6"
            />
            <StatCard
              title="Rating"
              value={stats.rating.toFixed(1)}
              icon="star"
              color="#F59E0B"
              suffix="⭐"
            />
            <StatCard
              title="Pending"
              value={stats.pendingBookings}
              icon="time"
              color="#EF4444"
            />
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row justify-between">
            {quickActions.map((action) => (
              <QuickActionButton key={action.id} action={action} />
            ))}
          </View>
        </View>

        {/* Today's Overview Card */}
        <View className="px-5 mb-6">
          <LinearGradient
            colors={["#3B82F6", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-5"
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
              borderRadius: 15,
            }}
          >
            <Text className="text-white/80 text-sm mb-2">Today's Overview</Text>
            <Text className="text-white text-3xl font-bold mb-4">
              {stats.pendingBookings}{" "}
              {stats.pendingBookings === 1 ? "Booking" : "Bookings"}
            </Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/70 text-xs mb-1">
                  Earnings Today
                </Text>
                <Text className="text-white text-xl font-bold">GHS 0.00</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/bookings")}
                className="bg-white/20 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Bookings */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                Recent Bookings
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {hasBookings
                  ? `${recentBookings.length} ${
                      recentBookings.length === 1 ? "request" : "requests"
                    }`
                  : "No bookings yet"}
              </Text>
            </View>
            {hasBookings && (
              <TouchableOpacity onPress={() => router.push("/bookings")}>
                <Text className="text-sm text-[#6F4E37] font-semibold">
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <ActivityIndicator size="large" color="#6F4E37" />
              <Text className="text-gray-400 mt-3">Loading bookings...</Text>
            </View>
          ) : hasBookings ? (
            recentBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3 text-lg font-semibold">
                No Bookings Yet
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Complete your profile and set your availability{"\n"}to start
                receiving booking requests
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                className="bg-[#6F4E37] px-6 py-3 rounded-full mt-4"
              >
                <Text className="text-white font-semibold">
                  Complete Profile
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Recent Activity
            </Text>
            <TouchableOpacity>
              <Text className="text-sm text-[#6F4E37] font-semibold">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </View>

        {/* Profile Completion */}
        {artisan && (
          <View className="px-5 mb-8">
            <View className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <View className="flex-row items-start">
                <View className="w-12 h-12 rounded-xl bg-amber-100 items-center justify-center mr-3">
                  <Ionicons name="ribbon" size={24} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">
                    Complete Your Profile
                  </Text>
                  <Text className="text-sm text-gray-600 mb-3">
                    {hasBookings
                      ? "Add more details to attract more customers"
                      : "Complete your profile to start receiving bookings"}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <View className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden mr-3">
                      <View
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: "60%" }}
                      />
                    </View>
                    <Text className="text-xs font-bold text-gray-900">60%</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/profile")}
                    className="bg-amber-500 px-4 py-2 rounded-full self-start"
                  >
                    <Text className="text-white font-semibold text-sm">
                      Complete Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Updated Booking Modal with Problem Photos */}
      <ArtisanPriceProposalModal
        showBookingModal={showBookingModal}
        setShowBookingModal={setShowBookingModal}
        selectedBooking={selectedBooking}
        submitting={submitting}
        handleApproveBooking={handleApproveBooking}
        formatDate={formatDate}
        formatTimeSlot={formatTimeSlot}
        hasProblemPhotos={hasProblemPhotos}
        ProblemPhotosGrid={ProblemPhotosGrid}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        notes={notes}
        setNotes={setNotes}
        proposedPrice={proposedPrice}
        setProposedPrice={setProposedPrice}

      />

      {/* Image Preview Modal */}
      <ArtisanProblemImagePreviewModal
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        selectedImage={selectedImage}
      />
    </View>
  );
};

export default ArtisanDashboard;
