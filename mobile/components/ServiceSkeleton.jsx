// components/skeletons/ServiceSkeleton.jsx (Animated Version)
import { View, FlatList } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Animated } from "react-native";

const ShimmerServiceItem = () => {
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
    <Animated.View
      style={shimmerStyle}
      className="bg-white rounded-2xl p-5 mb-3 mx-5"
    >
      <View className="flex-row items-start">
        {/* Icon Skeleton */}
        <View className="w-16 h-16 rounded-2xl bg-gray-200 mr-4" />

        {/* Content Skeleton */}
        <View className="flex-1">
          {/* Title and Chevron */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="h-5 bg-gray-200 rounded-full flex-1 mr-2" />
            <View className="w-5 h-5 rounded-full bg-gray-200" />
          </View>

          {/* Description Skeleton */}
          <View className="h-4 bg-gray-200 rounded-full mb-3 w-4/5" />
          <View className="h-4 bg-gray-200 rounded-full mb-4 w-3/4" />

          {/* Price Range Skeleton */}
          <View className="flex-row items-center mb-4">
            <View className="w-4 h-4 rounded-full bg-gray-200" />
            <View className="h-4 bg-gray-200 rounded-full w-24 ml-2" />
          </View>

          {/* Common Issues Skeleton */}
          <View className="space-y-2 mb-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-gray-200 mr-2" />
              <View className="h-3 bg-gray-200 rounded-full flex-1" />
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-gray-200 mr-2" />
              <View className="h-3 bg-gray-200 rounded-full w-3/4" />
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-gray-200 mr-2" />
              <View className="h-3 bg-gray-200 rounded-full w-2/3" />
            </View>
          </View>

          {/* Tags Skeleton */}
          <View className="flex-row flex-wrap mt-2">
            <View className="h-6 bg-gray-200 rounded-lg w-16 mr-2 mb-1" />
            <View className="h-6 bg-gray-200 rounded-lg w-20 mr-2 mb-1" />
            <View className="h-6 bg-gray-200 rounded-lg w-14 mb-1" />
          </View>

          {/* Certification Badge Skeleton */}
          <View className="flex-row items-center mt-3">
            <View className="w-4 h-4 rounded-full bg-gray-200" />
            <View className="h-3 bg-gray-200 rounded-full w-32 ml-2" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const ShimmerHeader = () => {
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
    <Animated.View
      style={shimmerStyle}
      className="bg-white border-b border-gray-200 mb-4"
    >
      <View className="px-5 pt-4 pb-5">
        {/* Title and Count Skeleton */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1">
            <View className="h-6 bg-gray-200 rounded-full w-32 mb-1" />
            <View className="h-4 bg-gray-200 rounded-full w-24" />
          </View>
        </View>

        {/* Search Bar Skeleton */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <View className="w-5 h-5 rounded-full bg-gray-200" />
          <View className="flex-1 ml-2 h-5 bg-gray-200 rounded-full" />
          <View className="w-5 h-5 rounded-full bg-gray-200" />
        </View>
      </View>
    </Animated.View>
  );
};

const ServiceSkeleton = ({ count = 6 }) => {
  const [skeletonData] = useState(
    Array.from({ length: count }, (_, i) => ({ id: i.toString() }))
  );

  const renderSkeletonItem = ({ item }) => <ShimmerServiceItem key={item.id} />;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={skeletonData}
        renderItem={renderSkeletonItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<ShimmerHeader />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default ServiceSkeleton;
