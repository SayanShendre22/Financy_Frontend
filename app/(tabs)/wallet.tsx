import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import WalletListItem from '@/components/WalletListItem'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import { useFocusEffect, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads'
import walletImg from "../../assets/bank_logos/wallet.png"

const adUnitId1 = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-7043202384843840/5030999588';


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

  const bannerRef = useRef<BannerAd>(null);
  useForeground(() => {
    Platform.OS === 'android' && bannerRef.current?.load();
  });

  const router = useRouter();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [hasFWallet, setHasFWallet] = useState(false);


  useEffect(() => {

    const fetchUserWallets = async () => {

      const token = await SecureStore.getItemAsync("jwtToken")

      try {
        const res = await fetch(BASE_URL+`/bank/getAccount`, {
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
    fetchUserFWallets();
    fetchUserWallets();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      setRefresh((prev) => !prev);
    }, [])
  );

  const fetchUserFWallets = async () => {

    const token = await SecureStore.getItemAsync("jwtToken")
    console.log("Fetching Financy Wallet with token:", token);
    try {
      const res = await fetch(BASE_URL+`/fwallet`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHasFWallet(data != null);
        console.log("✅ Fwallet data is:", wallets);


      } else {
        console.error("❌ Failed to fetch Fwallet : ", res.status);
      }
    } catch (err) {
      console.error("⚠️ Error fetching Fwallet:", err);
    } finally {
      // setLoading(false);
    }
  }

  const getTotalBalance = () => {
    let amount = 0;
    wallets.map((item) => {
      amount = amount + item.balance;
    })
    return amount;
  }

  const openFinancyWallet = () => {
    console.log("Wallet available ? "+ hasFWallet)
    hasFWallet ? (
      router.push({
        pathname: '/(modals)/financyWallet',
      })
    ) : (
      router.push({
        pathname: '/(helper)/activateFwallet',
      })
    );

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

          <TouchableOpacity style={styles.Walletcontainer}
            onPress={openFinancyWallet}
          >
            <View style={styles.imageContainer} >
              <Image
                style={{ flex: 1 }}
                source={walletImg}
                contentFit='cover'
                transition={100}
              />
            </View>
            <View style={styles.namecontainer} >
              <Typo size={16} >Financy Wallet</Typo>
              <Typo size={14} color={colors.neutral400} >Check Balance</Typo>
            </View>

            <Icons.CaretRightIcon
              size={verticalScale(20)}
              weight='bold'
              color={colors.white}
            />

          </TouchableOpacity>

          <FlatList
            data={wallets}
            renderItem={({ item, index }) => {
              return <WalletListItem item={item} index={index} router={router} />
            }}
            contentContainerStyle={styles.listStyle}
          />

        </View>

        <View>
          <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
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
    paddingTop: verticalScale(35),
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
  },
  imageContainer: {
    height: verticalScale(45),
    width: verticalScale(45),
    borderWidth: 1,
    borderColor: colors.neutral600,
    borderRadius: radius._12,
    borderCurve: "continuous",
    overflow: "hidden"
  },
  namecontainer: {
    flex: 1,
    gap: 2,
    marginLeft: spacingX._10,
  },
  Walletcontainer: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: verticalScale(17)
  }
})

function setRefresh(arg0: (prev: any) => boolean) {
  throw new Error('Function not implemented.')
}
