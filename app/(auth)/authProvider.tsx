import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
    token: null,
    setToken: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter(); // ✅ useRouter hook
    const segments = useSegments(); // tells which layout/route is mounted

    // Load token from AsyncStorage on app start
    useEffect(() => {
        const loadToken = async () => {
            const savedToken = await AsyncStorage.getItem('jwtToken');
            setToken(savedToken);
        };
        loadToken();
    }, []);

    // Watch token changes
    useEffect(() => {
        if (segments.length > 0 && !token) {
            router.replace("/(auth)/login");
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};
