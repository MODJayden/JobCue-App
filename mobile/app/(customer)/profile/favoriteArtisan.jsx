import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { getFavorites, toggleFavoriteArtisan } from "../../../store/user";
import BookingModal from "../../../components/BookingModal";
import FavoriteSkeleton from "../../../components/FavoriteSkeleton";

// Memoized Avatar Component
const Avatar = memo(({ uri, name, size = 60, verified = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getInitials = (name) => {
    if (!name) return "A";
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
              borderWidth: 2,
              borderColor: verified ? "#10B981" : "#E5E7EB",
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
            borderWidth: 2,
            borderColor: verified ? "#10B981" : "#E5E7EB",
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "bold", fontSize: size / 2.5 }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {verified && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.28,
            height: size * 0.28,
            backgroundColor: "#10B981",
            borderRadius: size * 0.14,
            borderWidth: 2,
            borderColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="checkmark" size={size * 0.15} color="white" />
        </View>
      )}
    </View>
  );
});

// Memoized Badge Component
const Badge = memo(({ badge }) => {
  const getBadgeConfig = (badge) => {
    switch (badge) {
      case "top_rated":
        return { icon: "star", color: "#F59E0B", label: "Top Rated" };
      case "quick_response":
        return { icon: "flash", color: "#3B82F6", label: "Quick Response" };
      case "emergency_expert":
        return { icon: "medical", color: "#EF4444", label: "Emergency Expert" };
      case "verified":
        return {
          icon: "shield-checkmark",
          color: "#10B981",
          label: "Verified",
        };
      default:
        return { icon: "ribbon", color: "#6F4E37", label: badge };
    }
  };

  const config = getBadgeConfig(badge);

  return (
    <View
      className="flex-row items-center px-2 py-1 rounded-full mr-2 mb-2"
      style={{ backgroundColor: `${config.color}15` }}
    >
      <Ionicons name={config.icon} size={12} color={config.color} />
      <Text
        className="text-xs font-semibold ml-1"
        style={{ color: config.color }}
      >
        {config.label}
      </Text>
    </View>
  );
});

const FavoriteArtisan = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    user,
    favorites: favoriteArtisans,
    isGetFavoritesLoading,
  } = useSelector((state) => state.auth);
  const [showBooking, setShowBooking] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedArtisan, setSelectedArtisan] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(getFavorites(user?.userId));
    }
  }, [dispatch]);

  const filters = useMemo(
    () => [
      { id: "all", label: "All", icon: "grid-outline" },
      { id: "available", label: "Available", icon: "checkmark-circle" },
      { id: "top_rated", label: "Top Rated", icon: "star" },
    ],
    []
  );
  // Memoized Artisan Card
  const ArtisanCard = memo(
    ({ artisan, onPress, onRemoveFavorite }) => {
      const verified = artisan.backgroundCheck?.status === "approved";
      const isAvailable = artisan.availability?.isAvailable;
      const isEmergencyAvailable = artisan.availability?.emergencyAvailable;

      const handleRemove = useCallback(
        (e) => {
          onRemoveFavorite(artisan._id);
        },
        [artisan, onRemoveFavorite]
      );

      return (
        <TouchableOpacity
          onPress={() => onPress(artisan)}
          activeOpacity={0.7}
          className="bg-white rounded-2xl mb-3 border border-gray-100 overflow-hidden"
        >
          <View className="p-4">
            <View className="flex-row items-start">
              {/* Avatar */}
              <View className="mr-3">
                <Avatar
                  uri={artisan.media?.profilePicture?.url}
                  name={artisan.userId?.name || artisan.businessName}
                  size={60}
                  verified={verified}
                />
              </View>

              {/* Info */}
              <View className="flex-1">
                <View className="flex-row items-start justify-between mb-1">
                  <View className="flex-1 mr-2">
                    <Text
                      className="text-lg font-bold text-gray-900"
                      numberOfLines={1}
                    >
                      {artisan.businessName}
                    </Text>
                    {artisan.businessName && (
                      <Text className="text-sm text-gray-500" numberOfLines={1}>
                        Artisan
                      </Text>
                    )}
                  </View>

                  {/* Remove Favorite Button */}
                  <TouchableOpacity
                    onPress={handleRemove}
                    className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
                  >
                    <Ionicons name="heart" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Rating */}
                <View className="flex-row items-center mb-2">
                  <View className="flex-row items-center bg-amber-50 rounded-lg px-2 py-1 mr-2">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-sm font-bold text-gray-900 ml-1">
                      {artisan.rating?.average?.toFixed(1) || "0.0"}
                    </Text>
                    <Text className="text-xs text-gray-500 ml-1">
                      ({artisan.rating?.count || 0})
                    </Text>
                  </View>

                  {/* Experience */}
                  <View className="flex-row items-center">
                    <Ionicons
                      name="briefcase-outline"
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text className="text-xs text-gray-500 ml-1">
                      {artisan.experience || 0} yrs exp
                    </Text>
                  </View>
                </View>

                {/* Services */}
                {/*  {artisan.services && artisan.services.length > 0 && (
              <View className="flex-row flex-wrap mb-2">
                {artisan.services.slice(0, 2).map((service, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 rounded-lg px-2 py-1 mr-2 mb-1"
                  >
                    <Text className="text-xs text-gray-700" numberOfLines={1}>
                      {service.name || service}
                    </Text>
                  </View>
                ))}
                {artisan.services.length > 2 && (
                  <View className="bg-gray-100 rounded-lg px-2 py-1">
                    <Text className="text-xs text-gray-700">
                      +{artisan.services.length - 2} more
                    </Text>
                  </View>
                )}
              </View>
            )} */}

                {/* Badges */}
                {artisan.badges && artisan.badges.length > 0 && (
                  <View className="flex-row flex-wrap">
                    {artisan.badges.slice(0, 3).map((badge, index) => (
                      <Badge key={index} badge={badge} />
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Bottom Info */}
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
              {/* Availability Status */}
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isAvailable ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text
                  className={`text-sm font-semibold ${
                    isAvailable ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isAvailable ? "Available" : "Unavailable"}
                </Text>

                {isEmergencyAvailable && (
                  <View className="flex-row items-center ml-3">
                    <Ionicons name="flash" size={14} color="#EF4444" />
                    <Text className="text-xs font-semibold text-red-600 ml-1">
                      Emergency
                    </Text>
                  </View>
                )}
              </View>

              {/* Service Areas Count */}
              {artisan.serviceAreas && artisan.serviceAreas.length > 0 && (
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 ml-1">
                    {artisan.serviceAreas.length} area
                    {artisan.serviceAreas.length > 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View className="flex-row border-t border-gray-100">
            {/*     <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              // TODO: Navigate to chat
              console.log("Chat with artisan:", artisan._id);
            }}
            className="flex-1 py-3 items-center justify-center border-r border-gray-100"
          >
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={18} color="#6F4E37" />
              <Text className="text-sm font-semibold text-[#6F4E37] ml-2">
                Message
              </Text>
            </View>
          </TouchableOpacity> */}

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowBooking(true);
                setSelectedArtisan(artisan);
              }}
              className="flex-1 py-3 items-center justify-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={18} color="#6F4E37" />
                <Text className="text-sm font-semibold text-[#6F4E37] ml-2">
                  Book Now
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.artisan._id === nextProps.artisan._id &&
        prevProps.artisan.rating?.average ===
          nextProps.artisan.rating?.average &&
        prevProps.artisan.availability?.isAvailable ===
          nextProps.artisan.availability?.isAvailable
      );
    }
  );

  const filteredArtisans = useMemo(() => {
    if (selectedFilter === "all") return favoriteArtisans;
    if (selectedFilter === "available") {
      return favoriteArtisans?.filter((a) => a.availability?.isAvailable);
    }
    if (selectedFilter === "top_rated") {
      return favoriteArtisans?.filter((a) => a.rating?.average >= 4.5);
    }
    return favoriteArtisans;
  }, [favoriteArtisans, selectedFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch updated favorite artisans
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleArtisanPress = useCallback(
    (artisan) => {
      router.push(`/(customer)/artisans/${artisan._id}`);
    },
    [router]
  );

  const handleRemoveFavorite = useCallback((artisanId) => {
    console.log(artisanId);
    dispatch(
      toggleFavoriteArtisan({
        artisanId: artisanId,
        userId: user?.userId,
      })
    ).unwrap();
  }, []);

  const FilterTab = memo(({ filter }) => {
    const isActive = selectedFilter === filter.id;
    const count =
      filter.id === "available"
        ? filteredArtisans?.filter((a) => a.availability?.isAvailable).length
        : filter.id === "top_rated"
        ? filteredArtisans?.filter((a) => a.rating?.average >= 4.5).length
        : null;

    return (
      <TouchableOpacity
        onPress={() => setSelectedFilter(filter.id)}
        className={`px-4 py-2 rounded-full mr-2 ${
          isActive ? "bg-[#6F4E37]" : "bg-gray-100"
        }`}
      >
        <View className="flex-row items-center">
          <Ionicons
            name={filter.icon}
            size={16}
            color={isActive ? "white" : "#6B7280"}
          />
          <Text
            className={`text-sm font-semibold ml-2 ${
              isActive ? "text-white" : "text-gray-700"
            }`}
          >
            {filter.label}
          </Text>
          {count !== null && count > 0 && (
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
                {count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  });

  const EmptyState = memo(() => (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <LinearGradient
        colors={["#6F4E3720", "#6F4E3710"]}
        className="w-32 h-32 rounded-full items-center justify-center mb-6"
      >
        <Ionicons name="heart-outline" size={64} color="#6F4E37" />
      </LinearGradient>
      <Text className="text-xl font-bold text-gray-900 mb-2">
        No Favorite Artisans Yet
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-8 px-4">
        Save your favorite artisans for quick access and easy booking
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/services")}
        className="bg-[#6F4E37] px-8 py-4 rounded-full"
        style={{
          shadowColor: "#6F4E37",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center">
          <Ionicons name="search" size={20} color="white" />
          <Text className="text-white font-bold text-base ml-2">
            Discover Artisans
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  ));

  const renderItem = useCallback(
    ({ item }) => (
      <ArtisanCard
        artisan={item}
        onPress={handleArtisanPress}
        onRemoveFavorite={handleRemoveFavorite}
      />
    ),
    [handleArtisanPress, handleRemoveFavorite]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-5 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="w-10 h-10 items-center justify-center mr-2"
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Favorite Artisans
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {favoriteArtisans?.length} favorite
                {favoriteArtisans?.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center">
            <Ionicons name="heart" size={24} color="#EF4444" />
          </View>
        </View>

        {/* Filters */}
        <View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FilterTab filter={item} />}
          />
        </View>
      </View>

      {/* Artisans List */}
      {isGetFavoritesLoading ? (
        <FavoriteSkeleton />
      ) : (
        <FlatList
          data={filteredArtisans}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6F4E37"]}
              tintColor="#6F4E37"
            />
          }
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}

      <BookingModal
        visible={showBooking}
        artisan={selectedArtisan}
        aiEstimate={{ min: 80, max: 120 }}
        onClose={() => setShowBooking(false)}
      />
    </SafeAreaView>
  );
};

export default FavoriteArtisan;
