import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { BASE_URL } from '@/config/api'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { accountOptionType } from '@/types'
import { verticalScale } from '@/utils/styling'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import { useFocusEffect, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { AuthContext } from '../(auth)/authProvider'


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

const Profile = () => {

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setToken } = useContext(AuthContext);
  const [refresh, setRefresh] = useState(false);
  

  const getProfileImage = (file: any) => {
    if (file && typeof file == 'string') return file;
    if (file && typeof file == 'object') return file.url;

    return require('../../assets/images/defaultAvatar.png')
  }

   useEffect(() => {
      const fetchUser = async () => {
        const token = await SecureStore.getItemAsync("jwtToken")
        // console.log("sayan model "+token)
        try {
          const res = await fetch(BASE_URL+`/user/getUserByToken`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach only if token exists
            },
          });
          if (res.ok) {
            const data = await res.json(); // ✅ parse JSON
            setUser(data); // ✅ Save in state
            console.log(data)
            await SecureStore.setItemAsync("user", JSON.stringify(user));// console.log("✅ User email set in localStorage:", data.email, data.username);
          } else {
            console.error("❌ Failed to fetch user:", res.status);
          }
        } catch (err) {
          console.error("⚠️ Error fetching user:", err);
        } finally {
          setLoading(false);
        }
      }
  
      const fetchProfile = async () => {
  
        const token = await SecureStore.getItemAsync("jwtToken")
        // console.log(" the token is " + token)
  
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
          setLoading(false);
        }
      }
  
      fetchProfile();
      fetchUser(); 
    }, [refresh]);
  
    useFocusEffect(
      useCallback(() => {
        setRefresh((prev) => !prev);
      }, [])
    );
  
 
  const accountOptions: accountOptionType[] = [
    {
      title: "Edit Profile",
      icon: <Icons.UserIcon size={26} color={colors.white} weight='fill' />,
      routeName: '/(modals)/profileModal',
      bgColor: "#6366f1"
    },
    {
      title: "Settings",
      icon: <Icons.GearSixIcon size={26} color={colors.white} weight='fill' />,
      routeName: '/(modals)/settingModal',
      bgColor: "#059669"
    },
    {
      title: "Privacy Policy",
      icon: <Icons.LockIcon size={26} color={colors.white} weight='fill' />,
      routeName: '/(modals)/policyModal',
      bgColor: colors.neutral600
    },
    {
      title: "Logout",
      icon: <Icons.PowerIcon size={26} color={colors.white} weight='fill' />,
      // routeName: '/(modals)/profileModal',
      bgColor: "#e11d48"
    },
  ]

  if (loading) return <Typo>Loading...</Typo>;

  const handleLogout = async () => {
    setToken(null);
    
    // Clear SecureStore
    await SecureStore.deleteItemAsync("jwtToken");

    // Clear AsyncStorage
    await AsyncStorage.clear();

    // Clear localStorage (only works on web)
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }

    Alert.alert("Logout", "login in again");

  }

  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => console.log('cancel logout'),
        style: 'cancel'
      },
      {
        text: "Logout",
        onPress: () => handleLogout(),
        style: 'destructive'
      }
    ])
  }

  const handlePress = (item: accountOptionType) => {
    if (item.title == "Logout") {
      showLogoutAlert();
    }

    if (item.routeName) router.push(item.routeName);

  }

  return (
    <ScreenWrapper>
      <View style={styles.container} >
        <Header title='Profile' style={{ marginVertical: spacingY._25}} />
        {/* user info  */}
        <View style={styles.userInfo} >

          {/* avatar  */}
          <View  >
            <Image
              // source={userProfile?userProfile.profilePic: "../../assets/images/defaultAvatar.png" }
              source={userProfile?.profilePic ? BASE_URL+"/images/profilePic/" + userProfile.profilePic : "https://picsum.photos/seed/696/3000/2000"}
              style={styles.avatar}
              contentFit='cover'
              transition={100}
            />
          </View>

          {/* name & email  */}
          <View style={styles.nameContainer} >
            <Typo size={24} fontWeight={"600"}
              color={colors.neutral100}
            >
              {user?.username}
            </Typo>
            <Typo size={15}
              color={colors.neutral400}
            >
              {user?.email}
            </Typo>
          </View>

          {/* account options  */}
          <View style={styles.accountOption} >
            {accountOptions.map((item, index) => {
              return (
                <Animated.View
                  key={index.toString()}
                  entering={FadeInDown.delay(index * 50)
                    .springify()
                    .damping(14)
                  }
                  style={styles.listItem} >
                  <TouchableOpacity
                    onPress={() => handlePress(item)}
                    style={styles.flexRow} >
                    {/* icons  */}
                    <View style={[styles.listIcon,
                    { backgroundColor: item.bgColor }
                    ]}>
                      {item.icon && item.icon}
                    </View>
                    <Typo
                      size={16} style={{ flex: 1 }} fontWeight={"500"}
                    >{item.title}</Typo>
                    <Icons.CaretRightIcon
                      size={verticalScale(20)}
                      weight='bold'
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  userInfo: {
    marginTop: verticalScale(30),
    // alignItems: "center",
    gap: spacingY._15
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: "center"
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    borderCurve: "continuous"
  },
  listItem: {
    marginBottom: verticalScale(17)
  },
  accountOption: {
    marginTop: spacingY._35
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
})