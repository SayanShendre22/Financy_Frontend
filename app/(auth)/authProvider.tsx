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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem("jwtToken");
      setToken(savedToken);
      setIsLoading(false);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (token && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [token, isLoading, segments]);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
