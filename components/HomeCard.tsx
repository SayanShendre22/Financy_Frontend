import { BASE_URL } from '@/config/api'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { ImageBackground } from 'expo-image'
import { useFocusEffect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Typo from './Typo'

interface Wallet {
    id: number;
    accountNumber: string;
    accountType: string;
    balance: number;
    bankName: string;
    ifscCode: string;
    fetchedAt: string | null;
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

interface HomeCardProps {
    data: Transaction[];
}

const HomeCard = ({ data }: HomeCardProps) => {

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [refresh, setRefresh] = useState(false);


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

    const getIncome = () => {
        let amount = 0;
        // console.log("getIncome() ", data)
        {
            data && data.length > 0 ? (
                data.map((tx) => {
                    // console.log("getIncome ")
                    if (tx.type == 'income') {
                        amount = amount + Number(tx.amount);
                    }
                }
                )
            ) : (
                console.log("getIncome() else")
            )
        }
        return amount;
    }

    const getExpense = () => {
        let amount = 0;
        // console.log("getIncome() ", data)
        {
            data && data.length > 0 ? (
                data.map((tx) => {
    
                    if (tx.type == 'expense') {
                        amount = amount + Number(tx.amount);
                    }
                }
                )
            ) : (
                console.log("getExpense() else")
            )
        }
        return amount;
    }


    return (
        <ImageBackground
            source={require("../assets/images/card.png")}
            resizeMode='stretch'
            style={styles.bgImage}
        >
            <View style={styles.container} >
                <View>

                    {/* total balance  */}
                    <View style={styles.totalBalanceRow} >
                        <Typo color={colors.neutral800} size={17} fontWeight={"500"} >
                            Total Balance
                        </Typo>
                        <Icons.DotsThreeOutlineIcon
                            size={verticalScale(23)}
                            color={colors.black}
                            weight='fill'
                        />
                    </View>
                    <Typo color={colors.black} size={30} fontWeight={"bold"} >
                        Rs {getTotalBalance()?.toFixed(2)}
                    </Typo>
                </View>
                {/* total expense and income  */}
                <View style={styles.stats} >
                    {/* income  */}
                    <View style={{ gap: verticalScale(5) }} >
                        <View style={styles.incomeExpense} >
                            <View style={styles.statsIcon} >
                                <Icons.ArrowUpIcon
                                    size={verticalScale(15)}
                                    color={colors.black}
                                    weight='bold'
                                />
                            </View>
                            <Typo size={16} color={colors.neutral700} fontWeight={"500"} >
                                Income
                            </Typo>
                        </View>
                        <View style={{ alignSelf: "center" }} >
                            <Typo size={17} color={colors.green} fontWeight={"600"} >
                                Rs {getIncome()?.toFixed(2)}
                            </Typo>
                        </View>
                    </View>
                    {/* expence  */}
                    <View style={{ gap: verticalScale(5) }} >
                        <View style={styles.incomeExpense} >
                            <View style={styles.statsIcon} >
                                <Icons.ArrowDownIcon
                                    size={verticalScale(15)}
                                    color={colors.black}
                                    weight='bold'
                                />
                            </View>
                            <Typo size={16} color={colors.neutral700} fontWeight={"500"} >
                                Expence
                            </Typo>
                        </View>
                        <View style={{ alignSelf: "center" }} >
                            <Typo size={17} color={colors.rose} fontWeight={"600"} >
                                Rs {getExpense()?.toFixed(2)}
                            </Typo>
                        </View>
                    </View>
                </View>

            </View>
        </ImageBackground>
    )
}

export default HomeCard

const styles = StyleSheet.create({
    bgImage: {
        height: scale(210),
        width: "100%"
    },
    container: {
        padding: spacingX._20,
        paddingHorizontal: scale(23),
        height: "87%",
        width: "100%",
        justifyContent: "space-between"
    },
    totalBalanceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._5
    },
    stats: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statsIcon: {
        backgroundColor: colors.neutral350,
        padding: spacingY._5,
        borderRadius: 50,
    },
    incomeExpense: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingY._7,
    }
})