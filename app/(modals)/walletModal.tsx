
import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { AntDesign } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Item {
    label: string;
    value: string;
}

const AccountTypedata: Item[] = [
    { label: "Saving", value: "saving" },
    { label: "Salary", value: "salary" },
    { label: "Current", value: "current" },
    { label: "Other", value: "other" },
];

interface User {
    email: string;
    username: string;
}

const WalletModal = () => {

    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState<Item | null>(null);
    const toggleDropdown = () => setVisible(!visible);

    const onSelect = (item: Item) => {
        setSelected(item);
        setVisible(false);
        console.log("seleted item is", item.value)
        setWallet({ ...wallet, accountType: String(item.value) })
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

    const { id, name, balance, type, accNo, ifsc } = useLocalSearchParams<{
        id: string;
        name: string;
        balance: string;
        type: string;
        accNo: string;
        ifsc: string;
    }>();

    // convert id to number if needed
    const walletId = Number(id);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        })
        console.log(result);
        if (!result.canceled) {
            // ✅ Save the image URI into userProfile
            // setUserProfile(prev =>
            //     prev ? { ...prev, profilePic: result.assets[0].uri } : null
            // );
        }
    }

    useEffect(() => {
        const getUserNProfile = async () => {
            try {
                const storedProfile = await SecureStore.getItemAsync("userProfile");
                const storeduser = await SecureStore.getItemAsync("user");
                if (storedProfile) {
                    // setUserProfile(JSON.parse(storedProfile) as UserProfile);
                    // console.log("user Profile is ", userProfile)
                }
                if (storeduser) {
                    setUser(JSON.parse(storeduser) as User);
                    console.log('user data is ', user)
                }

            } catch (error) {
                console.error("Error loading user & profile:", error);
            }
        };

        if (id) {
            setWallet({
                id: Number(id),
                bankName: name || "",
                accountNumber: accNo || "",
                accountType: type || "",
                balance: Number(balance) || 0,
                ifscCode: ifsc || "",
                created: new Date(), // or pass actual creation date if available
                fetchedAt: ""        // fill if needed
            });
        }

        getUserNProfile();
    }, [id, name, balance, type, accNo, ifsc]);


    const deleteWallet = async () => {
        const token = await SecureStore.getItemAsync("jwtToken")
        setLoading(true)

        try {
            const res = await fetch(BASE_URL+`/bank/deleteAcount/${walletId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
                },
                // body: JSON.stringify(formData), // ✅ stringify the object
            });
            setLoading(false)
            if (res.ok) {
                const data = await res.json();
                Alert.alert("Wallet Deleted")
                router.back();

            } else {
                console.error("❌ Failed to Deleting wallet:", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error Deleting wallet:", err);
        }

    }


    const onSubmit = async () => {

        if (!wallet.bankName.trim() || !wallet.accountType) {
            Alert.alert("User", "Please fill all the fields")
            return;
        }
        setLoading(true)

        const token = await SecureStore.getItemAsync("jwtToken")
        console.log(token)

        if (id) {
            //update wallet

            const formData = {
                id: walletId,
                bankName: wallet.bankName,
                accountNumber: wallet.accountNumber,
                balance: wallet.balance,
                ifscCode: wallet.ifscCode,
                accountType: wallet.accountType,
                fetchedAt: new Date
            }

            try {
                const res = await fetch(BASE_URL+`/bank/updateBankAccount`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify(formData), // ✅ stringify the object
                });
                setLoading(false)
                if (res.ok) {
                    const data = await res.json();
                    Alert.alert("Wallet added")
                    router.back();
                    // router.push('/(tabs)/wallet')
                } else {
                    console.error("❌ Failed to add wallet:", res.status);
                }
            } catch (err) {
                console.error("⚠️ Error adding user:", err);
            }
        } else {
            //save new wallet

            const formData = {
                bankName: wallet.bankName,
                accountNumber: wallet.accountNumber,
                balance: wallet.balance,
                ifscCode: wallet.ifscCode,
                accountType: wallet.accountType,
                fetchedAt: new Date
            }

            try {
                const res = await fetch(BASE_URL+`/bank/createBankAccount`, {
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
                    Alert.alert("Wallet added")
                    router.back();
                    // router.push('/(tabs)/wallet')
                } else {
                    console.error("❌ Failed to add wallet:", res.status);
                }
            } catch (err) {
                console.error("⚠️ Error adding user:", err);
            }
        }

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
                    onPress: () => deleteWallet(),
                    style: 'destructive'
                },
            ]
        );
    }

    return (
        <ModalWrapper>
            <View style={styles.container} >
                <Header
                    title={wallet?.bankName ? wallet.bankName.toLocaleUpperCase() : "New Wallet"}
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                {/* form  */}
                <ScrollView contentContainerStyle={styles.form}  >

                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} >Bank Name</Typo>
                        <Input
                            placeholder='HDFC'
                            value={wallet?.bankName}
                            onChangeText={(value) => setWallet({ ...wallet, bankName: value })}
                        />
                    </View>

                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} >Balance</Typo>
                        <Input
                            placeholder='100'
                            value={wallet?.balance?.toString() || ""}
                            onChangeText={(value) =>
                                setWallet({ ...wallet, balance: Number(value) }) // string → number back
                            }
                        />
                    </View>

                    {/* drop down  */}
                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} >Account Type</Typo>

                        <TouchableOpacity style={styles.dropDownContainer} onPress={toggleDropdown}>
                            <Typo
                                style={{
                                    ...styles.dropDownInput,
                                    color: selected ? colors.neutral100 : colors.neutral400,
                                }}
                            >
                                {selected ? selected.label : "Select Account type"}
                            </Typo>
                             <AntDesign
                                name={visible ? "up" : "down"}
                                size={16}
                                color="gray"
                            // style={styles.icon}
                            />
                        </TouchableOpacity>


                        <Modal transparent visible={visible} animationType="fade"   >
                            <TouchableOpacity style={styles.overlay} onPress={toggleDropdown}  >
                                <View style={styles.dropdown}>
                                    <FlatList
                                        data={AccountTypedata}
                                        keyExtractor={(item) => item.value}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.item}
                                                onPress={() => onSelect(item)}
                                            >
                                                <Text style={styles.itemText}>{item.label}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>
                        {selected && <Typo style={styles.result} color={colors.primary}   >Selected: {selected.label}</Typo>}
                    </View>


                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} >Account No (Optional)</Typo>
                        <Input
                            placeholder='99999999999'
                            value={wallet?.accountNumber}
                            onChangeText={(value) => setWallet({ ...wallet, accountNumber: value })}
                        />
                    </View>


                    <View style={styles.inputContainer} >
                        <Typo color={colors.neutral200} >IFSC code  (Optional)</Typo>
                        <Input
                            placeholder='HDFCIFSC'
                            value={wallet?.ifscCode}
                            onChangeText={(value) => setWallet({ ...wallet, ifscCode: value })}
                        />
                    </View>

                </ScrollView>
            </View>

            <View style={styles.footer} >

                {/* {wallet?.id && ( */}
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
                {/* )} */}

                <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }} >
                    {id ?
                        <Typo
                            color={colors.black} fontWeight={"700"}
                        >
                            Update Wallet
                        </Typo> :
                        <Typo
                            color={colors.black} fontWeight={"700"}
                        >
                            Add Wallet
                        </Typo>
                    }
                </Button>
            </View>

        </ModalWrapper>
    )
}

export default WalletModal

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