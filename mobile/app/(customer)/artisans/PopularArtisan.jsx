import React from "react";
import FeaturedArtisans from "../../../components/FeaturedArtisans";
import { View, Text } from "react-native";
const PopularArtisan = () => {
  return (
    <View className="bg-gray-50  p-4 ">
      <FeaturedArtisans count={5} />
    </View>
  );
};
export default PopularArtisan;
