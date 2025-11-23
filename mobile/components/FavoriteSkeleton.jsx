import { View, Text } from "react-native";
import { memo } from "react";

const FavoriteSkeleton = memo(() => {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        marginBottom: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      {/* Top Row */}
      <View style={{ flexDirection: "row" }}>
        {/* Avatar Skeleton */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#E5E7EB",
            marginRight: 12,
          }}
        />

        {/* Name + Subtitle */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: "60%",
              height: 16,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              width: "40%",
              height: 12,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
            }}
          />
        </View>

        {/* Heart Skeleton */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#F3F4F6",
          }}
        />
      </View>

      {/* Rating + Experience */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 80,
            height: 18,
            borderRadius: 6,
            backgroundColor: "#E5E7EB",
            marginRight: 10,
          }}
        />
        <View
          style={{
            width: 60,
            height: 18,
            borderRadius: 6,
            backgroundColor: "#E5E7EB",
          }}
        />
      </View>

      {/* Badges */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
        }}
      >
        <View
          style={{
            width: 70,
            height: 22,
            borderRadius: 12,
            backgroundColor: "#F3F4F6",
            marginRight: 8,
          }}
        />
        <View
          style={{
            width: 70,
            height: 22,
            borderRadius: 12,
            backgroundColor: "#F3F4F6",
            marginRight: 8,
          }}
        />
        <View
          style={{
            width: 70,
            height: 22,
            borderRadius: 12,
            backgroundColor: "#F3F4F6",
          }}
        />
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#F3F4F6",
          marginVertical: 14,
        }}
      />

      {/* Availability + Areas */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: 100,
            height: 16,
            backgroundColor: "#E5E7EB",
            borderRadius: 6,
          }}
        />
        <View
          style={{
            width: 80,
            height: 16,
            backgroundColor: "#E5E7EB",
            borderRadius: 6,
          }}
        />
      </View>

      {/* Bottom Buttons */}
      <View
        style={{
          marginTop: 16,
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: "#F3F4F6",
          paddingTop: 14,
        }}
      >
        <View
          style={{
            height: 36,
            flex: 1,
            backgroundColor: "#E5E7EB",
            borderRadius: 10,
          }}
        />
      </View>
    </View>
  );
});
export default FavoriteSkeleton;
