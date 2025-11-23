import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useCallback, useEffect, memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/store/user";

/* ========================================================
 🧱 InputField Component — Moved outside & memoized
======================================================== */
const InputField = memo(
  ({ label, value, onChangeText, placeholder, error, ...props }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className={`bg-gray-100 rounded-xl px-4 py-3.5 text-gray-900 ${
          error ? "border border-red-500" : ""
        }`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  )
);
InputField.displayName = "InputField";

/* ========================================================
 🧩 Main EditProfile Screen
======================================================== */
const EditProfile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Initialize with user info
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Stable handler — does not trigger re-renders of inputs
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (showPasswordFields) {
      if (!formData.currentPassword)
        newErrors.currentPassword = "Current password is required";

      if (formData.newPassword) {
        if (formData.newPassword.length < 6)
          newErrors.newPassword = "Password must be at least 6 characters";

        if (formData.newPassword !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showPasswordFields]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      if (showPasswordFields && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      await dispatch(updateUser({ id: user.userId, data: updateData })).unwrap();

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, formData, showPasswordFields, user, router, validateForm]);

  /* ========================================================
   🧭 Render
  ======================================================== */
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="mr-3 w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-full ${
              isSubmitting ? "bg-[#8B6549] opacity-70" : "bg-[#6F4E37]"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Form */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Basic Information
            </Text>

            <InputField
              label="Full Name"
              value={formData.name}
              onChangeText={(v) => handleInputChange("name", v)}
              placeholder="Enter your full name"
              error={errors.name}
            />

            <InputField
              label="Email"
              value={formData.email}
              onChangeText={(v) => handleInputChange("email", v)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              onChangeText={(v) => handleInputChange("phone", v)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              error={errors.phone}
            />

            {/* Change Password */}
            <View className="mt-6">
              <TouchableOpacity
                onPress={() => setShowPasswordFields((prev) => !prev)}
                className="flex-row items-center justify-between mb-4"
              >
                <Text className="text-lg font-bold text-gray-900">
                  Change Password
                </Text>
                <Ionicons
                  name={showPasswordFields ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#6F4E37"
                />
              </TouchableOpacity>

              {showPasswordFields && (
                <View key="password-section">
                  <InputField
                    label="Current Password"
                    value={formData.currentPassword}
                    onChangeText={(v) =>
                      handleInputChange("currentPassword", v)
                    }
                    placeholder="Enter current password"
                    secureTextEntry
                    error={errors.currentPassword}
                  />

                  <InputField
                    label="New Password"
                    value={formData.newPassword}
                    onChangeText={(v) => handleInputChange("newPassword", v)}
                    placeholder="Enter new password"
                    secureTextEntry
                    error={errors.newPassword}
                  />

                  <InputField
                    label="Confirm New Password"
                    value={formData.confirmPassword}
                    onChangeText={(v) =>
                      handleInputChange("confirmPassword", v)
                    }
                    placeholder="Confirm new password"
                    secureTextEntry
                    error={errors.confirmPassword}
                  />

                  <View className="bg-blue-50 rounded-xl p-3 flex-row items-start">
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#3B82F6"
                      style={{ marginRight: 8, marginTop: 2 }}
                    />
                    <Text className="text-xs text-blue-700 flex-1">
                      Password must be at least 6 characters long
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default memo(EditProfile);
