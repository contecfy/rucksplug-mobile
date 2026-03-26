import React, { useState } from "react";
import { StyleSheet, View, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "prizmux";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth-store";

const { width } = Dimensions.get("window");

const SLIDES = [
    {
        title: "Welcome to Rucks Plug",
        description: "A private financial services platform focused on accessible lending and investment opportunities.",
        image: require("@/assets/images/icon.png"),
    },
    {
        title: "Visionary Ecosystem",
        description: "To build a trusted and scalable financial ecosystem that empowers individuals to grow their money.",
        image: require("@/assets/images/icon.png"), // Reusing icon as placeholder
    },
    {
        title: "Responsible Lending",
        description: "Standardized repayment structures and disciplined capital management to ensure sustainability.",
        image: require("@/assets/images/icon.png"),
    }
];

export default function Onboarding() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const { setHasSeenOnboarding } = useAuthStore();
    const [currentSlide, setCurrentSlide] = useState(0);

    const cardBackground = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const buttonBackground = useThemeColor({}, 'tint');
    const buttonText = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const background = useThemeColor({}, 'background');

    const handleNext = async () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            await setHasSeenOnboarding(true);
            router.push("/(auth)/login");
        }
    };

    const handleSkip = async () => {
        await setHasSeenOnboarding(true);
        router.push("/(auth)/login");
    };

    const slide = SLIDES[currentSlide];

    return (
        <ThemedView style={styles.container}>
            <View style={styles.imageContainer}>
                <Image 
                    source={slide.image} 
                    style={[styles.image, { tintColor: textColor }]} 
                    resizeMode="contain" 
                />
            </View>

            <View style={[styles.card, { backgroundColor: cardBackground }]}>
                <ThemedText type="boldPrecision" style={styles.title}>{slide.title}</ThemedText>
                <ThemedText type="precision" style={styles.description}>{slide.description}</ThemedText>
                
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View 
                            key={index} 
                            style={[
                                styles.dot, 
                                index === currentSlide ? styles.activeDot : styles.inactiveDot
                            ]} 
                        />
                    ))}
                </View>

                <Button 
                    title={currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"} 
                    onPress={handleNext} 
                    fullWidth
                    borderRadius={12}
                    style={{ backgroundColor: buttonBackground } as any}
                    textStyle={{ color: buttonText, fontFamily: 'Inter_600SemiBold' }}
                />
                
                {currentSlide < SLIDES.length - 1 && (
                    <Button 
                        title="Skip" 
                        variant="outline" 
                        onPress={handleSkip}
                        fullWidth
                        style={[{ marginTop: 12, borderWidth: 1 }, { borderColor: textColor }] as any}
                        textStyle={{ color: textColor }}
                        borderRadius={12}
                    />
                )}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "space-between",
        paddingBottom: 40,
    },
    imageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width * 0.6,
        height: width * 0.6,
    },
    card: {
        padding: 30,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    title: {
        textAlign: "center",
        marginBottom: 16,
    },
    description: {
        textAlign: "center",
        opacity: 0.7,
        lineHeight: 22,
        marginBottom: 30,
    },
    pagination: {
        flexDirection: "row",
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#0a7ea4', // Keeping brand color for active dot if desired, or use tintColor
        width: 20,
    },
    inactiveDot: {
        backgroundColor: '#D1D1D1', // Use mutedText?
    },
    skipButton: {
        marginTop: 12,
        borderWidth: 1,
    }
});
