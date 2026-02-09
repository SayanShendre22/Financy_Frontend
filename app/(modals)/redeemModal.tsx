import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'


interface RedeemModalProps {
    id: number;
    coins: number;
    type: 'upi' | 'bank';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED';
    createdAt: string;      // ISO timestamp
    details: string;
}



const redeemModal = () => {


    const [paymentDetailsVisible, setPaymentDetailsVisible] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [upiId, setUpiId] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [withdrawCoins, setWithdrawCoins] = useState(''); // keep as string for input
    const [redeemRequests, setRedeemRequests] = useState<RedeemModalProps[]>([]);
    const [redeemDetails, setRedeemDetails] = useState({
        remainingDays: 0,
        totalRedeemedCoins: 0,
        canRedeem: true
    });


    const { id, coins } = useLocalSearchParams<{
        id: string;
        coins: string;
    }>();

    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        lastRedeem();
        console.log("Wallet ID:", id);
        console.log("Available Coins:", coins);
    }, [id, coins, upiId, accountNumber, ifscCode, accountHolder, withdrawCoins,refresh]);

     useFocusEffect(
            useCallback(() => {
                setRefresh((prev) => !prev);
            }, [])
        );

    const validateInputs = () => {
        if (!selectedMethod) {
            Alert.alert("Error", "Please select a payment method.");
            return false;
        }
        if (Number(withdrawCoins) <= 0 || Number(withdrawCoins) > Number(coins)) {
            Alert.alert("Error", "Please enter a valid number of coins to withdraw.");
            return false;
        }
        if (selectedMethod === "UPI" && upiId.trim() === "") {
            Alert.alert("Error", "Please enter your UPI ID.");
            return false;
        }
        if (selectedMethod === "BANK") {
            if (accountNumber.trim() === "" || ifscCode.trim() === "" || accountHolder.trim() === "") {
                Alert.alert("Error", "Please fill in all bank details.");
                return false;
            }
        }

        let details = "";

        if (selectedMethod === "UPI") {
            details = `UPI ID: ${upiId}\nCoins: ${withdrawCoins}`;
        } else if (selectedMethod === "BANK") {
            details = `Account Number: ${accountNumber}\nIFSC Code: ${ifscCode}\nAccount Holder: ${accountHolder}\nCoins: ${withdrawCoins}`;
        }

        // Send the details directly
        sendRedeemRequest(details);
    }

    const sendRedeemRequest = async (details: string) => {
        const token = await SecureStore.getItemAsync("jwtToken")
        console.log(token)
        setLoading(true)
        const formData = {
            walletId: Number(id),
            coins: withdrawCoins,
            type: selectedMethod?.toLocaleLowerCase(),
            details: details
        }

        try {
            const res = await fetch(BASE_URL+`/coins/redeem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
                },
                body: JSON.stringify(formData), // ✅ stringify the object
            });
            setLoading(false)
            if (res.ok) {
                const data = await res.json();
                Alert.alert("Success", "Redeem request sent successfully!");
            } else {
                console.error("❌ Failed to send redeem request:", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error sending redeem request:", err);
        }
    }


    const lastRedeem = async () => {
        const token = await SecureStore.getItemAsync("jwtToken")
        try {
            const res = await fetch(BASE_URL+`/coins/redeem/getLast/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
                },
            });
            setLoading(false)
            if (res.ok) {
                const data = await res.json();
                console.log("Last Redeem details:", data);
                setRedeemRequests(data);
                console.log("✅ Redeem request sent:", redeemRequests);
                calculateRedeemData(data);
            } else {
                console.error("❌ Failed Last Redeem details request:", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error Last Redeem details request:", err);
        }
    }

    const calculateRedeemData = (redeemRequests: any[]) => {
        if (!redeemRequests || redeemRequests.length === 0) {
            console.log("got null data")
            return {
                remainingDays: 0,
                totalRedeemedCoins: 0,
                canRedeem: true
            };
        }

        // assuming list is sorted DESC by createdAt
        const lastRedeemAt = redeemRequests[0].createdAt;
        const lastRedeemDate = new Date(lastRedeemAt);

        // next allowed date
        const nextAllowedRedeemDate = new Date(lastRedeemDate);
        nextAllowedRedeemDate.setDate(nextAllowedRedeemDate.getDate() + 30);

        const now = new Date();

        // remaining days
        const remainingDays = Math.max(
            0,
            Math.ceil(
                (nextAllowedRedeemDate.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            )
        );

        // total redeemed coins till now
        const totalRedeemedCoins = redeemRequests.reduce(
            (sum, r) => sum + (r.coins || 0),
            0
        );

        setRedeemDetails({
            remainingDays,
            totalRedeemedCoins,
            canRedeem: remainingDays === 0
        });
        console.log(remainingDays, totalRedeemedCoins, remainingDays === 0)

        return {
            remainingDays,
            totalRedeemedCoins,
            canRedeem: remainingDays === 0
        };
    };


    return (
        <ModalWrapper style={{ backgroundColor: colors.neutral900 }}  >
            <View style={styles.header} >
                <Header
                    title="Redeem Coins"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                <View
                    style={{ flexDirection: "row", alignItems: "center", gap: spacingX._10 }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacingX._10 }}>
                        <Typo size={16} fontWeight="600" color={colors.white} >
                            Available Coins:
                        </Typo>
                        <Typo size={20} fontWeight="700" color={colors.gold} >
                            {coins}
                        </Typo>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacingX._10 }}>
                        <Typo size={16} fontWeight="600" color={colors.white} >
                            Redeem will be available in:
                        </Typo>
                        <Typo size={20} fontWeight="700" color={colors.gold} >
                            {redeemDetails.remainingDays} days
                        </Typo>
                    </View>

                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: spacingX._10, marginTop: spacingY._10 }} >
                    <Typo size={14} fontWeight="600" color={colors.white} >
                        Total Redeemed Coins:
                    </Typo>
                    <Typo size={20} fontWeight="700" color={colors.gold} >
                        {redeemDetails.totalRedeemedCoins}
                    </Typo>
                </View>
            </View>

            <View style={styles.container} >
                <ScrollView contentContainerStyle={styles.form}  >
                    <TouchableOpacity style={[styles.methodBlock, styles.flexRow]}
                        onPress={() => {
                            setPaymentDetailsVisible(true)
                            console.log("UPI selected");
                            setSelectedMethod("UPI");
                        }}
                    >
                        <Typo size={16} fontWeight="600" color={colors.white} >
                            UPI (Recommended)
                        </Typo>
                        <Icons.MoneyIcon
                            size={25}
                            color={colors.white}
                            weight='fill'
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.methodBlock, styles.flexRow]}
                        onPress={() => {
                            setPaymentDetailsVisible(true)
                            console.log("Bank selected");
                            setSelectedMethod("BANK");
                        }}
                    >
                        <Typo size={16} fontWeight="600" color={colors.white} >
                            BANK TRANSFER
                        </Typo>
                        <Icons.BankIcon
                            size={25}
                            color={colors.white}
                            weight='fill'
                        />
                    </TouchableOpacity>
                </ScrollView>

            </View>

            {paymentDetailsVisible && (

                <Animated.View

                    entering={FadeInDown.duration(1000).springify().damping(12)}
                    style={{ alignItems: "center" }}
                >
                    <View style={styles.paymentInfo} >
                        <View style={{ flexDirection: 'row' }} >
                            <Typo size={15} fontWeight="600" color={colors.black} style={{ margin: verticalScale(15) }}   >
                                Enter your payment details
                            </Typo>
                        </View>
                        <TouchableOpacity onPress={() => setPaymentDetailsVisible(false)}
                            style={{ position: "absolute", top: verticalScale(15), right: verticalScale(30) }}
                        >
                            <Icons.XCircleIcon
                                weight='fill'
                                color={colors.black}
                                size={verticalScale(25)}
                            />
                        </TouchableOpacity>

                        {selectedMethod === "UPI" && (
                            <View style={styles.inputContainer} >
                                <Typo color={colors.black} >Enter your UPI ID</Typo>
                                <Input
                                    placeholder='UPI ID'
                                    value={upiId}
                                    onChangeText={(text) => setUpiId(text)}
                                    keyboardType="default"
                                    autoCapitalize="none"
                                />
                            </View>
                        )}

                        {selectedMethod === "BANK" && (
                            <>
                                <View style={[styles.inputContainer]} >
                                    <Typo color={colors.black} >Enter Account Number</Typo>
                                    <Input
                                        placeholder='Account Number'
                                        value={accountNumber}
                                        onChangeText={(text) => setAccountNumber(text)}
                                        keyboardType="number-pad"
                                    />
                                </View>

                                <View style={[styles.inputContainer]} >
                                    <Typo color={colors.black} >Enter IFSC Code</Typo>
                                    <Input
                                        placeholder='IFSC Code'
                                        value={ifscCode}
                                        onChangeText={(text) => setIfscCode(text)}
                                        autoCapitalize="characters"
                                    />
                                </View>

                                <View style={[styles.inputContainer]} >
                                    <Typo color={colors.black} >Enter Account Holder Name</Typo>
                                    <Input
                                        placeholder='Account Holder Name'
                                        value={accountHolder}
                                        onChangeText={(text) => setAccountHolder(text)}
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.inputContainer} >
                            <Typo color={colors.black} >Enter coins to withdraw</Typo>
                            <Input
                                placeholder='100'
                                value={withdrawCoins}
                                onChangeText={(text) => setWithdrawCoins(text.replace(/[^0-9]/g, ''))} // keep only digits
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.footer} >
                            {redeemDetails.canRedeem ? (
                                <Button
                                    onPress={() => {
                                        setPaymentDetailsVisible(false)
                                        validateInputs()
                                    }}
                                    style={{ flex: 1, backgroundColor: colors.primaryLight }} >
                                    <Typo color={colors.black} fontWeight={"700"}>
                                        Send Request
                                    </Typo>
                                </Button>
                        ) : (
                                 <Button
                                    onPress={() => {
                                        Alert.alert("Info", `You can redeem again in ${redeemDetails.remainingDays} days.`)
                                    }}
                                    style={{ flex: 1, backgroundColor: colors.primaryLight }} >
                                    <Typo color={colors.black} fontWeight={"700"}>
                                        Next redeem in {redeemDetails.remainingDays} days
                                    </Typo>
                                </Button>
                            )}

                        </View>

                    </View>
                </Animated.View>
            )
            }
        </ModalWrapper >
    )
}

export default redeemModal


const styles = StyleSheet.create({
    paymentInfo: {
        position: "absolute",
        backgroundColor: colors.primary,
        bottom: verticalScale(20),
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    methodBlock: {
        padding: spacingY._15,
        backgroundColor: colors.neutral800,
        borderBlockColor: colors.neutral700,
        borderWidth: 1,
        borderRadius: radius._10,
        marginBottom: spacingY._10
    },
    flexRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._10
    },
    header: {
        width: "100%",
        height: "25%",
        backgroundColor: colors.primary,
        paddingVertical: 30,      // top & bottom
        paddingHorizontal: 20,    // left & right
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center" as const,
        color: "#000000ff",
        // shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        // elevation for Android shadow
        elevation: 4,
    },
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
        marginBottom: spacingY._5,
    },
    form: {
        gap: spacingY._17,
        marginTop: spacingY._30
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
        gap: spacingY._10,
        backgroundColor: "#0000005b",
        borderRadius: radius._10,
        width: "90%",
        padding: spacingY._10,
        marginBottom: spacingY._15,
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
})
