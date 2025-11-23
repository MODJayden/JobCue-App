import { useEffect, useMemo, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getPopularArtisans } from "../store/artisan";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ArtisanSkeleton from "./ArtisanSkeleton";
import BookingModal from "./BookingModal";

const FeaturedArtisans = () => {
  const dispatch = useDispatch();
  const { popular, loadingPopular } = useSelector((state) => state.artisan);

  const [showBooking, setShowBooking] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState(null);

  useEffect(() => {
    if (!popular || popular.length === 0) {
      dispatch(getPopularArtisans());
    }
  }, [dispatch]);

  const featuredList = useMemo(() => {
    return popular?.slice(0, 5) || [];
  }, [popular]);

  const handleViewArtisan = useCallback((artisanId) => {
    router.push(`/(customer)/artisans/${artisanId}`);
  }, []);

  // ✅ Open Booking Modal
  const handleBookArtisan = useCallback((artisan) => {
    setSelectedArtisan(artisan);
    setShowBooking(true);
  }, []);



  const getBadgeIcon = useCallback((badges) => {
    if (badges?.includes("top_rated")) return "⭐";
    if (badges?.includes("verified")) return "✓";
    if (badges?.includes("emergency_expert")) return "🚨";
    return null;
  }, []);

  // Loading / empty states
  if (loadingPopular && featuredList.length === 0) return <ArtisanSkeleton />;
  if (!loadingPopular && featuredList.length === 0) {
    return (
      <View className="bg-gray-50 rounded-2xl p-6 items-center">
        <Ionicons name="people-outline" size={48} color="#D1D5DB" />
        <Text className="text-gray-500 mt-2">
          No featured artisans available
        </Text>
      </View>
    );
  }

  return (
    <View>
      {featuredList.map((artisan) => {
        const userName = artisan?.businessName || "Unknown Artisan";
        const userProfilePic =
          artisan?.media?.profilePicture?.url ||
          artisan?.userId?.profilePicture;
        const isVerified =
          artisan?.ghanaCard?.verified &&
          artisan?.backgroundCheck?.status === "approved";
        const rating = artisan?.rating?.average || 0;
        const ratingCount = artisan?.rating?.count || 0;
        const serviceAreas = artisan?.serviceAreas || [];
        const services = artisan?.services || [];
        const badges = artisan?.badges || [];
        const badgeIcon = getBadgeIcon(badges);

        return (
          <TouchableOpacity
            key={artisan._id}
            onPress={() => handleViewArtisan(artisan._id)}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              {/* Profile Picture */}
              <View className="relative mr-3">
                {userProfilePic ? (
                  <Image
                    source={{ uri: userProfilePic }}
                    className="w-14 h-14 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="bg-gray-200 w-14 h-14 rounded-full items-center justify-center">
                    <Ionicons name="person" size={28} color="#9CA3AF" />
                  </View>
                )}

                {/* Badge Overlay */}
                {badgeIcon && (
                  <View className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 items-center justify-center border-2 border-white">
                    <Text className="text-xs">{badgeIcon}</Text>
                  </View>
                )}
              </View>

              {/* Artisan Info */}
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text
                    className="text-gray-900 font-bold text-base mr-2"
                    numberOfLines={1}
                  >
                    {userName}
                  </Text>
                  {isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10B981"
                    />
                  )}
                </View>

                {/* Services */}
                {services.length > 0 && (
                  <Text
                    className="text-gray-600 text-sm mb-2"
                    numberOfLines={1}
                  >
                    {services
                      .map((service) => service?.name || service)
                      .slice(0, 2)
                      .join(" • ")}
                  </Text>
                )}

                {/* Rating + Location */}
                <View className="flex-row items-center">
                  <View className="flex-row items-center mr-3">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-gray-700 text-xs ml-1 font-semibold">
                      {rating.toFixed(1)}
                    </Text>
                    {ratingCount > 0 && (
                      <Text className="text-gray-400 text-xs ml-1">
                        ({ratingCount})
                      </Text>
                    )}
                  </View>

                  {serviceAreas.length > 0 && (
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="location" size={14} color="#6B7280" />
                      <Text
                        className="text-gray-500 text-xs ml-1"
                        numberOfLines={1}
                      >
                        {serviceAreas
                          .map((area) => area?.name || "")
                          .filter(Boolean)
                          .slice(0, 2)
                          .join(", ")}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Experience */}
                {artisan?.experience > 0 && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons
                      name="briefcase-outline"
                      size={12}
                      color="#6B7280"
                    />
                    <Text className="text-gray-500 text-xs ml-1">
                      {artisan.experience}{" "}
                      {artisan.experience === 1 ? "year" : "years"} exp
                    </Text>
                  </View>
                )}
              </View>

              {/* Book Button */}
              <TouchableOpacity
                onPress={() => handleBookArtisan(artisan)}
                className="bg-[#6F4E37] px-4 py-2.5 rounded-xl ml-2"
                style={{
                  shadowColor: "#6F4E37",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white text-sm font-semibold">Book</Text>
              </TouchableOpacity>
            </View>

            {/* Availability */}
            {artisan?.availability?.isAvailable && (
              <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-600 text-xs font-semibold">
                  {artisan?.availability?.isAvailable
                    ? "Available Now"
                    : "Unavailable"}
                </Text>
                {artisan?.availability?.emergencyAvailable && (
                  <>
                    <Text className="text-gray-400 text-xs mx-2">•</Text>
                    <Ionicons name="flash" size={12} color="#EF4444" />
                    <Text className="text-red-600 text-xs font-semibold ml-1">
                      Emergency
                    </Text>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* ✅ Booking Modal */}
      {selectedArtisan && (
        <BookingModal
          visible={showBooking}
          artisan={selectedArtisan}
          aiEstimate={{ min: 80, max: 120 }}
          onClose={() => setShowBooking(false)}
          
        />
      )}
    </View>
  );
};

export default FeaturedArtisans;
