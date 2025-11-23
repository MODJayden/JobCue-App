import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getAllServices } from "@/store/service";
import {
  updateArtisanServices,
  getArtisanByUserId,
  removeArtisanService,
} from "@/store/artisan";
import { Ionicons } from "@expo/vector-icons";

const MAX_SERVICES = 3;

const Skills = () => {
  const dispatch = useDispatch();

  // Redux state
  const { services, loading: servicesLoading } = useSelector(
    (state) => state.service
  );
  const { user } = useSelector((state) => state.auth);
  const { artisan, loading: artisanLoading } = useSelector(
    (state) => state.artisan
  );

  // Local state
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Memoize saved services to prevent unnecessary re-renders
  const savedServices = useMemo(
    () => artisan?.services || [],
    [artisan?.services]
  );

  // Optimized: Load data in parallel and show UI immediately
  useEffect(() => {
    const loadInitialData = async () => {
      const promises = [];

      // Only fetch if data doesn't exist
      if (!services || services.length === 0) {
        promises.push(dispatch(getAllServices()));
      }

      if (user?.userId && !artisan) {
        promises.push(dispatch(getArtisanByUserId(user.userId)));
      }

      // Load in parallel
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      setInitialLoadComplete(true);
    };

    loadInitialData();
  }, []); // Only run once on mount

  // Initialize selected services from saved services
  useEffect(() => {
    if (savedServices.length > 0) {
      const serviceIds = savedServices.map((s) =>
        typeof s === "string" ? s : s._id
      );
      setSelectedServices(serviceIds);
    }
  }, [savedServices]);

  // Determine view mode
  const hasServices = savedServices.length > 0;
  const canAddMore = savedServices.length < MAX_SERVICES;
  const showSelectionView = isSelectionMode || !hasServices;

  // Memoize categories to prevent recalculation
  const categories = useMemo(() => {
    if (!services || services.length === 0)
      return [{ label: "All Services", value: "all" }];

    return [
      { label: "All Services", value: "all" },
      ...Array.from(new Set(services.map((s) => s.category))).map((cat) => ({
        label: cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: cat,
      })),
    ];
  }, [services]);


  // Memoize filtered services
  const filteredServices = useMemo(() => {
    if (!services) return [];

    return services.filter((service) => {
      if (!service.isActive) return false;

      const matchesSearch =
        searchQuery === "" ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || service.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  // Toggle service selection
  const toggleService = useCallback((serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        if (prev.length >= MAX_SERVICES) {
          Alert.alert(
            "Limit Reached",
            `You can only select up to ${MAX_SERVICES} services`
          );
          return prev;
        }
        return [...prev, serviceId];
      }
    });
  }, []);

  // Check if service is selected
  const isSelected = useCallback(
    (serviceId) => selectedServices.includes(serviceId),
    [selectedServices]
  );

  // Handle save services - optimistic update
  const handleSaveServices = async () => {
    if (selectedServices.length === 0) {
      Alert.alert("Required", "Please select at least one service");
      return;
    }

    setSaving(true);

    try {
      const res = await dispatch(
        updateArtisanServices({
          services: selectedServices,
          userId: user.userId,
        })
      );

      if (res.payload?.success) {
        // Optimistic update - no need to refetch
        Alert.alert("Success", "Services saved successfully");
        setIsSelectionMode(false);
        setSearchQuery("");
        dispatch(getArtisanByUserId(user.userId));
        setSelectedCategory("all");
      } else {
        Alert.alert("Error", res.payload?.message || "Failed to save services");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle remove service - optimistic update
  const handleRemoveService = (serviceId) => {
    Alert.alert(
      "Remove Service",
      "Are you sure you want to remove this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingServiceId(serviceId);

            try {
              const res = await dispatch(
                removeArtisanService({ userId: user.userId, serviceId })
              );

              if (res.payload?.success) {
                Alert.alert("Success", "Service removed successfully");
                dispatch(getArtisanByUserId(user.userId));
                setSelectedServices((prev) =>
                  prev.filter((id) => id !== serviceId)
                );
              } else {
                Alert.alert(
                  "Error",
                  res.payload?.message || "Failed to remove service"
                );
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setRemovingServiceId(null);
            }
          },
        },
      ]
    );
  };

  // Cancel selection mode
  const handleCancelSelection = useCallback(() => {
    const serviceIds = savedServices.map((s) =>
      typeof s === "string" ? s : s._id
    );
    setSelectedServices(serviceIds);
    setIsSelectionMode(false);
    setSearchQuery("");
    setSelectedCategory("all");
  }, [savedServices]);

  // Render service item for FlatList (better performance)
  const renderServiceItem = useCallback(
    ({ item: service }) => {
      const selected = isSelected(service._id);
      const disabled = !selected && selectedServices.length >= MAX_SERVICES;

      return (
        <TouchableOpacity
          onPress={() => toggleService(service._id)}
          disabled={disabled}
          className={`bg-white rounded-2xl p-4 border-2 mb-4 ${
            selected ? "border-[#6F4E37]" : "border-transparent"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <View className="flex-row items-start">
            <View
              className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                selected ? "bg-amber-100" : "bg-gray-100"
              }`}
            >
              <Text className="text-2xl">{service.icon}</Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-base font-bold text-gray-900">
                  {service.name}
                </Text>
                {selected && (
                  <View className="bg-[#6F4E37] rounded-full w-6 h-6 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </View>

              <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                {service.description}
              </Text>

              <View className="flex-row items-center mb-2">
                <Ionicons name="cash-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  {service.basePriceRange?.currency}{" "}
                  {service.basePriceRange?.min} - {service.basePriceRange?.max}
                </Text>
                <Text className="text-gray-400 text-xs mx-2">•</Text>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  ~{service.averageDuration} mins
                </Text>
              </View>

              {service.requiresCertification && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="shield-checkmark" size={14} color="#F59E0B" />
                  <Text className="text-amber-600 text-xs ml-1 font-semibold">
                    Certification Required
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [isSelected, selectedServices.length, toggleService]
  );

  // Show skeleton/loading on first load only
  if (!initialLoadComplete) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6F4E37" />
        <Text className="text-gray-600 mt-4">Loading services...</Text>
      </View>
    );
  }

  // Render selection view
  if (showSelectionView) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-5 pt-3 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-gray-900">
              {hasServices ? "Add More Services" : "Select Your Services"}
            </Text>
            {hasServices && (
              <TouchableOpacity onPress={handleCancelSelection}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-gray-600 text-sm">
            Choose up to {MAX_SERVICES} services you can provide
          </Text>

          {/* Selected Count */}
          {selectedServices.length > 0 && (
            <View className="mt-3 bg-amber-50 px-4 py-2 rounded-xl flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#6F4E37" />
                <Text className="text-[#6F4E37] font-semibold ml-2">
                  {selectedServices.length} / {MAX_SERVICES} service
                  {selectedServices.length !== 1 ? "s" : ""} selected
                </Text>
              </View>
              {selectedServices.length === MAX_SERVICES && (
                <View className="bg-[#6F4E37] px-2 py-1 rounded">
                  <Text className="text-white text-xs font-bold">MAX</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View className="px-5 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search services..."
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

        {/* Category Filter */}
       {/*  <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-white border-b border-gray-200 flex-grow-0 "
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
          data={categories}
          keyExtractor={(item) => item.value}
          renderItem={({ item: category }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(category.value)}
              className={`px-4 py-4 rounded-full mr-2 ${
                selectedCategory === category.value
                  ? "bg-[#6F4E37]"
                  : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  selectedCategory === category.value
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          )}
        /> */}

        {/* Services List - Using FlatList for better performance */}
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 mt-4 text-center">
                No services found
              </Text>
              <Text className="text-gray-400 text-sm mt-1 text-center">
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />

        {/* Bottom Action Buttons */}
        {selectedServices.length > 0 && (
          <View className="bg-white px-5 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSaveServices}
              className="bg-[#6F4E37] py-4 rounded-xl flex-row items-center justify-center"
              disabled={saving}
              style={{
                shadowColor: "#6F4E37",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Save {selectedServices.length} Service
                    {selectedServices.length !== 1 ? "s" : ""}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Render saved services view
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          My Services
        </Text>
        <Text className="text-gray-600 text-sm">
          Services you currently offer ({savedServices.length}/{MAX_SERVICES})
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Saved Services */}
        <View>
          {savedServices.map((service) => (
            <View
              key={service._id}
              className="bg-white rounded-2xl p-4 mb-4 border-2 border-[#6F4E37]"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row items-start">
                <View className="w-12 h-12 rounded-xl items-center justify-center mr-3 bg-amber-100">
                  <Text className="text-2xl">{service.icon}</Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-bold text-gray-900">
                      {service.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveService(service._id)}
                      className="bg-red-50 rounded-full w-8 h-8 items-center justify-center"
                      disabled={removingServiceId === service._id}
                    >
                      {removingServiceId === service._id ? (
                        <ActivityIndicator size="small" color="#6F4E37" />
                      ) : (
                        <View className="bg-[#6F4E37] rounded-full w-6 h-6 items-center justify-center">
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="white"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <Text
                    className="text-gray-600 text-sm mb-2"
                    numberOfLines={2}
                  >
                    {service.description}
                  </Text>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="cash-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {service.basePriceRange?.currency}{" "}
                      {service.basePriceRange?.min} -{" "}
                      {service.basePriceRange?.max}
                    </Text>
                    <Text className="text-gray-400 text-xs mx-2">•</Text>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      ~{service.averageDuration} mins
                    </Text>
                  </View>

                  <View className="bg-green-50 px-3 py-1 rounded-full self-start">
                    <Text className="text-green-700 text-xs font-semibold">
                      ✓ Active
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add More Services Button */}
        {canAddMore && (
          <TouchableOpacity
            onPress={() => setIsSelectionMode(true)}
            className="bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="bg-[#6F4E37] rounded-full w-12 h-12 items-center justify-center mb-3">
              <Ionicons name="add" size={28} color="white" />
            </View>
            <Text className="text-gray-900 font-bold text-base mb-1">
              Add More Services
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              You can add up to {MAX_SERVICES - savedServices.length} more
              service
              {MAX_SERVICES - savedServices.length !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 mt-4">
          <View className="flex-row">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-900 font-semibold mb-1">
                Service Limit
              </Text>
              <Text className="text-blue-700 text-sm">
                You can offer up to {MAX_SERVICES} different services. Focus on
                the services you're most skilled at to get better ratings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Skills;
