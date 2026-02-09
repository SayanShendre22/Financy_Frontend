import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'


export const commingsoon=()=>{
        Alert.alert("Comming Soon","This feature will be available soon to you.");
    }

const settingModal = () => {

    return (

        <ModalWrapper style={{ backgroundColor: colors.neutral900 }}  >
            <View style={styles.container} >
                <Header
                    title="Settings"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._20 }}
                />

                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    gap: verticalScale(15),
                    flexWrap: "wrap"
                }}>

                    <TouchableOpacity style={styles.itemBox} 
                    onPress={commingsoon}
                    >
                        <Typo color={colors.black}  fontWeight={"700"} >
                            Change Password
                        </Typo>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.itemBox} 
                     onPress={commingsoon}
                    >
                        <Typo color={colors.black}  fontWeight={"700"} >
                           Enable/Disable Financy Wallet
                        </Typo>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.itemBox} 
                     onPress={commingsoon}
                    >
                        <Typo color={colors.black}  fontWeight={"700"} >
                           Light Mode
                        </Typo>
                    </TouchableOpacity>

                  
                </View>

            </View>
        </ModalWrapper>
    )
}

export default settingModal


const styles = StyleSheet.create({
    itemBox: {
        backgroundColor:colors.primary,
        borderRadius:verticalScale(15),
        margin: verticalScale(10),
        padding: verticalScale(20),
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(40)
    },
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