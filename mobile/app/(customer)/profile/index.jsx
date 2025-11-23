// Profile.jsx (updated, full)
// ------------------------------------------------------------
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { memo, useState, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LocationModal from "../../../components/LocationModal";
import { getCustomerByUserId, updateCustomer } from "../../../store/artisan";
import { removeToken } from "../../../store/user";
import { uploadImageDirect } from "../../../store/imageUpload";

const Avatar = memo(({ uri, name, size = 100, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ position: "relative" }}
    >
      {uri && !imageError ? (
        <>
          {imageLoading && (
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#F3F4F6",
                position: "absolute",
              }}
            />
          )}
          <Image
            source={{ uri }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: "#F3F4F6",
              borderWidth: 4,
              borderColor: "white",
            }}
            onError={() => setImageError(true)}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
        </>
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#6F4E37",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 4,
            borderColor: "white",
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "bold", fontSize: size / 2.5 }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Camera Icon */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: size * 0.28,
          height: size * 0.28,
          backgroundColor: "#6F4E37",
          borderRadius: size * 0.14,
          borderWidth: 3,
          borderColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="camera" size={size * 0.13} color="white" />
      </View>
    </TouchableOpacity>
  );
});

// ---------------------- AddressCard (memoized) ----------------------
const AddressCard = memo(
  ({ address, onEdit, onDelete }) => {
    const getIcon = (label) => {
      switch (String(label || "").toLowerCase()) {
        case "home":
          return "home";
        case "office":
        case "work":
          return "briefcase";
        default:
          return "location";
      }
    };

    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
        <View className="flex-row items-start">
          <View className="w-12 h-12 rounded-xl bg-[#6F4E37]/10 items-center justify-center mr-3">
            <Ionicons name={getIcon(address.label)} size={24} color="#6F4E37" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-bold text-gray-900">
                {address || "Address"}
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => onDelete(address)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            {address.coordinates && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="navigate-outline" size={14} color="#9CA3AF" />
                <Text className="text-xs text-gray-400 ml-1">
                  {Number(address.coordinates.lat).toFixed(4)},{" "}
                  {Number(address.coordinates.lng).toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.address._id === nextProps.address._id &&
    prevProps.address.label === nextProps.address.label &&
    prevProps.address.address === nextProps.address.address
);

// ---------------------- MenuItem (memoized) ----------------------
const MenuItem = memo(
  ({ icon, title, subtitle, onPress, showBadge, badgeCount }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-xl bg-[#6F4E37]/10 items-center justify-center mr-3">
          <Ionicons name={icon} size={24} color="#6F4E37" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-bold text-gray-900">{title}</Text>
            {showBadge && badgeCount > 0 && (
              <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 ml-2">
                <Text className="text-white text-xs font-bold">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  )
);

// ---------------------- Main Profile Component ----------------------
const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { customer } = useSelector((state) => state.artisan || {});

  // UI state
  const [locations, setLocations] = useState([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Image upload / view state
  const [showImageModal, setShowImageModal] = useState(false); // upload modal
  const [tempImage, setTempImage] = useState(null); // preview before upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageViewModal, setShowImageViewModal] = useState(false); // full view
  const [viewingImage, setViewingImage] = useState(null); // { url, type } OR null

  const [userAvatar, setUserAvatar] = useState(""); // store avatar url locally

  // Load location history from AsyncStorage
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const saved = await AsyncStorage.getItem("location_history");
        if (saved) setLocations(JSON.parse(saved));
      } catch (err) {
        // ignore
      }
    };
    loadLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user?.userId) return;

      dispatch(getCustomerByUserId(user.userId)).then((res) => {
        if (res?.payload?.success) {
          setUserAvatar(res.payload.data.profilePicture || "");
        }
      });
    }, [dispatch, user?.userId])
  );

  useEffect(() => {
    if (customer?.profilePicture) {
      setUserAvatar(customer.profilePicture);
    }
  }, [customer?.profilePicture]);

  // Derived values
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userPhone = user?.phone || "";
  const loyaltyPoints = customer?.loyaltyPoints || 0;
  const favoriteArtisans = customer?.favoriteArtisans || [];

  const pickImage = useCallback(async (type = "profile") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      quality: 0.7,
    });

    if (!result.canceled) {
      setTempImage({ ...result.assets[0], type });
      setShowImageModal(true);
    }
  }, []);

  const handleViewImage = useCallback((uriOrObj) => {
    if (!uriOrObj) return;
    if (typeof uriOrObj === "string") {
      setViewingImage({ url: uriOrObj, type: "profile" });
    } else if (typeof uriOrObj === "object") {
      const url = uriOrObj.url || uriOrObj.uri || "";
      const type = uriOrObj.type || "profile";
      setViewingImage({ url, type });
    }
    setShowImageViewModal(true);
  }, []);

  const handleImageUpload = useCallback(
    (type = "profile") => {
      pickImage(type);
    },
    [pickImage]
  );

  const saveImage = async () => {
    setUploadingImage(true);

    try {
      // Upload image
      const image = await dispatch(uploadImageDirect(tempImage.uri));
      const uploadedUrl =
        image.payload?.secure_url ||
        image.payload?.data?.secure_url ||
        image.payload;

      if (uploadedUrl) {
        const data = {
          profilePicture: uploadedUrl,
          id: customer._id,
        };
        console.log(data);

        const res = await dispatch(updateCustomer(data));
        if (res.payload?.success) {
          setUserAvatar(uploadedUrl);
          setShowImageModal(false);
          setTempImage(null);
        } else {
          Alert.alert("Error", "Failed to update profile");
        }
      } else {
        Alert.alert("Error", "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const cancelImage = useCallback(() => {
    setShowImageModal(false);
    setTempImage(null);
  }, []);

  // ---------------------- Address actions ----------------------
  const handleAddAddress = useCallback(() => {
    setLocationModalVisible(true);
  }, []);

  const handleEditAddress = useCallback(
    (address) => {
      router.push({
        pathname: "/edit-address",
        params: { addressId: address._id },
      });
    },
    [router]
  );

  const handleDeleteAddress = useCallback(
    async (address) => {
      // remove matching string
      const filtered = locations.filter((item) => item !== address);

      setLocations(filtered);
      await AsyncStorage.setItem("location_history", JSON.stringify(filtered));

      /*  Alert.alert(
      "Delete Address",
      `Are you sure you want to delete "${address}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // remove matching string
              const filtered = locations.filter((item) => item !== address);

              setLocations(filtered);
              await AsyncStorage.setItem(
                "location_history",
                JSON.stringify(filtered)
              );

              Alert.alert("Deleted", "Address removed.");
            } catch (err) {
              console.log("delete error:", err);
            }
          },
        },
      ]
    ); */
    },
    [locations]
  );

  // ---------------------- Logout ----------------------
  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          dispatch(removeToken());
          router.replace("../../auth/login");
        },
      },
    ]);
  }, [dispatch, router]);

  // ---------------------- Render ----------------------
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header + Gradient */}
        <LinearGradient
          colors={["#6F4E37", "#8B6240"]}
          className="pb-8 pt-4 px-5"
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-white">Profile</Text>
            {/* <TouchableOpacity
              onPress={() => router.push("/settings")}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity> */}
          </View>

          {/* Profile Card */}
          <View className="bg-white rounded-3xl p-6 items-center">
            <Avatar
              uri={userAvatar}
              name={userName}
              size={100}
              onPress={() => {
                // If avatar exists, view it; otherwise start upload flow
                if (userAvatar) {
                  handleViewImage(userAvatar);
                } else {
                  handleImageUpload("profile");
                }
              }}
            />

            {/*    <Text className="text-xl font-bold text-gray-900 mt-4">
              {userName}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">{userEmail}</Text>

            {userPhone && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                <Text className="text-sm text-gray-500 ml-1">{userPhone}</Text>
              </View>
            )} */}

            {/* Loyalty Points */}
            <View className="flex-row items-center justify-center bg-amber-50 rounded-2xl px-6 py-3 mt-4 border border-amber-200">
              <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-xs text-gray-500">Loyalty Points</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {Number(loyaltyPoints).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View className="px-5 mt-6">
          {/* Quick Stats */}
          <View className="flex-row mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 mr-2 border border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="bookmark" size={20} color="#6F4E37" />
                <Text className="text-2xl font-bold text-gray-900">
                  {favoriteArtisans.length}
                </Text>
              </View>
              <Text className="text-xs text-gray-500">Favorites</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 ml-2 border border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="location" size={20} color="#6F4E37" />
                <Text className="text-2xl font-bold text-gray-900">
                  {locations?.length || 0}
                </Text>
              </View>
              <Text className="text-xs text-gray-500">Addresses</Text>
            </View>
          </View>

          {/* Saved Addresses */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Saved Addresses
              </Text>
              <TouchableOpacity
                onPress={handleAddAddress}
                className="bg-[#6F4E37] rounded-full px-4 py-2"
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white text-sm font-semibold ml-1">
                    Add
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {locations && locations.length > 0 ? (
              locations.map((address, index) => (
                <AddressCard
                  key={address._id || index}
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              ))
            ) : (
              <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                  <Ionicons name="location-outline" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  No Saved Addresses
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-4">
                  Add your frequently used addresses for faster booking
                </Text>
                <TouchableOpacity
                  onPress={handleAddAddress}
                  className="bg-[#6F4E37] rounded-full px-6 py-3"
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-bold ml-2">
                      Add Address
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Menu Items */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Account
            </Text>

            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push("./profile/edit-profile")}
            />
            <MenuItem
              icon="heart-outline"
              title="Favorite Artisans"
              subtitle={`${favoriteArtisans.length} artisans`}
              onPress={() => router.push("./profile/favoriteArtisan")}
              showBadge={false}
            />
            <MenuItem
              icon="time-outline"
              title="Booking History"
              subtitle="View your past bookings"
              onPress={() => router.push("/bookings")}
            />
            {/*  <MenuItem
              icon="shield-checkmark-outline"
              title="Emergency Contacts"
              subtitle="Manage emergency contacts"
              onPress={() => router.push("/emergency-contacts")}
            /> */}
          </View>

          {/* Support & Settings */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Support & Settings
            </Text>

            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help with your account"
              onPress={() => router.push("./profile/Help")}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Privacy"
              subtitle="Read our policies"
              onPress={() => router.push("./profile/Terms")}
            />
            <MenuItem
              icon="information-circle-outline"
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => router.push("./profile/About")}
            />
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-200"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text className="text-base font-bold text-red-600 ml-2">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelect={(loc) => {
          // Save locally; in real app you would call the API
          const updated = [...(locations || []), loc];
          setLocations(updated);
          AsyncStorage.setItem(
            "location_history",
            JSON.stringify(updated)
          ).catch(() => {});
          setLocationModalVisible(false);
        }}
      />

      {/* Upload Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={cancelImage}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            <View className="px-6 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">
                Upload Image
              </Text>
            </View>

            <ScrollView className="max-h-[70vh]">
              {tempImage ? (
                <View className="p-6 items-center">
                  <Image
                    source={{ uri: tempImage.uri }}
                    className="w-full h-64 rounded-xl"
                    resizeMode="cover"
                  />
                  <Text className="text-sm text-gray-500 mt-3">
                    {tempImage.fileName || tempImage.uri}
                  </Text>
                </View>
              ) : (
                <View className="p-6 items-center">
                  <Text className="text-sm text-gray-500">
                    No image selected
                  </Text>
                </View>
              )}
            </ScrollView>

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
                disabled={uploadingImage || !tempImage}
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

      {/* Fullscreen Image View Modal */}
      <Modal
        visible={showImageViewModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowImageViewModal(false);
          setViewingImage(null);
        }}
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

            {/* If viewingImage type is profile we show Update button */}
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

            {/* If viewing Ghana card and it's not verified, allow upload/update */}
            {(viewingImage?.type === "ghanaCard_front" ||
              viewingImage?.type === "ghanaCard_back") &&
              !customer?.ghanaCard?.verified && (
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

            {/* Verified badge if Ghana card verified */}
            {(viewingImage?.type === "ghanaCard_front" ||
              viewingImage?.type === "ghanaCard_back") &&
              customer?.ghanaCard?.verified && (
                <View className="bg-green-600 px-4 py-2 rounded-full flex-row items-center">
                  <Ionicons name="shield-checkmark" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Verified
                  </Text>
                </View>
              )}
          </View>

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
                style={{ width: "100%", height: "100%", maxHeight: 600 }}
                resizeMode="contain"
                onError={(e) => {
                  console.log("Image load error:", e.nativeEvent);
                  Alert.alert("Error", "Failed to load image");
                }}
                onLoad={() => console.log("Image loaded")}
              />
            ) : (
              <View className="items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-white mt-4">Loading image...</Text>
              </View>
            )}
          </View>

          {/* Footer info */}
          <View className="bg-black/70 px-5 py-4">
            <Text className="text-white text-sm text-center">
              {viewingImage?.type === "profile" && "Profile Picture"}
              {viewingImage?.type === "ghanaCard_front" &&
                "Ghana Card - Front Side"}
              {viewingImage?.type === "ghanaCard_back" &&
                "Ghana Card - Back Side"}
            </Text>

            {customer?.ghanaCard?.verified &&
              (viewingImage?.type === "ghanaCard_front" ||
                viewingImage?.type === "ghanaCard_back") && (
                <Text className="text-green-400 text-xs text-center mt-1">
                  ✓ This document has been verified and cannot be modified
                </Text>
              )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
