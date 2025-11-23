// components/BookingModal.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../store/booking";
import LocationModal from "./LocationModal";
import { uploadImageDirect, deleteImage } from "../store/imageUpload";
import { getCustomerByUserId } from "../store/artisan";

const BookingModal = ({ visible, onClose, artisan }) => {
  const dispatch = useDispatch();

  const [selectedService, setSelectedService] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [location, setLocation] = useState("");
  const [problemImage, setProblemImage] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { customer } = useSelector((state) => state.artisan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      dispatch(getCustomerByUserId(user?.userId));
    }
  }, [user?.userId]);

  // Load saved location
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("location");
      if (saved) setLocation(JSON.parse(saved));
    })();
  }, []);

  // Upload image when problemImage changes
  useEffect(() => {
    if (problemImage) {
      handleImageUpload();
    }
  }, [problemImage]);

  const handleImageUpload = async () => {
    if (!problemImage) return;

    setIsImageUploading(true);
    try {
      const result = await dispatch(uploadImageDirect(problemImage)).unwrap();
      setUploadedImageUrl(result?.payload?.secure_url || result?.secure_url);
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to upload image.");
      setProblemImage(null);
    } finally {
      setIsImageUploading(false);
    }
  };

  // Pick problem image - now only allows one image
  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!result.canceled) {
      setProblemImage(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    if (uploadedImageUrl) {
      dispatch(deleteImage({ imageUrl: uploadedImageUrl }));
    }
    setProblemImage(null);
    setUploadedImageUrl(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!selectedService || !scheduledDate || !timeSlot || !location) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const customerId = customer?._id;
      if (!customerId) {
        Alert.alert("Error", "Please log in to make a booking.");
        setIsSubmitting(false);
        return;
      }

      const [startTime, endTime] = timeSlot.split("-").map((s) => s.trim());

      const bookingData = {
        customer: customerId,
        artisan: artisan?._id,
        service: selectedService,
        problemDescription,
        problemPhotos: uploadedImageUrl,
        scheduledDate,
        timeSlot: { start: startTime || "09:00", end: endTime || "17:00" },
        isEmergency,
        location: {
          address: location,
          city: "",
          region: "",
          coordinates: { lat: 0, lng: 0 },
          instructions: "",
        },
      };

      dispatch(createBooking(bookingData)).then((res) => {
        if (res?.payload?.success) {
          Alert.alert(
            "Booking Request Sent",
            "The artisan will review your request and send a price for your approval."
          );
          // Reset form
          setProblemImage(null);
          setUploadedImageUrl(null);
          setSelectedService("");
          setScheduledDate("");
          setTimeSlot("");
          setProblemDescription("");
          setIsEmergency(false);
          setIsSubmitting(false);
          onClose();
        } else {
          Alert.alert("Error", res?.message || "Something went wrong.");
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      Alert.alert("Error", error?.message || "Booking failed");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Book {artisan?.businessName || "Artisan"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Service Selection */}
              <Text className="text-sm text-gray-600 mb-1">Select Service</Text>
              <View className="border border-gray-300 rounded-lg mb-3">
                {artisan?.services?.map((service, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedService(service?._id || service)}
                    className={`p-3 ${
                      selectedService === (service?._id || service)
                        ? "bg-[#6F4E37]/10"
                        : ""
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedService === (service?._id || service)
                          ? "text-[#6F4E37] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {service?.name || service}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Problem Description */}
              <Text className="text-sm text-gray-600 mb-1">
                Problem Description (Optional)
              </Text>
              <TextInput
                multiline
                numberOfLines={3}
                value={problemDescription}
                onChangeText={setProblemDescription}
                placeholder="Describe the issue..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 mb-3"
              />

              {/* Problem Photo - Single Image */}
              <Text className="text-sm text-gray-600 mb-2">
                Add Problem Image (Optional)
              </Text>
              <View className="flex-row mb-3">
                {problemImage ? (
                  <View className="relative mr-2">
                    <Image
                      source={{ uri: problemImage }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={handleRemovePhoto}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleAddPhoto}
                    className="w-20 h-20 border border-dashed border-gray-400 rounded-lg items-center justify-center"
                    disabled={isImageUploading}
                  >
                    <Ionicons
                      name="camera"
                      size={24}
                      color={isImageUploading ? "#D1D5DB" : "#6B7280"}
                    />
                  </TouchableOpacity>
                )}
                {isImageUploading && (
                  <View className="ml-4 justify-center">
                    <Text className="text-sm text-gray-500">Uploading...</Text>
                  </View>
                )}
              </View>

              {/* Scheduled Date */}
              <Text className="text-sm text-gray-600 mb-1">Scheduled Date</Text>
              <TextInput
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="YYYY-MM-DD"
                className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-gray-800"
              />

              {/* Time Slot */}
              <Text className="text-sm text-gray-600 mb-1">Time Slot</Text>
              <TextInput
                value={timeSlot}
                onChangeText={setTimeSlot}
                placeholder="e.g. 10:00 AM - 12:00 PM"
                className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-gray-800"
              />

              {/* Location */}
              <View className="mb-3">
                <Text className="text-sm text-gray-600 mb-1">Location</Text>
                <TouchableOpacity
                  onPress={() => setLocationModalVisible(true)}
                  className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
                >
                  <Text
                    className={`text-sm ${
                      location ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {location || "Select your location"}
                  </Text>
                  <Ionicons name="location-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Emergency Switch */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm text-gray-700 font-medium">
                  Is this an emergency?
                </Text>
                <Switch
                  value={isEmergency}
                  onValueChange={setIsEmergency}
                  trackColor={{ false: "#D1D5DB", true: "#6F4E37" }}
                  thumbColor="#fff"
                />
              </View>

              {/* Info Box */}
              <View className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                <Text className="text-yellow-800 text-sm">
                  After booking, the artisan will review your request and send a
                  price for your approval before work begins.
                </Text>
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-[#6F4E37] rounded-lg py-3 mb-4"
                disabled={isImageUploading || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    Submit Booking
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelect={(loc) => setLocation(loc)}
      />
    </>
  );
};

export default BookingModal;
