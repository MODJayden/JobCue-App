import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getArtisansByService } from "../../../store/artisan";
import { useDispatch, useSelector } from "react-redux";
import ArtisanSkeleton from "../../../components/ArtisanSkeleton";

// Static badge configurations
const BADGE_CONFIG = {
  top_rated: { color: "#F59E0B", icon: "star", label: "Top Rated" },
  quick_response: { color: "#3B82F6", icon: "flash", label: "Quick Response" },
  emergency_expert: { color: "#EF4444", icon: "alarm", label: "Emergency" },
  verified: { color: "#10B981", icon: "checkmark-circle", label: "Verified" },
};

const FILTERS = [
  { id: "all", label: "All", icon: "grid" },
  { id: "top_rated", label: "Top Rated", icon: "star" },
  { id: "available", label: "Available", icon: "checkmark-circle" },
  { id: "emergency", label: "Emergency", icon: "flash" },
];

// Memoized Artisan Card Component
const ArtisanCard = ({ artisan, onPress }) => {
  // Availability status
  const availability = useMemo(() => {
    if (!artisan.availability?.isAvailable) {
      return { text: "Unavailable", color: "#EF4444", bgColor: "#FEF2F2" };
    }
    if (artisan.availability?.emergencyAvailable) {
      return { text: "Available Now", color: "#10B981", bgColor: "#ECFDF5" };
    }
    return { text: "Available", color: "#3B82F6", bgColor: "#EFF6FF" };
  }, [artisan.availability]);

  // Profile picture with fallback
  const profilePicture = useMemo(
    () =>
      artisan.media?.profilePicture?.url ||
      artisan.userId?.profilePicture ||
      "https://via.placeholder.com/80",
    [artisan.media, artisan.userId]
  );

  // Display name
  const displayName = artisan.userId?.name || "Artisan";

  // Experience display
  const experienceText =
    artisan.experience > 0 ? `${artisan.experience}+ yrs` : null;

  // Service areas - show only city names
  const serviceAreasText = useMemo(() => {
    if (!artisan.serviceAreas || artisan.serviceAreas.length === 0) return null;

    const areas = artisan.serviceAreas
      .slice(0, 3)
      .map((area) => area.name || area)
      .join(", ");

    return artisan.serviceAreas.length > 3
      ? `${areas} +${artisan.serviceAreas.length - 3}`
      : areas;
  }, [artisan.serviceAreas]);

  return (
    <TouchableOpacity
      onPress={onPress}
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
      <View className="flex-row">
        {/* Profile Image with Availability Badge */}
        <View className="relative">
          <Image
            source={{ uri: profilePicture }}
            className="w-20 h-20 rounded-2xl"
            style={{ backgroundColor: "#F3F4F6" }}
          />
          <View
            className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: availability.bgColor }}
          >
            <View className="flex-row items-center" style={{ gap: 2 }}>
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: availability.color }}
              />
              <Text
                className="text-xs font-bold"
                style={{ color: availability.color }}
              >
                {availability.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Artisan Info */}
        <View className="flex-1 ml-4">
          {/* Name & Business */}
          <View className="mb-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {displayName}
            </Text>
            {artisan.businessName && (
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                {artisan.businessName}
              </Text>
            )}
          </View>

          {/* Rating & Experience */}
          <View className="flex-row items-center mb-2" style={{ gap: 8 }}>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-base font-bold text-gray-900">
                {artisan.rating?.average?.toFixed(1) || "New"}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              ({artisan.rating?.count || 0})
            </Text>
            {experienceText && (
              <>
                <View className="w-1 h-1 rounded-full bg-gray-300" />
                <Text className="text-sm text-gray-600">{experienceText}</Text>
              </>
            )}
          </View>

          {/* Badges - Show max 2 */}
          {artisan.badges && artisan.badges.length > 0 && (
            <View className="flex-row flex-wrap mb-2" style={{ gap: 6 }}>
              {artisan.badges.slice(0, 2).map((badge, index) => {
                const config = BADGE_CONFIG[badge];
                if (!config) return null;

                return (
                  <View
                    key={index}
                    className="px-2 py-1 rounded-lg flex-row items-center"
                    style={{
                      backgroundColor: `${config.color}15`,
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name={config.icon}
                      size={12}
                      color={config.color}
                    />
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Service Areas */}
          {serviceAreasText && (
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="location" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                {serviceAreasText}
              </Text>
            </View>
          )}

          {/* Ghana Card Verification Status */}
          {artisan.ghanaCard?.verified && (
            <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text className="text-xs text-green-600 font-semibold">
                ID Verified
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Languages & Additional Info */}
      {artisan.languages && artisan.languages.length > 0 && (
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          <Ionicons name="language" size={14} color="#9CA3AF" />
          <Text className="text-xs text-gray-500 ml-2">
            {artisan.languages.join(", ")}
          </Text>

          {/* Probation Status */}
          {artisan.probation && (
            <>
              <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
              <Text className="text-xs text-amber-600 font-medium">New</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const ArtisansListScreen = () => {
  const router = useRouter();
  const { serviceId, name } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [localLoading, setLocalLoading] = useState(true);
  const dispatch = useDispatch();

  const { artisansByService, isLoading } = useSelector(
    (state) => state.artisan
  );

  // SAFETY: Ensure artisans is always an array
  const artisans = useMemo(() => {
    // Handle if artisansByService is an object with data property
    if (artisansByService?.data && Array.isArray(artisansByService.data)) {
      console.log("Extracting from nested data property");
      return artisansByService.data;
    }

    // Handle if it's already an array
    if (Array.isArray(artisansByService)) {
      return artisansByService;
    }

    // Fallback to empty array
    console.warn("artisansByService is not an array:", artisansByService);
    return [];
  }, [artisansByService]);

  // CRITICAL FIX: Fetch artisans whenever serviceId changes
  useEffect(() => {
    // Create an async function inside useEffect
    const fetchArtisans = async () => {
      console.log("=== Fetching artisans for serviceId:", serviceId, "===");
      setLocalLoading(true);

      try {
        // Reset filter when service changes
        setSelectedFilter("all");

        // Fetch new artisans for this service
        const result = await dispatch(getArtisansByService(serviceId)).unwrap();
      } catch (error) {
      } finally {
        setLocalLoading(false);
      }
    };

    // Only fetch if we have a serviceId
    if (serviceId) {
      fetchArtisans();
    }
  }, [serviceId, dispatch]); // Only depend on serviceId and dispatch

  // Memoized filtered artisans
  const filteredArtisans = useMemo(() => {
    if (!artisans || artisans.length === 0) return [];

    return artisans.filter((artisan) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "top_rated")
        return artisan.badges?.includes("top_rated");
      if (selectedFilter === "emergency")
        return artisan.availability?.emergencyAvailable;
      if (selectedFilter === "available")
        return artisan.availability?.isAvailable;
      return true;
    });
  }, [artisans, selectedFilter]);

  // Callbacks
  const handleArtisanPress = useCallback(
    (artisan) => {
      router.push(`/(customer)/artisans/${artisan._id}`);
    },
    [router]
  );

  const handleFilterPress = useCallback((filterId) => {
    setSelectedFilter(filterId);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Render functions
  const renderArtisan = useCallback(
    ({ item }) => (
      <ArtisanCard artisan={item} onPress={() => handleArtisanPress(item)} />
    ),
    [handleArtisanPress]
  );

  const renderFilterTab = useCallback(
    ({ item: filter }) => (
      <TouchableOpacity
        onPress={() => handleFilterPress(filter.id)}
        className={`px-4 py-2.5 rounded-full flex-row items-center mr-2 ${
          selectedFilter === filter.id ? "bg-[#6F4E37]" : "bg-gray-100"
        }`}
        style={{ gap: 6 }}
      >
        <Ionicons
          name={filter.icon}
          size={16}
          color={selectedFilter === filter.id ? "white" : "#6B7280"}
        />
        <Text
          className={`text-sm font-semibold ${
            selectedFilter === filter.id ? "text-white" : "text-gray-600"
          }`}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    ),
    [selectedFilter, handleFilterPress]
  );

  const keyExtractor = useCallback((item) => item._id, []);
  const filterKeyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 180,
      offset: 180 * index,
      index,
    }),
    []
  );

  // Header Component
  const ListHeaderComponent = useMemo(
    () => (
      <View className="mb-3">
        {artisans && artisans.length > 0 && (
          <FlatList
            data={FILTERS}
            renderItem={renderFilterTab}
            keyExtractor={filterKeyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        )}
      </View>
    ),
    [artisans, renderFilterTab, filterKeyExtractor]
  );

  // Empty Component
  const ListEmptyComponent = useMemo(
    () => (
      <View className="flex-1 items-center justify-center px-8 py-20">
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
        </View>
        <Text className="text-gray-900 text-xl font-bold text-center mb-2">
          No Artisans Available
        </Text>
        <Text className="text-gray-500 text-center text-base mb-8">
          {selectedFilter !== "all"
            ? "Try adjusting your filters"
            : `We don't have any ${
                name?.toLowerCase() || "artisans"
              } yet. Check back soon!`}
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-[#6F4E37] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">
            Browse Other Services
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [name, selectedFilter, handleBack]
  );

  // Loading state - Show loading if either Redux or local loading
  if (localLoading || (isLoading && !artisans)) {
    return <ArtisanSkeleton count={5} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-5 pt-4 pb-5">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={handleBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#6F4E37]">
              {name || "Artisans"}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {filteredArtisans.length}{" "}
              {filteredArtisans.length === 1 ? "artisan" : "artisans"} available
            </Text>
          </View>
        </View>
      </View>

      {/* Artisans List */}
      <FlatList
        data={filteredArtisans}
        renderItem={renderArtisan}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />
    </SafeAreaView>
  );
};

export default ArtisansListScreen;
