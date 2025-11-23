// components/LocationModal.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const LocationModal = ({ visible, onClose, onLocationSelect }) => {
  const [previousLocations, setPreviousLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [loading, setLoading] = useState(false);

  // Load recent locations from storage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await AsyncStorage.getItem("location_history");
        if (history) setPreviousLocations(JSON.parse(history));
      } catch (error) {
        console.warn("⚠️ Failed to load location history", error);
      }
    };
    if (visible) loadHistory();
  }, [visible]);

  // Select existing location
  const handleSelect = async (loc) => {
    await AsyncStorage.setItem("location", JSON.stringify(loc));
    onLocationSelect(loc);
    onClose();
  };

  // Save new location entered manually
  const handleSave = async () => {
    if (!newLocation.trim()) {
      Alert.alert("Please enter a valid location");
      return;
    }

    const trimmed = newLocation.trim();
    const updatedList = [
      trimmed,
      ...previousLocations.filter((l) => l !== trimmed),
    ].slice(0, 5);

    await AsyncStorage.setItem("location", JSON.stringify(trimmed));
    await AsyncStorage.setItem("location_history", JSON.stringify(updatedList));

    onLocationSelect(trimmed);
    setPreviousLocations(updatedList);
    setNewLocation("");
    onClose();
  };

  // 🛰 Use current location via Expo Location API
  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable location permissions in settings."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
        timeout: 10000,
      });

      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const readable = `${place.city || place.region || "Unknown"}, ${
        place.country || ""
      }`.trim();

      if (!readable) {
        Alert.alert("Unable to detect city name. Try again.");
        return;
      }

      // Save + update
      const updatedList = [
        readable,
        ...previousLocations.filter((l) => l !== readable),
      ].slice(0, 5);

      await AsyncStorage.setItem("location", JSON.stringify(readable));
      await AsyncStorage.setItem(
        "location_history",
        JSON.stringify(updatedList)
      );

      onLocationSelect(readable);
      setPreviousLocations(updatedList);
      onClose();
    } catch (error) {
      console.error("💥 Error fetching current location:", error);
      Alert.alert("Error", "Failed to fetch your current location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-2xl p-5">
          <Text className="text-lg font-bold mb-3 text-center text-gray-800">
            Select Your Location
          </Text>

          {/* Recent locations */}
          {previousLocations.length > 0 && (
            <>
              <Text className="text-sm text-gray-600 mb-2">
                Recent Locations
              </Text>
              <FlatList
                data={previousLocations}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    className="py-2 border-b border-gray-200"
                  >
                    <Text className="text-gray-800 text-base">{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {/* Enter new location manually */}
        {/*   <TextInput
            value={newLocation}
            onChangeText={setNewLocation}
            placeholder="Enter new location..."
            className="border border-gray-300 rounded-lg px-3 py-2 mt-3 text-gray-800"
          /> */}

          {/* Save manual location */}
         {/*  <TouchableOpacity
            onPress={handleSave}
            className="bg-[#6F4E37] rounded-lg py-3 mt-4"
          >
            <Text className="text-center text-white font-semibold">
              Save Location
            </Text>
          </TouchableOpacity> */}

          {/* Use current location */}
          <TouchableOpacity
            disabled={loading}
            onPress={handleUseCurrentLocation}
            className="border border-[#6F4E37] rounded-lg py-3 mt-3 flex-row justify-center items-center"
          >
            {loading ? (
              <ActivityIndicator color="#6F4E37" />
            ) : (
              <Text className="text-[#6F4E37] font-semibold">
                Use My Current Location
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity onPress={onClose} className="mt-3 py-2">
            <Text className="text-center text-gray-600 font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationModal;
