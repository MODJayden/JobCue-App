import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/user";

const Login = () => {
  const { role } = useLocalSearchParams(); // Get role from navigation
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { error } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.auth);
  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (isAuth) {
      if (user.role === "customer") {
        router.replace("/(customer)/artisans");
      } else if (user.role === "artisan") {
        router.replace("/(artisan)");
      } else if (user.role === "admin") {
        router.replace("/(admin)");
      }
    }
  }, [isAuth, user]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    dispatch(loginUser(formData)).then((res) => {
      if (res?.payload?.success) {
        Alert.alert("Login Successful");
      } else {
        Alert.alert(error);
        console.log(error);
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="pt-14 pb-8 px-6">
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Log in to continue
            {role && (
              <Text className="font-semibold text-indigo-600"> as {role}</Text>
            )}
          </Text>
        </View>

        {/* Illustration/Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center">
            <Ionicons name="person" size={48} color="#6366f1" />
          </View>
        </View>

        {/* Form */}
        <View className="flex-1 px-6">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
            >
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                errors.password ? "border-red-500" : "border-gray-200"
              }`}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                className="flex-1 ml-3 text-base text-gray-900"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => router.push("/forgot-password")}
            className="self-end mb-6"
          >
            <Text className="text-indigo-600 text-sm font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`rounded-xl py-4 items-center mb-4 ${
              isLoading ? "bg-indigo-400" : "bg-[#6366F1]"
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Logging in..." : "Log In"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="px-4 text-gray-500 text-sm">OR</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Login Buttons */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3 mb-3"
            activeOpacity={0.7}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text className="text-gray-700 text-base font-medium ml-2">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3 mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="logo-apple" size={20} color="#000000" />
            <Text className="text-gray-700 text-base font-medium ml-2">
              Continue with Apple
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600 text-sm">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("./register")}>
              <Text className="text-indigo-600 text-sm font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
