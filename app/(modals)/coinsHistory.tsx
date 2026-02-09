import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

interface CoinTransaction {
    tid: number;
    coins: number;
    type: 'daily' | 'image' | 'video';
    createdAt: string;
}


const coinsHistory = () => {

    const [transactions, setTransactions] = useState<CoinTransaction[]>([]);

    useEffect(() => {
        getCoinTransactions();
    }, []);

    const { id } = useLocalSearchParams<{
        id: string;
    }>();


    const getCoinTransactions = async () => {
        const token = await SecureStore.getItemAsync("jwtToken")
        try {
            const res = await fetch(BASE_URL+`/coins/transactions/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
                },
            });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
                console.log("all coins transactions :", transactions);
            } else {
                console.error("❌ Failed Last Redeem details request:", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error Last Redeem details request:", err);
        }
    }


    return (

        <ModalWrapper style={{ backgroundColor: colors.neutral900 }}  >
            <View style={styles.container} >
                <Header
                    title="All Coins Transactions"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />


                <ScrollView
                    contentContainerStyle={styles.scrollViewStyle}
                    showsVerticalScrollIndicator={false}
                >

                    {transactions.map((transaction, index) => (
                        <Animated.View
                            entering={FadeInDown.delay(index*100)}
                        >
                            <View key={transaction.tid} style={{ padding: spacingY._10, borderBottomWidth: 1, borderBottomColor: colors.neutral700 }} >

                                <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
                                    <View>
                                        <Typo color={colors.white} fontWeight="600" >
                                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction

                                        </Typo>
                                        <Typo color={colors.neutral400} >
                                            {transaction.createdAt
                                                ? new Date(transaction.createdAt).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "2-digit",
                                                })
                                                : ""}
                                        </Typo>
                                    </View>

                                    <Typo color={transaction.coins >= 0 ? colors.primary : colors.rose} fontWeight="700" >
                                        {transaction.coins >= 0 ? `+${transaction.coins}` : transaction.coins} Coins
                                    </Typo>
                                </View>

                            </View>
                        </Animated.View>
                    ))}

                </ScrollView>


            </View>
        </ModalWrapper>
    )
}

export default coinsHistory

const styles = StyleSheet.create({
    scrollViewStyle: {
        marginTop: spacingY._10,
        paddingBottom: verticalScale(100),
        gap: spacingY._25
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