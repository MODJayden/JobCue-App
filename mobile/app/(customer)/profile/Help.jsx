import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { memo, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";

// Memoized FAQ Item
const FAQItem = memo(({ faq, isExpanded, onToggle }) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.7}
    className="bg-white rounded-2xl mb-3 border border-gray-100 overflow-hidden"
  >
    <View className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-bold text-gray-900 mb-1">
            {faq.question}
          </Text>
          {isExpanded && (
            <Text className="text-sm text-gray-600 leading-6 mt-2">
              {faq.answer}
            </Text>
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

// Memoized Contact Method Card
const ContactCard = memo(({ icon, title, subtitle, onPress, color = "#6F4E37" }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
  >
    <View className="flex-row items-center">
      <View
        className="w-14 h-14 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={28} color={color} />
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

// Memoized Quick Action Card
const QuickActionCard = memo(({ icon, title, subtitle, onPress, color = "#6F4E37" }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-1 bg-white rounded-2xl p-4 border border-gray-100"
  >
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
  </TouchableOpacity>
));

const HelpSupport = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  // FAQ Data
  const faqs = [
    {
      id: '1',
      question: 'How do I book an artisan on Zeal?',
      answer: 'Browse services, select an artisan, choose your date and time, and confirm your booking. The artisan will review and propose a price. Once you accept, the booking is confirmed.',
      category: 'booking',
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'Zeal accepts mobile money (MTN, Vodafone, AirtelTigo), bank cards (Visa, Mastercard), and cash payments upon service completion.',
      category: 'payment',
    },
    {
      id: '3',
      question: 'How do I cancel a booking?',
      answer: 'Go to your bookings, select the booking you want to cancel, and tap "Cancel Booking". Note that cancellation policies may apply depending on the timing.',
      category: 'booking',
    },
    {
      id: '4',
      question: 'Are all artisans verified?',
      answer: 'Yes! All artisans on Zeal undergo background checks and verification of their Ghana Card and professional credentials before approval.',
      category: 'safety',
    },
    {
      id: '5',
      question: 'What if I\'m not satisfied with the service?',
      answer: 'Contact our support team within 24 hours. We have a satisfaction guarantee policy and will work to resolve any issues or provide a refund if necessary.',
      category: 'support',
    },
    {
      id: '6',
      question: 'How do ratings work?',
      answer: 'After service completion, you can rate the artisan on quality, punctuality, pricing, and professionalism. Ratings help other customers make informed decisions.',
      category: 'general',
    },
    {
      id: '7',
      question: 'Can I save my favorite artisans?',
      answer: 'Yes! Tap the heart icon on any artisan\'s profile to add them to your favorites for quick access and future bookings.',
      category: 'features',
    },
    {
      id: '8',
      question: 'What are emergency bookings?',
      answer: 'Emergency bookings are for urgent services. Artisans marked as "Emergency Available" can respond quickly to your immediate needs, often on the same day.',
      category: 'booking',
    },
  ];

  const filteredFAQs = searchQuery.trim()
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const handleCall = useCallback(() => {
    Linking.openURL('tel:+233257479336');
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL('mailto:aphixsix@gmail.com');
  }, []);

  const handleWhatsApp = useCallback(() => {
    Linking.openURL('https://wa.me/233257479336');
  }, []);

  const handleLiveChat = useCallback(() => {
    Alert.alert(
      'Live Chat',
      'Our live chat feature is coming soon! For immediate assistance, please call or WhatsApp us.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleReportIssue = useCallback(() => {
    router.push('/report-issue');
  }, []);

  const handleFeedback = useCallback(() => {
    router.push('/feedback');
  }, []);

  const handleToggleFAQ = useCallback((id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  }, [expandedFAQ]);

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
                  Help & Support
                </Text>
                <Text className="text-sm text-white/80 mt-1">
                  We're here to help you
                </Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search FAQs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View className="px-5 -mt-4 mb-6">
          <View className="flex-row mb-3">
            <QuickActionCard
              icon="chatbubbles"
              title="Live Chat"
              subtitle="Chat with us now"
              onPress={handleLiveChat}
              color="#10B981"
            />
            <View className="w-3" />
            <QuickActionCard
              icon="call"
              title="Call Us"
              subtitle="Speak to support"
              onPress={handleCall}
              color="#3B82F6"
            />
          </View>

          <View className="flex-row">
            <QuickActionCard
              icon="alert-circle"
              title="Report Issue"
              subtitle="Flag a problem"
              onPress={handleReportIssue}
              color="#EF4444"
            />
            <View className="w-3" />
            <QuickActionCard
              icon="chatbox"
              title="Feedback"
              subtitle="Share your thoughts"
              onPress={handleFeedback}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Contact Methods */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Contact Us
          </Text>

          <ContactCard
            icon="call"
            title="Phone Support"
            subtitle="+233 257 479 336"
            onPress={handleCall}
            color="#3B82F6"
          />

          <ContactCard
            icon="mail"
            title="Email Support"
            subtitle="aphixsix@gmail.com"
            onPress={handleEmail}
            color="#6F4E37"
          />

          <ContactCard
            icon="logo-whatsapp"
            title="WhatsApp"
            subtitle="Chat on WhatsApp"
            onPress={handleWhatsApp}
            color="#25D366"
          />
        </View>

        {/* Operating Hours */}
        <View className="px-5 mb-6">
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="time" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-2">
                  Support Hours
                </Text>
                <View className="space-y-1">
                  <View className="flex-row items-center mb-1">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    <Text className="text-sm text-gray-700">
                      Monday - Friday: 8:00 AM - 8:00 PM
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    <Text className="text-sm text-gray-700">
                      Saturday: 9:00 AM - 6:00 PM
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                    <Text className="text-sm text-gray-700">
                      Sunday: 10:00 AM - 4:00 PM
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* FAQs Section */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </Text>

          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedFAQ === faq.id}
                onToggle={() => handleToggleFAQ(faq.id)}
              />
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                <Ionicons name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-base font-semibold text-gray-900 mb-1">
                No Results Found
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Try different keywords or contact us directly
              </Text>
            </View>
          )}
        </View>

        {/* Help Center Link */}
        {/* <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/help-center')}
            activeOpacity={0.7}
            className="bg-[#6F4E37] rounded-2xl p-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center mr-3">
                  <Ionicons name="book" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-white mb-1">
                    Visit Help Center
                  </Text>
                  <Text className="text-sm text-white/80">
                    Browse all articles and guides
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View> */}

        {/* Additional Info */}
        <View className="px-5 mb-8">
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-gray-900 mb-2">
                  Need Urgent Help?
                </Text>
                <Text className="text-xs text-gray-700 leading-5">
                  For urgent issues or emergencies, please call our hotline directly. 
                  We're committed to resolving your concerns as quickly as possible.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Version */}
        <View className="px-5 pb-8 items-center">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-lg bg-[#6F4E37] items-center justify-center mr-2">
              <Text className="text-white font-bold text-sm">Z</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">Zeal</Text>
          </View>
          <Text className="text-xs text-gray-400">Version 1.0.0</Text>
          <Text className="text-xs text-gray-400 mt-1">
            © 2025 Zeal. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupport;