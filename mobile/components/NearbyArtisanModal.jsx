import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NearbyArtisanModal = ({ visible, onClose, onArtisansFound }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [foundArtisans, setFoundArtisans] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const webViewRef = useRef(null);

  // Ripple animation values
  const rippleAnim1 = useRef(new Animated.Value(0)).current;
  const rippleAnim2 = useRef(new Animated.Value(0)).current;
  const rippleAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) getUserLocation();
  }, [visible]);

  useEffect(() => {
    if (isSearching) {
      startRippleAnimation();
    } else {
      rippleAnim1.setValue(0);
      rippleAnim2.setValue(0);
      rippleAnim3.setValue(0);
    }
  }, [isSearching]);

  // Update map when artisans are found
  useEffect(() => {
    if (foundArtisans.length > 0 && webViewRef.current) {
      updateMapMarkers();
    }
  }, [foundArtisans]);

  const startRippleAnimation = () => {
    const createRipple = (animValue, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    Animated.parallel([
      createRipple(rippleAnim1, 0),
      createRipple(rippleAnim2, 600),
      createRipple(rippleAnim3, 1200),
    ]).start();
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Permission to access location is required!"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
    } catch (error) {
      Alert.alert("Error", "Failed to get your location");
      console.error(error);
    }
  };

  const searchNearbyArtisans = async () => {
    if (!userLocation) {
      Alert.alert("Error", "Location not available");
      return;
    }

    setIsSearching(true);
    setFoundArtisans([]);
    setSelectedArtisan(null);

    try {
      // Replace with your actual API call
      setTimeout(() => {
        setIsSearching(false);

        // Mock data with coordinates near user
        const mockArtisans = [
          {
            id: 1,
            name: "John Carpenter",
            specialty: "Carpentry",
            rating: 4.8,
            distance: "0.5 km",
            phone: "+233 24 123 4567",
            availability: "Available",
            latitude: userLocation.latitude + 0.003,
            longitude: userLocation.longitude + 0.002,
          },
          {
            id: 2,
            name: "Mary Plumber",
            specialty: "Plumbing",
            rating: 4.5,
            distance: "1.2 km",
            phone: "+233 24 234 5678",
            availability: "Available",
            latitude: userLocation.latitude - 0.004,
            longitude: userLocation.longitude - 0.003,
          },
          {
            id: 3,
            name: "Sam Electrician",
            specialty: "Electrical",
            rating: 4.9,
            distance: "0.8 km",
            phone: "+233 24 345 6789",
            availability: "Busy",
            latitude: userLocation.latitude + 0.002,
            longitude: userLocation.longitude - 0.005,
          },
          {
            id: 4,
            name: "David Mason",
            specialty: "Masonry",
            rating: 4.6,
            distance: "0.3 km",
            phone: "+233 24 456 7890",
            availability: "Available",
            latitude: userLocation.latitude - 0.001,
            longitude: userLocation.longitude + 0.004,
          },
        ];

        setFoundArtisans(mockArtisans);

        if (onArtisansFound) {
          onArtisansFound(mockArtisans);
        }
      }, 3000);
    } catch (error) {
      setIsSearching(false);
      Alert.alert("Error", "Failed to find artisans nearby");
      console.error(error);
    }
  };

  const updateMapMarkers = () => {
    const markersData = foundArtisans.map((artisan) => ({
      id: artisan.id,
      lat: artisan.latitude,
      lng: artisan.longitude,
      name: artisan.name,
      specialty: artisan.specialty,
      rating: artisan.rating,
      distance: artisan.distance,
      availability: artisan.availability,
    }));

    const jsCode = `
      if (typeof updateArtisanMarkers === 'function') {
        updateArtisanMarkers(${JSON.stringify(markersData)});
      }
    `;

    webViewRef.current?.injectJavaScript(jsCode);
  };

  const handleClose = () => {
    setIsSearching(false);
    setFoundArtisans([]);
    setSelectedArtisan(null);
    rippleAnim1.setValue(0);
    rippleAnim2.setValue(0);
    rippleAnim3.setValue(0);
    onClose();
  };

  const getSpecialtyIcon = (specialty) => {
    const icons = {
      Carpentry: "hammer",
      Plumbing: "water",
      Electrical: "flash",
      Masonry: "cube",
    };
    return icons[specialty] || "build";
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      Carpentry: "#8B4513",
      Plumbing: "#1E90FF",
      Electrical: "#FFD700",
      Masonry: "#808080",
    };
    return colors[specialty] || "#6F4E37";
  };

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "markerClick") {
        const artisan = foundArtisans.find((a) => a.id === data.artisanId);
        if (artisan) {
          setSelectedArtisan(artisan);
        }
      } else if (data.type === "mapClick") {
        setSelectedArtisan(null);
      }
    } catch (error) {
      console.error("Error parsing map message:", error);
    }
  };

  const handleZoom = (direction) => {
    const jsCode = `
      if (typeof ${direction === "in" ? "zoomIn" : "zoomOut"} === 'function') {
        ${direction === "in" ? "zoomIn" : "zoomOut"}();
      }
    `;
    webViewRef.current?.injectJavaScript(jsCode);
  };

  // Generate Leaflet map HTML
  const getMapHTML = () => {
    if (!userLocation) return "";

    const { latitude, longitude } = userLocation;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
          }
          #map {
            height: 100%;
            width: 100%;
          }
          .artisan-marker {
            background-color: white;
            border: 3px solid #6F4E37;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          }
          .artisan-marker:hover {
            transform: scale(1.1);
          }
          .artisan-marker.selected {
            border-color: #1E90FF;
            border-width: 4px;
          }
          .user-marker {
            background-color: #EF4444;
            border: 3px solid white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.1);
            }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${latitude}, ${longitude}], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // User location marker
          const userIcon = L.divIcon({
            className: 'user-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const userMarker = L.marker([${latitude}, ${longitude}], { 
            icon: userIcon,
            zIndexOffset: 1000
          }).addTo(map);

          // Store artisan markers
          const artisanMarkers = {};

          // Icon mapping
          const iconMap = {
            'Carpentry': '🔨',
            'Plumbing': '🔧',
            'Electrical': '⚡',
            'Masonry': '🧱'
          };

          // Function to get specialty color
          function getSpecialtyColor(specialty) {
            const colors = {
              'Carpentry': '#8B4513',
              'Plumbing': '#1E90FF',
              'Electrical': '#FFD700',
              'Masonry': '#808080'
            };
            return colors[specialty] || '#6F4E37';
          }

          // Update artisan markers
          window.updateArtisanMarkers = function(artisans) {
            // Clear existing markers
            Object.values(artisanMarkers).forEach(marker => map.removeLayer(marker));
            
            // Add new markers
            artisans.forEach(artisan => {
              const icon = L.divIcon({
                className: 'artisan-marker',
                html: iconMap[artisan.specialty] || '🛠️',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
              });

              const marker = L.marker([artisan.lat, artisan.lng], { icon })
                .addTo(map)
                .on('click', function() {
                  // Highlight selected marker
                  Object.values(artisanMarkers).forEach(m => {
                    const el = m.getElement();
                    if (el) el.classList.remove('selected');
                  });
                  this.getElement().classList.add('selected');
                  
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerClick',
                    artisanId: artisan.id
                  }));
                });

              artisanMarkers[artisan.id] = marker;
            });

            // Fit bounds to show all markers
            if (artisans.length > 0) {
              const bounds = L.latLngBounds(
                [[${latitude}, ${longitude}]].concat(
                  artisans.map(a => [a.lat, a.lng])
                )
              );
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          };

          // Zoom functions
          window.zoomIn = function() {
            map.zoomIn();
          };

          window.zoomOut = function() {
            map.zoomOut();
          };

          // Map click handler
          map.on('click', function(e) {
            // Deselect all markers
            Object.values(artisanMarkers).forEach(m => {
              const el = m.getElement();
              if (el) el.classList.remove('selected');
            });
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              lat: e.latlng.lat,
              lng: e.latlng.lng
            }));
          });
        </script>
      </body>
      </html>
    `;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
            <View className="flex-1">
              <Text className="text-xl font-bold" style={{ color: "#6F4E37" }}>
                Find Nearby Artisans
              </Text>
              {foundArtisans.length > 0 && (
                <Text className="text-sm text-gray-500 mt-0.5">
                  {foundArtisans.length} artisan
                  {foundArtisans.length !== 1 ? "s" : ""} found
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6F4E37" />
            </TouchableOpacity>
          </View>

          {/* Map Area */}
          <View className="flex-1 relative">
            {userLocation ? (
              <>
                <WebView
                  ref={webViewRef}
                  originWhitelist={["*"]}
                  source={{ html: getMapHTML() }}
                  style={{ flex: 1 }}
                  onMessage={handleMapMessage}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />

                {/* Zoom Controls */}
                <View className="absolute right-4 top-4 bg-white rounded-xl shadow-lg overflow-hidden">
                  <TouchableOpacity
                    onPress={() => handleZoom("in")}
                    className="p-3 border-b border-gray-200"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={24} color="#6F4E37" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleZoom("out")}
                    className="p-3"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={24} color="#6F4E37" />
                  </TouchableOpacity>
                </View>

                {/* Coordinates badge */}
                <View className="absolute top-4 left-4 bg-white/95 rounded-xl px-3 py-2 shadow-md">
                  <View className="flex-row items-center">
                    <Ionicons name="location-sharp" size={14} color="#6F4E37" />
                    <Text
                      className="text-xs font-semibold ml-1.5"
                      style={{ color: "#6F4E37" }}
                    >
                      {userLocation.latitude.toFixed(5)},{" "}
                      {userLocation.longitude.toFixed(5)}
                    </Text>
                  </View>
                </View>

                {/* Radius indicator */}
                {isSearching && (
                  <View className="absolute top-16 left-4 bg-white/95 rounded-xl px-3 py-2 shadow-md">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="radio-outline"
                        size={14}
                        color="#6F4E37"
                      />
                      <Text
                        className="text-xs font-semibold ml-1.5"
                        style={{ color: "#6F4E37" }}
                      >
                        1 km radius
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View className="flex-1 items-center justify-center bg-gray-100">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: "#6F4E37" }}
                >
                  <Ionicons name="location" size={40} color="white" />
                </View>
                <Text className="text-gray-700 font-semibold text-base mt-4">
                  Getting your location...
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Please wait a moment
                </Text>
              </View>
            )}
          </View>

          {/* Selected Artisan Details Card */}
          {selectedArtisan && (
            <View className="absolute bottom-24 left-5 right-5 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
              <View className="flex-row items-start">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "#6F4E37" }}
                >
                  <Ionicons
                    name={getSpecialtyIcon(selectedArtisan.specialty)}
                    size={28}
                    color="white"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-gray-900 font-bold text-base">
                      {selectedArtisan.name}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedArtisan(null)}>
                      <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-gray-600 text-sm mb-1">
                    {selectedArtisan.specialty}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text className="text-sm text-gray-700 ml-1 mr-3">
                      {selectedArtisan.rating}
                    </Text>
                    <Ionicons name="navigate" size={14} color="#6F4E37" />
                    <Text className="text-sm text-gray-700 ml-1">
                      {selectedArtisan.distance}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View
                        className={`w-2 h-2 rounded-full mr-1.5 ${
                          selectedArtisan.availability === "Available"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <Text className="text-xs text-gray-600">
                        {selectedArtisan.availability}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-green-600 px-4 py-2 rounded-lg"
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="call" size={14} color="white" />
                        <Text className="text-white font-semibold text-xs ml-1">
                          Call Now
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Searching Status Card */}
          {isSearching && (
            <View className="absolute bottom-24 left-5 right-5 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-3" style={{ gap: 6 }}>
                  <Animated.View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: "#6F4E37",
                      opacity: rippleAnim1.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    }}
                  />
                  <Animated.View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: "#6F4E37",
                      opacity: rippleAnim2.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    }}
                  />
                  <Animated.View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: "#6F4E37",
                      opacity: rippleAnim3.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    }}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold text-base">
                    Searching nearby...
                  </Text>
                  <Text className="text-gray-500 text-sm mt-0.5">
                    Scanning within 1km radius
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Action Button */}
          {userLocation && !foundArtisans.length && (
            <View className="p-4 border-t border-gray-200 bg-white">
              <TouchableOpacity
                onPress={searchNearbyArtisans}
                disabled={isSearching}
                className="rounded-xl py-4 items-center justify-center"
                style={{
                  backgroundColor: isSearching ? "#9CA3AF" : "#6F4E37",
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={isSearching ? "radio-outline" : "navigate"}
                    size={22}
                    color="white"
                  />
                  <Text className="text-white font-bold text-base ml-2">
                    {isSearching ? "Searching..." : "Find Artisans"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Artisan List */}
          {foundArtisans.length > 0 && !selectedArtisan && (
            <View className="border-t border-gray-200 bg-white">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                {foundArtisans.map((artisan) => (
                  <TouchableOpacity
                    key={artisan.id}
                    onPress={() => setSelectedArtisan(artisan)}
                    className="bg-gray-50 rounded-xl p-3 mr-3 border border-gray-200"
                    style={{ width: SCREEN_WIDTH * 0.7 }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: "#6F4E37" }}
                      >
                        <Ionicons
                          name={getSpecialtyIcon(artisan.specialty)}
                          size={24}
                          color="white"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-bold text-sm">
                          {artisan.name}
                        </Text>
                        <Text className="text-gray-600 text-xs">
                          {artisan.specialty}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="star" size={12} color="#FBBF24" />
                          <Text className="text-xs text-gray-700 ml-1 mr-2">
                            {artisan.rating}
                          </Text>
                          <Ionicons name="navigate" size={12} color="#6F4E37" />
                          <Text className="text-xs text-gray-700 ml-1">
                            {artisan.distance}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default NearbyArtisanModal;
