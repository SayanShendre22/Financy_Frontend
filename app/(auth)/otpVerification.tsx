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
import React, { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'


// const OTPVerification: React.FC<OTPVerificationProps> = ({ handleRegisterSubmit, email }) => {
const OTPVerification = () => {

    const router = useRouter();
    const otpRef = useRef("");

    // const { UnVerifiedEmail, name, password } = useLocalSearchParams<{
    //     UnVerifiedEmail?: string;
    //     name?: string;
    //     password?: string;
    // }>();


    const [isLoading, setLoading] = useState(false);

    const handlesubmit = async () => {

        if (!otpRef.current) {
            Alert.alert("Login", "Please fill all the fields");
            return;
        }

        const storedData = await SecureStore.getItemAsync("unregistrestUser")

        if (storedData) {
            const user = JSON.parse(storedData);
            console.log("User data 1 : ", user);

            console.log("otp is : ", otpRef.current)
            console.log("email is : ", user.email)
            console.log("good to goo")

            setLoading(true)
            // OTP Verification
            try {
                const response = await fetch(BASE_URL+'/auth/validateOtp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: user.email,
                        otp: otpRef.current
                    })
                });
                setLoading(false)

                if (!response.ok) {
                    alert("Invalid OTP")
                } else {
                    // registering user here

                    // Send data to your backend API
                    const response = await fetch(BASE_URL+"/auth/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(user),
                    })
                    setLoading(false)
                    const result = await response.json()
                    console.log(result)

                    if (!response.ok) {
                        // Backend returned an error
                        Alert.alert("SignUp Error", result.message || "Something went wrong!")
                    } else {
                        // Success - store token securely
                        await SecureStore.setItemAsync("userToken", result.token)
                        Alert.alert("Success", "User registered successfully!")
                        router.replace('/(tabs)/home')
                    }

                }


            } catch (error) {
                console.error('Error:', error);
            }

        }

    }

    return (
        <ScreenWrapper>
            <View style={[ styles.container, { marginTop: spacingY._40 }]}>
                <BackButton iconSize={28} />

                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={30} fontWeight={"800"} >
                        OTP
                    </Typo>
                    <Typo size={30} fontWeight={"800"} >
                        Verification
                    </Typo>
                </View>

                {/* form  */}
                <View style={styles.form}>
                    <Typo size={16} color={colors.textLight} >
                        Please veriiy your email through otp
                    </Typo>
                    {/* input  */}
                    <Input
                        placeholder='Enter your 6-digit OTP'
                        onChangeText={(value) => (otpRef.current = value)}
                        icon={<Icons.NumberCircleSixIcon
                            size={verticalScale(26)}
                            color={colors.neutral300}
                            weight='fill'
                        />}
                    />

                    <Typo size={14} color={colors.text} style={{ alignSelf: 'flex-end' }} >
                        Resend OTP
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
                            Verify
                        </Typo>
                    </Button>

                </View>

                {/* footer  */}
                <View style={styles.footer}>
                    <Typo size={15}>Wrong email? </Typo>
                    <Pressable
                        onPress={() => router.replace('/(auth)/register')}  >
                        <Typo size={15} fontWeight={"700"} color={colors.primary}>
                            Enter it again
                        </Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default OTPVerification;

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