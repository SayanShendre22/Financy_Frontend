import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { useFocusEffect, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, RewardedAd, RewardedAdEventType, TestIds, useForeground } from 'react-native-google-mobile-ads'

const adUnitId1 = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-7043202384843840/5030999588';
const adUnitId2 = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7043202384843840/7657162922';
const adUnitId3 = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-7043202384843840/5165719193';

const interstitial = InterstitialAd.createForAdRequest(adUnitId2, {
    keywords: ['fashion', 'clothing'],
});

const rewarded = RewardedAd.createForAdRequest(adUnitId3, {
    keywords: ['fashion', 'clothing'],
});

interface FWallet {
    wid: number;
    coins: number;
    activeStatus: number;
    createdAt: string;
    updatedAt: string;
}

const FinancyWallet = () => {

    const bannerRef = useRef<BannerAd>(null);
    useForeground(() => {
        Platform.OS === 'android' && bannerRef.current?.load();
    });

    const router = useRouter();

    const [wallets, setWallets] = useState<FWallet | null>(null);
    const [refresh, setRefresh] = useState(false);

    const [adLoaded1, setAdLoaded1] = useState(false);
    const [adLoaded2, setAdLoaded2] = useState(false);

    useEffect(() => {
        fetchUserWallets();
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded1(true);
        });

        const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
            if (Platform.OS === 'android') {
                setAdLoaded1(false);
                StatusBar.setHidden(true);
            }
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            if (Platform.OS === 'android') {
                StatusBar.setHidden(false);
            }
        });

        // Start loading the interstitial straight away
        interstitial.load();

        // Unsubscribe from events on unmount
        return () => {
            unsubscribeLoaded();
            unsubscribeOpened();
            unsubscribeClosed();
        };
    }, []);

    useEffect(() => {

        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setAdLoaded2(true);
        });

        const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
                updateWalletBalance(50, "video");
                setAdLoaded2(false);
            },
        );

        // Start loading the rewarded ad straight away
        rewarded.load();

        // Unsubscribe from events on unmount
        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, []);



    useFocusEffect(
        useCallback(() => {
            setRefresh((prev) => !prev);
        }, [])
    );

    const showRewardedAd = () => {
        if (!adLoaded2) {
            Alert.alert("Please wait", "Ad is still loading...");
            rewarded.load();
            return;
        }

        rewarded.show();
        setAdLoaded2(false);
    };



    const fetchUserWallets = async () => {

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
                setWallets(data); // <-- store it in state
                console.log("✅ Fwallet data is:", wallets);
                // console.log("❌ Fwallet data is:", wallets);

            } else {
                console.error("❌ Failed to fetch Fwallet : ", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error fetching Fwallet:", err);
        } finally {
            // setLoading(false);
        }
    }



    const createWallets = async () => {

        const token = await SecureStore.getItemAsync("jwtToken")
        console.log("Fetching Financy Wallet with token:", token);
        try {
            const res = await fetch(BASE_URL+`/fwallet/createFWallet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (res.ok) {
                const data: FWallet = await res.json();
                setWallets(data); // <-- store it in state
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


    const updateWalletBalance = async (amt: number, type: string) => {

        const token = await SecureStore.getItemAsync("jwtToken")
        console.log("Fetching Financy Wallet with token: ", token);
        try {
            const res = await fetch(BASE_URL+`/fwallet/updateWallet/${type}/${amt}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (res.ok) {
                const data: FWallet = await res.json();
                setWallets(data); // <-- store it in state
                console.log("✅ Fwallet data is:", wallets);
                Alert.alert("Success", `You've earned ${amt} coins!`);
            } else {
                console.error("❌ Failed to fetch Fwallet : ", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error fetching Fwallet:", err);
            if (type == "daily") {
                Alert.alert("Info", "You have already checked in today. Come back tomorrow!");
            } else if (type === "image") {
                Alert.alert("Info", "Todays ads limit reached (10). Try again tomorrow!");
            } else {
                Alert.alert("Info", "Todays ads limit reached (5). Try again tomorrow!");
            }

        } finally {
            // setLoading(false);
        }
    }

    const handleDailyCheckIn = (amt: number) => {
        // createWallets();
        updateWalletBalance(amt, "daily");
    }

    const handleImgAdsRewards = (amt: number) => {
        // Logic for daily check-in reward
        interstitial.show();
        updateWalletBalance(amt, "image");
    }

    const handleVideoAdsRewards = (amt: number) => {
        // Logic for daily check-in reward
        // rewarded.show();
    }

    const openReferModal = () => {
        router.push({
            pathname: '/(modals)/referModal',
        })
    }

    const openRedeemModal = () => {
        router.push({
            pathname: '/(modals)/redeemModal',
            params: {
                id: wallets?.wid,
                coins: wallets?.coins
            }
        })
    }

    const openCoinsTransactionModal = () => {
        router.push({
            pathname: '/(modals)/coinsHistory',
            params: {
                id: wallets?.wid,
            }
        })
    }

    return (
        <ModalWrapper>
            <View style={styles.container}   >
                <Header
                    title="Financy Wallet"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                <ScrollView contentContainerStyle={styles.form}  >
                    <View style={{ margin: "auto", alignItems: "center" }} >
                        <Typo size={20} fontWeight="300" >
                            Your Coins
                        </Typo>

                        <TouchableOpacity style={{ marginTop: spacingY._20, margin: "auto", backgroundColor: colors.neutral800, padding: spacingY._15, borderRadius: radius._10 }} >
                            <Typo size={18} fontWeight="800" color={colors.gold}>
                                {wallets ? wallets.coins : 0}
                            </Typo>
                        </TouchableOpacity>


                        <View style={{ flexDirection: "row", justifyContent: "center", gap: scale(20) }} >
                            <Button style={{ marginTop: spacingY._30, padding: spacingY._10 }} onPress={fetchUserWallets} >
                                <Typo color={colors.black} fontWeight={"700"}  >
                                    Refresh
                                </Typo>
                            </Button>

                            <Button style={{ marginTop: spacingY._30, padding: spacingY._10 , backgroundColor: colors.primaryLight  }} onPress={openCoinsTransactionModal} >
                                <Typo color={colors.black} fontWeight={"700"}  >
                                    History
                                </Typo>
                            </Button>
                        </View>


                    </View>
                </ScrollView>

                <ScrollView contentContainerStyle={styles.form}  >

                    <TouchableOpacity style={[styles.EarnBoxs, styles.flexRow]}
                        onPress={() => {
                            handleDailyCheckIn(10);
                        }}
                    >
                        <Typo size={16} fontWeight="600" color={colors.white} >
                            Daily Check-in
                        </Typo>
                        <Icons.ClockAfternoonIcon
                            // style={{ marginTop: verticalScale(100) }}
                            size={25}
                            color={colors.white}
                            weight='fill'
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.EarnBoxs, styles.flexRow]}
                        disabled={!adLoaded1}
                        onPress={() => {
                            handleImgAdsRewards(25);
                        }}
                    >
                        {
                            adLoaded1 ? (
                                <Typo size={16} fontWeight="600" color={colors.white} >
                                    Earn by Watching Ads
                                </Typo>
                            ) : (
                                <Typo size={16} fontWeight="600" color={colors.green}  >
                                    Please try after some time...
                                </Typo>
                            )
                        }

                        <Icons.ImageIcon
                            // style={{ marginTop: verticalScale(100) }}
                            size={25}
                            color={colors.white}
                            weight='fill'
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.EarnBoxs, styles.flexRow]}

                        onPress={() => {
                            rewarded.show();
                        }}
                        disabled={!adLoaded2}
                    >

                        {
                            adLoaded2 ? (
                                <Typo size={16} fontWeight="600" color={colors.white}  >
                                    Earn by Watching Videos
                                </Typo>
                            ) : (
                                <Typo size={16} fontWeight="600" color={colors.green}  >
                                    Please try after some time...
                                </Typo>
                            )
                        }

                        <Icons.VideoCameraIcon
                            // style={{ marginTop: verticalScale(100) }}
                            size={25}
                            color={colors.white}
                            weight='fill'
                        />
                    </TouchableOpacity>

                    <View>
                        <View>
                            <BannerAd ref={bannerRef} unitId={adUnitId1} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                        </View>
                    </View>

                </ScrollView>
                <View style={styles.footer} >

                    <Button onPress={() => { openReferModal() }} style={{ flex: 1, backgroundColor: colors.primaryLight }} >
                        <Typo color={colors.black} fontWeight={"700"}>
                            Refer
                        </Typo>
                    </Button>

                    <Button onPress={() => { openRedeemModal() }} style={{ flex: 1 }}>
                        <Typo color={colors.black} fontWeight={"700"}>
                            Redeem Coins
                        </Typo>
                    </Button>

                </View>

            </View>
        </ModalWrapper>
    )
}

export default FinancyWallet

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._20,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._5,
        borderTopWidth: 1
    },
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center"
    },
    avatar: {
        alignSelf: 'center',
        backgroundColor: colors.neutral300,
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200,
        borderWidth: 1,
        borderColor: colors.neutral500
    },
    editIcon: {
        position: "absolute",
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 100,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 10,
        elevation: 4,
        padding: spacingY._7
    },
    inputContainer: {
        gap: spacingY._10
    },
    flexRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._10
    },

    button: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
    },
    buttonText: { fontSize: 16 },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    dropdown: {
        backgroundColor: "#fff",
        borderRadius: 8,
        maxHeight: 250,
    },
    item: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
    itemText: { fontSize: 16 },
    result: { marginTop: 20, fontSize: 16, fontWeight: "bold" },
    dropDownContainer: {
        flexDirection: 'row',
        height: verticalScale(54),
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15,
        gap: spacingX._10
    },
    dropDownInput: {
        flex: 1,
        color: colors.white,
        fontSize: verticalScale(14),
    },
    EarnBoxs: {
        padding: spacingY._15,
        backgroundColor: colors.neutral800,
        borderBlockColor: colors.neutral700,
        borderWidth: 1,
        borderRadius: radius._10,
        marginBottom: spacingY._10
    },
})