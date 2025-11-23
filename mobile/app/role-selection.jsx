import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useNavigation } from "expo-router";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const scaleCustomer = useRef(new Animated.Value(1)).current;
  const scaleArtisan = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const handlePressIn = (role) => {
    const scale = role === "customer" ? scaleCustomer : scaleArtisan;
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (role) => {
    const scale = role === "customer" ? scaleCustomer : scaleArtisan;
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    router.push(`./auth/register?role=${role}`);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-1 bg-gradient-to-br from-indigo-50 to-white">
        {/* Header */}
        <View className="pt-16 pb-8 px-6">
          <Text className="text-4xl font-bold text-gray-900 text-center mb-3">
            Welcome!
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Choose how you want to continue
          </Text>
        </View>

        {/* Role Cards */}
        <View className="flex-1 justify-center px-6 pb-20">
          {/* Customer Card */}
          <Animated.View style={{ transform: [{ scale: scaleCustomer }] }}>
            <TouchableOpacity
              onPress={() => handleRoleSelect("customer")}
              onPressIn={() => handlePressIn("customer")}
              onPressOut={() => handlePressOut("customer")}
              activeOpacity={0.9}
              className={`bg-white rounded-3xl p-8 mb-6 shadow-lg border-2 ${
                selectedRole === "customer"
                  ? "border-indigo-600"
                  : "border-transparent"
              }`}
            >
              {/* Icon */}
              <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="person" size={40} color="#6366f1" />
              </View>

              {/* Title */}
              <Text className="text-2xl font-bold text-gray-900 mb-3">
                I'm a Customer
              </Text>

              {/* Description */}
              <Text className="text-base text-gray-600 leading-6 mb-4">
                Find and hire skilled artisans for your projects. Browse
                profiles, read reviews, and get quotes.
              </Text>

              {/* Features */}
              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                  <Text className="text-sm text-gray-700 ml-2">
                    Browse skilled professionals
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                  <Text className="text-sm text-gray-700 ml-2">
                    Read verified reviews
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                  <Text className="text-sm text-gray-700 ml-2">
                    Secure booking system
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <View className="absolute top-8 right-8">
                <Ionicons
                  name="arrow-forward-circle"
                  size={28}
                  color="#6366f1"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Artisan Card */}
          <Animated.View style={{ transform: [{ scale: scaleArtisan }] }}>
            <TouchableOpacity
              onPress={() => handleRoleSelect("artisan")}
              onPressIn={() => handlePressIn("artisan")}
              onPressOut={() => handlePressOut("artisan")}
              activeOpacity={0.9}
              className={`bg-white rounded-3xl p-8 shadow-lg border-2 ${
                selectedRole === "artisan"
                  ? "border-purple-600"
                  : "border-transparent"
              }`}
            >
              {/* Icon */}
              <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="hammer" size={40} color="#8b5cf6" />
              </View>

              {/* Title */}
              <Text className="text-2xl font-bold text-gray-900 mb-3">
                I'm an Artisan
              </Text>

              {/* Description */}
              <Text className="text-base text-gray-600 leading-6 mb-4">
                Grow your business by connecting with customers. Showcase your
                work and get more jobs.
              </Text>

              {/* Features */}
              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                  <Text className="text-sm text-gray-700 ml-2">
                    Create professional profile
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                  <Text className="text-sm text-gray-700 ml-2">
                    Receive job requests
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                  <Text className="text-sm text-gray-700 ml-2">
                    Build your reputation
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <View className="absolute top-8 right-8">
                <Ionicons
                  name="arrow-forward-circle"
                  size={28}
                  color="#8b5cf6"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RoleSelection;
