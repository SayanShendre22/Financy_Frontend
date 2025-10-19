import { expenseCategories } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { TransactionItemProps, TransactionListType, TransactionType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { FlashList } from "@shopify/flash-list"
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Loading from './Loading'
import Typo from './Typo'



const TransactionList = ({
    data,
    title,
    loading,
    emptyListMessage,
}: TransactionListType) => {

    const openWallet = () => {

    }

    const handleClick = (item: TransactionType) => {
        // console.log("clicked ", item);
        router.push({
            pathname: '/(modals)/transactionModal',
            params: {
                id: String(item.id),
                amount: String(item.amount),
                category: String(item.category),
                description: String(item.description),
                recipt: String(item.recipt),
                timestamp: String(item.timestamp),
                type: String(item.type),
            },
        });
    };

    useEffect(() => {

    }, []);

    return (
        <View style={styles.container} >
            {title && (
                <Typo size={20} fontWeight={"500"} >
                    {title}
                </Typo>
            )}

            <View>
                <FlashList
                    data={data}
                    renderItem={({ item, index }) => (
                        <TransactionItem item={item}
                            index={index}
                            handleClick={handleClick}
                        />)}
                // estimateitemSize={60}
                />

            </View>

            {!loading && data.length == 0 && (
                <Typo
                    size={15}
                    color={colors.neutral400}
                    style={{ textAlign: "center", marginTop: spacingY._15, }}
                >
                    {emptyListMessage}
                </Typo>
            )}

            {loading && (
                <View style={{ top: verticalScale(100) }} >
                    <Loading />
                </View>
            )}


        </View>
    );
}

const TransactionItem = ({
    item, index, handleClick
}: TransactionItemProps) => {
    // console.log(item.category)
    let category = expenseCategories[item.category];
    //  let category = incomeCategory;
    const IconComponent = category.icon || "";

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100)}
        >
            <TouchableOpacity style={styles.row} onPress={() => handleClick(item)} >
                <View style={[styles.icon, { backgroundColor: category.bgColor }]} >
                    {IconComponent && (
                        <IconComponent
                            size={verticalScale(25)}
                            weight='fill'
                            color={colors.white}
                        />
                    )}
                </View>

                <View style={styles.categoriesDes} >
                    <Typo size={17} >{item.category}</Typo>
                    <Typo size={12} color={colors.neutral400}
                        textProps={{ numberOfLines: 1 }} >
                        {item.description}
                    </Typo>
                </View>
                <View style={styles.amountDate} >
                    {item.type == "expense" ? (
                        <Typo fontWeight={"500"} color={colors.rose} >
                            - {item.amount} rs
                        </Typo>
                    ) :
                        <Typo fontWeight={"500"} color={colors.primary} >
                            + {item.amount} rs
                        </Typo>
                    }
                    <Typo size={13} color={colors.neutral400} >
                        {item.timestamp
                            ? new Date(item.timestamp).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                            })
                            : ""}
                    </Typo>
                </View>

            </TouchableOpacity>
        </Animated.View>
    )
}

export default TransactionList

const styles = StyleSheet.create({

    container: {
        gap: spacingY._17,
    },
    list: {
        minHeight: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacingX._12,
        marginBottom: spacingY._12,

        // list with background
        backgroundColor: colors.neutral800,
        padding: spacingY._10,
        paddingHorizontal: spacingY._10,
        borderRadius: radius._17
    },
    icon: {
        height: verticalScale(44),
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: radius._12,
        borderCurve: "continuous"
    },
    categoriesDes: {
        flex: 1,
        gap: 2.5
    },
    amountDate: {
        alignItems: "flex-end",
        gap: 3,
    }

})