import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
} from "react-native";
import { memo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Memoized Feature Card
const FeatureCard = memo(({ icon, title, description, color = "#6F4E37" }) => (
  <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
    <View className="flex-row items-start">
      <View
        className="w-14 h-14 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900 mb-2">
          {title}
        </Text>
        <Text className="text-sm text-gray-600 leading-6">
          {description}
        </Text>
      </View>
    </View>
  </View>
));

// Memoized Value Card
const ValueCard = memo(({ icon, title, description, color = "#6F4E37" }) => (
  <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
    <View
      className="w-12 h-12 rounded-xl items-center justify-center mb-3"
      style={{ backgroundColor: `${color}15` }}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text className="text-sm font-bold text-gray-900 mb-2">
      {title}
    </Text>
    <Text className="text-xs text-gray-600 leading-5">
      {description}
    </Text>
  </View>
));

// Memoized Stat Card
const StatCard = memo(({ number, label, icon, color = "#6F4E37" }) => (
  <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center">
    <View
      className="w-12 h-12 rounded-xl items-center justify-center mb-2"
      style={{ backgroundColor: `${color}15` }}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text className="text-2xl font-bold text-gray-900 mb-1">
      {number}
    </Text>
    <Text className="text-xs text-gray-500 text-center">
      {label}
    </Text>
  </View>
));

// Memoized Social Link
const SocialLink = memo(({ icon, platform, onPress, color = "#6F4E37" }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center"
  >
    <View
      className="w-14 h-14 rounded-xl items-center justify-center mb-2"
      style={{ backgroundColor: `${color}15` }}
    >
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text className="text-sm font-semibold text-gray-900">
      {platform}
    </Text>
  </TouchableOpacity>
));

// Memoized Link Card
const LinkCard = memo(({ icon, title, subtitle, onPress, color = "#6F4E37" }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
  >
    <View className="flex-row items-center">
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900 mb-1">
          {title}
        </Text>
        <Text className="text-sm text-gray-500">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
  </TouchableOpacity>
));

const AboutScreen = () => {
  const router = useRouter();

  const handleWebsite = useCallback(() => {
    Linking.openURL('https://www.devdoor-tech.onrender.com');
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL('mailto:info@zealapp.com');
  }, []);

  const handleFacebook = useCallback(() => {
    Linking.openURL('https://facebook.com/zealapp');
  }, []);

  const handleTwitter = useCallback(() => {
    Linking.openURL('https://twitter.com/zealapp');
  }, []);

  const handleInstagram = useCallback(() => {
    Linking.openURL('https://instagram.com/zealapp');
  }, []);

  const handleLinkedIn = useCallback(() => {
    Linking.openURL('https://linkedin.com/company/zealapp');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#6F4E37", "#8B6240"]}
          className="pb-8 pt-4 px-5"
        >
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* App Logo & Name */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-3xl bg-white items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl font-bold text-[#6F4E37]">Z</Text>
            </View>
            <Text className="text-3xl font-bold text-white mb-2">
              Zeal
            </Text>
            <Text className="text-base text-white/90 text-center">
              Connecting Skills with Needs
            </Text>
            <View className="bg-white/20 rounded-full px-4 py-1.5 mt-3">
              <Text className="text-white text-sm font-semibold">
                Version 1.0.0
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Mission Statement */}
        <View className="px-5 -mt-4 mb-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="bulb" size={24} color="#3B82F6" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Our Mission
              </Text>
            </View>
            <Text className="text-sm text-gray-700 leading-6">
              Zeal is transforming how Ghanaians access skilled artisan services. 
              We're building a trusted marketplace that connects customers with verified, 
              professional artisans across all trades, making quality services accessible, 
              affordable, and reliable for everyone.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Our Impact
          </Text>
          <View className="flex-row mb-3">
            <StatCard
              number="5K+"
              label="Active Artisans"
              icon="people"
              color="#6F4E37"
            />
            <View className="w-3" />
            <StatCard
              number="50K+"
              label="Happy Customers"
              icon="happy"
              color="#10B981"
            />
          </View>
          <View className="flex-row">
            <StatCard
              number="100K+"
              label="Jobs Completed"
              icon="checkmark-circle"
              color="#3B82F6"
            />
            <View className="w-3" />
            <StatCard
              number="4.8★"
              label="Average Rating"
              icon="star"
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Core Values */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Our Core Values
          </Text>
          <View className="flex-row mb-3">
            <ValueCard
              icon="shield-checkmark"
              title="Trust"
              description="Every artisan is verified and vetted"
              color="#10B981"
            />
            <View className="w-3" />
            <ValueCard
              icon="heart"
              title="Quality"
              description="Excellence in every service delivered"
              color="#EF4444"
            />
          </View>
          <View className="flex-row">
            <ValueCard
              icon="flash"
              title="Speed"
              description="Quick responses and efficient service"
              color="#3B82F6"
            />
            <View className="w-3" />
            <ValueCard
              icon="people"
              title="Community"
              description="Building stronger local economies"
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Key Features */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            What We Offer
          </Text>

          <FeatureCard
            icon="search"
            title="Easy Discovery"
            description="Browse hundreds of skilled artisans by service, location, ratings, and availability. Find the perfect match for your needs in seconds."
            color="#6F4E37"
          />

          <FeatureCard
            icon="shield-checkmark"
            title="Verified Professionals"
            description="All artisans undergo thorough background checks, Ghana Card verification, and skills assessment before joining our platform."
            color="#10B981"
          />

          <FeatureCard
            icon="calendar"
            title="Flexible Booking"
            description="Schedule services at your convenience with instant booking confirmations and real-time updates on artisan availability."
            color="#3B82F6"
          />

          <FeatureCard
            icon="card"
            title="Secure Payments"
            description="Multiple payment options including mobile money, bank cards, and cash. All transactions are protected and transparent."
            color="#8B5CF6"
          />

          <FeatureCard
            icon="chatbubbles"
            title="Direct Communication"
            description="Chat directly with artisans to discuss details, share requirements, and get instant responses to your questions."
            color="#F59E0B"
          />

          <FeatureCard
            icon="star"
            title="Quality Assurance"
            description="Read genuine reviews from verified customers and rate your experience to help others make informed decisions."
            color="#EF4444"
          />
        </View>

        {/* Story Section */}
        <View className="px-5 mb-6">
          <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-blue-500 items-center justify-center mr-3">
                <Ionicons name="book" size={24} color="white" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Our Story
              </Text>
            </View>
            <Text className="text-sm text-gray-700 leading-6 mb-3">
              Founded in 2024, Zeal was born from a simple observation: finding reliable 
              artisans in Ghana was unnecessarily difficult, and skilled professionals 
              struggled to find consistent work.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              We built Zeal to solve both problems by creating a trusted platform that 
              empowers artisans to grow their businesses while giving customers peace of 
              mind when hiring skilled professionals.
            </Text>
          </View>
        </View>

        {/* Connect With Us */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Connect With Us
          </Text>
          
          <View className="flex-row mb-3">
            <SocialLink
              icon="logo-facebook"
              platform="Facebook"
              onPress={handleFacebook}
              color="#1877F2"
            />
            <View className="w-3" />
            <SocialLink
              icon="logo-twitter"
              platform="Twitter"
              onPress={handleTwitter}
              color="#1DA1F2"
            />
          </View>

          <View className="flex-row">
            <SocialLink
              icon="logo-instagram"
              platform="Instagram"
              onPress={handleInstagram}
              color="#E4405F"
            />
            <View className="w-3" />
            <SocialLink
              icon="logo-linkedin"
              platform="LinkedIn"
              onPress={handleLinkedIn}
              color="#0A66C2"
            />
          </View>
        </View>

        {/* Quick Links */}
        {/* <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            More Information
          </Text>

          <LinkCard
            icon="globe"
            title="Visit Our Website"
            subtitle="www.devdoor-tech.onrender.com"
            onPress={handleWebsite}
            color="#6F4E37"
          />

          <LinkCard
            icon="mail"
            title="Contact Us"
            subtitle="info@zealapp.com"
            onPress={handleEmail}
            color="#3B82F6"
          />

          <LinkCard
            icon="document-text"
            title="Terms & Conditions"
            subtitle="Read our terms of service"
            onPress={() => router.push('/terms-conditions')}
            color="#8B5CF6"
          />

          <LinkCard
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={() => router.push('/privacy-policy')}
            color="#10B981"
          />

          <LinkCard
            icon="help-circle"
            title="Help & Support"
            subtitle="Get assistance anytime"
            onPress={() => router.push('/help-support')}
            color="#F59E0B"
          />
        </View> */}

        {/* Recognition */}
        <View className="px-5 mb-6">
          <View className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-amber-500 items-center justify-center mr-3">
                <Ionicons name="trophy" size={24} color="white" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Recognition
              </Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-amber-500 mr-3" />
                <Text className="flex-1 text-sm text-gray-700">
                  Featured in Ghana Tech Awards 2024
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-amber-500 mr-3" />
                <Text className="flex-1 text-sm text-gray-700">
                  Best Startup Platform - Ghana Innovation Hub
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-amber-500 mr-3" />
                <Text className="flex-1 text-sm text-gray-700">
                  Top 10 Mobile Apps in Ghana 2024
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Team */}
        <View className="px-5 mb-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center mr-3">
                <Ionicons name="people" size={24} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Our Team
              </Text>
            </View>
            <Text className="text-sm text-gray-700 leading-6">
              We're a passionate team of technologists, designers, and business strategists 
              committed to empowering Ghana's artisan community. Together, we're building 
              the future of skilled services in Africa.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="px-5 pb-8">
          <View className="bg-gray-100 rounded-2xl p-5 items-center">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-lg bg-[#6F4E37] items-center justify-center mr-2">
                <Text className="text-white font-bold text-lg">Z</Text>
              </View>
              <Text className="text-xl font-bold text-gray-900">Zeal</Text>
            </View>
            <Text className="text-xs text-gray-500 text-center mb-1">
              Empowering Artisans, Serving Communities
            </Text>
            <Text className="text-xs text-gray-400 text-center">
              © 2025 Zeal. All rights reserved.
            </Text>
            <Text className="text-xs text-gray-400 text-center mt-2">
              Made with ❤️ in Ghana
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;