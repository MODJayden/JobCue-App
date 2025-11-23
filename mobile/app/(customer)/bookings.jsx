import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerByUserId } from "../../store/artisan";
import {
  approvePrice,
  getBookingForUser,
  updateSingleBooking,
} from "../../store/booking";
import { socket } from "@/socket/serviceSocket";
import PriceProposalModal from "../../components/PriceProposalModal";
import { getChatByBooking } from "../../store/chat";

const Bookings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { bookings, isLoading } = useSelector((state) => state.booking);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { customer } = useSelector((state) => state.artisan);

  // Price Proposal Modal States
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;
    dispatch(getCustomerByUserId(user.userId)).then((res) => {
      if (res.payload?.success) {
        dispatch(getBookingForUser(res.payload.data._id));
      }
    });

    // connect socket and listen for updates
    socket.emit("join_user_room", customer?._id);
    socket.on("booking_updated", ({ booking }) => {
      dispatch(updateSingleBooking(booking));
    });

    return () => {
      socket.off("booking_updated");
    };
  }, [customer?._id, dispatch]);

  // Status tabs - Updated to include price_proposed
  const statusTabs = [
    { id: "all", label: "All", icon: "apps", count: bookings?.length || 0 },
    {
      id: "pending",
      label: "Pending",
      icon: "time",
      count: bookings?.filter((b) => b.status === "pending").length || 0,
    },
    {
      id: "price_proposed",
      label: "Price Proposed",
      icon: "cash",
      count: bookings?.filter((b) => b.status === "price_proposed").length || 0,
    },
    {
      id: "accepted",
      label: "Accepted",
      icon: "checkmark-circle",
      count: bookings?.filter((b) => b.status === "accepted").length || 0,
    },
    {
      id: "in_progress",
      label: "Active",
      icon: "construct",
      count: bookings?.filter((b) => b.status === "in_progress").length || 0,
    },
    {
      id: "completed",
      label: "Completed",
      icon: "checkmark-done",
      count: bookings?.filter((b) => b.status === "completed").length || 0,
    },
  ];

  // Date filter options
  const dateFilters = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
  ];

  // Status configurations - Updated to include price_proposed and price_rejected
  const getStatusConfig = useCallback((status) => {
    const configs = {
      pending: {
        color: "#F59E0B",
        bg: "#FFFBEB",
        icon: "time",
        label: "Pending",
      },
      price_proposed: {
        color: "#3B82F6",
        bg: "#EFF6FF",
        icon: "cash",
        label: "Price Proposed",
      },
      accepted: {
        color: "#10B981",
        bg: "#ECFDF5",
        icon: "checkmark-circle",
        label: "Accepted",
      },
      price_rejected: {
        color: "#EF4444",
        bg: "#FEF2F2",
        icon: "close-circle",
        label: "Price Rejected",
      },
      rejected: {
        color: "#EF4444",
        bg: "#FEF2F2",
        icon: "close-circle",
        label: "Rejected",
      },
      in_progress: {
        color: "#8B5CF6",
        bg: "#F5F3FF",
        icon: "construct",
        label: "In Progress",
      },
      completed: {
        color: "#10B981",
        bg: "#ECFDF5",
        icon: "checkmark-done",
        label: "Completed",
      },
      cancelled: {
        color: "#EF4444",
        bg: "#FEF2F2",
        icon: "close-circle",
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  }, []);

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

  // Handle booking card press
  const handleBookingPress = useCallback(
    (booking) => {
      if (booking.status === "price_proposed" || "accepted") {
        setSelectedBooking(booking);
        setShowPriceModal(true);
      }
    },
    [router]
  );

  // Handle price acceptance
  const handleAcceptPrice = useCallback(async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      // TODO: Dispatch action to accept price
      dispatch(
        approvePrice({
          bookingId: selectedBooking._id,
          customerId: customer._id,
          approved: true,
        })
      ).then((res) => {
        if (res.payload.success) {
          Alert.alert("Success", "Price accepted successfully", [
            {
              text: "OK",
              onPress: () => {
                setShowPriceModal(false);
                setSelectedBooking(null);
                setProposedPrice("");
              },
            },
          ]);
        }
      });
    } catch (error) {
      console.error("Error accepting price:", error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedBooking]);

  // Handle price rejection
  const handleRejectPrice = useCallback(async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      dispatch(
        approvePrice({
          bookingId: selectedBooking._id,
          customerId: customer._id,
          approved: false,
        })
      ).then((res) => {
        if (res.payload.success) {
          Alert.alert("Success", "Price rejected successfully", [
            {
              text: "OK",
              onPress: () => {
                setShowPriceModal(false);
                setSelectedBooking(null);
                setProposedPrice("");
              },
            },
          ]);
        }
      });

      setShowPriceModal(false);
    } catch (error) {
      console.error("Error rejecting price:", error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedBooking]);

  // Handle chat/bargain
  const handleStartChat = useCallback(() => {
    if (!selectedBooking) return;

    dispatch(getChatByBooking(selectedBooking._id)).then((res) => {
      if (res.payload.success) {
        // Navigate to chat screen with artisan
        router.push(`./messages/${res.payload.data._id}`);
        setShowPriceModal(false);
      }
    });
  }, [selectedBooking, router]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    let filtered = [...bookings];

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((b) => b.status === selectedStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.service?.name?.toLowerCase().includes(query) ||
          b.artisan?.userId?.name?.toLowerCase().includes(query) ||
          b.location?.address?.toLowerCase().includes(query)
      );
    }

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDateFilter === "today") {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      });
    } else if (selectedDateFilter === "week") {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        return bookingDate >= today && bookingDate <= weekFromNow;
      });
    } else if (selectedDateFilter === "month") {
      const monthFromNow = new Date(today);
      monthFromNow.setMonth(today.getMonth() + 1);
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        return bookingDate >= today && bookingDate <= monthFromNow;
      });
    } else if (selectedDateFilter === "upcoming") {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        return bookingDate >= today;
      });
    } else if (selectedDateFilter === "past") {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        return bookingDate < today;
      });
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)
    );
  }, [bookings, selectedStatus, searchQuery, selectedDateFilter]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedDateFilter("all");
    setShowFilterModal(false);
  }, []);

  // Booking Card Component
  const BookingCard = useCallback(
    ({ booking }) => {
      const statusConfig = getStatusConfig(booking.status);
      const artisan = booking.artisan;
      const service = booking.service;

      return (
        <TouchableOpacity
          onPress={() => handleBookingPress(booking)}
          activeOpacity={0.7}
          className="bg-white rounded-2xl p-4 mb-3 mx-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Header */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-14 h-14 rounded-xl bg-gray-100 items-center justify-center mr-3">
                <Text className="text-2xl">{service?.icon || "🔧"}</Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold text-gray-900"
                  numberOfLines={1}
                >
                  {service?.name || "Service"}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="calendar" size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {formatDate(booking.scheduledDate)}
                  </Text>
                </View>
              </View>
            </View>
            <View
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: statusConfig.bg }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={statusConfig.icon}
                  size={12}
                  color={statusConfig.color}
                />
                <Text
                  className="text-xs font-bold ml-1"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Artisan Info */}
          {artisan && (
            <View className="flex-row items-center mb-3">
              <Image
                source={{
                  uri:
                    artisan.media?.profilePicture?.url ||
                    "https://via.placeholder.com/40",
                }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">
                  {artisan.userId?.name || "Artisan"}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {artisan.rating?.average?.toFixed(1) || "New"} •{" "}
                    {artisan.businessName || ""}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Details */}
          <View className="bg-gray-50 rounded-xl p-3 mb-3">
            <View className="flex-row items-start mb-2">
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text
                className="text-xs text-gray-700 ml-2 flex-1"
                numberOfLines={2}
              >
                {booking.location?.address || "Location not set"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-700 ml-2">
                {booking.timeSlot?.start} - {booking.timeSlot?.end}
              </Text>
              {booking.isEmergency && (
                <View className="bg-red-100 px-2 py-0.5 rounded ml-2">
                  <Text className="text-red-700 text-xs font-bold">URGENT</Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            {booking.proposedPrice?.total > 0 ? (
              <View>
                <Text className="text-xs text-gray-500">
                  {booking.status === "price_proposed"
                    ? "Proposed Price"
                    : "Total Cost"}
                </Text>
                <Text className="text-lg font-bold text-gray-900">
                  {booking.proposedPrice.currency}{" "}
                  {booking.proposedPrice.total.toFixed(2)}
                </Text>
                {booking.status === "price_proposed" && (
                  <Text className="text-xs text-blue-600 font-semibold mt-1">
                    Tap to review proposal
                  </Text>
                )}
              </View>
            ) : (
              <View>
                <Text className="text-xs text-gray-500">Awaiting Quote</Text>
                <Text className="text-sm font-semibold text-amber-600">
                  Artisan will provide pricing
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </View>
        </TouchableOpacity>
      );
    },
    [getStatusConfig, formatDate, handleBookingPress]
  );

  // Skeleton Card
  const SkeletonCard = () => (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5">
      <View className="flex-row items-center mb-3">
        <View className="w-14 h-14 rounded-xl bg-gray-200 mr-3" />
        <View className="flex-1">
          <View
            className="h-4 bg-gray-200 rounded mb-2"
            style={{ width: "70%" }}
          />
          <View className="h-3 bg-gray-200 rounded" style={{ width: "40%" }} />
        </View>
        <View className="w-20 h-7 bg-gray-200 rounded-full" />
      </View>
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
        <View className="flex-1">
          <View
            className="h-3 bg-gray-200 rounded mb-2"
            style={{ width: "60%" }}
          />
          <View className="h-3 bg-gray-200 rounded" style={{ width: "40%" }} />
        </View>
      </View>
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
        <View className="w-6 h-6 bg-gray-200 rounded-full" />
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
        <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2">
        No Bookings Found
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-8">
        {searchQuery || selectedDateFilter !== "all"
          ? "Try adjusting your filters"
          : "Start by booking a service from our talented artisans"}
      </Text>
      {(searchQuery || selectedDateFilter !== "all") && (
        <TouchableOpacity
          onPress={resetFilters}
          className="bg-gray-200 px-6 py-3 rounded-full mb-3"
        >
          <Text className="text-gray-700 font-semibold">Clear Filters</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => router.push("/services")}
        className="bg-[#6F4E37] px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Browse Services</Text>
      </TouchableOpacity>
    </View>
  );

  // Render item
  const renderItem = useCallback(
    ({ item }) => <BookingCard booking={item} />,
    [BookingCard]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Price Proposal Modal */}
      <PriceProposalModal
        showPriceModal={showPriceModal}
        setShowPriceModal={setShowPriceModal}
        selectedBooking={selectedBooking}
        actionLoading={actionLoading}
        handleAcceptPrice={handleAcceptPrice}
        handleRejectPrice={handleRejectPrice}
        handleStartChat={handleStartChat}
      />

      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-5 pt-4 pb-5">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                My Bookings
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="options" size={24} color="#6F4E37" />
              {(selectedDateFilter !== "all" || searchQuery) && (
                <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#6F4E37]" />
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search bookings..."
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

      {/* Bookings List */}
      {isLoading ? (
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
    <View className="bg-white rounded-t-3xl overflow-hidden max-h-[85%]">
      {/* Header */}
      <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Filters</Text>
        <TouchableOpacity
          onPress={() => setShowFilterModal(false)}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Date Filter */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Filter by Date
          </Text>
          <View className="flex-row flex-wrap">
            {dateFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedDateFilter(filter.id)}
                className={`px-4 py-2.5 rounded-full mr-2 mb-2 ${
                  selectedDateFilter === filter.id
                    ? "bg-[#6F4E37]"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedDateFilter === filter.id
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

        {/* Active Filters */}
        {(selectedDateFilter !== "all" || searchQuery) && (
          <View className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-bold text-gray-900 mb-1">
                  Active Filters
                </Text>
                <View className="flex-row flex-wrap">
                  {selectedDateFilter !== "all" && (
                    <View className="bg-white px-2 py-1 rounded mr-2 mb-1">
                      <Text className="text-xs text-gray-700">
                        {dateFilters.find(
                          (f) => f.id === selectedDateFilter
                        )?.label || ""}
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
      <View className="p-5 border-t border-gray-200 bg-white">
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
    </View>
  );
};

export default Bookings;
