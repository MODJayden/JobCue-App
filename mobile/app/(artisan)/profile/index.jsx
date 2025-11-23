import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { updateProfilePicture } from "@/store/artisan";
import PortfolioModal from "../../../components/PotfolioModal";
import {
  uploadProfilePicture,
  uploadPortfolioImage,
  uploadGhanaCardFront,
  uploadGhanaCardBack,
  removePortfolioItem,
} from "@/store/imageUpload";
import {
  getArtisanByUserId,
  updateGhanaCard,
  updateBussinessName,
  updateExperience,
  updateAvailability,
} from "@/store/artisan";
import { router } from "expo-router";

import { removeToken } from "@/store/user";

const ArtisanProfileManagement = () => {
  const dispatch = useDispatch();
  const { artisan, isLoading } = useSelector((state) => state.artisan);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioCategory, setPortfolioCategory] = useState("");
  const [portfolioComparisonType, setPortfolioComparisonType] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [showPortfolioViewModal, setShowPortfolioViewModal] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  // Profile state
  const [profileData, setProfileData] = useState({
    profilePicture: artisan?.media.profilePicture.url,
    businessName: artisan?.businessName || "",
    experience: 0,
    skills: [],
    serviceAreas: [],
    languages: [],
    tools: [],
    ghanaCard: {
      number: "",
      frontImage: null,
      backImage: null,
    },
    availability: {
      emergencyAvailable: false,
      isAvailable: true,
    },
    portfolio: [],
    services: [],
  });
  const artisanId = artisan?._id;
  const [isUpdatingInput, setIsUpdatingInput] = useState(false);

  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageType, setCurrentImageType] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageViewModal, setShowImageViewModal] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Array edit modal
  const [showArrayModal, setShowArrayModal] = useState(false);
  const [arrayField, setArrayField] = useState(null);
  const [arrayInput, setArrayInput] = useState("");
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  useEffect(() => {
    if (user) {
      dispatch(getArtisanByUserId(user?.userId || user?._id));
    }
  }, [dispatch]);

  useEffect(() => {
    if (artisan) {
      setProfileData({
        profilePicture: artisan.media?.profilePicture?.url || null,
        businessName: artisan.businessName || "",
        experience: artisan.experience || 0,
        skills: artisan.skills || [],
        serviceAreas: artisan.serviceAreas || [],
        languages: artisan.languages || [],
        tools: artisan.tools || [],
        ghanaCard: {
          number: artisan.ghanaCard?.number || "",
          frontImage: artisan.ghanaCard?.frontImage || null,
          backImage: artisan.ghanaCard?.backImage || null,
        },
        availability: artisan.availability || {
          emergencyAvailable: false,
          isAvailable: true,
        },
        portfolio: artisan.media?.portfolio || [],
      });
    }
  }, [artisan]);

  // Handle viewing existing image (NEW FEATURE)
  const handleViewImage = useCallback((imageUrl, imageType) => {
    setViewingImage({ url: imageUrl, type: imageType });
    setShowImageViewModal(true);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: currentImageType === "profile" ? [1, 1] : [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0]);
      setShowImageModal(true);
    }
  };
  // Handle image upload (individual)
  const handleImageUpload = (type) => {
    setCurrentImageType(type);
    setTempImage(null);
    pickImage();
  };

  //
  const saveImage = async () => {
    setUploadingImage(true);

    try {
      let result;

      if (currentImageType === "profile") {
        if (!tempImage || !artisanId) return;

        result = await dispatch(
          uploadProfilePicture({
            artisanId: artisanId,
            imageUri: tempImage.uri,
          })
        );

        setProfileData({
          ...profileData,
          profilePicture: result.payload.artisanData.profilePicture.url,
        });
      } else if (currentImageType === "ghanaCard_front") {
        if (!tempImage || !artisanId) return;
        const result = await dispatch(
          uploadGhanaCardFront({
            artisanId: artisanId,
            imageUri: tempImage.uri,
          })
        ).unwrap();

        setProfileData({
          ...profileData,
          ghanaCard: {
            ...profileData.ghanaCard,
            frontImage: result.frontImage,
          },
        });
      } else if (currentImageType === "ghanaCard_back") {
        if (!tempImage || !artisanId) return;

        // Update Ghana Card in backend
        const res = await dispatch(
          uploadGhanaCardBack({
            artisanId: artisanId,
            imageUri: tempImage.uri,
          })
        ).unwrap();

        setProfileData({
          ...profileData,
          ghanaCard: {
            ...profileData.ghanaCard,
            backImage: res.backImage,
          },
        });
      } else if (currentImageType === "portfolio") {
        try {
          setUploadingImage(true); // Show loading state

          const portfolioData = {
            category: portfolioCategory,
            description: portfolioDescription || "",
            artisanId: artisanId,
          };

          if (portfolioCategory === "before_after") {
            if (!beforeImage || !afterImage) {
              Alert.alert(
                "Required",
                "Please upload both before and after images"
              );
              setUploadingImage(false);
              return;
            }

            portfolioData.type = "before_after_pair";
            portfolioData.beforeImageUri = beforeImage.uri;
            portfolioData.afterImageUri = afterImage.uri;
          } else {
            if (!tempImage) {
              Alert.alert("Required", "Please upload an image");
              setUploadingImage(false);
              return;
            }

            portfolioData.type = "single";
            portfolioData.imageUri = tempImage.uri;
          }

          // Dispatch the Redux thunk
          const result = await dispatch(
            uploadPortfolioImage(portfolioData)
          ).unwrap();

          // Update local profileData state with the returned portfolio item
          setProfileData((prevData) => ({
            ...prevData,
            portfolio: [...prevData.portfolio, result.portfolioItem],
          }));

          // Reset and close modal
          cancelImage();
        } catch (error) {
          console.error("Portfolio upload error:", error);
          Alert.alert(
            "Error",
            error.message ||
              "Failed to upload portfolio item. Please try again."
          );
        } finally {
          setUploadingImage(false); // Hide loading state
        }
      }

      setShowImageModal(false);
      setTempImage(null);

      Alert.alert(
        "Success",
        currentImageType === "profile"
          ? "Profile picture updated successfully!"
          : currentImageType === "portfolio"
          ? "Portfolio image added successfully!"
          : "Ghana Card image uploaded successfully!"
      );
    } catch (error) {
      console.error("Upload error:", error.message);
      Alert.alert("Error", error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Cancel image
  const cancelImage = () => {
    setShowImageModal(false);
    setShowPortfolioModal(false);
    setTempImage(null);
    setCurrentImageType(null);
    setPortfolioCategory("");
    setPortfolioComparisonType("");
    setPortfolioDescription("");
    setBeforeImage(null);
    setAfterImage(null);
  };

  // Handle single field edit
  const openEditModal = (field, currentValue) => {
    setEditField(field);
    setEditValue(currentValue?.toString() || "");
    setShowEditModal(true);
  };

  // Save single field
  const saveSingleField = async (type, value) => {
    setIsUpdatingInput(true);
    if (type === "businessName") {
      await dispatch(
        updateBussinessName({ artisanId, bussinessName: value })
      ).then((res) => {
        if (res?.payload.success) {
          setIsUpdatingInput(false);
          setShowEditModal(false);
          setProfileData({
            ...profileData,
            businessName: value,
          });
          Alert.alert("Success", "Bussiness Name updated successfully!");
        } else {
          Alert.alert("Error", res?.payload.message || "Failed to update");
          setIsUpdatingInput(false);
        }
      });
    } else if (type === "experience") {
      dispatch(updateExperience({ artisanId, experience: value })).then(
        (res) => {
          if (res.payload.success) {
            setIsUpdatingInput(false);
            setShowEditModal(false);
            setProfileData({
              ...profileData,
              experience: value,
            });
            Alert.alert("Success", "Experience updated successfully!");
          } else {
            Alert.alert("Error", res?.payload.message || "Failed to update");
            setIsUpdatingInput(false);
          }
        }
      );
    }
  };

  // Add to array
  const addToArray = async () => {
    if (!arrayInput.trim()) return;

    const currentArray = profileData[arrayField];
    if (currentArray.includes(arrayInput.trim())) {
      Alert.alert("Already exists", `${arrayInput} is already in the list`);
      return;
    }

    const newArray = [...currentArray, arrayInput.trim()];
    const updateData = { [arrayField]: newArray };

    try {
      await dispatch(updateProfilePicture(updateData)).unwrap();
      setProfileData({ ...profileData, [arrayField]: newArray });
      setArrayInput("");
      Alert.alert("Success", "Added successfully!");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add");
    }
  };

  // Remove from array
  const removeFromArray = async (field, item) => {
    Alert.alert("Remove", `Remove "${item}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const newArray = profileData[field].filter((i) => i !== item);
          const updateData = { [field]: newArray };

          try {
            await dispatch(updateProfilePicture(updateData)).unwrap();
            setProfileData({ ...profileData, [field]: newArray });
            Alert.alert("Success", "Removed successfully!");
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to remove");
          }
        },
      },
    ]);
  };

  // Update Ghana Card number
  const updateGhanaCardNumber = async (number) => {
    try {
      setIsUpdatingInput(true);

      await dispatch(updateGhanaCard({ artisanId, number })).then((res) => {
        if (res?.payload.success) {
          setShowEditModal(false);
          setIsUpdatingInput(false);
          setProfileData({
            ...profileData,
            ghanaCard: { ...profileData.ghanaCard, number },
          });
          Alert.alert("Success", "Ghana Card number updated!");
        } else {
          Alert.alert("Error", res?.payload.message || "Failed to update");
          setIsUpdatingInput(false);
        }
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update");
      setIsUpdatingInput(false);
    }
  };

  const toggleAvailability = async (field) => {
    // Store original value for potential revert
    const originalValue = profileData.availability[field];

    // Immediate optimistic update
    const newAvailability = {
      ...profileData.availability,
      [field]: !originalValue,
    };

    // Update UI immediately
    setProfileData({
      ...profileData,
      availability: newAvailability,
    });

    try {
      // Dispatch with correct structure
      await dispatch(
        updateAvailability({
          artisanId,
          availabilityData: {
            [field]: newAvailability[field],
          },
        })
      ).unwrap();

      // Success - UI is already updated
      console.log(`${field} updated to:`, newAvailability[field]);
    } catch (error) {
      // Revert on error
      const revertedAvailability = {
        ...profileData.availability,
        [field]: originalValue,
      };
      setProfileData({
        ...profileData,
        availability: revertedAvailability,
      });

      Alert.alert("Error", error.message || "Failed to update availability");
    }
  };

  // Remove portfolio item
  const removePortfolioItems = async (index) => {
    console.log("Removing portfolio item:", index);

    // Get the specific portfolio item to be removed
    const portfolioItemToRemove = profileData.portfolio[index];

    if (!portfolioItemToRemove || !portfolioItemToRemove._id) {
      Alert.alert("Error", "Cannot remove item: Invalid portfolio item");
      return;
    }

    Alert.alert("Remove Photo", "Remove this photo from portfolio?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          console.log(
            "Removing portfolio item with ID:",
            portfolioItemToRemove._id
          );

          dispatch(
            removePortfolioItem({
              artisanId,
              portfolioItemId: portfolioItemToRemove._id,
            })
          )
            .then((res) => {
              if (res.payload.success) {
                // Update local state by filtering out the removed item
                const newPortfolio = profileData.portfolio.filter(
                  (_, i) => i !== index
                );
                setProfileData({ ...profileData, portfolio: newPortfolio });
                Alert.alert("Success", "Photo removed from portfolio!");
              } else {
                Alert.alert(
                  "Error",
                  res.payload.message || "Failed to remove photo"
                );
              }
            })
            .catch((error) => {
              console.error("Remove portfolio error:", error);
              Alert.alert("Error", "Failed to remove photo");
            });
        },
      },
    ]);
  };

  // Section Item Component
  const SectionItem = ({
    icon,
    title,
    value,
    onPress,
    iconColor = "#10B981",
    showBadge = false,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white px-5 py-4 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-gray-900 font-medium">{title}</Text>
        {value && (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
            {value}
          </Text>
        )}
      </View>
      {showBadge && <View className="bg-red-500 w-2 h-2 rounded-full mr-2" />}
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  // Verification Badge
  const VerificationBadge = () => {
    const status = artisan?.ghanaCard?.verified ? "verified" : "pending";
    const bgColor = status === "verified" ? "bg-green-100" : "bg-yellow-100";
    const textColor =
      status === "verified" ? "text-green-700" : "text-yellow-700";
    const icon = status === "verified" ? "checkmark-circle" : "time";

    return (
      <View
        className={`${bgColor} px-3 py-1.5 rounded-full flex-row items-center`}
      >
        <Ionicons
          name={icon}
          size={14}
          color={status === "verified" ? "#15803D" : "#A16207"}
        />
        <Text className={`${textColor} text-xs font-semibold ml-1`}>
          {status === "verified" ? "Verified" : "Pending"}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-5 py-4">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Manage your professional profile
          </Text>
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white mb-2 px-5 py-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                if (profileData.profilePicture) {
                  handleViewImage(profileData.profilePicture, "profile");
                } else {
                  handleImageUpload("profile");
                }
              }}
            >
              <View className="relative">
                {profileData.profilePicture ? (
                  <Image
                    source={{ uri: profileData.profilePicture }}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center">
                    <Ionicons name="person" size={32} color="#9CA3AF" />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 bg-blue-600 w-7 h-7 rounded-full items-center justify-center border-2 border-white">
                  <Ionicons name="camera" size={14} color="white" />
                </View>
              </View>
            </TouchableOpacity>

            <View className="flex-1 ml-4">
              <Text className="text-xl font-bold text-gray-900">
                {profileData.businessName || "Your Business Name"}
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="text-sm text-gray-600 ml-1 font-semibold">
                  {artisan?.rating?.average?.toFixed(1) || "0.0"}
                </Text>
                <Text className="text-sm text-gray-400 ml-1">
                  ({artisan?.rating?.count || 0} reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Verification Section */}
        <View className="bg-white mb-2">
          <View className="px-5 py-3 border-b border-gray-100">
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Verification
            </Text>
          </View>

          {/* Ghana Card Number */}
          <SectionItem
            icon="card"
            title="Ghana Card Number"
            value={profileData.ghanaCard.number || "Add Ghana Card number"}
            onPress={() =>
              openEditModal("ghanaCardNumber", profileData.ghanaCard.number)
            }
            iconColor="#3B82F6"
            showBadge={!profileData.ghanaCard.number}
          />

          {/* Ghana Card Front */}
          <TouchableOpacity
            onPress={() => {
              console.log("Ghana Card Front clicked");
              console.log("Front Image URL:", profileData.ghanaCard.frontImage);
              console.log("Is Verified:", profileData.ghanaCard.verified);

              if (profileData.ghanaCard.frontImage) {
                // View image (can update if not verified)
                handleViewImage(
                  profileData.ghanaCard.frontImage,
                  "ghanaCard_front"
                );
              } else {
                // Upload new image
                handleImageUpload("ghanaCard_front");
              }
            }}
            className="px-5 py-4 border-b border-gray-100 flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
              <Ionicons name="image" size={22} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base text-gray-900 font-medium">
                Ghana Card - Front
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {profileData.ghanaCard.frontImage
                  ? profileData.ghanaCard.verified
                    ? "Verified - Tap to view"
                    : "Uploaded - Tap to view/update"
                  : "Upload front image"}
              </Text>
            </View>
            {!profileData.ghanaCard.frontImage && (
              <View className="bg-red-500 w-2 h-2 rounded-full mr-2" />
            )}
            {profileData.ghanaCard.verified &&
              profileData.ghanaCard.frontImage && (
                <View className="bg-green-100 px-2 py-1 rounded mr-2">
                  <Text className="text-green-700 text-xs font-semibold">
                    ✓ Verified
                  </Text>
                </View>
              )}
            {profileData.ghanaCard.frontImage ? (
              <Image
                source={{ uri: profileData.ghanaCard.frontImage }}
                style={{ width: 48, height: 48, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>

          {/* Ghana Card Back - NEW: View only if uploaded & verified */}
          <TouchableOpacity
            onPress={() => {
              console.log("Ghana Card Back clicked");
              console.log("Back Image URL:", profileData.ghanaCard.backImage);
              console.log("Is Verified:", profileData.ghanaCard.verified);

              if (profileData.ghanaCard.backImage) {
                // View image (can update if not verified)
                handleViewImage(
                  profileData.ghanaCard.backImage,
                  "ghanaCard_back"
                );
              } else {
                // Upload new image
                handleImageUpload("ghanaCard_back");
              }
            }}
            className="px-5 py-4 border-b border-gray-100 flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
              <Ionicons name="image" size={22} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base text-gray-900 font-medium">
                Ghana Card - Back
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {profileData.ghanaCard.backImage
                  ? profileData.ghanaCard.verified
                    ? "Verified - Tap to view"
                    : "Uploaded - Tap to view/update"
                  : "Upload back image"}
              </Text>
            </View>
            {!profileData.ghanaCard.backImage && (
              <View className="bg-red-500 w-2 h-2 rounded-full mr-2" />
            )}
            {profileData.ghanaCard.verified &&
              profileData.ghanaCard.backImage && (
                <View className="bg-green-100 px-2 py-1 rounded mr-2">
                  <Text className="text-green-700 text-xs font-semibold">
                    ✓ Verified
                  </Text>
                </View>
              )}
            {profileData.ghanaCard.backImage ? (
              <Image
                source={{ uri: profileData.ghanaCard.backImage }}
                style={{ width: 48, height: 48, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>

          {/* Verification Status */}
          <View className="px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-4">
                <Ionicons name="shield-checkmark" size={22} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-base text-gray-900 font-medium">
                  Verification Status
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {artisan?.backgroundCheck?.status || "Pending review"}
                </Text>
              </View>
            </View>
            <VerificationBadge />
          </View>
        </View>

        {/* Professional Details */}
        <View className="bg-white mb-2">
          <View className="px-5 py-3 border-b border-gray-100">
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Professional Details
            </Text>
          </View>

          <SectionItem
            icon="briefcase"
            title="Business Name"
            value={profileData.businessName || "Add business name"}
            onPress={() =>
              openEditModal("businessName", profileData.businessName)
            }
            iconColor="#3B82F6"
            showBadge={!profileData.businessName}
          />

          <SectionItem
            icon="time"
            title="Experience"
            value={`${profileData.experience} years`}
            onPress={() => openEditModal("experience", profileData.experience)}
            iconColor="#10B981"
          />

          <SectionItem
            icon="construct"
            title="Skills"
            value={
              profileData.skills.length
                ? profileData.skills.join(", ")
                : "Add your skills"
            }
            onPress={() => router.push("/(artisan)/profile/skills")}
            iconColor="#F59E0B"
            showBadge={profileData.services?.length === 0}
          />

          <SectionItem
            icon="location"
            title="Service Areas"
            value={
              profileData.serviceAreas.length
                ? "update service areas"
                : "Add service areas"
            }
            onPress={() => router.push("/(artisan)/profile/ServiceArea")}
            iconColor="#EC4899"
            showBadge={profileData.serviceAreas.length === 0}
          />

          {/*   <SectionItem
            icon="language"
            title="Languages"
            value={
              profileData.languages.length
                ? profileData.languages.join(", ")
                : "Add languages"
            }
            onPress={() => openArrayModal("languages")}
            iconColor="#8B5CF6"
          /> */}

          {/*   <SectionItem
            icon="hammer"
            title="Tools & Equipment"
            value={
              profileData.tools.length
                ? profileData.tools.join(", ")
                : "Add tools"
            }
            onPress={() => openArrayModal("tools")}
            iconColor="#6366F1"
          /> */}
        </View>

        {/* Portfolio Section */}
        <View className="bg-white mb-2">
          <View className="px-5 py-3 border-b border-gray-100 flex-row items-center justify-between">
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Portfolio ({profileData.portfolio.length}/20)
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowPortfolioModal(true);
                setCurrentImageType("portfolio");
              }}
            >
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {profileData.portfolio.length > 0 ? (
            <View className="px-5 py-4">
              <View className="flex-row flex-wrap -mx-1">
                {profileData.portfolio.map((item, index) => (
                  <View key={index} className="w-1/3 px-1 mb-2">
                    {/* Before/After Pair */}
                    {item.portfolioImageType === "before_after_pair" &&
                    item.beforeAfter ? (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedPortfolioItem(item);
                          setShowPortfolioViewModal(true);
                        }}
                        className="relative"
                      >
                        {/* Show both images side by side in thumbnail */}
                        <View className="flex-row">
                          <Image
                            source={{ uri: item.beforeAfter.before.url }}
                            className="w-1/2 h-24 rounded-l-lg"
                            resizeMode="cover"
                          />
                          <Image
                            source={{ uri: item.beforeAfter.after.url }}
                            className="w-1/2 h-24 rounded-r-lg"
                            resizeMode="cover"
                          />
                        </View>

                        {/* Before/After Badge */}
                        <View className="absolute bottom-1 left-1 bg-blue-600 px-2 py-0.5 rounded">
                          <Text className="text-white text-[10px] font-bold">
                            B/A
                          </Text>
                        </View>

                        {/* Delete Button */}
                        <TouchableOpacity
                          onPress={() => removePortfolioItems(index)}
                          className="absolute top-1 right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                        >
                          <Ionicons name="close" size={14} color="white" />
                        </TouchableOpacity>

                        {/* Featured Badge */}
                        {item.isFeatured && (
                          <View className="absolute top-1 left-1 bg-yellow-500 w-6 h-6 rounded-full items-center justify-center">
                            <Ionicons name="star" size={14} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      /* Single Image */
                      item.image && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedPortfolioItem(item);
                            setShowPortfolioViewModal(true);
                          }}
                          className="relative"
                        >
                          <Image
                            source={{ uri: item.image.url }}
                            className="w-full h-24 rounded-lg"
                            resizeMode="cover"
                          />

                          {/* Category Badge */}
                          {item.category && (
                            <View className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded">
                              <Text className="text-white text-[10px] font-semibold">
                                {item.category.replace("_", " ").toUpperCase()}
                              </Text>
                            </View>
                          )}

                          {/* Delete Button */}
                          <TouchableOpacity
                            onPress={() => removePortfolioItems(index)}
                            className="absolute top-1 right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                          >
                            <Ionicons name="close" size={14} color="white" />
                          </TouchableOpacity>

                          {/* Featured Badge */}
                          {item.isFeatured && (
                            <View className="absolute top-1 left-1 bg-yellow-500 w-6 h-6 rounded-full items-center justify-center">
                              <Ionicons name="star" size={14} color="white" />
                            </View>
                          )}
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="px-5 py-8 items-center">
              <Ionicons name="images-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-2">No portfolio items yet</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPortfolioModal(true);
                  setCurrentImageType("portfolio");
                }}
                className="bg-blue-600 px-6 py-2.5 rounded-xl mt-4"
              >
                <Text className="text-white font-semibold">
                  Add First Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Availability */}
        <View className="bg-white mb-6">
          <View className="px-5 py-3 border-b border-gray-100">
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Availability
            </Text>
          </View>

          <View className="px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-4">
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              </View>
              <View>
                <Text className="text-base text-gray-900 font-medium">
                  Available for Work
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {profileData.availability.isAvailable ? "Online" : "Offline"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => toggleAvailability("isAvailable")}
              className={`w-14 h-8 rounded-full justify-center ${
                profileData.availability.isAvailable
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
              disabled={isLoading}
            >
              <View
                className={`w-6 h-6 rounded-full bg-white shadow ${
                  profileData.availability.isAvailable
                    ? "self-end mr-1"
                    : "self-start ml-1"
                }`}
              />
            </TouchableOpacity>
          </View>

          <View className="px-5 py-4 flex-row items-center justify-between border-t border-gray-100">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-4">
                <Ionicons name="flash" size={22} color="#EF4444" />
              </View>
              <View>
                <Text className="text-base text-gray-900 font-medium">
                  Emergency Services
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Available 24/7 for urgent jobs
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => toggleAvailability("emergencyAvailable")}
              className={`w-14 h-8 rounded-full justify-center ${
                profileData.availability.emergencyAvailable
                  ? "bg-red-500"
                  : "bg-gray-300"
              }`}
              disabled={isLoading}
            >
              <View
                className={`w-6 h-6 rounded-full bg-white shadow ${
                  profileData.availability.emergencyAvailable
                    ? "self-end mr-1"
                    : "self-start ml-1"
                }`}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={async () => {
            await dispatch(removeToken());
            router.push("/auth/login");
          }}
          className="bg-red-600 px-6 mx-4 py-2.5 rounded-xl my-4 flex-row items-center justify-center"
        >
          <Ionicons name="log-out" size={24} color="white" />
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Image Upload Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={cancelImage}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">
                {currentImageType === "profile" && "Upload Profile Picture"}
                {currentImageType === "ghanaCard_front" &&
                  "Upload Ghana Card (Front)"}
                {currentImageType === "ghanaCard_back" &&
                  "Upload Ghana Card (Back)"}
              </Text>
            </View>

            <ScrollView className="max-h-[70vh]">
              {/* Image Preview */}
              {tempImage && (
                <View className="p-6">
                  <Image
                    source={{ uri: tempImage.uri }}
                    className="w-full h-64 rounded-xl"
                    resizeMode="cover"
                  />
                </View>
              )}
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
                  !tempImage ||
                  (currentImageType === "portfolio" &&
                    (!portfolioCategory || !portfolioComparisonType))
                }
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

      {/* Edit Single Field Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-4 w-80">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              {editField === "businessName" && "Edit Business Name"}
              {editField === "experience" && "Edit Experience"}
              {editField === "ghanaCardNumber" && "Edit Ghana Card Number"}
            </Text>

            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              placeholder={
                editField === "businessName"
                  ? "Enter business name"
                  : editField === "experience"
                  ? "Years of experience"
                  : "Ghana Card number"
              }
              keyboardType={editField === "experience" ? "numeric" : "default"}
              className="bg-gray-100 px-4 py-4 rounded-xl text-gray-900 text-base mb-4"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 py-4 rounded-xl mr-3"
              >
                <Text className="text-gray-700 text-center font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={
                  editField === "ghanaCardNumber"
                    ? () => {
                        updateGhanaCardNumber(editValue);
                      }
                    : () => {
                        saveSingleField(editField, editValue);
                      }
                }
                className="flex-1 bg-blue-600 py-4 rounded-xl"
                disabled={isUpdatingInput}
              >
                {isUpdatingInput ? (
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
      {/* Array Field Modal (Skills, Languages, etc.) */}
      <Modal
        visible={showArrayModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowArrayModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-4 w-80">
            <View className="mb-4">
              <Text className="text-2xl font-bold text-gray-900 mb-2 text-center capitalize">
                Manage {arrayField}
              </Text>
              <Text className="text-base text-gray-500 text-center mb-4">
                {arrayField === "skills" && "Add your professional skills"}
                {arrayField === "serviceAreas" &&
                  "Add neighborhoods or areas you serve"}
                {arrayField === "languages" && "Add languages you speak"}
                {arrayField === "tools" && "Add tools and equipment you own"}
              </Text>
            </View>

            {/* Add Input */}
            <View className="flex-row mb-6">
              <TextInput
                value={arrayInput}
                onChangeText={setArrayInput}
                placeholder={`Add ${arrayField?.slice(0, -1) || "item"}`}
                className="flex-1 bg-gray-100 px-4 py-4 rounded-xl text-gray-900 text-base mr-3 border border-gray-200"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={addToArray}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={addToArray}
                className="bg-blue-600 w-14 h-14 rounded-xl items-center justify-center"
                disabled={isLoading || !arrayInput.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="add" size={28} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* List of Items */}
            <View className="flex-1 mb-4">
              <Text className="text-lg font-semibold text-gray-700 mb-3">
                Your {arrayField} ({profileData[arrayField]?.length || 0})
              </Text>
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="handled"
              >
                {profileData[arrayField]?.length > 0 ? (
                  profileData[arrayField].map((item, index) => (
                    <View
                      key={index}
                      className="flex-row items-center justify-between bg-gray-50 px-4 py-4 rounded-xl mb-3 border border-gray-200"
                    >
                      <Text className="text-base text-gray-900 flex-1">
                        {item}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeFromArray(arrayField, item)}
                        className="p-1"
                      >
                        <Ionicons
                          name="close-circle"
                          size={26}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-8 items-center justify-center flex-1">
                    <Ionicons name="list-outline" size={56} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-3 text-lg">
                      No {arrayField} added yet
                    </Text>
                    <Text className="text-gray-400 text-center mt-1">
                      Start by adding your first item above
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowArrayModal(false)}
              className="bg-gray-200 py-4 rounded-xl"
            >
              <Text className="text-gray-700 text-center font-semibold text-lg">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Portfolio Modal */}
      <PortfolioModal
        setShowPortfolioModal={setShowPortfolioModal}
        showPortfolioModal={showPortfolioModal}
        portfolioCategory={portfolioCategory}
        setPortfolioCategory={setPortfolioCategory}
        setPortfolioDescription={setPortfolioDescription}
        portfolioDescription={portfolioDescription}
        tempImage={tempImage}
        setTempImage={setTempImage}
        beforeImage={beforeImage}
        setBeforeImage={setBeforeImage}
        afterImage={afterImage}
        setAfterImage={setAfterImage}
        setUploadingImage={setUploadingImage}
        uploadingImage={uploadingImage}
        saveImage={saveImage}
        cancelImage={cancelImage}
        currentImageType={currentImageType}
      />
      {/* Portfolio View Modal */}
      <Modal
        visible={showPortfolioViewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPortfolioViewModal(false)}
      >
        <View className="flex-1 bg-black/95">
          {/* Header */}
          <View className="pt-12 px-5 pb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setShowPortfolioViewModal(false)}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            <View className="flex-row space-x-3">
              {/* Delete */}
              <TouchableOpacity
                onPress={() => {
                  setShowPortfolioViewModal(false);
                  const index = profileData.portfolio.findIndex(
                    (item) => item._id === selectedPortfolioItem._id
                  );
                  if (index !== -1) removePortfolioItems(index);
                }}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            {selectedPortfolioItem?.portfolioImageType ===
              "before_after_pair" && selectedPortfolioItem?.beforeAfter ? (
              <View className="px-5">
                {/* Before Image */}
                <View className="mb-4">
                  <View className="bg-black/60 px-3 py-1 rounded-t-lg">
                    <Text className="text-white font-bold text-sm">BEFORE</Text>
                  </View>
                  <Image
                    source={{
                      uri: selectedPortfolioItem.beforeAfter.before.url,
                    }}
                    className="w-full h-72 rounded-b-lg"
                    resizeMode="contain"
                  />
                </View>

                {/* After Image */}
                <View className="mb-4">
                  <View className="bg-green-600 px-3 py-1 rounded-t-lg">
                    <Text className="text-white font-bold text-sm">AFTER</Text>
                  </View>
                  <Image
                    source={{
                      uri: selectedPortfolioItem.beforeAfter.after.url,
                    }}
                    className="w-full h-72 rounded-b-lg"
                    resizeMode="contain"
                  />
                </View>

                {/* Description */}
                {selectedPortfolioItem.beforeAfter.description && (
                  <View className="bg-gray-900 p-4 rounded-lg">
                    <Text className="text-white text-sm">
                      {selectedPortfolioItem.beforeAfter.description}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              selectedPortfolioItem?.image && (
                <View className="flex-1 justify-center px-5">
                  <Image
                    source={{ uri: selectedPortfolioItem.image.url }}
                    className="w-full h-96"
                    resizeMode="contain"
                  />

                  {/* Caption */}
                  {selectedPortfolioItem.image.caption && (
                    <View className="bg-gray-900 p-4 rounded-lg mt-4">
                      <Text className="text-white text-sm">
                        {selectedPortfolioItem.image.caption}
                      </Text>
                    </View>
                  )}

                  {/* Category Info */}
                  <View className="bg-gray-900 p-3 rounded-lg mt-2 flex-row items-center justify-between">
                    <Text className="text-gray-400 text-xs">Category</Text>
                    <Text className="text-white text-sm font-semibold">
                      {selectedPortfolioItem.category.replace("_", " ")}
                    </Text>
                  </View>
                </View>
              )
            )}

            {/* Upload Date */}
            {selectedPortfolioItem?.uploadedAt && (
              <View className="px-5 py-3">
                <Text className="text-gray-500 text-xs text-center">
                  Uploaded on{" "}
                  {new Date(
                    selectedPortfolioItem.uploadedAt
                  ).toLocaleDateString()}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Image Viewing modal */}
      {/* NEW: Image View Modal - View existing images with option to update */}
      <Modal
        visible={showImageViewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageViewModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.95)" }}>
          {/* Header */}
          <View className="pt-12 px-5 pb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                setShowImageViewModal(false);
                setViewingImage(null);
              }}
              className="w-10 h-10 items-center justify-center bg-black/50 rounded-full"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            {/* Update Button - Only show if NOT verified for Ghana Card */}
            {viewingImage?.type === "profile" && (
              <TouchableOpacity
                onPress={() => {
                  setShowImageViewModal(false);
                  setViewingImage(null);
                  handleImageUpload("profile");
                }}
                className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center"
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Update</Text>
              </TouchableOpacity>
            )}

            {/* For Ghana Card - only show update if not verified */}
            {(viewingImage?.type === "ghanaCard_front" ||
              viewingImage?.type === "ghanaCard_back") &&
              !profileData.ghanaCard.verified && (
                <TouchableOpacity
                  onPress={() => {
                    setShowImageViewModal(false);
                    setViewingImage(null);
                    handleImageUpload(viewingImage.type);
                  }}
                  className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center"
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Update</Text>
                </TouchableOpacity>
              )}

            {/* Show verified badge if Ghana Card is verified */}
            {(viewingImage?.type === "ghanaCard_front" ||
              viewingImage?.type === "ghanaCard_back") &&
              profileData.ghanaCard.verified && (
                <View className="bg-green-600 px-4 py-2 rounded-full flex-row items-center">
                  <Ionicons name="shield-checkmark" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Verified
                  </Text>
                </View>
              )}
          </View>

          {/* Image Display */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            {viewingImage?.url ? (
              <Image
                source={{ uri: viewingImage.url }}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: 500,
                }}
                resizeMode="contain"
                onError={(error) => {
                  console.log("Image load error:", error.nativeEvent);
                  Alert.alert("Error", "Failed to load image");
                }}
                onLoad={() => console.log("Image loaded successfully")}
              />
            ) : (
              <View className="items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-white mt-4">Loading image...</Text>
              </View>
            )}
          </View>

          {/* Info Footer */}
          <View className="bg-black/70 px-5 py-4">
            <Text className="text-white text-sm text-center">
              {viewingImage?.type === "profile" && "Profile Picture"}
              {viewingImage?.type === "ghanaCard_front" &&
                "Ghana Card - Front Side"}
              {viewingImage?.type === "ghanaCard_back" &&
                "Ghana Card - Back Side"}
            </Text>
            {profileData.ghanaCard.verified &&
              (viewingImage?.type === "ghanaCard_front" ||
                viewingImage?.type === "ghanaCard_back") && (
                <Text className="text-green-400 text-xs text-center mt-1">
                  ✓ This document has been verified and cannot be modified
                </Text>
              )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ArtisanProfileManagement;
