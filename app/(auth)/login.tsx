import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useContext, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
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

            // Send data to your backend API
            const response = await fetch("http://192.168.0.181:9090/auth/login", {
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



    return (
        <ScreenWrapper>
            <View style={styles.container}>
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
                    <Typo size={14} color={colors.text} style={{ alignSelf: 'flex-end' }} >
                        Forgot Password?
                    </Typo>

                    <Button
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