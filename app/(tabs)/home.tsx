import Button from '@/components/Button'
import HomeCard from '@/components/HomeCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import TransactionList from '@/components/TransactionList'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import { useFocusEffect, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { AuthContext } from '../(auth)/authProvider'

interface User {
  email: string;
  username: string;
}

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



const Home = () => {
  const { setToken } = useContext(AuthContext);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const token = await SecureStore.getItemAsync("jwtToken");
      try {
        const res = await fetch(`http://192.168.0.181:9090/user/getUserByToken`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), 
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
         
          await SecureStore.setItemAsync("user", JSON.stringify(data));
        
        } else {
          console.error("❌ Failed to get user:", res.status);
        }
      } catch (err) {
        console.error("⚠️ Error Fething user :", err);
      }
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
          setTransactions(data); 
        } else {
          console.error("❌ Failed to fetch transactions : ", res.status);
        }
      } catch (err) {
        console.error("⚠️ Error fetching transactions:", err);
      } finally {
      }
    }

    fetchTransaction();
    getUser();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      setRefresh((prev) => !prev);
    }, [])
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}  >
        {/* header  */}
        <View style={styles.header} >
          <View style={{ gap: 4 }} >
            <Typo size={16} color={colors.neutral400}>Hello</Typo>
            <Typo size={20} fontWeight={"500"}   >
              {user?.username}
            </Typo>
          </View>
          <TouchableOpacity style={styles.searchicon} onPress={() => router.push("/(modals)/searchModal")} >
            <Icons.MagnifyingGlassIcon
              size={verticalScale(22)}
              color={colors.neutral200}
              weight='bold'
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* card  */}
          <View>
            <HomeCard data={transactions} />
          </View>

          {transactions != null ? (
            <TransactionList
              data={transactions}
              loading={false}
              title='Recent Transactions'
              emptyListMessage='No Transaction added yet!'
            />
          ) : "No Transaction"}

        </ScrollView>

        <Button
          style={styles.floatingButton}
          onPress={() => router.push("/(modals)/transactionModal")}
        >
          <Icons.PlusIcon
            color={colors.black}
            weight='bold'
            size={verticalScale(24)}
          />
        </Button>

      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8)
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10
  },
  searchicon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30)
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25
  }

})