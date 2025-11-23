import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { socket } from "@/socket/serviceSocket";
import { getCustomerByUserId } from "../store/artisan";
import { getBookingForUser, updateSingleBooking, approvePrice } from "../store/booking";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import PriceProposalModal from "./PriceProposalModal";
import { getChatByBooking } from "../store/chat";
import OfflineFallBack from "./OfflineFallback";

const RecentBooking = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { bookings, isLoading } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);
  const { customer } = useSelector((state) => state.artisan);

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

    socket.emit("join_user_room", customer?._id);
    socket.on("booking_updated", ({ booking }) => {
      dispatch(updateSingleBooking(booking));
    });

    return () => socket.off("booking_updated");
  }, [customer?._id, dispatch, user?.userId]);

  const recentBookings = useMemo(() => {
    return bookings?.slice(0, 3) || [];
  }, [bookings]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "#F59E0B",
      price_proposed: "#3B82F6",
      accepted: "#10B981",
      in_progress: "#8B5CF6",
      completed: "#10B981",
      rejected: "#EF4444",
      cancelled: "#EF4444",
    };
    return colors[status] || "#6B7280";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleBookingPress = (booking) => {
    if (booking.status === "price_proposed") {
      setSelectedBooking(booking);
      setShowPriceModal(true);
    }
  };

  const handleAcceptPrice = async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      const res = await dispatch(
        approvePrice({
          bookingId: selectedBooking._id,
          customerId: customer?._id,
          approved: true,
        })
      );

      if (res.payload.success) {
        Alert.alert("Success", "Price accepted successfully", [
          {
            text: "OK",
            onPress: () => {
              setShowPriceModal(false);
              setSelectedBooking(null);
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error accepting price:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPrice = async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      const res = await dispatch(
        approvePrice({
          bookingId: selectedBooking._id,
          customerId: customer?._id,
          approved: false,
        })
      );

      if (res.payload.success) {
        Alert.alert("Success", "Price rejected successfully", [
          {
            text: "OK",
            onPress: () => {
              setShowPriceModal(false);
              setSelectedBooking(null);
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error rejecting price:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!selectedBooking) return;

    dispatch(getChatByBooking(selectedBooking._id)).then((res) => {
      if (res.payload.success) {
        router.push(`../(customer)/messages/${res.payload.data._id}`);
        setShowPriceModal(false);
      }
    });
  };

  const BookingCard = ({ booking }) => (
    <TouchableOpacity
      onPress={() => handleBookingPress(booking)}
      activeOpacity={0.7}
      className="bg-white rounded-xl p-4 mr-3 border border-gray-100"
      style={{ width: 280 }}
    >
      {/* Service Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-lg bg-gray-50 items-center justify-center mr-3">
          <Text className="text-xl">{booking.service?.icon || "🔧"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
            {booking.service?.name || "Service"}
          </Text>
          <Text className="text-xs text-gray-500">{formatDate(booking.scheduledDate)}</Text>
        </View>
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getStatusColor(booking.status) }}
        />
      </View>

      {/* Artisan Info */}
      {booking.artisan && (
        <View className="flex-row items-center mb-3">
          <Image
            source={{
              uri:
                booking.artisan.media?.profilePicture?.url ||
                "https://via.placeholder.com/32",
            }}
            className="w-8 h-8 rounded-full mr-2"
          />
          <Text className="text-xs text-gray-700 flex-1" numberOfLines={1}>
            {booking.artisan.userId?.name || "Artisan"}
          </Text>
          {booking.artisan.rating?.average !== undefined && (
            <View className="flex-row items-center">
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text className="text-xs text-gray-600 ml-1">
                {booking.artisan.rating.average.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Time & Price */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-xs text-gray-600 ml-1">
            {booking.timeSlot?.start || "TBD"}
          </Text>
        </View>
        {booking.proposedPrice?.total > 0 && (
          <Text className="text-sm font-bold text-gray-900">
            {booking.proposedPrice?.currency || ""}{" "}
            {booking.proposedPrice?.total?.toFixed(2) || ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const SkeletonCard = () => (
    <View
      className="bg-white rounded-xl p-4 mr-3 border border-gray-100"
      style={{ width: 280 }}
    >
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-lg bg-gray-200" />
        <View className="flex-1 ml-3">
          <View className="h-3 bg-gray-200 rounded mb-2" style={{ width: "70%" }} />
          <View className="h-2 bg-gray-200 rounded" style={{ width: "40%" }} />
        </View>
      </View>
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-gray-200" />
        <View className="h-2 bg-gray-200 rounded ml-2 flex-1" />
      </View>
      <View className="flex-row justify-between pt-3 border-t border-gray-100">
        <View className="h-2 bg-gray-200 rounded" style={{ width: "30%" }} />
        <View className="h-2 bg-gray-200 rounded" style={{ width: "25%" }} />
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="items-center py-6 px-6">
      <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-3">
        <Ionicons name="calendar-outline" size={28} color="#D1D5DB" />
      </View>
      <Text className="text-base font-semibold text-gray-900 mb-1">
        No Recent Bookings
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
        Book a service to get started
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/services")}
        className="bg-[#6F4E37] px-5 py-2 rounded-full"
      >
        <Text className="text-white text-sm font-medium">Browse Services</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isLoading && recentBookings.length === 0) {
    return <EmptyState />;
  }

  return (
    
    <View className="pb-8">
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

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        data={isLoading ? [1, 2, 3] : recentBookings}
        keyExtractor={(item, index) => (isLoading ? index.toString() : item._id)}
        renderItem={({ item }) =>
          isLoading ? <SkeletonCard /> : <BookingCard booking={item} />
        }
      />
    </View>
  );
};

export default RecentBooking;
