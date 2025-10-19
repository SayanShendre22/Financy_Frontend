import { HeaderProps } from '@/types'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Typo from './Typo'

const Header = ({ title = "", leftIcon, style }: HeaderProps) => {
  return (
    <View>
      {leftIcon &&
        <Typo style={styles.leftIcon} >
          {leftIcon}
        </Typo>}
      {title && (
        <Typo
          size={22}
          fontWeight={"600"}
          style={{
            textAlign: "center",
            width: leftIcon ? "82%" : "100%"
          }}
        >
          {title}
        </Typo>
      )
      }
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row"
  },
  leftIcon: {
    alignItems: 'flex-start'
  },
})