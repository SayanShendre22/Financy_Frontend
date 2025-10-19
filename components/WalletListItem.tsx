import { colors, radius, spacingX } from '@/constants/theme'
import { WalletType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import { Router } from 'expo-router'
import * as Icons from 'phosphor-react-native'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
// import { walletLogos } from "../constants/data"
import Typo from './Typo'


// Import all possible bank logos statically
// import axisLogo from "../assets/bank_logos/hdfc.png"
import hdfcLogo from "../assets/bank_logos/hdfc.png"
import iciciLogo from "../assets/bank_logos/icici.png"
import defaultLogo from "../assets/bank_logos/other.png"
import sbiLogo from "../assets/bank_logos/sbi.png"

// Create a mapping
const walletLogos: Record<string, any> = {
  hdfc: hdfcLogo,
  icici: iciciLogo,
  sbi: sbiLogo,
//   axis: axisLogo,
};

const WalletListItem = ({
    item,
    index,
    router
}: {
    item: WalletType,
    index: number,
    router: Router
}) => {

const openWallet = () =>{
    router.push({
      pathname: '/(modals)/walletModal',
      params: {
        id:item?.id,
        name:item?.bankName,
        balance:item?.balance,
        type:item?.accountType,
        accNo:item?.accountNumber,
        ifsc:item?.ifscCode
      }
    })
  }



    return (
        <Animated.View
        entering={FadeInDown.delay(index*50)
            .springify()
            .damping(13)
        }
        >
            <TouchableOpacity style={styles.container} onPress={openWallet} >
                <View style={styles.imageContainer} >
                    <Image
                        style={{flex:1}}
                        source={walletLogos[item?.bankName.toLowerCase()] || defaultLogo}
                        contentFit='cover'
                        transition={100}
                    />
                </View>
                <View style={styles.namecontainer} >
                    <Typo size={16} >{item?.bankName.toUpperCase()}</Typo>
                    <Typo size={14} color={colors.neutral400} >{item?.balance}</Typo>
                </View>

                <Icons.CaretRightIcon
                size={verticalScale(20)}
                weight='bold'
                color={colors.white}
                />

            </TouchableOpacity>
        </Animated.View>
    )
}

export default WalletListItem

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        alignItems: "center",
        marginBottom: verticalScale(17)
    },
    imageContainer: {
        height: verticalScale(45),
        width: verticalScale(45),
        borderWidth: 1,
        borderColor: colors.neutral600,
        borderRadius: radius._12,
        borderCurve:"continuous",
        overflow: "hidden"
    },
    namecontainer: {
        flex: 1,
        gap:2,
        marginLeft:spacingX._10
    }
})