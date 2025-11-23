import React, { useState, useRef } from "react";
import { View, Text, Modal, TouchableOpacity, Animated } from "react-native";
import { Audio } from "expo-av";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const RecordingModal = ({ visible, onClose, onSendRecording }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for recording indicator
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Permission to access microphone is required!");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      startPulseAnimation();

      // Update duration
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) {
          clearInterval(interval);
        }
      });
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      stopPulseAnimation();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const handleSend = async () => {
    if (!recordingUri) return;

    setIsThinking(true);

    try {
      // Prepare the audio file for upload
      const formData = new FormData();
      formData.append("audio", {
        uri: recordingUri,
        type: "audio/m4a",
        name: "recording.m4a",
      });

      // Call your callback with the prepared data
      await onSendRecording(formData);

      // Reset state
      setRecordingUri(null);
      setDuration(0);
      setIsThinking(false);
    } catch (err) {
      console.error("Failed to send recording", err);
      setIsThinking(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    if (recording) {
      stopRecording();
    }
    setRecordingUri(null);
    setDuration(0);
    setIsThinking(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold" style={{ color: "#6F4E37" }}>
              Voice Request
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6F4E37" />
            </TouchableOpacity>
          </View>

          {/* Chat-like content area */}
          <View className="flex-1 p-4">
            {/* Initial message */}
            <View className="bg-gray-100 rounded-2xl rounded-tl-none p-4 mb-4 self-start max-w-[80%]">
              <Text className="text-gray-800">
                Hi! Tell me what service you need and I'll recommend the perfect
                artisan for you.
              </Text>
            </View>

            {/* Recording status */}
            {isRecording && (
              <View className="items-center justify-center flex-1">
                <Animated.View
                  style={{
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  <View
                    className="w-24 h-24 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#6F4E37" }}
                  >
                    <Ionicons name="mic" size={40} color="white" />
                  </View>
                </Animated.View>
                <Text
                  className="text-lg font-semibold mt-4"
                  style={{ color: "#6F4E37" }}
                >
                  Recording...
                </Text>
                <Text
                  className="text-2xl font-bold mt-2"
                  style={{ color: "#6F4E37" }}
                >
                  {formatDuration(duration)}
                </Text>
              </View>
            )}

            {/* Recording ready to send */}
            {recordingUri && !isRecording && !isThinking && (
              <View
                className="rounded-2xl rounded-tr-none p-4 self-end max-w-[80%]"
                style={{ backgroundColor: "#6F4E37" }}
              >
                <Text className="text-white font-medium mb-1">
                  Voice recording
                </Text>
                <Text className="text-white/80 text-sm">
                  {formatDuration(duration)}
                </Text>
              </View>
            )}

            {/* Thinking indicator */}
            {isThinking && (
              <View className="bg-gray-100 rounded-2xl rounded-tl-none p-4 self-start max-w-[80%]">
                <View className="flex-row items-center">
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <View className="w-2 h-2 bg-gray-400 rounded-full" />
                    <View className="w-2 h-2 bg-gray-400 rounded-full" />
                    <View className="w-2 h-2 bg-gray-400 rounded-full" />
                  </View>
                  <Text className="text-gray-600 ml-3">
                    Finding the perfect artisan...
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom action area */}
          <View className="p-4 border-t border-gray-200">
            <View className="flex-row items-center justify-center space-x-4">
              {!isRecording && !recordingUri && (
                <TouchableOpacity
                  onPress={startRecording}
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#6F4E37" }}
                >
                  <Ionicons name="mic" size={28} color="white" />
                </TouchableOpacity>
              )}

              {isRecording && (
                <TouchableOpacity
                  onPress={stopRecording}
                  className="w-16 h-16 rounded-full items-center justify-center bg-red-500"
                >
                  <View className="w-6 h-6 bg-white rounded" />
                </TouchableOpacity>
              )}

              {recordingUri && !isRecording && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setRecordingUri(null);
                      setDuration(0);
                    }}
                    className="w-14 h-14 rounded-full items-center justify-center bg-gray-200"
                  >
                    <Ionicons name="close" size={24} color="#6F4E37" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSend}
                    className="w-16 h-16 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#6F4E37" }}
                  >
                    <Ionicons name="send" size={28} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RecordingModal;
