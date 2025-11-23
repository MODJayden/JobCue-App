// app/OnboardingScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Find Skilled Artisans",
    description:
      "Connect with verified professionals in your area for any service you need",
    icon: "search",
    color: "#6366f1",
  },
  {
    id: 2,
    title: "Grow Your Business",
    description:
      "Artisans can showcase their work and reach more customers easily",
    icon: "briefcase",
    color: "#8b5cf6",
  },
  {
    id: 3,
    title: "Safe & Reliable",
    description: "Read reviews, compare prices, and book with confidence",
    icon: "shield-checkmark",
    color: "#ec4899",
  },
];

const DOT_ACTIVE_WIDTH = 32;
const DOT_INACTIVE_WIDTH = 8;
const DOT_HEIGHT = 8;

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // progress animates from 1 (visible) -> 0 (hidden) -> 1 (visible for new slide)
  const progress = useSharedValue(1);

  // Keep shared active index for dot animations
  const activeIndex = useSharedValue(0);

  // Make sure shared index follows state
  useEffect(() => {
    activeIndex.value = withTiming(currentIndex, { duration: 250 });
  }, [currentIndex, activeIndex]);

  // Animated style for slide container (fade + scale)
  const slideAnimatedStyle = useAnimatedStyle(() => {
    const opacity = progress.value;
    const scale = interpolate(progress.value, [0, 1], [0.95, 1], Extrapolate.CLAMP);
    const translateY = interpolate(progress.value, [0, 1], [8, 0], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  // Icon container animation (subtle pop)
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.98, 1], Extrapolate.CLAMP);
    return {
      transform: [{ scale }],
    };
  });

  // Handle slide transitions (animate out, change index, animate in)
  const handleSlideChange = (newIndex) => {
    if (isTransitioning || newIndex === currentIndex) return;

    setIsTransitioning(true);

    // animate out
    progress.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) {
        // update React state on the JS thread
        runOnJS(setCurrentIndex)(newIndex);

        // animate in
        progress.value = withTiming(1, { duration: 220 }, (finishedIn) => {
          if (finishedIn) {
            runOnJS(setIsTransitioning)(false);
          }
        });
      } else {
        // fallback: ensure we clear transitioning flag
        runOnJS(setIsTransitioning)(false);
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) handleSlideChange(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) handleSlideChange(currentIndex - 1);
  };

  const handleSkip = () => {
    router.replace("role-selection");
  };

  const handleGetStarted = () => {
    router.replace("role-selection");
  };

  const currentSlide = slides[currentIndex];

  return (
    <View className="flex-1 bg-white">
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          onPress={handleSkip}
          className="absolute top-14 right-6 z-10"
          accessibilityLabel="Skip onboarding"
        >
          <Text className="text-gray-600 text-base font-medium">Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slide Content */}
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View
          className="items-center justify-center w-full"
          style={slideAnimatedStyle}
        >
          {/* Icon Container */}
          <Animated.View
            className="w-32 h-32 rounded-full items-center justify-center mb-12"
            style={[
              {
                // slightly translucent background using 20 hex alpha
                backgroundColor: currentSlide.color + "20",
              },
              iconAnimatedStyle,
            ]}
          >
            <Ionicons name={currentSlide.icon} size={64} color={currentSlide.color} />
          </Animated.View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            {currentSlide.title}
          </Text>

          {/* Description */}
          <Text className="text-base text-gray-600 text-center leading-6 px-2">
            {currentSlide.description}
          </Text>
        </Animated.View>
      </View>

      {/* Pagination Dots */}
      <View className="flex-row justify-center items-center mb-8">
        {slides.map((_, index) => {
          // each dot's width is animated using activeIndex shared value
          const dotStyle = useAnimatedStyle(() => {
            // interpolate activeIndex value to width: when activeIndex === index => large width
            const widthAnimated = interpolate(
              activeIndex.value,
              [index - 1, index, index + 1],
              [DOT_INACTIVE_WIDTH, DOT_ACTIVE_WIDTH, DOT_INACTIVE_WIDTH],
              Extrapolate.CLAMP
            );

            const backgroundOpacity = interpolate(
              activeIndex.value,
              [index - 1, index, index + 1],
              [0.6, 1, 0.6],
              Extrapolate.CLAMP
            );

            return {
              width: withTiming(widthAnimated, { duration: 220 }),
              height: DOT_HEIGHT,
              borderRadius: DOT_HEIGHT / 2,
              backgroundColor: `rgba(99,102,241, ${backgroundOpacity})`, // indigo-ish
              marginHorizontal: 6,
            };
          });

          return <Animated.View key={index} style={dotStyle} />;
        })}
      </View>

      {/* Navigation Buttons */}
      <View className="px-8 pb-12">
        {currentIndex === slides.length - 1 ? (
          <Pressable
            onPress={handleGetStarted}
            className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg"
            android_ripple={{ color: "#4f46e5" }}
          >
            <Text className="text-white text-lg font-semibold">Get Started</Text>
          </Pressable>
        ) : (
          <View className="flex-row justify-between items-center">
            {currentIndex > 0 ? (
              <Pressable
                onPress={handlePrev}
                className="flex-row items-center"
                android_ripple={{ color: "#eef2ff" }}
                style={Platform.OS === "web" ? { cursor: "pointer" } : undefined}
              >
                <Ionicons name="chevron-back" size={24} color="#6366f1" />
                <Text className="text-indigo-600 text-base font-medium ml-1">Back</Text>
              </Pressable>
            ) : (
              <View style={{ width: 48 /* keep layout consistent */ }} />
            )}

            <Pressable
              onPress={handleNext}
              className="bg-indigo-600 rounded-full w-16 h-16 items-center justify-center shadow-lg"
              android_ripple={{ color: "#4f46e5" }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
              accessibilityLabel="Next slide"
            >
              <Ionicons name="arrow-forward" size={28} color="white" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;
