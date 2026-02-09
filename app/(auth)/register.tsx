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
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import { AuthContext } from './authProvider'


const register = () => {

    const router = useRouter();
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const nameRef = useRef("");
    const [isLoading, setLoading] = useState(false);
    const { setToken } = useContext(AuthContext);


    async function handlesubmit() {

        setLoading(true)

        try {
            // Prepare the data to send
            const data = {
                username: nameRef.current,
                email: emailRef.current,
                password: passwordRef.current,
            }

            // Send data to your backend API
            const response = await fetch("http://192.168.0.181:9090/auth/register", {
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
                Alert.alert("SignUp Error", result.message || "Something went wrong!")
            } else {
                // Success - store token securely
                await SecureStore.setItemAsync("jwtToken", result.token)
                setToken(result.token);
                Alert.alert("Success", "User registered successfully!")
                router.replace('/(tabs)/home')
            }
        } catch (error) {
            console.error("Signup Error:", error)
            Alert.alert("SignUp Error", "Network error or server unavailable")
        } finally {
            setLoading(false)
        }
    }

    const handleOnRegisteration = async () => {

        if (!emailRef.current || !passwordRef.current || !nameRef.current) {
            Alert.alert("SignUp", "Please fill all the fields")
            return
        }

        setLoading(true)
        //sending otp
        try {
            const response = await fetch(BASE_URL+`/auth/send-otp?email=${emailRef.current}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Failed to send OTP. Please try again.');
            } else {
                alert("OTP sent successfully!")
                // navigate to OTP screen and pass the props
                const data = {
                    username: nameRef.current,
                    email: emailRef.current,
                    password: passwordRef.current,
                }

                console.log("before otp ",data)

                await SecureStore.setItemAsync("unregistrestUser",JSON.stringify(data));

                // router.push((`/(auth)/otpVerification/${emailRef.current}/${nameRef.current}/${passwordRef.current}`) as any);
                router.push('/(auth)/otpVerification')
            }

        } catch (error) {
            console.error('Error:', error);

        }

        setLoading(false);


    }

    return (
        <ScreenWrapper>
            <View style={[styles.container, { marginTop: spacingY._40 }]} >
                <BackButton iconSize={28} />

                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={30} fontWeight={"800"} >
                        Let's
                    </Typo>
                    <Typo size={30} fontWeight={"800"} >
                        Get Started
                    </Typo>
                </View>

                {/* form  */}
                <View style={styles.form}>
                    <Typo size={16} color={colors.textLight} >
                        Create your account to track your expenses
                    </Typo>
                    {/* input  */}
                    <Input
                        placeholder='Enter your name'
                        onChangeText={(value) => (nameRef.current = value)}
                        icon={<Icons.UserIcon
                            size={verticalScale(26)}
                            color={colors.neutral300}
                            weight='fill'
                        />}
                    />
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

                    <Button
                        loading={isLoading}
                        onPress={handleOnRegisteration}
                    >
                        <Typo
                            fontWeight={"700"}
                            color={colors.black}
                            size={21}
                        >
                            Sign up
                        </Typo>
                    </Button>

                </View>

                {/* footer  */}
                <View style={styles.footer}>
                    <Typo size={15}>Already have a account?</Typo>
                    <Pressable onPress={() => router.replace('/(auth)/login')}  >
                        <Typo size={15} fontWeight={"700"} color={colors.primary}  >
                            Login up
                        </Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default register

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