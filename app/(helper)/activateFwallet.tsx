import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { useFocusEffect, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

interface User {
    email: string;
    username: string;
}

interface UserProfile {
    fullname: string;
    address: string;
    job: string;
    salary: string;
    mobileNo: string;
    dob: string;
    profilePic: string;
    goal: string;
}


const activateFwallet = () => {

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [mobile, setMobile] = useState("");
    const [userProfile, setUserProfile] = useState<UserProfile>({
        fullname: '',
        address: '',
        job: '',
        salary: '',
        mobileNo: '',
        dob: '',
        profilePic: '',
        goal: '',
    });
    const otpRef = useRef("");
    const [otpsent, setOtpsent] = useState(false);

    const [refresh, setRefresh] = useState(false);


    const getProfileImage = (file: any) => {
        if (file && typeof file == 'string') return file;
        if (file && typeof file == 'object') return file.url;

        return require('../../assets/images/defaultAvatar.png')
    }

    useEffect(() => {
        const getUser = async () => {
            const token = await SecureStore.getItemAsync("jwtToken");
            try {
                const res = await fetch(BASE_URL+`/user/getUserByToken`, {
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
        const fetchProfile = async () => {
            const token = await SecureStore.getItemAsync("jwtToken")
            try {
                const res = await fetch(BASE_URL+`/profile/getProfile`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data)
                    console.log("✅ Profile for localStorage : ", userProfile?.profilePic);
                } else {
                    console.error("❌ Failed to fetch Profile : ", res.status);
                }
            } catch (err) {
                console.error("⚠️ Error fetching user:", err);
            } finally {

            }
        }

        fetchProfile();
        getUser();
    }, [refresh]);

    useFocusEffect(
        useCallback(() => {
            setRefresh((prev) => !prev);
        }, [])
    );

    const sendOTPToMobile = () => {

    }

    const verifyOTP = () => {

    }

    const createWallets = async () => {

        updateProfile();

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
                const data = await res.json();

                console.log("✅ Fwallet data is:", data);

            } else {
                console.error("❌ Failed to fetch Fwallet : ", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error fetching Fwallet:", err);
        } finally {
            // setLoading(false);
        }
    }

    const updateProfile = async () => {
        if (user) {
            let username = user?.username;
            if (!username.trim()) {
                Alert.alert("User", "Please fill all the fields")
                return;
            }
        }
        if (mobile.length === 10) {
            // setUserProfile(prev => ({
            //     ...prev,
            //     mobileNo: mobile,
            // }));
        } else {
            Alert.alert("Mobile", "Please enter mobile no")
            return;
        }

        const token = await SecureStore.getItemAsync("jwtToken")
        const formData = new FormData();

        formData.append("fullname", "");
        formData.append("address", "");
        formData.append("job", "");
        formData.append("salary", "");
        formData.append("mobileNo", mobile);
        formData.append("dob", "");
        formData.append("goal", "");
        // ✅ append image ONLY if it's a real local file
        if (
            userProfile?.profilePic &&
            (userProfile.profilePic.startsWith("file://") ||
                userProfile.profilePic.startsWith("content://"))
        ) {
            formData.append("PP", {
                uri: userProfile.profilePic,
                type: "image/jpeg",
                name: "profile.jpg",
            } as any);
        }

        try {
            const res = await fetch(BASE_URL+"/profile/saveProfile", {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            if (res.ok) {
                console.log(res.status)
                Alert.alert("Profile", "profile updated success");
                router.push({
                    pathname: '/(modals)/financyWallet',
                })
            } else {
                console.error("❌ Failed to fetch user:", res.status);
                router.back();
            }
        } catch (err) {
            console.error("⚠️ Error fetching user:", err);
            router.back();
        }
    }


    const updateProfile1 = async () => {


        const token = await SecureStore.getItemAsync("jwtToken")
        console.log('profile pic ', userProfile?.profilePic)

        const formData = new FormData();

        formData.append("fullname", user?.username ?? "")
        formData.append("address", userProfile?.address ?? "");
        formData.append("job", userProfile?.job ?? "");
        formData.append("salary", userProfile?.salary ?? "");
        formData.append("mobileNo", mobile ?? "");
        formData.append("dob", userProfile?.dob ?? "");
        formData.append("goal", userProfile?.goal ?? "");


        try {
            const res = await fetch(BASE_URL+`/profile/saveProfile`, {
                method: "POST",
                headers: {
                    //   "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            if (res.ok) {
                console.log(res.status)
                Alert.alert("Profile", "profile updated success");
                router.back();
            } else {
                console.error("❌ Failed to fetch user:", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error fetching user:", err);
        }
    }



    return (

        <ModalWrapper style={{ backgroundColor: colors.neutral900 }}  >
            <View style={styles.container} >
                <Header
                    title="Activate You Financy Wallet"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                <Typo color={colors.neutral400} style={{ margin: spacingY._20, alignContent: "center" }}>
                    Verify your details
                </Typo>

                <View style={styles.inputContainer} >
                    <Typo color={colors.black} >Email</Typo>
                    <Input
                        placeholder='100'
                        value={user?.email}
                        onChange={() => { }}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Typo color={colors.black}>Mobile</Typo>
                    {userProfile?.mobileNo ? (
                        <Input
                            placeholder={userProfile.mobileNo}
                            value={userProfile.mobileNo}
                        />
                    ) : (
                        <Input
                            placeholder="Enter mobile number"
                            value={mobile}
                            keyboardType="number-pad"
                            maxLength={10} // ✅ hard limit at input level
                            onChangeText={(text) =>
                                setMobile(text.replace(/[^0-9]/g, '').slice(0, 10))
                            }
                        />
                    )}
                </View>

                {/*  OTP validation code for future  */}
                {/* <View>
                    <Input
                        placeholder='Enter your 6-digit OTP'
                        onChangeText={(value) => (otpRef.current = value)}
                        icon={<Icons.NumberCircleSixIcon
                            size={verticalScale(26)}
                            color={colors.neutral300}
                            weight='fill'
                        />}
                    />
                    <Button
                        onPress={() => otpsent ? verifyOTP() : sendOTPToMobile()}
                    >
                        {otpsent ? (
                            <Typo
                                fontWeight={"700"}
                                color={colors.black}
                                size={21}
                            >
                                Verify
                            </Typo>
                        ) : (
                            <Typo
                                fontWeight={"700"}
                                color={colors.black}
                                size={21}
                            >
                                Send OTP
                            </Typo>
                        )}

                    </Button>
                </View> */}


                <View style={{ margin: spacingY._20, alignContent: "center" }} >
                    <Button
                        onPress={() => createWallets()}
                    >
                        <Typo
                            fontWeight={"700"}
                            color={colors.black}
                            size={21}
                        >
                            Open Your Financy Wallet
                        </Typo>
                    </Button>
                </View>


            </View>
        </ModalWrapper>
    )
}

export default activateFwallet


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
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