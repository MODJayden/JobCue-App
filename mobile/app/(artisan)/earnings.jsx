import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  FlatList,
  Modal,
} from "react-native";
import { memo, useState, useCallback, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";

// Memoized Stat Card
const StatCard = memo(
  ({ icon, title, value, subtitle, color = "#6F4E37", trend }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-start justify-between mb-3">
        <View
          className={`w-12 h-12 rounded-xl items-center justify-center`}
          style={{ backgroundColor: `${color}15` }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View
            className={`px-2 py-1 rounded-full flex-row items-center ${
              trend.positive ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Ionicons
              name={trend.positive ? "trending-up" : "trending-down"}
              size={12}
              color={trend.positive ? "#10B981" : "#EF4444"}
            />
            <Text
              className={`text-xs font-bold ml-1 ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-sm text-gray-500 mb-1">{title}</Text>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
      {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
    </View>
  )
);

// Memoized Transaction Item
const TransactionItem = memo(
  ({ transaction }) => {
    const isPositive = transaction.type === "credit";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
      >
        <View className="flex-row items-start">
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              isPositive ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Ionicons
              name={isPositive ? "arrow-down" : "arrow-up"}
              size={20}
              color={isPositive ? "#10B981" : "#EF4444"}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className="text-base font-bold text-gray-900"
                numberOfLines={1}
              >
                {transaction.description}
              </Text>
              <Text
                className={`text-base font-bold ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : "-"}₵{transaction.amount.toFixed(2)}
              </Text>
            </View>

            <Text className="text-sm text-gray-500 mb-2">
              {transaction.customerName || "Platform Fee"}
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs text-gray-400 ml-1">
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <View
                className={`px-2 py-1 rounded-full ${
                  transaction.status === "completed"
                    ? "bg-green-100"
                    : transaction.status === "pending"
                    ? "bg-yellow-100"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    transaction.status === "completed"
                      ? "text-green-700"
                      : transaction.status === "pending"
                      ? "text-yellow-700"
                      : "text-gray-700"
                  }`}
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.transaction._id === nextProps.transaction._id;
  }
);

// Memoized Filter Tab
const FilterTab = memo(({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-2 ${
      isActive ? "bg-[#6F4E37]" : "bg-gray-100"
    }`}
  >
    <Text
      className={`text-sm font-semibold ${
        isActive ? "text-white" : "text-gray-700"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
));

const Earnings = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { artisan } = useSelector((state) => state.artisan || {});

  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Mock data - Replace with actual data from your store
  const mockData = {
    availableBalance: 4250.5,
    totalEarnings: 12840.75,
    pendingPayouts: 850.25,
    thisMonthEarnings: 3420.0,
    completedJobs: 48,
    platformFees: 428.4,
    lastPayout: {
      amount: 3800.0,
      date: "2025-11-05",
    },
    transactions: [
      {
        _id: "1",
        type: "credit",
        description: "Plumbing Service - Pipe Repair",
        customerName: "John Doe",
        amount: 450.0,
        date: "2025-11-08",
        status: "completed",
      },
      {
        _id: "2",
        type: "debit",
        description: "Platform Service Fee (10%)",
        amount: 45.0,
        date: "2025-11-08",
        status: "completed",
      },
      {
        _id: "3",
        type: "credit",
        description: "Electrical Installation",
        customerName: "Jane Smith",
        amount: 680.0,
        date: "2025-11-07",
        status: "completed",
      },
      {
        _id: "4",
        type: "debit",
        description: "Platform Service Fee (10%)",
        amount: 68.0,
        date: "2025-11-07",
        status: "completed",
      },
      {
        _id: "5",
        type: "credit",
        description: "Carpentry Work - Cabinet",
        customerName: "Mike Johnson",
        amount: 920.0,
        date: "2025-11-06",
        status: "pending",
      },
    ],
  };

  const periods = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
    { id: "all", label: "All Time" },
  ];

  const filters = [
    { id: "all", label: "All" },
    { id: "credit", label: "Earnings" },
    { id: "debit", label: "Fees" },
  ];

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === "all") return mockData.transactions;
    return mockData.transactions.filter((t) => t.type === selectedFilter);
  }, [selectedFilter, mockData.transactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch updated earnings data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleWithdraw = useCallback(() => {
    setShowWithdrawModal(true);
  }, []);

  const confirmWithdrawal = useCallback(() => {
    // TODO: Process withdrawal
    setShowWithdrawModal(false);
    console.log("Processing withdrawal...");
  }, []);

  const EmptyState = memo(() => (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-2">
        No Transactions Yet
      </Text>
      <Text className="text-sm text-gray-500 text-center">
        Complete jobs to start earning money
      </Text>
    </View>
  ));

  const renderTransaction = useCallback(
    ({ item }) => <TransactionItem transaction={item} />,
    []
  );

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 bg-white">
        <View>
          <Text className="text-2xl font-bold text-[#6F4E37]">Earnings</Text>
          <Text className="text-sm text-[#6F4E37]/80 mt-1">
            Track your income & payouts
          </Text>
        </View>
       
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6F4E37"]}
            tintColor="#6F4E37"
          />
        }
      >
        {/* Header with Gradient */}
        
          {/* Balance Card */}
          <View className="bg-white rounded-3xl p-6 m-4">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm text-gray-500 mb-1">
                  Available Balance
                </Text>
                <Text className="text-4xl font-bold text-gray-900">
                  ₵{mockData.availableBalance.toFixed(2)}
                </Text>
              </View>
              <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="wallet" size={32} color="#10B981" />
              </View>
            </View>

            {mockData.lastPayout && (
              <View className="bg-gray-50 rounded-xl p-3 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="arrow-up-circle"
                      size={16}
                      color="#6F4E37"
                    />
                    <Text className="text-xs text-gray-600 ml-2">
                      Last payout: ₵{mockData.lastPayout.amount.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400">
                    {new Date(mockData.lastPayout.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row">
              <TouchableOpacity
                onPress={handleWithdraw}
                className="flex-1 bg-[#6F4E37] py-3 rounded-xl mr-2"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="cash-outline" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Withdraw</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/payout-methods")}
                className="flex-1 bg-gray-100 py-3 rounded-xl ml-2"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="card-outline" size={20} color="#6F4E37" />
                  <Text className="text-[#6F4E37] font-bold ml-2">Methods</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        

        {/* Period Selector */}
        <View className="px-5 py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periods.map((period) => (
              <FilterTab
                key={period.id}
                label={period.label}
                isActive={selectedPeriod === period.id}
                onPress={() => setSelectedPeriod(period.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid */}
        <View className="px-5 mb-4">
          <View className="flex-row mb-3">
            <View className="flex-1 mr-1.5">
              <StatCard
                icon="trending-up"
                title="Total Earnings"
                value={`₵${mockData.totalEarnings.toFixed(2)}`}
                subtitle="All time"
                color="#10B981"
                trend={{ positive: true, value: "+12.5%" }}
              />
            </View>
            <View className="flex-1 ml-1.5">
              <StatCard
                icon="calendar"
                title="This Month"
                value={`₵${mockData.thisMonthEarnings.toFixed(2)}`}
                subtitle={`${mockData.completedJobs} jobs`}
                color="#3B82F6"
                trend={{ positive: true, value: "+8.3%" }}
              />
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 mr-1.5">
              <StatCard
                icon="hourglass-outline"
                title="Pending Payouts"
                value={`₵${mockData.pendingPayouts.toFixed(2)}`}
                subtitle="Processing"
                color="#F59E0B"
              />
            </View>
            <View className="flex-1 ml-1.5">
              <StatCard
                icon="remove-circle-outline"
                title="Platform Fees"
                value={`₵${mockData.platformFees.toFixed(2)}`}
                subtitle="This month"
                color="#EF4444"
              />
            </View>
          </View>
        </View>

        {/* Transactions Section */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push("/all-transactions")}>
              <Text className="text-sm font-semibold text-[#6F4E37]">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transaction Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {filters.map((filter) => (
              <FilterTab
                key={filter.id}
                label={filter.label}
                isActive={selectedFilter === filter.id}
                onPress={() => setSelectedFilter(filter.id)}
              />
            ))}
          </ScrollView>

          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            <View>
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}
        </View>

        {/* Earnings Insights */}
        <View className="px-5 mb-6">
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="bulb" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 mb-2">
                  Earnings Tip
                </Text>
                <Text className="text-xs text-gray-700 leading-5">
                  Complete more jobs and maintain high ratings to increase your
                  earnings. Artisans with 4.5+ ratings earn 30% more on average!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Withdraw Funds
              </Text>
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-2xl p-4 mb-4">
              <Text className="text-sm text-gray-500 mb-1">
                Available Balance
              </Text>
              <Text className="text-3xl font-bold text-gray-900">
                ₵{mockData.availableBalance.toFixed(2)}
              </Text>
            </View>

            <View className="bg-amber-50 rounded-xl p-3 mb-6 border border-amber-200">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <Text className="text-xs text-gray-700 ml-2 flex-1">
                  Withdrawals are processed within 1-3 business days. A small
                  processing fee may apply.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={confirmWithdrawal}
              className="bg-[#6F4E37] py-4 rounded-2xl mb-3"
            >
              <Text className="text-white font-bold text-center text-base">
                Continue to Withdrawal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowWithdrawModal(false)}
              className="py-3"
            >
              <Text className="text-gray-600 font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Earnings;
