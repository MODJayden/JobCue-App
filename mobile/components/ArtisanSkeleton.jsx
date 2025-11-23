// components/skeletons/ArtisanSkeleton.jsx
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const SkeletonItem = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity, paddingHorizontal: 10 }}
      className="bg-white rounded-2xl  mb-3 border border-gray-100"
    >
      <View className="flex-row items-center">
        {/* Profile Picture Skeleton */}
        <View className="relative mr-3">
          <View className="w-14 h-14 rounded-full bg-gray-200" />
          {/* Badge Skeleton */}
          <View className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 items-center justify-center border-2 border-white">
            <View className="w-3 h-3 rounded-full bg-gray-300" />
          </View>
        </View>

        {/* Artisan Info Skeleton */}
        <View className="flex-1">
          {/* Name and Verification Skeleton */}
          <View className="flex-row items-center mb-3">
            <View className="h-4 bg-gray-200 rounded-full flex-1 mr-2" />
            <View className="w-4 h-4 rounded-full bg-gray-200" />
          </View>

          {/* Services Skeleton */}
          <View className="h-3 bg-gray-200 rounded-full mb-3 w-3/4" />

          {/* Rating and Location Skeleton */}
          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 rounded-full bg-gray-200" />
              <View className="h-3 bg-gray-200 rounded-full w-8 ml-1" />
            </View>
            <View className="flex-row items-center flex-1">
              <View className="w-3 h-3 rounded-full bg-gray-200" />
              <View className="h-3 bg-gray-200 rounded-full flex-1 ml-1" />
            </View>
          </View>

          {/* Experience Skeleton */}
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-gray-200" />
            <View className="h-3 bg-gray-200 rounded-full w-20 ml-1" />
          </View>
        </View>

        {/* Book Button Skeleton */}
        <View className="bg-gray-200 px-4 py-2.5 rounded-xl ml-2">
          <View className="w-8 h-3 bg-gray-300 rounded-full" />
        </View>
      </View>

      {/* Availability Indicator Skeleton */}
      <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
        <View className="w-2 h-2 rounded-full bg-gray-200 mr-2" />
        <View className="h-3 bg-gray-200 rounded-full w-20" />
        <View className="w-2 h-2 rounded-full bg-gray-200 mx-2" />
        <View className="w-3 h-3 rounded-full bg-gray-200" />
        <View className="h-3 bg-gray-200 rounded-full w-16 ml-1" />
      </View>
    </Animated.View>
  );
};

const ArtisanSkeleton = ({ count = 4 }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};

export default ArtisanSkeleton;
