import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BACKEND_URL } from '../config';

type RootStackParamList = {
    Login: { setIsLoggedIn: (value: boolean) => void };
    Signup: { setIsLoggedIn: (value: boolean) => void };
    MainApp: undefined;
};

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

interface ErrorResponse {
    message?: string;
    error?: string;
}

const SignupScreen = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<SignupScreenNavigationProp>();
    const route = useRoute();
    const { setIsLoggedIn } = route.params as RootStackParamList['Signup'];
    
    useEffect(() => {
        Font.loadAsync({
            'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
            'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
            'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
            'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
        })
        .then(() => setFontsLoaded(true))
        .catch(err => console.warn('Font load error: ', err));
    }, []);

    const handleSignup = async () => {
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
                email,
                password,
                username
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            console.log('✅ Signup response:', response.data);
            
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            setIsLoggedIn(true);
        } catch (error) {
            console.error('❌ Signup error:', error);
            Alert.alert('Error', 'Failed to sign up. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#172251" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <Text style={styles.title}>DIGICLO</Text>
            <View style={styles.form}>
                <Text style={styles.header}>Create an Account</Text>
                
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUserName}
                    style={styles.input}
                    editable={!isLoading}
                />
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    style={styles.input}
                    editable={!isLoading}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    editable={!isLoading}
                />
                <TextInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={styles.input}
                    editable={!isLoading}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleSignup}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.footer}>
                    Already have an account?{' '}
                    <Text style={styles.link} onPress={() => navigation.navigate('Login', { setIsLoggedIn })}>
                        Login
                    </Text>
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: { fontFamily: 'Inter-Bold', fontSize: 32, color: '#172251', textAlign: 'center', marginBottom: 20 },
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: 'white'},
    form: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
    header: { fontFamily: 'Inter-SemiBold', color: '#293869', fontSize: 20, marginBottom: 20 },
    input: { 
        fontFamily: 'Inter-Regular',
        backgroundColor: 'white',
        borderWidth: 1, 
        borderColor: 'white',
        padding: 10, 
        marginBottom: 10, 
        borderRadius: 5,
        color: '#3A4E81',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        backgroundColor: '#172251',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontFamily: 'Inter-Bold',
        color: 'white',
        fontSize: 16,
    },
    error: { fontFamily: 'Inter-Regular', color: '#BF0E26', marginBottom: 10 },
    footer: { fontFamily: 'Inter-Regular', color: '#293869', marginTop: 20, textAlign: 'center' },
    link: {
        fontFamily: 'Inter-Bold',
        color: '#4B6599',
    },
});
