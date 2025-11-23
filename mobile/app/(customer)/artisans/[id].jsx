// Updated ArtisanProfileScreen with Add to Favorites

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
  ActivityIndicator,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getArtisanProfileById } from "../../../store/artisan";
import { toggleFavoriteArtisan } from "../../../store/user";
import { useDispatch, useSelector } from "react-redux";
import ArtisanProfileSkeleton from "../../../components/ArtisanProfileSkeleton";
import BookingModal from "../../../components/BookingModal";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

// Static configurations
const BADGE_CONFIG = {
  top_rated: { color: "#F59E0B", icon: "star", label: "Top Rated" },
  quick_response: { color: "#3B82F6", icon: "flash", label: "Quick Response" },
  emergency_expert: {
    color: "#EF4444",
    icon: "alarm",
    label: "Emergency Expert",
  },
  verified: { color: "#10B981", icon: "checkmark-circle", label: "Verified" },
};

const TABS = ["about", "portfolio", "reviews"];

const RATING_CATEGORIES = [
  { key: "quality", label: "Quality" },
  { key: "punctuality", label: "Punctuality" },
  { key: "pricing", label: "Pricing" },
  { key: "professionalism", label: "Professionalism" },
];

const PORTFOLIO_CATEGORY_LABELS = {
  before_after: "Before & After",
  service_work: "Service Work",
  project_completion: "Completed Projects",
  tools_equipment: "Tools & Equipment",
  other: "Other",
};

// Memoized Badge Component
const Badge = ({ badge }) => {
  const config = BADGE_CONFIG[badge];
  if (!config) return null;

  return (
    <View
      className="px-3 py-1.5 rounded-lg flex-row items-center"
      style={{ backgroundColor: `${config.color}15`, gap: 6 }}
    >
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text className="text-sm font-semibold" style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
};

// Memoized Info Card Component
const InfoCard = ({ icon, title, children }) => (
  <View className="bg-white rounded-2xl p-5 mb-4">
    <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
      <Ionicons name={icon} size={20} color="#1F2937" />
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
    </View>
    {children}
  </View>
);

// Service Areas Component
const ServiceAreas = ({ serviceAreas }) => {
  const areasText = useMemo(() => {
    if (!serviceAreas || serviceAreas.length === 0) {
      return "No service areas listed";
    }
    return serviceAreas.map((area) => area.name || area).join(", ");
  }, [serviceAreas]);

  return (
    <InfoCard icon="location" title="Service Areas">
      <Text className="text-gray-600">{areasText}</Text>
    </InfoCard>
  );
};

// Services Component
const ServicesDisplay = ({ services }) => {
  const serviceNames = useMemo(() => {
    if (!services || services.length === 0) return [];
    return services.map((service) => service.name || service);
  }, [services]);

  if (serviceNames.length === 0) return null;

  return (
    <InfoCard icon="construct" title="Services Offered">
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {serviceNames.map((service, index) => (
          <View key={index} className="bg-blue-50 px-3 py-2 rounded-lg">
            <Text className="text-sm text-blue-700 font-medium">{service}</Text>
          </View>
        ))}
      </View>
    </InfoCard>
  );
};

// Languages Component
const LanguagesDisplay = ({ languages }) => {
  const languagesText = useMemo(() => {
    if (!languages || languages.length === 0) return "English";
    return languages.join(", ");
  }, [languages]);

  return (
    <InfoCard icon="language" title="Languages">
      <Text className="text-gray-600">{languagesText}</Text>
    </InfoCard>
  );
};

// Certifications Component
const CertificationsDisplay = ({ certifications }) => {
  if (!certifications || certifications.length === 0) return null;

  return (
    <InfoCard icon="ribbon" title="Certifications">
      {certifications.map((cert, index) => (
        <View key={index} className="mb-3 last:mb-0">
          <Text className="text-gray-900 font-semibold">{cert.name}</Text>
          <Text className="text-sm text-gray-500">
            {cert.issuingOrg} • {cert.year}
          </Text>
        </View>
      ))}
    </InfoCard>
  );
};

// Ghana Card Verification Component
const GhanaCardVerification = ({ ghanaCard }) => {
  if (!ghanaCard) return null;

  return (
    <View className="bg-white rounded-2xl p-5 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Ionicons
            name="card"
            size={20}
            color={ghanaCard.verified ? "#10B981" : "#F59E0B"}
          />
          <Text className="text-lg font-bold text-gray-900">
            Ghana Card Verification
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            ghanaCard.verified ? "bg-green-100" : "bg-yellow-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              ghanaCard.verified ? "text-green-700" : "text-yellow-700"
            }`}
          >
            {ghanaCard.verified ? "Verified" : "Pending"}
          </Text>
        </View>
      </View>
      {ghanaCard.number && (
        <Text className="text-sm text-gray-500 mt-2">
          ID: {ghanaCard.number}
        </Text>
      )}
    </View>
  );
};

// Background Check Component
const BackgroundCheckDisplay = ({ backgroundCheck }) => {
  if (!backgroundCheck) return null;

  const statusConfig = {
    approved: { color: "#10B981", bg: "#ECFDF5", text: "Passed" },
    pending: { color: "#F59E0B", bg: "#FFFBEB", text: "Pending" },
    rejected: { color: "#EF4444", bg: "#FEF2F2", text: "Failed" },
  };

  const config = statusConfig[backgroundCheck.status] || statusConfig.pending;

  return (
    <View className="bg-white rounded-2xl p-5 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Ionicons name="shield-checkmark" size={20} color={config.color} />
          <Text className="text-lg font-bold text-gray-900">
            Background Check
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: config.bg }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: config.color }}
          >
            {config.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Portfolio Item Component
const PortfolioItem = ({ item, onPress }) => {
  const isSingleImage = item.portfolioImageType === "single";
  const imageUrl = isSingleImage
    ? item.image?.url
    : item.beforeAfter?.after?.url || item.beforeAfter?.before?.url;

  const categoryLabel = PORTFOLIO_CATEGORY_LABELS[item.category] || "Work";

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      className="mb-4"
      style={{ width: CARD_WIDTH }}
    >
      <View className="relative">
        <Image
          source={{ uri: imageUrl || "https://via.placeholder.com/200" }}
          style={{
            width: CARD_WIDTH,
            height: CARD_WIDTH * 1.2,
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
          }}
        />

        {/* Featured Badge */}
        {item.isFeatured && (
          <View
            className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded-lg flex-row items-center"
            style={{ gap: 4 }}
          >
            <Ionicons name="star" size={12} color="white" />
            <Text className="text-xs font-bold text-white">Featured</Text>
          </View>
        )}

        {/* Before/After Badge */}
        {!isSingleImage && (
          <View className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded-lg">
            <Text className="text-xs font-bold text-white">Before & After</Text>
          </View>
        )}

        {/* Category Badge */}
        <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-lg">
          <Text className="text-xs font-semibold text-white">
            {categoryLabel}
          </Text>
        </View>
      </View>

      {/* Caption */}
      {(isSingleImage
        ? item.image?.caption
        : item.beforeAfter?.description) && (
        <Text className="text-sm text-gray-700 mt-2" numberOfLines={2}>
          {isSingleImage ? item.image.caption : item.beforeAfter.description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Portfolio Image Modal Component
const PortfolioModal = ({ visible, item, onClose }) => {
  if (!item) return null;

  const isBeforeAfter = item.portfolioImageType === "before_after_pair";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/95">
        {/* Header */}
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="text-white text-lg font-bold">
              {isBeforeAfter ? "Before & After" : "Portfolio"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Image Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {isBeforeAfter && item.beforeAfter ? (
            <View className="px-5">
              {/* Before Image */}
              <View className="mb-4">
                <View className="bg-black/60 px-3 py-1 rounded-t-lg">
                  <Text className="text-white font-bold text-sm">BEFORE</Text>
                </View>
                <Image
                  source={{ uri: item.beforeAfter.before?.url }}
                  className="w-full h-72 rounded-b-lg"
                  resizeMode="contain"
                  style={{ backgroundColor: "#1F2937" }}
                />
                {item.beforeAfter.before?.caption && (
                  <Text className="text-gray-400 text-xs mt-2">
                    {item.beforeAfter.before.caption}
                  </Text>
                )}
              </View>

              {/* After Image */}
              <View className="mb-4">
                <View className="bg-green-600 px-3 py-1 rounded-t-lg">
                  <Text className="text-white font-bold text-sm">AFTER</Text>
                </View>
                <Image
                  source={{ uri: item.beforeAfter.after?.url }}
                  className="w-full h-72 rounded-b-lg"
                  resizeMode="contain"
                  style={{ backgroundColor: "#1F2937" }}
                />
                {item.beforeAfter.after?.caption && (
                  <Text className="text-gray-400 text-xs mt-2">
                    {item.beforeAfter.after.caption}
                  </Text>
                )}
              </View>

              {/* Description */}
              {item.beforeAfter.description && (
                <View className="bg-gray-900 p-4 rounded-lg mb-4">
                  <Text className="text-white text-sm leading-5">
                    {item.beforeAfter.description}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            item.image && (
              <View className="flex-1 justify-center px-5">
                <Image
                  source={{ uri: item.image.url }}
                  className="w-full"
                  style={{ height: height * 0.5 }}
                  resizeMode="contain"
                />

                {/* Caption */}
                {item.image.caption && (
                  <View className="bg-gray-900 p-4 rounded-lg mt-4">
                    <Text className="text-white text-sm leading-5">
                      {item.image.caption}
                    </Text>
                  </View>
                )}

                {/* Category Info */}
                <View className="bg-gray-900 p-3 rounded-lg mt-2 flex-row items-center justify-between">
                  <Text className="text-gray-400 text-xs">Category</Text>
                  <Text className="text-white text-sm font-semibold capitalize">
                    {PORTFOLIO_CATEGORY_LABELS[item.category] ||
                      item.category?.replace("_", " ") ||
                      "Work"}
                  </Text>
                </View>
              </View>
            )
          )}

          {/* Featured Badge */}
          {item.isFeatured && (
            <View className="px-5 pb-2">
              <View
                className="bg-yellow-500/20 border border-yellow-500 p-3 rounded-lg flex-row items-center justify-center"
                style={{ gap: 6 }}
              >
                <Ionicons name="star" size={16} color="#EAB308" />
                <Text className="text-yellow-500 font-semibold text-sm">
                  Featured Work
                </Text>
              </View>
            </View>
          )}

          {/* Upload Date */}
          {item.uploadedAt && (
            <View className="px-5 py-3">
              <Text className="text-gray-500 text-xs text-center">
                Uploaded on{" "}
                {new Date(item.uploadedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// Portfolio Tab Component
const PortfolioTab = ({ portfolio, onItemPress }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPortfolio = useMemo(() => {
    if (!portfolio || portfolio.length === 0) return [];
    if (selectedCategory === "all") return portfolio;
    return portfolio.filter((item) => item.category === selectedCategory);
  }, [portfolio, selectedCategory]);

  const categories = useMemo(() => {
    if (!portfolio || portfolio.length === 0) return [];
    const cats = [...new Set(portfolio.map((item) => item.category))];
    return ["all", ...cats];
  }, [portfolio]);

  if (!portfolio || portfolio.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-8 items-center">
        <Ionicons name="images-outline" size={48} color="#D1D5DB" />
        <Text className="text-gray-500 text-center mt-3">
          No portfolio items yet
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Category Filter */}
      {categories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat ? "bg-[#6F4E37]" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedCategory === cat ? "text-white" : "text-gray-600"
                }`}
              >
                {cat === "all" ? "All" : PORTFOLIO_CATEGORY_LABELS[cat] || cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Portfolio Grid */}
      <View className="flex-row flex-wrap justify-between">
        {filteredPortfolio.map((item, index) => (
          <PortfolioItem key={index} item={item} onPress={onItemPress} />
        ))}
      </View>

      {/* Portfolio Count */}
      <View className="bg-gray-100 rounded-xl p-3 mt-4">
        <Text className="text-sm text-gray-600 text-center">
          {filteredPortfolio.length}{" "}
          {filteredPortfolio.length === 1 ? "item" : "items"}
          {selectedCategory !== "all" && " in this category"}
        </Text>
      </View>
    </View>
  );
};

// Reviews Tab Component
const ReviewsTab = ({ rating }) => {
  const breakdownData = useMemo(() => {
    return RATING_CATEGORIES.map((cat) => ({
      ...cat,
      value: rating?.breakdown?.[cat.key] || 0,
    }));
  }, [rating]);

  return (
    <View>
      <View className="bg-white rounded-2xl p-5 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Rating Breakdown
        </Text>
        {breakdownData.map((item, index) => (
          <View key={index} className="mb-3 last:mb-0">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-700">{item.label}</Text>
              <Text className="text-gray-900 font-semibold">
                {item.value.toFixed(1)}
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${(item.value / 5) * 100}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      <View className="bg-white rounded-2xl p-5">
        <Text className="text-gray-500 text-center">
          Review details coming soon
        </Text>
      </View>
    </View>
  );
};

const ArtisanProfileScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("about");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  const dispatch = useDispatch();

  const { currentArtisan: artisan, loadingArtisanProfile } = useSelector(
    (state) => state.artisan
  );
  
  // ✅ Get user and favorites from auth state
  const { user, favorites, isToggleFavoriteLoading } = useSelector(
    (state) => state.auth
  );

  // ✅ Check if artisan is in favorites
  const isFavorite = useMemo(() => {
    return favorites?.includes(id) || false;
  }, [favorites, id]);

  useEffect(() => {
    if (!id) return;

    if (!artisan || artisan._id !== id) {
      dispatch(getArtisanProfileById(id));
    }
  }, [id]);

  // Handle Booking Submit
  const handleBookingSubmit = (formData) => {
    console.log("Booking submitted:", {
      ...formData,
      artisanId: artisan?._id,
    });
    setShowBooking(false);
  };

  // ✅ Handle Toggle Favorite
  const handleToggleFavorite = useCallback(async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login to add artisans to your favorites",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/login") },
        ]
      );
      return;
    }
    try {
      await dispatch(
        toggleFavoriteArtisan({
          artisanId: id,
          userId: user?.userId,
        })
      ).unwrap();
    } catch (error) {
      Alert.alert(
        "Error",
        error || "Failed to update favorites. Please try again."
      );
    }
  }, [user, id, dispatch, router]);

  // Memoized values
  const profilePicture = useMemo(
    () =>
      artisan?.media?.profilePicture?.url ||
      artisan?.userId?.profilePicture ||
      "https://via.placeholder.com/100",
    [artisan]
  );

  const displayName = useMemo(
    () => artisan?.userId?.name || "Artisan",
    [artisan]
  );

  const phoneNumber = useMemo(() => artisan?.userId?.phone, [artisan]);

  const portfolio = useMemo(() => artisan?.media?.portfolio || [], [artisan]);

  // Callbacks
  const handleBack = () => {
    router.back();
  };

  const handleCall = useCallback(() => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  }, [phoneNumber]);

  const handleMessage = useCallback(() => {
    Alert.alert(
      "Note",
      "You can start chatting with artisan when your booking price is proposed"
    );
  }, []);

  const handleTabPress = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handlePortfolioItemPress = useCallback((item) => {
    setSelectedPortfolioItem(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedPortfolioItem(null), 300);
  }, []);

  // Loading state
  if (loadingArtisanProfile) {
    return <ArtisanProfileSkeleton />;
  }

  // Not found state
  if (!artisan) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-5">
        <Ionicons name="person-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-900 text-xl font-bold mt-4">
          Artisan Not Found
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          The artisan profile you're looking for doesn't exist or has been
          removed.
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-slate-900 px-6 py-3 rounded-full mt-6"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-5 pt-4 pb-3">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* Profile Header */}
        <View className="bg-white px-5 py-6">
          <View className="flex-row">
            <Image
              source={{ uri: profilePicture }}
              className="w-24 h-24 rounded-2xl"
              style={{ backgroundColor: "#F3F4F6" }}
            />

            <View className="flex-1 ml-4">
              <Text
                className="text-2xl font-bold text-gray-900"
                numberOfLines={2}
              >
                {displayName}
              </Text>
              {artisan.businessName && (
                <Text
                  className="text-base text-gray-500 mt-1"
                  numberOfLines={1}
                >
                  {artisan.businessName}
                </Text>
              )}

              {/* Rating */}
              <View className="flex-row items-center mt-2" style={{ gap: 8 }}>
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text className="text-lg font-bold text-gray-900">
                    {artisan.rating?.average?.toFixed(1) || "New"}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">
                  ({artisan.rating?.count || 0} reviews)
                </Text>
              </View>

              {/* Experience */}
              {artisan.experience > 0 && (
                <Text className="text-sm text-gray-600 mt-2">
                  {artisan.experience}+ years experience
                </Text>
              )}

              {/* Portfolio Count */}
              {portfolio.length > 0 && (
                <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                  <Ionicons name="images" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600">
                    {portfolio.length} portfolio{" "}
                    {portfolio.length === 1 ? "item" : "items"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Badges */}
          {artisan.badges && artisan.badges.length > 0 && (
            <View className="flex-row flex-wrap mt-4" style={{ gap: 8 }}>
              {artisan.badges.map((badge, index) => (
                <Badge key={index} badge={badge} />
              ))}
            </View>
          )}
        </View>

        {/* ✅ Action Buttons - Updated with Favorite */}
        <View
          className="flex-row px-5 py-4 bg-white border-t border-gray-200"
          style={{ gap: 12 }}
        >
          {/* Favorite Button */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={isToggleFavoriteLoading}
            className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
              isFavorite ? "bg-red-50 border-2 border-red-500" : "bg-gray-100"
            }`}
            style={{ gap: 8 }}
            activeOpacity={0.7}
          >
            {isToggleFavoriteLoading ? (
              <ActivityIndicator 
                size="small" 
                color={isFavorite ? "#EF4444" : "#1F2937"} 
              />
            ) : (
              <>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "#EF4444" : "#1F2937"}
                />
                <Text
                  className={`font-semibold ${
                    isFavorite ? "text-red-500" : "text-gray-900"
                  }`}
                >
                  {isFavorite ? "Favorited" : "Favorite"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Message Button */}
          <TouchableOpacity
            onPress={handleMessage}
            className="flex-1 bg-gray-100 py-3.5 rounded-xl flex-row items-center justify-center"
            style={{ gap: 8 }}
          >
            <Ionicons name="chatbubble" size={20} color="#1F2937" />
            <Text className="text-gray-900 font-semibold">Message</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white border-b border-gray-200 px-5">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab)}
              className={`py-4 mr-8 ${activeTab === tab ? "border-b-2" : ""}`}
              style={activeTab === tab ? { borderColor: "#1F2937" } : {}}
            >
              <Text
                className={`text-base font-semibold capitalize ${
                  activeTab === tab ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-5 py-6">
          {activeTab === "about" && (
            <View>
              <ServicesDisplay services={artisan.services} />
              <ServiceAreas serviceAreas={artisan.serviceAreas} />
              <LanguagesDisplay languages={artisan.languages} />
              <GhanaCardVerification ghanaCard={artisan.ghanaCard} />
              <BackgroundCheckDisplay
                backgroundCheck={artisan.backgroundCheck}
              />
              <CertificationsDisplay certifications={artisan.certifications} />
            </View>
          )}

          {activeTab === "portfolio" && (
            <PortfolioTab
              portfolio={portfolio}
              onItemPress={handlePortfolioItemPress}
            />
          )}

          {activeTab === "reviews" && <ReviewsTab rating={artisan.rating} />}
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View className="bg-white border-t border-gray-200 px-5 py-4">
        <TouchableOpacity
          onPress={() => setShowBooking(true)}
          className="bg-[#6F4E37] py-4 rounded-2xl active:opacity-80"
        >
          <Text className="text-white text-center text-lg font-bold">
            Book Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Modal */}
      <PortfolioModal
        visible={modalVisible}
        item={selectedPortfolioItem}
        onClose={handleCloseModal}
      />
      
      {/* Booking Modal */}
      <BookingModal
        visible={showBooking}
        artisan={artisan}
        aiEstimate={{ min: 80, max: 120 }}
        onSubmit={handleBookingSubmit}
        onClose={() => setShowBooking(false)}
      />
    </SafeAreaView>
  );
};

export default ArtisanProfileScreen;