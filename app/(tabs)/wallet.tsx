import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import WalletListItem from '@/components/WalletListItem'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import { useFocusEffect, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'


interface Wallet {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  bankName: string;
  ifscCode: string;
  fetchedAt: string | null;
}

const Wallet = () => {

  const router = useRouter();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [refresh, setRefresh] = useState(false);


  useEffect(() => {

    const fetchUserWallets = async () => {

      const token = await SecureStore.getItemAsync("jwtToken")

      try {
        const res = await fetch(`http://192.168.0.181:9090/bank/getAccount`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data: Wallet[] = await res.json();
          setWallets(data); // <-- store it in state
          console.log("✅ wallet data is:", wallets);

        } else {
          console.error("❌ Failed to fetch Profile : ", res.status);
        }
      } catch (err) {
        console.error("⚠️ Error fetching user:", err);
      } finally {
        // setLoading(false);
      }
    }

    fetchUserWallets();

  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      setRefresh((prev) => !prev);
    }, [])
  );

  const getTotalBalance = () => {
    let amount = 0;
    wallets.map((item) => {
      amount = amount + item.balance;
    })
    return amount;
  }

  return (
    <ScreenWrapper style={{ backgroundColor: colors.black }} >
      <View style={styles.container} >
        {/* balance view  */}
        <View style={styles.balanceView} >
          <View style={{ alignItems: "center" }} >
            <Typo size={45} fontWeight={"500"}  >
              <Icons.CurrencyInrIcon
                style={{ marginTop: verticalScale(100) }}
                size={45}
                color={colors.white}
              // weight='fill'
              />
              {getTotalBalance()?.toFixed(2)}
            </Typo>
            <Typo size={16} color={colors.neutral300} >
              Total Balance
            </Typo>
          </View>
        </View>

        {/* wallets  */}
        <View style={styles.wallets} >
          {/* header  */}
          <View style={styles.flexRow} >
            <Typo>
              My Wallets
            </Typo>
            <TouchableOpacity onPress={() => router.push("/(modals)/walletModal")} >
              <Icons.PlusCircleIcon
                weight='fill'
                color={colors.primary}
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={wallets}
            renderItem={({ item, index }) => {
              return <WalletListItem item={item} index={index} router={router} />
            }}
            contentContainerStyle={styles.listStyle}
          />

        </View>

      </View>
    </ScreenWrapper>
  )
}

export default Wallet

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between"
  },
  balanceView: {
    paddingTop:verticalScale(35),
    height: verticalScale(160),
    backgroundColor: colors.black,
    justifyContent: "space-between",
    alignItems: "center"
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15
  }
})

function setRefresh(arg0: (prev: any) => boolean) {
  throw new Error('Function not implemented.')
}
