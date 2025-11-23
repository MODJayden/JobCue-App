import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

const PortfolioModal = ({
  showPortfolioModal,
  portfolioCategory,
  setPortfolioCategory,
  setPortfolioDescription,
  portfolioDescription,
  tempImage,
  setTempImage,
  beforeImage,
  setBeforeImage,
  afterImage,
  setAfterImage,
  uploadingImage,
  saveImage,
  cancelImage,
  currentImageType,
}) => {
  const pickImage = async (imageType) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photos");
        return;
      }
      

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
      });

      if (!result.canceled) {
        if (imageType === "before") {
          setBeforeImage(result.assets[0]);
        } else if (imageType === "after") {
          setAfterImage(result.assets[0]);
        } else {
          setTempImage(result.assets[0]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeImage = (imageType) => {
    if (imageType === "before") {
      setBeforeImage(null);
    } else if (imageType === "after") {
      setAfterImage(null);
    } else {
      setTempImage(null);
    }
  };

  const isBeforeAfterCategory = portfolioCategory === "before_after";

  const isSaveDisabled =
    uploadingImage ||
    !portfolioCategory ||
    (isBeforeAfterCategory ? !beforeImage || !afterImage : !tempImage);

  return (
    <Modal
      visible={showPortfolioModal}
      transparent
      animationType="fade"
      onRequestClose={cancelImage}
    >
      <View className="flex-1 bg-black/70 justify-center items-center px-5">
        <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
          {/* Modal Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-900">
              Add to Portfolio
            </Text>
          </View>

          <ScrollView className="max-h-[70vh]">
            <View className="px-6 py-4 space-y-4">
              {/* Category Selection */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </Text>
                <View className="border border-gray-300 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={portfolioCategory}
                    onValueChange={(value) => {
                      setPortfolioCategory(value);
                      // Reset images when category changes
                      setBeforeImage(null);
                      setAfterImage(null);
                      setTempImage(null);
                    }}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Select a category" value="" />
                    <Picker.Item label="Before & After" value="before_after" />
                    <Picker.Item label="Service Work" value="service_work" />
                    <Picker.Item
                      label="Project Completion"
                      value="project_completion"
                    />
                    <Picker.Item
                      label="Tools & Equipment"
                      value="tools_equipment"
                    />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>
              </View>

              {/* Before & After Image Upload */}
              {isBeforeAfterCategory ? (
                <>
                  {/* Before Image */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Before Image *
                    </Text>
                    {beforeImage ? (
                      <View className="relative">
                        <Image
                          source={{ uri: beforeImage.uri }}
                          className="w-full h-48 rounded-xl"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeImage("before")}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                        >
                          <Text className="text-white font-bold">✕</Text>
                        </TouchableOpacity>
                        <View className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">
                            BEFORE
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => pickImage("before")}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center"
                      >
                        <Text className="text-4xl text-gray-400 mb-2">📷</Text>
                        <Text className="text-gray-600 font-semibold">
                          Upload Before Photo
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          Tap to select image
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* After Image */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      After Image *
                    </Text>
                    {afterImage ? (
                      <View className="relative">
                        <Image
                          source={{ uri: afterImage.uri }}
                          className="w-full h-48 rounded-xl"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeImage("after")}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                        >
                          <Text className="text-white font-bold">✕</Text>
                        </TouchableOpacity>
                        <View className="absolute bottom-2 left-2 bg-green-600 px-3 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">
                            AFTER
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => pickImage("after")}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center"
                      >
                        <Text className="text-4xl text-gray-400 mb-2">📷</Text>
                        <Text className="text-gray-600 font-semibold">
                          Upload After Photo
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          Tap to select image
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              ) : (
                /* Single Image Upload for other categories */
                portfolioCategory && (
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Image *
                    </Text>
                    {tempImage ? (
                      <View className="relative">
                        <Image
                          source={{ uri: tempImage.uri }}
                          className="w-full h-64 rounded-xl"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeImage("single")}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                        >
                          <Text className="text-white font-bold">✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => pickImage("single")}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 items-center justify-center"
                      >
                        <Text className="text-5xl text-gray-400 mb-2">📷</Text>
                        <Text className="text-gray-600 font-semibold text-base">
                          Upload Photo
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          Tap to select image
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              )}

              {/* Description */}
              {portfolioCategory && (
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </Text>
                  <TextInput
                    value={portfolioDescription}
                    onChangeText={setPortfolioDescription}
                    placeholder="Add details about this work..."
                    multiline
                    numberOfLines={3}
                    className="border border-gray-300 rounded-xl p-3 text-gray-900"
                    textAlignVertical="top"
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View className="flex-row p-4 space-x-3 border-t border-gray-200">
            <TouchableOpacity
              onPress={cancelImage}
              className="flex-1 bg-gray-200 py-4 rounded-xl mr-3"
              disabled={uploadingImage}
            >
              <Text className="text-gray-700 text-center font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveImage}
              className="flex-1 bg-blue-600 py-4 rounded-xl"
              disabled={
                uploadingImage ||
                (currentImageType === "portfolio" &&
                  (portfolioCategory === "before_after"
                    ? !beforeImage || !afterImage
                    : !tempImage || !portfolioCategory))
              }
              style={{ opacity: isSaveDisabled ? 0.5 : 1 }}
            >
              {uploadingImage ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-base">
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PortfolioModal;
