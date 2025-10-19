import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router, useFocusEffect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as Icons from 'phosphor-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

interface UserProfile {
  fullname: string;
  address: string;
  job: string;
  salary: string;
  mobileNo: string;
  dob: string;
  profilePic: any;
  goal: string;
  PP: any,
}

interface User {
  email: string,
  username: string,
}


const ProfileModal = () => {

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refresh, setRefresh] = useState(false);


  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    })
    console.log(result);
    if (!result.canceled) {
      console.log("here")
      const imageUri = result.assets[0].uri;
      setUserProfile(prev =>
        prev ? { ...prev, profilePic: imageUri } : null
      );
      console.log("Picked Image URI: ", imageUri);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = await SecureStore.getItemAsync("jwtToken")
      // console.log("sayan model "+token)
      try {
        const res = await fetch(`http://192.168.0.181:9090/user/getUserByToken`, {
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
        const res = await fetch(`http://192.168.0.181:9090/profile/getProfile`, {
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


  const onSubmit = async () => {
    if (user) {
      let username = user?.username;
      if (!username.trim()) {
        Alert.alert("User", "Please fill all the fields")
        return;
      }
    }

    const token = await SecureStore.getItemAsync("jwtToken")
    console.log('profile pic ', userProfile?.profilePic)

    const formData = new FormData();

    formData.append("fullname", user?.username ?? "")
    formData.append("address", userProfile?.address ?? "");
    formData.append("job", userProfile?.job ?? "");
    formData.append("salary", userProfile?.salary ?? "");
    formData.append("mobileNo", userProfile?.mobileNo ?? "");
    formData.append("dob", userProfile?.dob ?? "");
    formData.append("goal", userProfile?.goal ?? "");
    formData.append("PP", {
      uri: userProfile?.profilePic,
      type: "image/jpeg", // or get from picker result
      name: "profile.jpg",
    } as any);

    try {
      const res = await fetch(`http://192.168.0.181:9090/profile/saveProfile?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
        body: formData,
      });
      if (res.ok) {
        console.log(res.status)
        Alert.alert("Profile","profile updated success");
        router.back();
      } else {
        console.error("❌ Failed to fetch user:", res.status);
      }
    } catch (err) {
      console.error("⚠️ Error fetching user:", err);
    }


  }

  const [loading, setLoading] = useState(false);

  return (
    <ModalWrapper>
      <View style={styles.container} >
        <Header
          title="Update Profile"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* form  */}
        <ScrollView contentContainerStyle={styles.form}  >
          <View style={styles.avatarContainer} >
            <Image
              style={styles.avatar}
              // source={{uri:"http://192.168.0.181:9090/images/profilePic/" + userProfile?.profilePic}}
              source={{ uri: userProfile?.profilePic }}
              contentFit="cover"
              transition={100}
            />

            <TouchableOpacity onPress={pickImage} style={styles.editIcon}  >
              <Icons.PencilIcon
                size={verticalScale(20)}
                color={colors.neutral800}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer} >
            <Typo color={colors.neutral200} >Name</Typo>
            <Input
              placeholder='Name'
              value={user?.username}
              onChangeText={(value) =>
                setUser(prev => ({
                  email: prev?.email || "",
                  username: value
                }))
              }
            />
          </View>

        </ScrollView>
      </View>

      <View style={styles.footer} >
        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }} >
          <Typo
            color={colors.black} fontWeight={"700"}
          >
            Update
          </Typo>
        </Button>
      </View>

    </ModalWrapper>
  )
}

export default ProfileModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
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
  }
})