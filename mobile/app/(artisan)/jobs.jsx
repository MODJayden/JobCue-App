import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { getArtisanByUserId } from "../../store/artisan";
import {
  getBookingForArtisan,
  updateSingleArtisanBooking,
} from "@/store/booking";
import { socket } from "@/socket/serviceSocket";
import ArtisanPriceProposalModal from "../../components/ArtisanPriceProposalModal";
import ArtisanProblemImagePreviewModal from "../../components/ArtisanProblemImagePreviewModal";

const Jobs = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { artisan } = useSelector((state) => state.artisan);
  const { artisanBookings: bookings, isLoading } = useSelector(
    (state) => state.booking
  );
  const { user } = useSelector((state) => state.auth);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proposedPrice, setProposedPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load data on mount
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

  // Socket connection for real-time updates
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

  // Status tabs
  const statusTabs = useMemo(
    () => [
      {
        id: "all",
        label: "All",
        icon: "apps",
        count: bookings?.length || 0,
      },
      {
        id: "pending",
        label: "Pending",
        icon: "time",
        count: bookings?.filter((b) => b.status === "pending").length || 0,
        color: "#F59E0B",
      },
      {
        id: "confirmed",
        label: "Confirmed",
        icon: "checkmark-circle",
        count: bookings?.filter((b) => b.status === "confirmed").length || 0,
        color: "#3B82F6",
      },
      {
        id: "in_progress",
        label: "In Progress",
        icon: "construct",
        count: bookings?.filter((b) => b.status === "in_progress").length || 0,
        color: "#8B5CF6",
      },
      {
        id: "price_proposed",
        label: "Price Proposed",
        icon: "money",
        count: bookings?.filter((b) => b.status === "price_proposed").length || 0,
        color: "#8B5CF6",
      },
      {
        id: "completed",
        label: "Completed",
        icon: "checkmark-done",
        count: bookings?.filter((b) => b.status === "completed").length || 0,
        color: "#10B981",
      },
    ],
    [bookings]
  );

  // Filter options
  const filterOptions = [
    { id: "all", label: "All Jobs", icon: "briefcase" },
    { id: "emergency", label: "Emergency", icon: "flash" },
    { id: "today", label: "Today", icon: "calendar" },
    { id: "upcoming", label: "Upcoming", icon: "time" },
    { id: "high_value", label: "High Value", icon: "cash" },
  ];

  // Format date
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  }, []);

  // Get status color
  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-700" },
      in_progress: { bg: "bg-purple-100", text: "text-purple-700" },
      completed: { bg: "bg-green-100", text: "text-green-700" },
      cancelled: { bg: "bg-red-100", text: "text-red-700" },
    };
    return colors[status] || colors.pending;
  }, []);

  // Process booking data
  const processBooking = useCallback(
    (booking) => {
      const customer = booking.customer;
      const service = booking.service;
      const statusColor = getStatusColor(booking.status);

      return {
        ...booking,
        displayName: customer?.userId?.name || "Customer",
        customerAvatar:
          customer?.userId?.profilePicture || "https://via.placeholder.com/40",
        serviceName: service?.name || "Service",
        serviceIcon: service?.icon || "🔧",
        statusColor,
        statusText: booking.status.replace("_", " ").toUpperCase(),
        locationText: booking.location?.address || "Location not set",
        dateText: formatDate(booking.scheduledDate),
        timeText: `${booking.timeSlot?.start || ""} - ${
          booking.timeSlot?.end || ""
        }`,
        estimatedBudget: booking.proposedPrice?.total
          ? booking.proposedPrice.total.toFixed(2)
          : "Not set",
        proposedPrice: booking.proposedPrice?.total > 0,
        hasPhotos: booking.problemPhotos?.length > 0,
        photoCount: booking.problemPhotos?.length || 0,
      };
    },
    [formatDate, getStatusColor]
  );

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    let filtered = bookings.map(processBooking);

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((b) => b.status === selectedStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.displayName.toLowerCase().includes(query) ||
          b.serviceName.toLowerCase().includes(query) ||
          b.locationText.toLowerCase().includes(query) ||
          b.problemDescription?.toLowerCase().includes(query)
      );
    }

    // Additional filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedFilter === "emergency") {
      filtered = filtered.filter((b) => b.isEmergency);
    } else if (selectedFilter === "today") {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      });
    } else if (selectedFilter === "upcoming") {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        return bookingDate >= today && b.status !== "completed";
      });
    } else if (selectedFilter === "high_value") {
      filtered = filtered.filter((b) => b.proposedPrice?.total >= 500);
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)
    );
  }, [bookings, selectedStatus, searchQuery, selectedFilter, processBooking]);

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

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedFilter("all");
    setShowFilterModal(false);
  }, []);

  // Handle booking modal open
  const handleViewBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setProposedPrice(booking.proposedPrice?.total?.toString() || "");
    setNotes(booking.proposedPrice?.note || "");
    setShowBookingModal(true);
  }, []);

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

  // Booking Card Component
  const BookingCard = useCallback(
    ({ booking }) => (
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
                  {booking.photoCount} photo
                  {booking.photoCount !== 1 ? "s" : ""}
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
            <Text className="text-sm text-gray-600 ml-1">
              {booking.dateText}
            </Text>
          </View>
        </View>

        {booking.timeSlot && (
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {booking.timeText}
            </Text>
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
    ),
    [handleViewBooking]
  );

  // Skeleton Card
  const SkeletonCard = () => (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5">
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-xl bg-gray-200 mr-3" />
        <View className="flex-1">
          <View
            className="h-4 bg-gray-200 rounded mb-2"
            style={{ width: "70%" }}
          />
          <View className="h-3 bg-gray-200 rounded" style={{ width: "40%" }} />
        </View>
        <View className="w-20 h-7 bg-gray-200 rounded-full" />
      </View>
      <View className="w-24 h-6 bg-gray-200 rounded-full mb-3" />
      <View className="bg-gray-100 rounded-xl p-3 mb-3">
        <View className="h-3 bg-gray-200 rounded mb-2" />
        <View className="h-3 bg-gray-200 rounded" style={{ width: "70%" }} />
      </View>
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View>
          <View
            className="h-3 bg-gray-200 rounded mb-2"
            style={{ width: 60 }}
          />
          <View className="h-4 bg-gray-200 rounded" style={{ width: 80 }} />
        </View>
        <View className="w-32 h-9 bg-gray-200 rounded-full" />
      </View>
    </View>
  );

  // Status Tab Component
  const StatusTab = useCallback(
    ({ tab }) => {
      const isActive = selectedStatus === tab.id;
      return (
        <TouchableOpacity
          onPress={() => setSelectedStatus(tab.id)}
          className={`px-4 py-2.5 rounded-full mr-2 ${
            isActive ? "bg-[#6F4E37]" : "bg-gray-100"
          }`}
        >
          <View className="flex-row items-center">
            <Ionicons
              name={tab.icon}
              size={16}
              color={isActive ? "white" : "#6B7280"}
            />
            <Text
              className={`text-sm font-semibold ml-2 ${
                isActive ? "text-white" : "text-gray-700"
              }`}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View
                className={`ml-2 px-2 py-0.5 rounded-full ${
                  isActive ? "bg-white/20" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedStatus]
  );

  // Empty State
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center mb-6">
        <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2">
        No Jobs Found
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-8">
        {searchQuery || selectedFilter !== "all"
          ? "Try adjusting your filters to see more jobs"
          : "Complete your profile and set availability to start receiving job requests"}
      </Text>
      {searchQuery || selectedFilter !== "all" ? (
        <TouchableOpacity
          onPress={resetFilters}
          className="bg-gray-200 px-6 py-3 rounded-full mb-3"
        >
          <Text className="text-gray-700 font-semibold">Clear Filters</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="bg-[#6F4E37] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Complete Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Format time slot
  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot || !timeSlot.start || !timeSlot.end) return "Time not set";
    return `${timeSlot.start} - ${timeSlot.end}`;
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
  const renderItem = useCallback(
    ({ item }) => 
      <View className="px-4">
        <BookingCard booking={item} />
      </View>
      ,
    [BookingCard]
  );
  // Check if booking has problem photos
  const hasProblemPhotos = (booking) => {
    return (
      booking?.problemPhotos &&
      Array.isArray(booking.problemPhotos) &&
      booking.problemPhotos.length > 0
    );
  };

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-5 pt-4 pb-5">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">My Jobs</Text>
              <Text className="text-sm text-gray-500 mt-1">
                {filteredBookings.length} job
                {filteredBookings.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="options" size={24} color="#6F4E37" />
              {(selectedFilter !== "all" || searchQuery) && (
                <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#6F4E37]" />
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        >
          {statusTabs.map((tab) => (
            <StatusTab key={tab.id} tab={tab} />
          ))}
        </ScrollView>
      </View>

      {/* Jobs List */}
      {isLoading && !refreshing ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonCard />}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6F4E37"
            />
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: "70%" }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                Filter Jobs
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5">
              {/* Filter Options */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Quick Filters
                </Text>
                <View className="flex-row flex-wrap">
                  {filterOptions.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      onPress={() => setSelectedFilter(filter.id)}
                      className={`px-4 py-2.5 rounded-full mr-2 mb-2 flex-row items-center ${
                        selectedFilter === filter.id
                          ? "bg-[#6F4E37]"
                          : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name={filter.icon}
                        size={16}
                        color={
                          selectedFilter === filter.id ? "white" : "#6B7280"
                        }
                      />
                      <Text
                        className={`text-sm font-semibold ml-2 ${
                          selectedFilter === filter.id
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Active Filters Summary */}
              {(selectedFilter !== "all" || searchQuery) && (
                <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm font-bold text-gray-900 mb-1">
                        Active Filters
                      </Text>
                      <View className="flex-row flex-wrap">
                        {selectedFilter !== "all" && (
                          <View className="bg-white px-2 py-1 rounded mr-2 mb-1">
                            <Text className="text-xs text-gray-700">
                              {
                                filterOptions.find(
                                  (f) => f.id === selectedFilter
                                )?.label
                              }
                            </Text>
                          </View>
                        )}
                        {searchQuery && (
                          <View className="bg-white px-2 py-1 rounded mr-2 mb-1">
                            <Text className="text-xs text-gray-700">
                              Search: {searchQuery}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={resetFilters}
                      className="bg-amber-500 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white text-xs font-bold">
                        Clear All
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Apply Button */}
            <View className="p-5 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                className="bg-[#6F4E37] py-4 rounded-xl"
              >
                <Text className="text-white font-bold text-base text-center">
                  Apply Filters ({filteredBookings.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ArtisanPriceProposalModal
        showBookingModal={showBookingModal}
        setShowBookingModal={setShowBookingModal}
        selectedBooking={selectedBooking}
        setProposedPrice={setProposedPrice}
        proposedPrice={proposedPrice}
        notes={notes}
        setNotes={setNotes}
        submitting={submitting}
        handleApproveBooking={handleApproveBooking}
        formatDate={formatDate}
        formatTimeSlot={formatTimeSlot}
        hasProblemPhotos={hasProblemPhotos}
        ProblemPhotosGrid={ProblemPhotosGrid}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      <ArtisanProblemImagePreviewModal
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        selectedImage={selectedImage}
      />
    </SafeAreaView>
  );
};

export default Jobs;
