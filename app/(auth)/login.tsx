import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useContext, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { commingsoon } from '../(modals)/settingModal'
import { AuthContext } from './authProvider'




const login = () => {

    const router = useRouter();
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [isLoading, setLoading] = useState(false);
    const { setToken } = useContext(AuthContext);


    async function handlesubmit() {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("SignUp", "Please fill all the fields")
            return
        }
        setLoading(true)
        try {
            // Prepare the data to send
            const data = {
                email: emailRef.current,
                password: passwordRef.current,
            }
            const LOGIN_URL = BASE_URL+"/auth/login";
            

            // Send data to your backend API
            const response = await fetch(LOGIN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            setLoading(false)
            const result = await response.json()
            console.log(result)

            if (!response.ok) {
                // Backend returned an error
                Alert.alert("Login Error", result.message || "Something went wrong!")
            } else {
                // Success - store token securely
                SecureStore.setItemAsync("jwtToken", result.token)
                setToken(result.token);
                Alert.alert("Success", "User Login successfully!")
                console.log("login success");
                router.replace('/(tabs)/home')
            }
        } catch (error) {
            console.error("Signup Error:", error)
            Alert.alert("Login Error", "Network error or server unavailable")
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async () => {

        const token = await SecureStore.getItemAsync("jwtToken")
        const formData = new FormData();

        formData.append("fullname", "");
        formData.append("address", "");
        formData.append("job", "");
        formData.append("salary", "");
        formData.append("mobileNo", "");
        formData.append("dob", "");
        formData.append("goal", "");

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
                // router.back();
            } else {
                console.error("❌ Failed to fetch user:", res.status);
            }
        } catch (err) {
            console.error("⚠️ Error fetching user:", err);
        }
    }



    return (
        <ScreenWrapper>
            <View style={[styles.container, { marginTop: spacingY._40 }]}>
                <BackButton iconSize={28} />

                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={30} fontWeight={"800"} >
                        Hey,
                    </Typo>
                    <Typo size={30} fontWeight={"800"} >
                        Welcome Back
                    </Typo>
                </View>

                {/* form  */}
                <View style={styles.form}>
                    <Typo size={16} color={colors.textLight} >
                        Login now to track all your expenses
                    </Typo>
                    {/* input  */}
                    <Input
                        placeholder='Enter your email'
                        onChangeText={(value) => (emailRef.current = value)}
                        icon={<Icons.AtIcon
                            size={verticalScale(26)}
                            color={colors.neutral300}
                            weight='fill'
                        />}
                    />
                    <Input
                        placeholder='Enter your password'
                        secureTextEntry
                        onChangeText={(value) => (passwordRef.current = value)}
                        icon={<Icons.LockIcon
                            size={verticalScale(26)}
                            color={colors.neutral300}
                            weight='fill'
                        />}
                    />
                    <TouchableOpacity
                    onPress={commingsoon}
                    >
                        <Typo size={14} color={colors.text} style={{ alignSelf: 'flex-end' }} >
                        Forgot Password?
                    </Typo>

                    </TouchableOpacity>
                    <Button
                        style={{
                            paddingHorizontal: 24,      // ✅ REQUIRED
                            minWidth: 120,
                        }}
                        loading={isLoading}
                        onPress={handlesubmit}
                    >
                        <Typo
                            fontWeight={"700"}
                            color={colors.black}
                            size={21}
                        >
                            Login
                        </Typo>
                    </Button>

                    {/* <Button
                        style={{
                            paddingHorizontal: 24,      // ✅ REQUIRED
                            minWidth: 120,
                        }}
                        loading={isLoading}
                        onPress={updateProfile}
                    >
                        <Typo
                            fontWeight={"700"}
                            color={colors.black}
                            size={21}
                        >
                            create profile
                        </Typo>
                    </Button> */}

                </View>

                {/* footer  */}
                <View style={styles.footer}>
                    <Typo size={15}>Don't have a account?</Typo>
                    <Pressable
                        onPress={() => router.replace('/(auth)/register')}  >
                        <Typo size={15} fontWeight={"700"} color={colors.primary}  >Sign up</Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default login

const styles = StyleSheet.create({

    container: {
        flex: 1,
        gap: spacingY._30,
        paddingHorizontal: spacingX._20
    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: "bold",
        color: colors.text,
    },
    form: {
        gap: spacingY._20
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: "500",
        color: colors.text,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
    footerText: {
        textAlign: "center",
        color: colors.text,
        fontSize: verticalScale(15)
    },
});