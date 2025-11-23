// components/skeletons/ArtisanProfileSkeleton.jsx
import { View, ScrollView, Dimensions } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Animated } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const ShimmerView = ({ style, children }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <Animated.View style={[shimmerStyle, style]}>{children}</Animated.View>
  );
};

const SkeletonHeader = () => (
  <View className="bg-white border-b border-gray-200 px-5 pt-4 pb-3">
    <View className="w-6 h-6 bg-gray-200 rounded-full" />
  </View>
);

const SkeletonProfileHeader = () => (
  <View className="bg-white px-5 py-6">
    <View className="flex-row">
      {/* Profile Picture Skeleton */}
      <View className="w-24 h-24 rounded-2xl bg-gray-200" />

      {/* Profile Info Skeleton */}
      <View className="flex-1 ml-4">
        <View className="h-7 bg-gray-200 rounded-full w-3/4 mb-2" />
        <View className="h-5 bg-gray-200 rounded-full w-1/2 mb-3" />

        {/* Rating Skeleton */}
        <View className="flex-row items-center mb-2">
          <View className="w-5 h-5 bg-gray-200 rounded-full mr-2" />
          <View className="h-5 bg-gray-200 rounded-full w-12 mr-3" />
          <View className="h-4 bg-gray-200 rounded-full w-16" />
        </View>

        {/* Experience Skeleton */}
        <View className="h-4 bg-gray-200 rounded-full w-32 mb-2" />

        {/* Portfolio Count Skeleton */}
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-200 rounded-full mr-1" />
          <View className="h-4 bg-gray-200 rounded-full w-24" />
        </View>
      </View>
    </View>

    {/* Badges Skeleton */}
    <View className="flex-row flex-wrap mt-4" style={{ gap: 8 }}>
      <View className="h-8 bg-gray-200 rounded-lg w-24" />
      <View className="h-8 bg-gray-200 rounded-lg w-28" />
      <View className="h-8 bg-gray-200 rounded-lg w-20" />
    </View>
  </View>
);

const SkeletonActionButtons = () => (
  <View
    className="flex-row px-5 py-4 bg-white border-t border-gray-200"
    style={{ gap: 12 }}
  >
    <View className="flex-1 h-12 bg-gray-200 rounded-xl" />
    <View className="flex-1 h-12 bg-gray-200 rounded-xl" />
  </View>
);

const SkeletonTabs = () => (
  <View className="flex-row bg-white border-b border-gray-200 px-5">
    <View className="h-12 w-20 bg-gray-200 rounded-full mr-8" />
    <View className="h-12 w-24 bg-gray-200 rounded-full mr-8" />
    <View className="h-12 w-20 bg-gray-200 rounded-full" />
  </View>
);

const SkeletonInfoCard = () => (
  <View className="bg-white rounded-2xl p-5 mb-4">
    {/* Card Header */}
    <View className="flex-row items-center mb-3">
      <View className="w-5 h-5 bg-gray-200 rounded-full mr-2" />
      <View className="h-5 bg-gray-200 rounded-full w-32" />
    </View>

    {/* Card Content */}
    <View className="h-4 bg-gray-200 rounded-full w-full mb-2" />
    <View className="h-4 bg-gray-200 rounded-full w-3/4" />
  </View>
);

const SkeletonServicesCard = () => (
  <View className="bg-white rounded-2xl p-5 mb-4">
    {/* Card Header */}
    <View className="flex-row items-center mb-3">
      <View className="w-5 h-5 bg-gray-200 rounded-full mr-2" />
      <View className="h-5 bg-gray-200 rounded-full w-36" />
    </View>

    {/* Service Tags */}
    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
      <View className="h-8 bg-gray-200 rounded-lg w-20" />
      <View className="h-8 bg-gray-200 rounded-lg w-24" />
      <View className="h-8 bg-gray-200 rounded-lg w-16" />
      <View className="h-8 bg-gray-200 rounded-lg w-22" />
    </View>
  </View>
);

const SkeletonPortfolioItem = () => (
  <View className="mb-4" style={{ width: CARD_WIDTH }}>
    <View
      className="bg-gray-200 rounded-xl"
      style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.2 }}
    />
    <View className="h-4 bg-gray-200 rounded-full mt-2 w-3/4" />
  </View>
);

const SkeletonPortfolioTab = () => (
  <View>
    {/* Category Filter Skeleton */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ gap: 8 }}
    >
      <View className="h-8 bg-gray-200 rounded-full w-16" />
      <View className="h-8 bg-gray-200 rounded-full w-20" />
      <View className="h-8 bg-gray-200 rounded-full w-24" />
      <View className="h-8 bg-gray-200 rounded-full w-20" />
    </ScrollView>

    {/* Portfolio Grid Skeleton */}
    <View className="flex-row flex-wrap justify-between">
      <SkeletonPortfolioItem />
      <SkeletonPortfolioItem />
      <SkeletonPortfolioItem />
      <SkeletonPortfolioItem />
    </View>

    {/* Portfolio Count Skeleton */}
    <View className="h-10 bg-gray-200 rounded-xl mt-4" />
  </View>
);

const SkeletonReviewsTab = () => (
  <View>
    {/* Rating Breakdown Skeleton */}
    <View className="bg-white rounded-2xl p-5 mb-4">
      <View className="h-6 bg-gray-200 rounded-full w-40 mb-4" />

      {[1, 2, 3, 4].map((item) => (
        <View key={item} className="mb-3 last:mb-0">
          <View className="flex-row items-center justify-between mb-1">
            <View className="h-4 bg-gray-200 rounded-full w-20" />
            <View className="h-4 bg-gray-200 rounded-full w-8" />
          </View>
          <View className="h-2 bg-gray-200 rounded-full" />
        </View>
      ))}
    </View>

    {/* Reviews Placeholder Skeleton */}
    <View className="bg-white rounded-2xl p-5">
      <View className="h-4 bg-gray-200 rounded-full w-full mb-2" />
      <View className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto" />
    </View>
  </View>
);

const SkeletonAboutTab = () => (
  <View>
    <SkeletonServicesCard />
    <SkeletonInfoCard />
    <SkeletonInfoCard />
    <SkeletonInfoCard />
    <SkeletonInfoCard />
  </View>
);

const SkeletonBookButton = () => (
  <View className="bg-white border-t border-gray-200 px-5 py-4">
    <View className="h-14 bg-gray-200 rounded-2xl" />
  </View>
);

const ArtisanProfileSkeleton = () => {
  const [activeTab, setActiveTab] = useState("about");

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return <SkeletonAboutTab />;
      case "portfolio":
        return <SkeletonPortfolioTab />;
      case "reviews":
        return <SkeletonReviewsTab />;
      default:
        return <SkeletonAboutTab />;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ShimmerView>
        <SkeletonHeader />
      </ShimmerView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <ShimmerView>
          <SkeletonProfileHeader />
        </ShimmerView>

        <ShimmerView>
          <SkeletonActionButtons />
        </ShimmerView>

        <ShimmerView>
          <SkeletonTabs />
        </ShimmerView>

        <View className="px-5 py-6">
          <ShimmerView>{renderTabContent()}</ShimmerView>
        </View>
      </ScrollView>

      <ShimmerView>
        <SkeletonBookButton />
      </ShimmerView>
    </View>
  );
};

export default ArtisanProfileSkeleton;
