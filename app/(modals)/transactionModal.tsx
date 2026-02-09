
import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUploade from '@/components/ImageUploade'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { expenseCategories, transactionTypes } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { ExpenseCategoriesType, WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { AntDesign } from "@expo/vector-icons"; // arrow icon
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Item {
    label: string;
    value: string;
}

interface User {
    email: string;
    username: string;
}

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
    timestamp: Date;
    reciptName: string;
    recipt: any;
}

interface expense {
    label: string;
    value: string;
}

const TransactionModal = (item: { id: any }) => {

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [refresh, setRefresh] = useState(false);

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const showDatePickerFun = () => {
        setShowDatePicker(true);
        console.log("clicked", showDatePicker)

    };

    const hideDatePicker = () => {
        setShowDatePicker(false);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate: any) => {
        const currentDate = selectedDate || transaction.timestamp
        setTransaction({ ...transaction, timestamp: selectedDate })
        setShowDatePicker(Platform.OS == 'ios' ? true : false);
    };

    const [transaction, setTransaction] = useState<Transaction>({
        id: "",        // placeholder default
        amount: "",
        type: "",
        description: "",
        category: "income",
        timestamp: new Date,
        reciptName: "",
        recipt: null,
    });

    const { id, amount, category, description, recipt, timestamp, type } =
        useLocalSearchParams<{
            id: string;
            amount: string;
            category: string;
            description: string;
            recipt: string;
            timestamp: string;
            type: string;
        }>();

    const [typeVisible, setTypeVisible] = useState(false);
    const [walletVisible, setWalletVisible] = useState(false);
    const [expenseVisible, setExpenseVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<Item | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [selectedExpense, setSelectedExpense] = useState<expense | null>(null)
    const toggleTypeDropdown = () => setTypeVisible(!typeVisible);
    const toggleWalletDropdown = () => setWalletVisible(!walletVisible);
    const toggleExpenseDropdown = () => setExpenseVisible(!expenseVisible);

    const onSelectType = (item: Item) => {
        setSelectedType(item);
        setTypeVisible(false);
        setTransaction({ ...transaction, type: item.value })
        console.log("seleted item is", item.value)
    };

    const onSelectWallet = (item: Wallet) => {
        setSelectedWallet(item);
        setWalletVisible(false);
        console.log("seleted item is", item.bankName)
    };

    const onSelectExpense = (item: ExpenseCategoriesType) => {
        // setSelectedExpense(item);
        setExpenseVisible(false);
        console.log("seleted item is", item)
    };

    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<WalletType>({
        bankName: "",
        accountNumber: "",
        accountType: "",
        balance: 0,
        ifscCode: "",
        created: new Date,
        id: 0,
        fetchedAt: ""
    });


    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        })
        console.log(result);
        if (!result.canceled) {
            console.log("here")
            const imageUri = result.assets[0].uri;
            setTransaction({ ...transaction, recipt: imageUri });
            console.log("Picked Image URI: ", imageUri);
        }
    }

    useEffect(() => {
        const getUserNProfile = async () => {
            try {
                const storedProfile = await SecureStore.getItemAsync("userProfile");
                const storeduser = await SecureStore.getItemAsync("user");
                if (storedProfile) {
                }
                if (storeduser) {
                    setUser(JSON.parse(storeduser) as User);
                    console.log('user data is ', user)
                }

            } catch (error) {
                console.error("Error loading user & profile:", error);
            }
        };

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

        if (id) {
            console.log("Editing existing transaction...");
            setTransaction({
                id: id || "",
                amount: amount || "",
                category: category || "",
                description: description || "",
                recipt: recipt || "",
                timestamp: timestamp ? new Date(timestamp) : new Date(),
                type: type || "",
                reciptName: "",  // ✅ add this line
            });

            // setWallet(bank);
            console.log("bank data " + wallet?.bankName + " " + transaction.id)

            if (type) {
                setSelectedType({ ...selectedType, label: type, value: type });
            }
            if (category) {
                setSelectedExpense({ ...selectedExpense, label: category, value: category });
            }
            // if(bank){
            //     setSelectedWallet(bank);
            //     setWallet(bank)
            // }
            // console.log(" seleted wallet "+selectedWallet)
        }

        fetchUserWallets();
        getUserNProfile();
    }, [refresh]);

    useFocusEffect(
        useCallback(() => {
            setRefresh((prev) => !prev);
        }, [])
    );


    const deleteTransaction = async () => {
        const token = await SecureStore.getItemAsync("jwtToken")
        setLoading(true)

        try {
            const res = await fetch(BASE_URL+`/transactions/deleteTransaction/${transaction.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
                },
                // body: JSON.stringify(formData), // ✅ stringify the object
            });
            setLoading(false)
            if (res.ok) {
                Alert.alert("Wallet Deleted")
                router.back();
            } else {
                console.error("❌ Failed to Deleting transaction:", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error Deleting transaction:", err);
        }

    }


    const onSubmit = async () => {
        if (user) {
            let username = user?.username;
            if (!username.trim()) {
                Alert.alert("User", "Please fill all the fields")
                return;
            }
        }

        const token = await SecureStore.getItemAsync("jwtToken")
        console.log('receipt pic ', transaction.recipt)

        const formData = new FormData();

        formData.append("amount", transaction?.amount ?? "");
        formData.append("type", transaction?.type ?? "");
        formData.append("description", transaction?.description ?? "");
        formData.append("category", transaction?.category ?? "");
        formData.append(
            "timestamp",
            transaction.timestamp
                .toISOString()
                .replace('Z', '')
                .split('.')[0]
        );

        // ✅ append file ONLY if it exists and is valid
        if (
            transaction?.recipt &&
            (transaction.recipt.startsWith("file://") ||
                transaction.recipt.startsWith("content://"))
        ) {
            formData.append("recipt", {
                uri: transaction.recipt,
                type: "image/jpeg",
                name: "receipt.jpg",
            } as any);
        }


        console.log('receipt pic ', transaction.recipt)
        console.log("bank acc id ", selectedWallet?.id)
        try {
            const res = await fetch(BASE_URL+`/transactions/addTransactions/${selectedWallet?.id}`, {
                method: "POST",
                headers: {
                    // "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
                },
                body: formData,
            });
            if (res.ok) {
                const data = await res.json(); // ✅ parse JSON
                setUser(data); // ✅ Save in state
                console.log("submitted transiaction :" + data)
                Alert.alert("Transaction", "Added sucess")
                router.back()

            } else {
                console.error("❌ Failed to add transaction", res.status);
                Alert.alert("Transaction", "Added sucess")
                router.back();
            }
        } catch (err) {
            console.error("⚠️ Error to add transaction", err);
            Alert.alert("Transaction", "Added sucess")
            router.back()
        } finally {
            console.log("this is finally")
        }

        console.log("outside")

    }

    const [loading, setLoading] = useState(false);

    const showDeleteAlert = () => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to do this? \nThis action will remove all transactions related to this wallet",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("cancle"),
                    style: 'cancel'
                },
                {
                    text: "Delete",
                    onPress: () => deleteTransaction(),
                    style: 'destructive'
                },
            ]
        );
    }

    return (
        <ModalWrapper>
            <View style={styles.container} >
                <Header
                    title="New Transaction"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                {/* form  */}
                <ScrollView contentContainerStyle={styles.form}  >

                    {/* selete transation type  */}
                    <View style={styles.inputContainer} >

                        <Typo color={colors.neutral200} size={16} >Type</Typo>
                        <TouchableOpacity style={styles.dropDownContainer} onPress={toggleTypeDropdown}>
                            <Typo
                                style={{
                                    ...styles.dropDownInput,
                                    color: selectedType ? colors.neutral100 : colors.neutral400,
                                }}
                            >
                                {selectedType ? selectedType.label : "Select type of transaction"}
                            </Typo>
                            <AntDesign
                                name={typeVisible ? "up" : "down"}
                                size={16}
                                color="gray"
                            />
                        </TouchableOpacity>

                        <Modal transparent visible={typeVisible} animationType="slide"   >
                            <TouchableOpacity style={styles.overlay} onPress={toggleTypeDropdown}  >
                                <View style={styles.dropdown}>
                                    <FlatList
                                        data={transactionTypes}
                                        keyExtractor={(item) => item.value}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.item}
                                                onPress={() => onSelectType(item)}
                                            >
                                                <Text style={styles.itemText}>{item.label}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>
                        {selectedType && <Typo style={styles.result} color={colors.primary}   >Selected: {selectedType.label}</Typo>}
                    </View>

                    {/* selete wallet dropdown  */}
                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} size={16} >Wallet</Typo>

                        <TouchableOpacity style={styles.dropDownContainer} onPress={toggleWalletDropdown}>
                            <Typo
                                style={{
                                    ...styles.dropDownInput,
                                    color: selectedWallet ? colors.neutral100 : colors.neutral400,
                                }}
                            >
                                {selectedWallet ? selectedWallet.bankName : "Select Wallet for transaction"}

                            </Typo>

                            <AntDesign
                                name={walletVisible ? "up" : "down"}
                                size={16}
                                color="gray"
                            // style={styles.icon}
                            />

                        </TouchableOpacity>


                        <Modal transparent visible={walletVisible} animationType="slide" >
                            <TouchableOpacity style={styles.overlay} onPress={toggleWalletDropdown}  >
                                <View style={styles.dropdown}>
                                    <FlatList
                                        data={wallets}
                                        keyExtractor={(item) => item.bankName}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.item}
                                                onPress={() => onSelectWallet(item)}
                                            >
                                                <Text style={styles.itemText}>{item.bankName.toLocaleUpperCase()}</Text>
                                                <Typo style={styles.itemText}>Rs {item.balance}</Typo>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>
                        {selectedWallet && <Typo style={styles.result} color={colors.primary}>Selected: {selectedWallet.bankName}</Typo>}
                    </View>

                    {transaction.type == 'expense' && (
                        // expence category 
                        <View style={styles.inputContainer} >
                            <Typo color={colors.neutral200} size={16}>Expence Category</Typo>

                            <TouchableOpacity style={styles.dropDownContainer} onPress={toggleExpenseDropdown}>
                                <Typo
                                    style={{
                                        ...styles.dropDownInput,
                                        color: selectedWallet ? colors.neutral100 : colors.neutral400,
                                    }}
                                >
                                    {selectedExpense ? selectedExpense.value : "Select the expence category"}

                                </Typo>

                                <AntDesign
                                    name={expenseVisible ? "up" : "down"}
                                    size={16}
                                    color="gray"
                                // style={styles.icon}
                                />

                            </TouchableOpacity>


                            <Modal transparent visible={expenseVisible} animationType="slide" >
                                <TouchableOpacity style={styles.overlay} onPress={toggleExpenseDropdown}  >
                                    <View style={styles.dropdown}>
                                        <FlatList
                                            data={Object.values(expenseCategories)}
                                            keyExtractor={(item) => item.value}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.item}
                                                    onPress={() => {
                                                        setTransaction({
                                                            ...transaction, category: item.value
                                                        });
                                                        setSelectedExpense(item);
                                                        setExpenseVisible(false);

                                                    }}
                                                >
                                                    <Text style={styles.itemText}>{item.value.toLocaleUpperCase()}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                            {selectedExpense && <Typo style={styles.result} color={colors.primary}   >Selected: {selectedExpense?.value}</Typo>}
                        </View>
                    )}

                    {/* date picker  */}
                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} size={16} >Date</Typo>
                        {
                            !showDatePicker && (
                                <Pressable
                                    style={styles.dateInput}
                                    onPress={() => showDatePickerFun()}
                                >
                                    <Typo size={14}  >
                                        {(transaction.timestamp as Date).toLocaleDateString()}
                                    </Typo>
                                </Pressable>
                            )
                        }

                        {
                            showDatePicker && (
                                <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                                    <DateTimePicker
                                        themeVariant='dark'
                                        value={transaction.timestamp as Date}
                                        textColor={colors.white}
                                        mode='date'
                                        display={Platform.OS == 'ios' ? 'spinner' : 'default'}
                                        onChange={onDateChange}
                                    />

                                    {Platform.OS == 'ios' && (
                                        <TouchableOpacity
                                            style={styles.datePickerButton}
                                            onPress={() => hideDatePicker()}
                                        >
                                            <Typo size={15} fontWeight={"500"} >
                                                Ok
                                            </Typo>
                                        </TouchableOpacity>
                                    )}


                                </View>
                            )
                        }

                    </View>

                    {/* transaction amount  */}
                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} size={16}>Amount</Typo>
                        <Input
                            placeholder='Enter transaction amount'
                            value={transaction?.amount}
                            onChangeText={(value) => setTransaction({ ...transaction, amount: value })}
                            keyboardType="number-pad"
                        />
                    </View>

                    {/* transaction Discription  */}
                    <View style={styles.inputContainer} >
                        <View style={styles.flexRow} >
                            <Typo color={colors.neutral200} size={16} >Discription</Typo>
                            <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                        </View>
                        <Input
                            // placeholder=''
                            value={transaction?.description}
                            multiline
                            containerStyle={{
                                flexDirection: 'row',
                                height: verticalScale(100),
                                alignItems: "flex-start",
                                paddingVertical: 15,
                            }}
                            onChangeText={(value) =>
                                setTransaction(
                                    { ...transaction, description: value }
                                )}
                        />

                    </View>


                    <View style={styles.inputContainer} >
                        <View style={styles.flexRow} >
                            <Typo color={colors.neutral200} size={16} >Receipt</Typo>
                            <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                        </View>
                        <ImageUploade
                            file={transaction.recipt}
                            onClear={() => setTransaction({ ...transaction, recipt: null })}
                            onSelect={(file) => {
                                setTransaction({ ...transaction, recipt: file })
                            }}
                            placeholder='Select Recipt'
                        />
                    </View>


                </ScrollView>
            </View>

            <View style={styles.footer} >

                {transaction?.id && (
                    <Button
                        onPress={showDeleteAlert}
                        style={{
                            backgroundColor: colors.rose,
                            paddingHorizontal: spacingX._15
                        }}
                    >
                        <Icons.TrashIcon
                            color={colors.white}
                            size={verticalScale(24)}
                            weight='bold'
                        />
                    </Button>
                )}

                {transaction?.id ? (
                    <Button 
                    onPress={()=>  {
                        Alert.alert("Comming soon","Updating Transactions not avaliable right now, You can try deleting and then create an new Tranaction");
                    }}
                    loading={loading} style={{ flex: 1 }} 
                    >

                        <Typo
                            color={colors.black} fontWeight={"700"}
                        >
                            Update Transaction
                        </Typo>

                    </Button>
                )
                    : (
                        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }} >

                            <Typo
                                color={colors.black} fontWeight={"700"}
                            >
                                Add Transaction
                            </Typo>

                        </Button>
                    )
                }
            </View>

        </ModalWrapper>
    )
}

export default TransactionModal

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
        marginTop: spacingY._15,
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
        // backgroundColor: '',
        borderRadius: 10,
        maxHeight: 250,
    },
    item: {
        padding: 12,
        backgroundColor: colors.neutral500,
        flexDirection: 'row',
        height: verticalScale(45),
        alignItems: 'center',
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.neutral900,
        borderRadius: radius._10,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15,
        margin: 1,
    },
    itemText: {
        fontSize: 16,
        color: colors.white,
        fontWeight: "700"
    },
    result: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: "bold"
    },
    dropDownContainer: {
        flexDirection: 'row',
        height: verticalScale(54),
        alignItems: 'center',
        justifyContent: "space-between",
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
    dropdownIcon: {
        // position: "absolute",
        // right: spacingY._7,
        //     paddingLeft: spacingX._40
    },
    inputImgContainer: {
        height: verticalScale(54),
        backgroundColor: colors.neutral700,
        borderRadius: radius._15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        borderColor: colors.neutral500,
        borderStyle: "dashed",
    },
    dateInput: {
        padding: 12,
        flexDirection: 'row',
        height: verticalScale(54),
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15,
    },
    iosDatePicker: {

    },
    datePickerButton: {
        backgroundColor: colors.neutral700,
        alignSelf: "flex-end",
        padding: spacingX._7,
        marginRight: spacingY._7,
        paddingHorizontal: spacingY._15,
        borderRadius: radius._10
    },
    flexRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._5
    }
})