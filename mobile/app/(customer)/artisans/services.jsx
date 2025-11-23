import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { getAllServices } from "../../../store/service";
import { removeToken } from "../../../store/user";
import ServiceSkeleton from "../../../components/ServiceSkeleton";

// Move static data outside component
const categoryIconMap = {
  plumbing: {
    icon: "water",
    library: "Ionicons",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
  },
  electrical: {
    icon: "flash",
    library: "Ionicons",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
  construction: {
    icon: "hammer",
    library: "MaterialCommunityIcons",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  home_repair: {
    icon: "home",
    library: "Ionicons",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },
  cleaning: {
    icon: "sparkles",
    library: "Ionicons",
    color: "#A855F7",
    bgColor: "#FAF5FF",
  },
  personal_care: {
    icon: "person",
    library: "Ionicons",
    color: "#EC4899",
    bgColor: "#FDF2F8",
  },
  events: {
    icon: "calendar",
    library: "Ionicons",
    color: "#F97316",
    bgColor: "#FFF7ED",
  },
  automotive: {
    icon: "car",
    library: "Ionicons",
    color: "#EF4444",
    bgColor: "#FEF2F2",
  },
  other: {
    icon: "grid",
    library: "Feather",
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
};

const serviceIconMap = {
  Plumber: { icon: "water", library: "Ionicons", color: "#3B82F6" },
  Electrician: { icon: "flash", library: "Ionicons", color: "#F59E0B" },
  "AC Technician": { icon: "snow", library: "Ionicons", color: "#06B6D4" },
  Carpenter: {
    icon: "hammer",
    library: "MaterialCommunityIcons",
    color: "#8B5CF6",
  },
  Painter: {
    icon: "brush",
    library: "MaterialCommunityIcons",
    color: "#EC4899",
  },
  Welder: { icon: "fire", library: "Ionicons", color: "#EF4444" },
  Tiler: { icon: "grid", library: "Feather", color: "#10B981" },
  Mason: { icon: "square", library: "Feather", color: "#6366F1" },
  "House Cleaner": { icon: "sparkles", library: "Ionicons", color: "#A855F7" },
  Gardener: { icon: "leaf", library: "Ionicons", color: "#22C55E" },
  Locksmith: { icon: "key", library: "Ionicons", color: "#F59E0B" },
  "Pest Control Specialist": {
    icon: "bug",
    library: "MaterialCommunityIcons",
    color: "#CA8A04",
  },
  "Roofing Specialist": { icon: "home", library: "Ionicons", color: "#DC2626" },
  "Appliance Repair Technician": {
    icon: "construct",
    library: "Ionicons",
    color: "#7C3AED",
  },
  "Generator Technician": {
    icon: "settings",
    library: "Ionicons",
    color: "#0891B2",
  },
  "Satellite TV Installer": {
    icon: "tv",
    library: "Ionicons",
    color: "#4F46E5",
  },
  "CCTV & Security Systems Installer": {
    icon: "camera",
    library: "Ionicons",
    color: "#7C3AED",
  },
  "Solar Panel Installer": {
    icon: "sunny",
    library: "Ionicons",
    color: "#F59E0B",
  },
  "Phone & Laptop Repair Technician": {
    icon: "phone-portrait",
    library: "Ionicons",
    color: "#3B82F6",
  },
  "Upholstery Specialist": {
    icon: "bed",
    library: "Ionicons",
    color: "#EC4899",
  },
  "Borehole Driller": { icon: "water", library: "Ionicons", color: "#06B6D4" },
  "Aluminum Fabricator": {
    icon: "square",
    library: "Feather",
    color: "#6B7280",
  },
  "POP Ceiling Installer": {
    icon: "home",
    library: "Ionicons",
    color: "#8B5CF6",
  },
  "Swimming Pool Technician": {
    icon: "water",
    library: "Ionicons",
    color: "#06B6D4",
  },
  "Interior Decorator": {
    icon: "brush",
    library: "MaterialCommunityIcons",
    color: "#EC4899",
  },
};

const getServiceIcon = (serviceName, category) => {
  return (
    serviceIconMap[serviceName] ||
    categoryIconMap[category] ||
    categoryIconMap.other
  );
};

// Memoized Service Item Component
const ServiceItem = ({ service, onPress }) => {
  const iconData = getServiceIcon(service.name, service.category);
  const IconComponent =
    iconData.library === "Ionicons"
      ? Ionicons
      : iconData.library === "MaterialCommunityIcons"
      ? MaterialCommunityIcons
      : Feather;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-5 mb-3 mx-5 active:opacity-80"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start">
        {/* Icon */}
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: iconData.bgColor || "#F3F4F6" }}
        >
          <IconComponent
            name={iconData.icon}
            size={28}
            color={iconData.color}
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-gray-900 flex-1">
              {service.name}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </View>

          {/* Description */}
          {service.description && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {service.description}
            </Text>
          )}

          {/* Price Range */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="cash-outline" size={16} color="#10B981" />
            <Text className="text-sm font-semibold text-green-600 ml-1">
              {service.basePriceRange?.currency || "GHS"}{" "}
              {service.basePriceRange?.min || 0} -{" "}
              {service.basePriceRange?.max || 0}
            </Text>
            {service.emergencySurcharge > 0 && (
              <Text className="text-xs text-gray-500 ml-2">
                (+{(service.emergencySurcharge * 100).toFixed(0)}% emergency)
              </Text>
            )}
          </View>

          {/* Common Issues */}
          {service.commonIssues && service.commonIssues.length > 0 && (
            <View>
              {service.commonIssues.slice(0, 3).map((issue, index) => (
                <View key={index} className="flex-row items-center mb-1.5">
                  <View
                    className="w-1.5 h-1.5 rounded-full mr-2"
                    style={{ backgroundColor: iconData.color }}
                  />
                  <Text
                    className="text-sm text-gray-600 flex-1"
                    numberOfLines={1}
                  >
                    {issue}
                  </Text>
                </View>
              ))}
              {service.commonIssues.length > 3 && (
                <Text className="text-xs text-gray-400 mt-1">
                  +{service.commonIssues.length - 3} more issues
                </Text>
              )}
            </View>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-2">
              {service.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded-lg mr-2 mb-1"
                >
                  <Text className="text-xs text-gray-600">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Certification Badge */}
          {service.requiresCertification && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="shield-checkmark" size={14} color="#3B82F6" />
              <Text className="text-xs text-blue-600 ml-1 font-semibold">
                Certification Required
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Services = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, services } = useSelector((state) => state.service);
  const hasLoaded = useRef(false);

  // Memoized filtered services
  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;

    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        service.commonIssues?.some((issue) =>
          issue.toLowerCase().includes(query)
        )
    );
  }, [services, searchQuery]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(getAllServices());
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    if (!hasLoaded.current && services.length === 0) {
      dispatch(getAllServices());
      hasLoaded.current = true;
    }
  }, [dispatch, services.length]);

  // Memoized handlers
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

  const handleLogout = useCallback(() => {
    dispatch(removeToken());
    router.replace("../../auth/login");
  }, [dispatch, router]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Render item with useCallback
  const renderItem = useCallback(
    ({ item }) => (
      <ServiceItem service={item} onPress={() => handleServicePress(item)} />
    ),
    [handleServicePress]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 200, // Approximate height
      offset: 200 * index,
      index,
    }),
    []
  );

  // Header Component
  const ListHeaderComponent = useMemo(
    () => (
      <View className="bg-white border-b border-gray-200 mb-4">
        <View className="px-5 pt-4 pb-5">
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-500 mt-1">
                {filteredServices.length} services available
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search services, issues, or tags..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    ),
    [filteredServices.length, searchQuery, clearSearch]
  );

  // Empty Component
  const ListEmptyComponent = useMemo(
    () => (
      <View className="items-center justify-center py-20">
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-400 text-lg mt-4">No services found</Text>
        <Text className="text-gray-400 text-sm text-center px-10">
          {searchQuery
            ? "Try searching for something else"
            : "No services available at the moment"}
        </Text>
      </View>
    ),
    [searchQuery]
  );


  // Loading state
  if (isLoading && !refreshing && services.length === 0) {
    return <ServiceSkeleton />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredServices}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};

export default Services;
