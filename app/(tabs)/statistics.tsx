import Header from '@/components/Header'
import Loading from '@/components/Loading'
import ScreenWrapper from '@/components/ScreenWrapper'
import TransactionList from '@/components/TransactionList'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useFocusEffect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { BarChart } from "react-native-gifted-charts"


interface Transaction {
  id: string;
  amount: string;
  type: string;
  description: string;
  category: string;
  timestamp: string;
  reciptName: string;
  recipt: any;
}

const Statistics = () => {

  const [activeIndex, setActiveIndex] = useState(0);
  const [chartData, setChartData] = useState([
    {
      value: 40,
      label: "Mon",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary
    },
    {
      value: 20,
      frontColor: colors.rose,
    },
    {
      value: 50,
      label: "Tue",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    {
      value: 40,
      frontColor: colors.rose
    }

  ]);
  const [chartLoading, setChartLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [refresh, setRefresh] = useState(false);

  const stats = transactions?.flatMap((day) => [
    {
      value:day.amount,
      label: new Date(day.timestamp).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      labelWidth: scale(30),
      frontColor: colors.primary
    },
    {
      value: day.amount,
      frontColor: colors.rose,
    },
  ])


  // const updateChartData = () => {
  //   transactions?.forEach((doc) =>{
  //     const transactionDate = ( doc.timestamp as Timestamp );
  //   const dayData= transactions?.find((day) => day.timestamp == )
  //   } )
  // }


  useEffect(() => {
    if (activeIndex == 0) {
      getWeeklyStats();
      console.log(0)
    }
    if (activeIndex == 1) {
      getMontlyStats();
      console.log(1)
    }
    if (activeIndex == 2) {
      getYearlyStats();
      console.log(2)
    }

    const fetchTransaction = async () => {
      const token = await SecureStore.getItemAsync("jwtToken")
      try {
        const res = await fetch(`http://192.168.0.181:9090/transactions/getAllByUser`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data: Transaction[] = await res.json();
          setTransactions(data); // <-- store it in state
          // console.log("✅ transation data is:", transactions);

        } else {
          console.error("❌ Failed to fetch transactions : ", res.status);
        }
      } catch (err) {
        console.error("⚠️ Error fetching transactions:", err);
      } finally {
      }
    }

    fetchTransaction();

  }, [activeIndex, refresh]);

  useFocusEffect(
    useCallback(() => {
      setRefresh((prev) => !prev);
    }, [])
  );

  const getWeeklyStats = async () => {

    const token = await SecureStore.getItemAsync("jwtToken")
    try {
      const res = await fetch(`http://192.168.0.181:9090/transactions/getWeeklyTnx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data: Transaction[] = await res.json();
        setTransactions(data); // <-- store it in state
        console.log("✅ transation data is:", transactions?.length);
      } else {
        console.error("❌ Failed to fetch weekly transactions : ", res.status);
      }
    } catch (err) {
      console.error("⚠️ Error fetching weekly transactions:", err);
    } finally {
    }
  }

  const getMontlyStats = async () => {
    const token = await SecureStore.getItemAsync("jwtToken")
    try {
      const res = await fetch(`http://192.168.0.181:9090/transactions/getMonthlyTnx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data: Transaction[] = await res.json();
        setTransactions(data); // <-- store it in state
        console.log("✅ transation data is:", transactions?.length);
      } else {
        console.error("❌ Failed to fetch getMonthlyTnx transactions : ", res.status);
      }
    } catch (err) {
      console.error("⚠️ Error fetching getMonthlyTnx transactions:", err);
    } finally {
    }
  }

  const getYearlyStats = async () => {
    const token = await SecureStore.getItemAsync("jwtToken")
    try {
      const res = await fetch(`http://192.168.0.181:9090/transactions/getYearlyTnx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data: Transaction[] = await res.json();
        setTransactions(data); // <-- store it in state
        console.log("✅ transation data is:", transactions?.length);
      } else {
        console.error("❌ Failed to fetch getYearlyTnx transactions : ", res.status);
      }
    } catch (err) {
      console.error("⚠️ Error fetching getYearlyTnx transactions:", err);
    } finally {
    }
  }


  return (
    <ScreenWrapper>
      <View style={styles.container} >
        <View style={styles.header} >
          <Header title='Statistics' />
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={['Weekly', 'Monthly', 'Yearly']}
            selectedIndex={activeIndex}
            onChange={(event) => {
              setActiveIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance='dark'
            activeFontStyle={styles.segmentFontStyle}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
          />

          <View style={styles.chartContainer} >
            {
              stats != null ? (
                <BarChart
                  data={stats}
                  barWidth={scale(12)}
                  spacing={[1, 2].includes(activeIndex) ? scale(5) : scale(10)}
                  roundedTop
                  roundedBottom
                  hideRules
                  yAxisLabelPrefix='Rs '
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisLabelWidth={[1, 2].includes(activeIndex) ? scale(45) : scale(40)}
                  yAxisTextStyle={{ color: colors.neutral300 }}
                  xAxisLabelTextStyle={{
                    color: colors.neutral300,
                    fontSize: verticalScale(12)
                  }}
                  noOfSections={5}
                  minHeight={5}
                  isAnimated={true}
                  animationDuration={1000}
                />
              ) : (
                <View style={styles.noChart} />
              )
            }

            {
              chartLoading && (
                <View style={styles.chartLoadingContainer} >
                  <Loading color={colors.white} />
                </View>
              )
            }
          </View>

          {/* transaction  */}
          <View>
            {transactions != null ? (
              <TransactionList
                data={transactions}
                loading={false}
                title='Recent Transactions'
                emptyListMessage='No Transaction added yet!'
              />
            ) : "No Transaction"}
          </View>

        </ScrollView>

      </View >
    </ScreenWrapper >
  )
}

export default Statistics

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center"
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0,0.6)"
  },
  header: {

  },
  noChart: {
    backgroundColor: "rgba(0,0,0,0.6)",
    height: verticalScale(210)
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous"
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black
  },
  segmentStyle: {
    height: scale(37)
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10
  }
})