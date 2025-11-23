import { useSelector, useDispatch } from "react-redux";
import { getAllServiceAreas } from "../../../store/serviceArea";
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
import {
  updateArtisanServiceAreas,
  removeArtisanServiceArea,
} from "@/store/serviceArea";
import { getArtisanByUserId } from "@/store/artisan";
import { Ionicons } from "@expo/vector-icons";

const MAX_AREAS = 5;

const ServiceLocation = () => {
  const dispatch = useDispatch();

  // Redux state
  const { serviceAreas, loading: areasLoading } = useSelector(
    (state) => state.serviceArea
  );
  const { user } = useSelector((state) => state.auth);
  const { artisan, loading: artisanLoading } = useSelector(
    (state) => state.artisan
  );

  // Local state
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingAreaId, setRemovingAreaId] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Memoize saved areas to prevent unnecessary re-renders
  const savedAreas = useMemo(
    () => artisan?.serviceAreas || [],
    [artisan?.serviceAreas]
  );

  // Optimized: Load data in parallel and show UI immediately
  useEffect(() => {
    const loadInitialData = async () => {
      const promises = [];

      // Only fetch if data doesn't exist
      if (!serviceAreas || serviceAreas.length === 0) {
        promises.push(dispatch(getAllServiceAreas()));
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

  // Initialize selected areas from saved areas
  useEffect(() => {
    if (savedAreas.length > 0) {
      const areaIds = savedAreas.map((a) =>
        typeof a === "string" ? a : a._id
      );
      setSelectedAreas(areaIds);
    }
  }, [savedAreas]);

  // Determine view mode
  const hasAreas = savedAreas.length > 0;
  const canAddMore = savedAreas.length < MAX_AREAS;
  const showSelectionView = isSelectionMode || !hasAreas;

  // Memoize regions to prevent recalculation
  const regions = useMemo(() => {
    if (!serviceAreas || serviceAreas.length === 0)
      return [{ label: "All Regions", value: "all" }];

    return [
      { label: "All Regions", value: "all" },
      ...Array.from(new Set(serviceAreas.map((a) => a.region))).map((reg) => ({
        label: reg,
        value: reg,
      })),
    ];
  }, [serviceAreas]);

  // Memoize districts based on selected region
  const districts = useMemo(() => {
    if (!serviceAreas || serviceAreas.length === 0)
      return [{ label: "All Districts", value: "all" }];

    const filteredAreas =
      selectedRegion === "all"
        ? serviceAreas
        : serviceAreas.filter((a) => a.region === selectedRegion);

    return [
      { label: "All Districts", value: "all" },
      ...Array.from(new Set(filteredAreas.map((a) => a.district))).map(
        (dist) => ({
          label: dist,
          value: dist,
        })
      ),
    ];
  }, [serviceAreas, selectedRegion]);

  // Memoize filtered areas
  const filteredAreas = useMemo(() => {
    if (!serviceAreas) return [];

    return serviceAreas.filter((area) => {
      if (!area.isActive) return false;

      const matchesSearch =
        searchQuery === "" ||
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.searchKeywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesRegion =
        selectedRegion === "all" || area.region === selectedRegion;

      const matchesDistrict =
        selectedDistrict === "all" || area.district === selectedDistrict;

      return matchesSearch && matchesRegion && matchesDistrict;
    });
  }, [serviceAreas, searchQuery, selectedRegion, selectedDistrict]);

  // Sort areas: popular first, then by name
  const sortedAreas = useMemo(() => {
    return [...filteredAreas].sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredAreas]);

  // Toggle area selection
  const toggleArea = useCallback((areaId) => {
    setSelectedAreas((prev) => {
      if (prev.includes(areaId)) {
        return prev.filter((id) => id !== areaId);
      } else {
        if (prev.length >= MAX_AREAS) {
          Alert.alert(
            "Limit Reached",
            `You can only select up to ${MAX_AREAS} service areas`
          );
          return prev;
        }
        return [...prev, areaId];
      }
    });
  }, []);

  // Check if area is selected
  const isSelected = useCallback(
    (areaId) => selectedAreas.includes(areaId),
    [selectedAreas]
  );

  // Handle save areas - optimistic update
  const handleSaveAreas = async () => {
    if (selectedAreas.length === 0) {
      Alert.alert("Required", "Please select at least one service area");
      return;
    }

    setSaving(true);

    try {
      const res = await dispatch(
        updateArtisanServiceAreas({
          serviceAreas: selectedAreas,
          userId: user.userId,
        })
      );

      if (res.payload?.success) {
        // Optimistic update - no need to refetch
        Alert.alert("Success", "Service areas saved successfully");
        setIsSelectionMode(false);
        setSearchQuery("");
        dispatch(getArtisanByUserId(user.userId));
        setSelectedRegion("all");
        setSelectedDistrict("all");
      } else {
        Alert.alert(
          "Error",
          res.payload?.message || "Failed to save service areas"
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle remove area - optimistic update
  const handleRemoveArea = (areaId) => {
    Alert.alert(
      "Remove Service Area",
      "Are you sure you want to remove this service area?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingAreaId(areaId);

            try {
              const res = await dispatch(
                removeArtisanServiceArea({
                  userId: user.userId,
                  serviceAreaId: areaId,
                })
              );

              if (res.payload?.success) {
                Alert.alert("Success", "Service area removed successfully");
                dispatch(getArtisanByUserId(user.userId));
                setSelectedAreas((prev) => prev.filter((id) => id !== areaId));
              } else {
                Alert.alert(
                  "Error",
                  res.payload?.message || "Failed to remove service area"
                );
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setRemovingAreaId(null);
            }
          },
        },
      ]
    );
  };

  // Cancel selection mode
  const handleCancelSelection = useCallback(() => {
    const areaIds = savedAreas.map((a) => (typeof a === "string" ? a : a._id));
    setSelectedAreas(areaIds);
    setIsSelectionMode(false);
    setSearchQuery("");
    setSelectedRegion("all");
    setSelectedDistrict("all");
  }, [savedAreas]);

  // Render area item for FlatList (better performance)
  const renderAreaItem = useCallback(
    ({ item: area }) => {
      const selected = isSelected(area._id);
      const disabled = !selected && selectedAreas.length >= MAX_AREAS;

      return (
        <TouchableOpacity
          onPress={() => toggleArea(area._id)}
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
              <Ionicons
                name="location"
                size={24}
                color={selected ? "#6F4E37" : "#9CA3AF"}
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center flex-1">
                  <Text className="text-base font-bold text-gray-900">
                    {area.name}
                  </Text>
                  {area.isPopular && (
                    <View className="bg-yellow-100 px-2 py-0.5 rounded ml-2">
                      <Text className="text-yellow-700 text-xs font-semibold">
                        Popular
                      </Text>
                    </View>
                  )}
                </View>
                {selected && (
                  <View className="bg-[#6F4E37] rounded-full w-6 h-6 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </View>

              <View className="flex-row items-center mb-2">
                <Ionicons name="business-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {area.district}
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <Ionicons name="map-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-xs ml-1">
                  {area.region}
                </Text>
              </View>

              {area.artisanCount > 0 && (
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-500 text-xs ml-1">
                    {area.artisanCount} artisan
                    {area.artisanCount !== 1 ? "s" : ""} serving this area
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [isSelected, selectedAreas.length, toggleArea]
  );


  // Show skeleton/loading on first load only
  if (!initialLoadComplete) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6F4E37" />
        <Text className="text-gray-600 mt-4">Loading service areas...</Text>
      </View>
    );
  }

  // Render selection view
  if (showSelectionView) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-5  pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-gray-900">
              {hasAreas ? "Add More Areas" : null}
            </Text>
            {hasAreas && (
              <TouchableOpacity onPress={handleCancelSelection}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-gray-600 text-sm">
            Choose up to {MAX_AREAS} areas where you can provide services
          </Text>

          {/* Selected Count */}
          {selectedAreas.length > 0 && (
            <View className="mt-3 bg-amber-50 px-4 py-2 rounded-xl flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#6F4E37" />
                <Text className="text-[#6F4E37] font-semibold ml-2">
                  {selectedAreas.length} / {MAX_AREAS} area
                  {selectedAreas.length !== 1 ? "s" : ""} selected
                </Text>
              </View>
              {selectedAreas.length === MAX_AREAS && (
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
              placeholder="Search areas..."
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

        {/* Region Filter */}
        {/*   <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-white border-b border-gray-200 flex-grow-0"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
          data={regions}
          keyExtractor={(item) => item.value}
          renderItem={({ item: region }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedRegion(region.value);
                setSelectedDistrict("all"); // Reset district when region changes
              }}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedRegion === region.value ? "bg-[#6F4E37]" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  selectedRegion === region.value
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {region.label}
              </Text>
            </TouchableOpacity>
          )}
        /> */}

        {/* District Filter (shown only when region is selected) */}
        {selectedRegion !== "all" && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            className="bg-gray-50 border-b border-gray-200 flex-grow-0"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 8,
            }}
            data={districts}
            keyExtractor={(item) => item.value}
            renderItem={({ item: district }) => (
              <TouchableOpacity
                onPress={() => setSelectedDistrict(district.value)}
                className={`px-3 py-1.5 rounded-full mr-2 ${
                  selectedDistrict === district.value
                    ? "bg-amber-100 border border-[#6F4E37]"
                    : "bg-white border border-gray-300"
                }`}
              >
                <Text
                  className={`font-medium text-xs ${
                    selectedDistrict === district.value
                      ? "text-[#6F4E37]"
                      : "text-gray-600"
                  }`}
                >
                  {district.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Areas List - Using FlatList for better performance */}
        <FlatList
          data={sortedAreas}
          renderItem={renderAreaItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="location-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 mt-4 text-center">
                No service areas found
              </Text>
              <Text className="text-gray-400 text-sm mt-1 text-center">
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />

        {/* Bottom Action Buttons */}
        {selectedAreas.length > 0 && (
          <View className="bg-white px-5 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSaveAreas}
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
                    Save {selectedAreas.length} Area
                    {selectedAreas.length !== 1 ? "s" : ""}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Render saved areas view
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          My Service Areas
        </Text>
        <Text className="text-gray-600 text-sm">
          Areas where you provide services ({savedAreas.length}/{MAX_AREAS})
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Saved Areas */}
        <View>
          {savedAreas.map((area) => (
            <View
              key={area._id}
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
                  <Ionicons name="location" size={24} color="#6F4E37" />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-base font-bold text-gray-900">
                        {area.name}
                      </Text>
                      {area.isPopular && (
                        <View className="bg-yellow-100 px-2 py-0.5 rounded ml-2">
                          <Text className="text-yellow-700 text-xs font-semibold">
                            ⭐ Popular
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveArea(area._id)}
                      className="bg-red-50 rounded-full w-8 h-8 items-center justify-center"
                      disabled={removingAreaId === area._id}
                    >
                      {removingAreaId === area._id ? (
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

                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="business-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-gray-600 text-sm ml-1">
                      {area.district}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="map-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-xs ml-1">
                      {area.region}
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

        {/* Add More Areas Button */}
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
              Add More Service Areas
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              You can add up to {MAX_AREAS - savedAreas.length} more area
              {MAX_AREAS - savedAreas.length !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 mt-4">
          <View className="flex-row">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-900 font-semibold mb-1">
                Service Area Limit
              </Text>
              <Text className="text-blue-700 text-sm">
                You can serve up to {MAX_AREAS} different areas. Focus on areas
                you can reliably reach to maintain good ratings and customer
                satisfaction.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceLocation;
