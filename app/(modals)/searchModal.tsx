import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import TransactionList from '@/components/TransactionList'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

interface Item {
    label: string;
    value: string;
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



interface User {
    email: string;
    username: string;
}

const SearchModal = () => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {

        const fetchTransaction = async () => {
            const token = await SecureStore.getItemAsync("jwtToken")
            try {
                const res = await fetch(BASE_URL+`/transactions/getAllByUser`, {
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

    }, []);

    const filteredTransaction = transactions?.filter((item) => {
        if (search.length > 1) {
            if (
                item.category?.toLowerCase()?.includes(search?.toLowerCase()) ||
                item.type?.toLowerCase()?.includes(search?.toLowerCase()) ||
                item.description?.toLowerCase()?.includes(search?.toLowerCase()) 
            ){
                return true;
            }
            return false;
        }
        return true;
    })

    return (
        <ModalWrapper style={{backgroundColor: colors.neutral900}}  >
            <View style={styles.container} >
                <Header
                    title="Search"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                {/* form  */}
                <ScrollView contentContainerStyle={styles.form}  >
                    <View style={styles.inputContainer} >
                        <Input
                            placeholder='shoes...'
                            value={search}
                            placeholderTextColor={colors.neutral400}
                            containerStyle={{backgroundColor: colors.neutral800}}
                            onChangeText={(value)=> setSearch(value)}
                        />
                    </View>

                    {/* transaction  */}
                    <View>
                        {transactions != null ? (
                            <TransactionList
                                data={filteredTransaction}
                                loading={false}
                                // title='Recent Transactions'
                                emptyListMessage='No Transaction added yet!'
                            />
                        ) : "No Transaction"}
                    </View>



                </ScrollView>
            </View>
        </ModalWrapper>
    )
}

export default SearchModal

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