import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const ArtisanPriceProposalModal = ({
  showBookingModal,
  setShowBookingModal,
  selectedBooking,
  submitting,
  handleApproveBooking,
  formatDate,
  formatTimeSlot,
  hasProblemPhotos,
  ProblemPhotosGrid,
  getStatusColor,
  getStatusText,
  proposedPrice,
  notes,
  setProposedPrice,
  setNotes
}) => {
   
  return (
    <Modal
      visible={showBookingModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowBookingModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: "90%" }}>
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              Booking Details
            </Text>
            <TouchableOpacity
              onPress={() => setShowBookingModal(false)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={selectedBooking ? [selectedBooking] : []}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="p-5">
                {/* Customer Info */}
                <View className="flex-row items-center mb-6">
                  <View className="w-16 h-16 rounded-full bg-gray-200 mr-4 items-center justify-center">
                    <Ionicons name="person" size={24} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">
                      {item.customer?.name ||
                        item.customer?.firstName ||
                        "Customer"}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {item.customer?.rating
                          ? `${item.customer.rating} (${
                              item.customer.reviewCount || 0
                            } reviews)`
                          : "No reviews yet"}
                      </Text>
                    </View>
                  </View>
                  {item.isEmergency && (
                    <View className="bg-red-100 px-3 py-1.5 rounded-full">
                      <Text className="text-red-700 text-xs font-bold">
                        URGENT
                      </Text>
                    </View>
                  )}
                </View>

                {/* Service Details */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Service Details
                  </Text>
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {item.service?.name || "Service"}
                  </Text>

                  <View className="space-y-2">
                    <View className="flex-row items-start mb-3">
                      <Ionicons name="location" size={18} color="#6B7280" />
                      <View className="flex-1 ml-2">
                        <Text className="text-xs text-gray-500">Location</Text>
                        <Text className="text-sm font-semibold text-gray-900">
                          {item.location?.address ||
                            item.location?.city ||
                            "Address not specified"}
                        </Text>
                        {item.location?.instructions && (
                          <Text className="text-xs text-gray-500 mt-1">
                            {item.location.instructions}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-start">
                      <Ionicons name="time" size={18} color="#6B7280" />
                      <View className="flex-1 ml-2">
                        <Text className="text-xs text-gray-500">
                          Date & Time
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">
                          {formatDate(item.scheduledDate)}
                          {item.timeSlot &&
                            ` • ${formatTimeSlot(item.timeSlot)}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Problem Photos - NEW SECTION */}
                {hasProblemPhotos(item) && (
                  <ProblemPhotosGrid photos={item.problemPhotos} />
                )}

                {/* Problem Description */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Problem Description
                  </Text>
                  <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Text className="text-sm text-gray-700 leading-5">
                      {item.problemDescription || "No description provided"}
                    </Text>
                  </View>
                </View>

                {/* Current Status */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Current Status
                  </Text>
                  <View
                    className={`${
                      getStatusColor(item.status).bg
                    } px-4 py-3 rounded-xl`}
                  >
                    <Text
                      className={`${
                        getStatusColor(item.status).text
                      } font-bold`}
                    >
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>

                {/* Your Proposed Price */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Your Proposed Price *
                  </Text>
                  <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-1">
                    <Text className="text-gray-600 text-lg font-bold mr-2">
                      GHS
                    </Text>
                    <TextInput
                      value={proposedPrice}
                      onChangeText={setProposedPrice}
                      placeholder="Enter your price"
                      keyboardType="numeric"
                      className="flex-1 text-gray-900 text-lg font-bold py-3"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">
                    This will be your final quote to the customer
                  </Text>
                </View>

                {/* Notes/Reason */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Notes & Breakdown *
                  </Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Explain your pricing (materials, labor, timeline, etc.)"
                    multiline
                    numberOfLines={4}
                    className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 text-sm"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    Help the customer understand your pricing
                  </Text>
                </View>
              </View>
            )}
            ListFooterComponent={
              <View className="p-5 border-t border-gray-200">
                <TouchableOpacity
                  onPress={handleApproveBooking}
                  disabled={submitting}
                  className="bg-[#6F4E37] py-4 rounded-xl mb-3 flex-row items-center justify-center"
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-sm">
                      Send Price Proposal
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};
export default ArtisanPriceProposalModal;
