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
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { registerUser } from "@/store/user";
import { useDispatch } from "react-redux";
import { createArtisan, createCustomer } from "@/store/artisan";

const Register = () => {
  const { role } = useLocalSearchParams();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: role || "customer",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Ghana phone number validation (starts with 0 and is 10 digits)
  const validateGhanaPhone = (phone) => {
    const ghanaPhoneRegex = /^0[2-5][0-9]{8}$/;
    return ghanaPhoneRegex.test(phone);
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

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

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validateGhanaPhone(formData.phone)) {
      newErrors.phone = "Enter a valid Ghana phone number (e.g., 0241234567)";
    }
    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase & number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    dispatch(registerUser(formData)).then((res) => {
      if (res.payload.success) {
        console.log(res.payload);
        router.push("/auth/login");
        if (role === "artisan") {
          dispatch(createArtisan(res.payload));
        } else {
          dispatch(createCustomer(res.payload));
        }
        Alert.alert("Success", "Account created successfully");
      } else {
        Alert.alert("Error", res.payload.message);
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
        <View className="pt-14 pb-6 px-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Create Account
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Sign up as a{" "}
            <Text className="font-semibold text-indigo-600">
              {role || "user"}
            </Text>
          </Text>
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
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Phone Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              FullName
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
            >
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Emmanuel Agyei"
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
            {errors.name && (
              <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
            )}
            {!errors.name && formData.name && (
              <Text className="text-gray-500 text-xs mt-1">
                Name is required
              </Text>
            )}
          </View>
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                errors.phone ? "border-red-500" : "border-gray-200"
              }`}
            >
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <TextInput
                value={formData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="0241234567"
                keyboardType="phone-pad"
                maxLength={10}
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
            {errors.phone && (
              <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>
            )}
            {!errors.phone && formData.phone && (
              <Text className="text-gray-500 text-xs mt-1">
                Ghana format: 10 digits starting with 0
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-4">
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

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-200"
              }`}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                className="flex-1 ml-3 text-base text-gray-900"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`rounded-xl py-4 items-center mb-4 ${
              isLoading ? "bg-indigo-400" : "bg-indigo-600"
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600 text-sm">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text className="text-indigo-600 text-sm font-semibold">
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
