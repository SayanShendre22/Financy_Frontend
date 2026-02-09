import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import { AuthProvider } from './(auth)/authProvider'


// const StackLayout = () => {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen
//         name='(modals)/profileModal'
//         options={{
//           presentation: "modal",
//           animation: 'fade_from_bottom'
//         }}
//       />
//     </Stack>
//   )
// }

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name='(modals)/profileModal'
          options={{
            presentation: "modal",
            // animation: ''
          }}
        />
        <Stack.Screen
          name='(modals)/walletModal'
          options={{
            presentation: "modal",
            // animation: ''
          }}
        />
        <Stack.Screen
          name='(modals)/transactionModal'
          options={{
            presentation: "modal",
            // animation: ''
          }}
        />
        <Stack.Screen
          name='(modals)/searchModal'
          options={{
            presentation: "modal",
            // animation: ''
          }}
        />
         <Stack.Screen
          name='(modals)/financyWallet'
          options={{
            presentation: "modal",
            // animation: ''
          }}
        />
      </Stack>
      
    </AuthProvider>
  )
}

const styles = StyleSheet.create({})