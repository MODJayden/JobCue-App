import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  Image,
  
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ArtisanProblemImagePreviewModal = ({
  showImageModal,
  setShowImageModal,
  selectedImage,
}) => {
  return (
    <Modal
      visible={showImageModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowImageModal(false)}
    >
      <View className="flex-1 bg-black/90 justify-center items-center">
        <TouchableOpacity
          className="absolute top-12 right-5 z-10"
          onPress={() => setShowImageModal(false)}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            className="w-full h-2/3"
            resizeMode="contain"
          />
        )}

        <TouchableOpacity
          className="absolute bottom-10 bg-white/20 px-6 py-3 rounded-full"
          onPress={() => setShowImageModal(false)}
        >
          <Text className="text-white font-semibold">Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
export default ArtisanProblemImagePreviewModal;
