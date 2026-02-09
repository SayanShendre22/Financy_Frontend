import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import bookData from "../../config/QuickLessonsData/RDPD.json"
import { BookLessons } from "../../types"


const learn = () => {

    const data = bookData as BookLessons;

    const openArticle = (aid: number) => {
        router.push({
            pathname: '/(modals)/articlePage',
            params: {
                aid: aid + "",
            }
        })
    }

    return (

        <ModalWrapper style={{ backgroundColor: colors.neutral900 }}  >
            <View style={styles.container} >
                <Header
                    title="Learn And Earn"
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._20 }}
                />

                <View style={{ alignItems: "center", marginBottom: spacingY._10 }} >
                    <Typo color={colors.neutral400} >
                        Quick Finance Lessons
                    </Typo>
                    <View style={{ flexDirection: "row" }}>
                        <Typo color={colors.neutral400} fontWeight={"600"}>
                            {data.book}
                        </Typo>
                        <Typo color={colors.neutral400} fontWeight={"400"} >
                            {" " + data.author_style}
                        </Typo>
                    </View>

                    <Typo color={colors.neutral400} fontWeight={"600"}
                    style={{ alignItems: "center", textAlign:"center" }}
                    >
                        {bookData.summary}
                    </Typo>

                    <View style={{ flexDirection: "row", margin: spacingY._15, gap: scale(10) }} >
                     
                     <FlatList
                            data={bookData.lessons}
                            showsVerticalScrollIndicator={false}
                            horizontal
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: colors.neutral800,
                                        padding: spacingY._15,
                                        paddingTop:spacingX._20,
                                        paddingBottom:spacingX._20,
                                        borderRadius: radius._15,
                                        marginRight: scale(10), // spacing between cards
                                        width: scale(220) // IMPORTANT for horizontal layout
                                    }}
                                    onPress={() => openArticle(item.id)}
                                >
                                    <Typo fontWeight="700" >Chapter {item.id}
                                    </Typo>
                                    <Typo color={colors.neutral400} >
                                        {item.title}
                                    </Typo>
                                   <View style={{flexDirection:"row", marginTop:spacingX._5}} >
                                     <Typo color={colors.neutral500} >
                                        Earn 
                                    </Typo>
                                    <Typo  color={colors.gold} >
                                        {" "+10*item.id} Coins
                                    </Typo>
                                   </View>
                                </TouchableOpacity>
                            )}
                        />

                    </View>

                </View>

                <View style={{ alignItems: "center" }} >
                    <Typo color={colors.neutral400} >
                        Today's Finance Articles
                    </Typo>

                    {/* here will be the list of articles in vertical scrolling */}
                    <View style={{ flexDirection: "row", marginTop: spacingY._15, gap: scale(10) }} >

                        <ScrollView
                            contentContainerStyle={styles.scrollViewStyle2}
                            showsVerticalScrollIndicator={false}
                        >
                            <Typo style={{textAlign:"center"}} >
                                Available Soon
                            </Typo>

                        </ScrollView>

                    </View>

                </View>

            </View>
        </ModalWrapper>
    )
}

export default learn


const styles = StyleSheet.create({
    scrollViewStyle: {
        flexDirection: 'row',     // ✅ required for horizontal items
        marginTop: spacingY._10,
        paddingBottom: verticalScale(100),
        gap: spacingY._25
    },
    scrollViewStyle2: {
        flexDirection: 'column',
        marginTop: spacingY._10,
        paddingBottom: verticalScale(100),
        gap: spacingY._25
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