import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { memo, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Memoized Section Item
const TermsSection = memo(({ section, isExpanded, onToggle }) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.7}
    className="bg-white rounded-2xl mb-3 border border-gray-100 overflow-hidden"
  >
    <View className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-lg bg-[#6F4E37]/10 items-center justify-center mr-3">
              <Ionicons name={section.icon} size={18} color="#6F4E37" />
            </View>
            <Text className="text-base font-bold text-gray-900 flex-1">
              {section.title}
            </Text>
          </View>
          {isExpanded && (
            <View className="mt-2 pl-11">
              <Text className="text-sm text-gray-600 leading-6 mb-3">
                {section.content}
              </Text>
              {section.points && section.points.length > 0 && (
                <View className="mt-2">
                  {section.points.map((point, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-[#6F4E37] mt-2 mr-3" />
                      <Text className="flex-1 text-sm text-gray-700 leading-6">
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            isExpanded ? 'bg-[#6F4E37]' : 'bg-gray-100'
          }`}
        >
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={isExpanded ? "white" : "#6B7280"}
          />
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

// Memoized Quick Info Card
const QuickInfoCard = memo(({ icon, title, subtitle, color = "#6F4E37" }) => (
  <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
    <View
      className="w-12 h-12 rounded-xl items-center justify-center mb-3"
      style={{ backgroundColor: `${color}15` }}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={1}>
      {title}
    </Text>
    <Text className="text-xs text-gray-500" numberOfLines={2}>
      {subtitle}
    </Text>
  </View>
));

const TermsConditions = () => {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState(null);

  // Terms & Conditions Data
  const termsData = [
    {
      id: '1',
      icon: 'document-text',
      title: 'Acceptance of Terms',
      content: 'By accessing or using the Zeal platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.',
      points: [
        'You must be at least 18 years old to use Zeal',
        'You are responsible for maintaining the confidentiality of your account',
        'You agree to provide accurate and complete information',
      ],
    },
    {
      id: '2',
      icon: 'person',
      title: 'User Accounts',
      content: 'When you create an account with Zeal, you must provide accurate, complete, and current information at all times.',
      points: [
        'Each user may maintain only one active account',
        'You are responsible for safeguarding your password',
        'You must notify us immediately of any unauthorized access',
        'We reserve the right to suspend or terminate accounts that violate our terms',
      ],
    },
    {
      id: '3',
      icon: 'shield-checkmark',
      title: 'Artisan Verification',
      content: 'All artisans on the Zeal platform undergo a verification process to ensure quality and safety for our customers.',
      points: [
        'Background checks and Ghana Card verification are required',
        'Professional credentials must be validated',
        'Regular quality assessments may be conducted',
        'False information may result in immediate account termination',
      ],
    },
    {
      id: '4',
      icon: 'calendar',
      title: 'Booking & Services',
      content: 'Bookings are subject to artisan availability and acceptance. The platform facilitates connections but does not guarantee service provision.',
      points: [
        'Service prices are proposed by artisans and must be accepted by customers',
        'Cancellation policies vary by service and timing',
        'Emergency bookings may incur additional charges',
        'All services must be completed within agreed timeframes',
      ],
    },
    {
      id: '5',
      icon: 'card',
      title: 'Payment Terms',
      content: 'Zeal processes payments securely on behalf of artisans. All transactions are subject to our payment policies.',
      points: [
        'Payment is due upon service completion unless otherwise agreed',
        'Accepted methods include mobile money, bank cards, and cash',
        'Service fees and taxes are clearly displayed before confirmation',
        'Refunds are processed according to our refund policy',
      ],
    },
    {
      id: '6',
      icon: 'people',
      title: 'User Conduct',
      content: 'Users must conduct themselves professionally and respectfully when using the Zeal platform.',
      points: [
        'Harassment, discrimination, or abusive behavior is strictly prohibited',
        'Fraudulent activities will result in account termination and legal action',
        'Users must comply with all applicable laws and regulations',
        'Ratings and reviews must be honest and based on actual experiences',
      ],
    },
    {
      id: '7',
      icon: 'lock-closed',
      title: 'Privacy & Data Protection',
      content: 'We take your privacy seriously. Your personal information is protected according to our Privacy Policy.',
      points: [
        'We collect and use data as described in our Privacy Policy',
        'Your information is never sold to third parties',
        'You can request access to or deletion of your data',
        'We implement industry-standard security measures',
      ],
    },
    {
      id: '8',
      icon: 'warning',
      title: 'Limitation of Liability',
      content: 'Zeal acts as a platform connecting customers with artisans. We are not liable for the quality or outcomes of services provided.',
      points: [
        'Artisans are independent contractors, not employees of Zeal',
        'We are not responsible for disputes between users and artisans',
        'Our liability is limited to the amount paid for the service',
        'We do not guarantee uninterrupted or error-free service',
      ],
    },
    {
      id: '9',
      icon: 'close-circle',
      title: 'Account Termination',
      content: 'Either party may terminate the user agreement at any time. Zeal reserves the right to suspend or terminate accounts.',
      points: [
        'Accounts may be suspended for violations of these terms',
        'You may delete your account at any time through app settings',
        'Termination does not affect obligations from completed transactions',
        'We may retain certain information as required by law',
      ],
    },
    {
      id: '10',
      icon: 'git-compare',
      title: 'Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.',
      points: [
        'Users will be notified of significant changes via email or app notification',
        'Updated terms become effective immediately upon posting',
        'It is your responsibility to review terms periodically',
      ],
    },
  ];

  const handleToggleSection = useCallback((id) => {
    setExpandedSection(expandedSection === id ? null : id);
  }, [expandedSection]);

  const handleContactSupport = useCallback(() => {
    router.push('/help-support');
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
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center mr-2"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View>
                <Text className="text-2xl font-bold text-white">
                  Terms & Conditions
                </Text>
                <Text className="text-sm text-white/80 mt-1">
                  Last updated: November 2024
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Info Cards */}
        <View className="px-5 -mt-4 mb-6">
          <View className="flex-row mb-3">
            <QuickInfoCard
              icon="shield-checkmark"
              title="Your Safety"
              subtitle="All artisans verified"
              color="#10B981"
            />
            <View className="w-3" />
            <QuickInfoCard
              icon="lock-closed"
              title="Secure"
              subtitle="Data protected"
              color="#3B82F6"
            />
          </View>

          <View className="flex-row">
            <QuickInfoCard
              icon="checkmark-circle"
              title="Fair Terms"
              subtitle="Clear guidelines"
              color="#6F4E37"
            />
            <View className="w-3" />
            <QuickInfoCard
              icon="people"
              title="Support"
              subtitle="Always available"
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Introduction */}
        <View className="px-5 mb-6">
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-2">
                  Welcome to Zeal
                </Text>
                <Text className="text-sm text-gray-700 leading-6">
                  These terms govern your use of the Zeal platform. Please read them carefully 
                  before using our services. By using Zeal, you agree to these terms in full.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Terms Sections */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Terms & Conditions
          </Text>

          {termsData.map((section) => (
            <TermsSection
              key={section.id}
              section={section}
              isExpanded={expandedSection === section.id}
              onToggle={() => handleToggleSection(section.id)}
            />
          ))}
        </View>

        {/* Contact Section */}
        <View className="px-5 mb-6">
          <View className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <View className="flex-row items-start">
              <Ionicons name="help-circle" size={20} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-gray-900 mb-2">
                  Questions About Our Terms?
                </Text>
                <Text className="text-xs text-gray-700 leading-5 mb-3">
                  If you have any questions or concerns about these terms, our support team 
                  is here to help clarify anything you need.
                </Text>
               {/*  <TouchableOpacity
                  onPress={handleContactSupport}
                  activeOpacity={0.7}
                  className="bg-[#6F4E37] rounded-xl py-2.5 px-4 self-start"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="chatbubbles" size={16} color="white" />
                    <Text className="text-white font-semibold text-sm ml-2">
                      Contact Support
                    </Text>
                  </View>
                </TouchableOpacity> */}
              </View>
            </View>
          </View>
        </View>

        {/* Related Documents */}
       {/*  <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Related Documents
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/privacy-policy')}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="eye" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">
                  Privacy Policy
                </Text>
                <Text className="text-sm text-gray-500">
                  How we handle your data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/community-guidelines')}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center mr-3">
                <Ionicons name="people" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">
                  Community Guidelines
                </Text>
                <Text className="text-sm text-gray-500">
                  Standards for respectful use
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View> */}

        {/* Footer */}
        <View className="px-5 pb-8">
          <View className="bg-gray-100 rounded-2xl p-4">
            <View className="flex-row items-center justify-center mb-2">
              <View className="w-8 h-8 rounded-lg bg-[#6F4E37] items-center justify-center mr-2">
                <Text className="text-white font-bold text-sm">Z</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">Zeal</Text>
            </View>
            <Text className="text-xs text-gray-500 text-center">
              © 2025 Zeal. All rights reserved.
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-1">
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsConditions;