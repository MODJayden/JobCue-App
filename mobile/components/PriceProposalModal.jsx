import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// Price Proposal Modal Component
const PriceProposalModal = ({
  showPriceModal,
  setShowPriceModal,
  selectedBooking,
  actionLoading,
  handleAcceptPrice,
  handleRejectPrice,
  handleStartChat,
}) => (
  <Modal
    visible={showPriceModal}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setShowPriceModal(false)}
  >
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl max-h-4/5">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">
            Price Proposal
          </Text>
          <TouchableOpacity
            onPress={() => setShowPriceModal(false)}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            disabled={actionLoading}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="p-6">
          {selectedBooking && (
            <>
              {/* Artisan Info */}
              <View className="flex-row items-center mb-6">
                <Image
                  source={{
                    uri:
                      selectedBooking.artisan?.media?.profilePicture?.url ||
                      "https://via.placeholder.com/60",
                  }}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {selectedBooking.artisan?.userId?.name || "Artisan"}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-sm text-gray-600 ml-1">
                      {selectedBooking.artisan?.rating?.average?.toFixed(1) ||
                        "New"}
                      {selectedBooking.artisan?.rating?.average && (
                        <Text className="text-gray-500">
                          {" "}
                          ({selectedBooking.artisan?.rating?.count || 0}{" "}
                          reviews)
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Service Details */}
              <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  {selectedBooking.service?.name || "Service"}
                </Text>
                <Text className="text-sm text-gray-600">
                  {selectedBooking.problemDescription ||
                    "No description provided"}
                </Text>
              </View>

              {/* Price Breakdown */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Price Breakdown
                </Text>

                <View className="space-y-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Labor Cost</Text>
                    <Text className="font-semibold">
                      GHS{" "}
                      {selectedBooking.proposedPrice?.labor?.toFixed(2) ||
                        "0.00"}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Parts & Materials</Text>
                    <Text className="font-semibold">
                      GHS{" "}
                      {selectedBooking.proposedPrice?.parts?.toFixed(2) ||
                        "0.00"}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Transportation</Text>
                    <Text className="font-semibold">
                      GHS{" "}
                      {selectedBooking.proposedPrice?.transport?.toFixed(2) ||
                        "0.00"}
                    </Text>
                  </View>

                  {selectedBooking.isEmergency && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Emergency Fee</Text>
                      <Text className="font-semibold">
                        GHS{" "}
                        {selectedBooking.proposedPrice?.emergencyFee?.toFixed(
                          2
                        ) || "0.00"}
                      </Text>
                    </View>
                  )}

                  <View className="border-t border-gray-200 pt-3 mt-2">
                    <View className="flex-row justify-between">
                      <Text className="text-lg font-bold text-gray-900">
                        Total
                      </Text>
                      <Text className="text-lg font-bold text-[#6F4E37]">
                        GHS{" "}
                        {selectedBooking.proposedPrice?.total?.toFixed(2) ||
                          "0.00"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Artisan's Notes */}
              {selectedBooking.proposedPrice?.note && (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Artisan's Notes
                  </Text>
                  <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Text className="text-sm text-gray-700 leading-5">
                      {selectedBooking.proposedPrice.note}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="space-y-3 mb-6">
                {/* Accept Button */}
                <TouchableOpacity
                  onPress={handleAcceptPrice}
                  disabled={actionLoading}
                  className="bg-[#10B981] py-4 rounded-xl flex-row items-center justify-center mb-3"
                >
                  {actionLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="white" />
                      <Text className="text-white font-semibold text-base ml-2">
                        Accept Price & Confirm Booking
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Reject Button */}
                <TouchableOpacity
                  onPress={handleRejectPrice}
                  disabled={actionLoading}
                  className="border border-red-500 py-4 rounded-xl flex-row items-center justify-center mb-3"
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#EF4444" size="small" />
                  ) : (
                    <>
                      <Ionicons name="close" size={20} color="#EF4444" />
                      <Text className="text-red-500 font-semibold text-base ml-2">
                        Reject Price
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Chat/Bargain Button */}
                <TouchableOpacity
                  onPress={handleStartChat}
                  disabled={actionLoading}
                  className="border border-[#6F4E37] py-4 rounded-xl flex-row items-center justify-center"
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={20}
                    color="#6F4E37"
                  />
                  <Text className="text-[#6F4E37] font-semibold text-base ml-2">
                    Chat & Bargain
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Additional Info */}
              <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#F59E0B"
                  />
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-semibold text-amber-900 mb-1">
                      Important Information
                    </Text>
                    <Text className="text-xs text-amber-800">
                      • Price is valid for 24 hours{"\n"}• Payment is only
                      required after service completion{"\n"}• You can negotiate
                      the price via chat
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  </Modal>
);
export default PriceProposalModal;
