import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    MainApp: undefined;
};

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const SignupScreen = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<SignupScreenNavigationProp>();
    const { signUp } = useAuth();

    useEffect(() => {
        Font.loadAsync({
            'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
            'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
            'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
            'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
        })
        .then(() => setFontsLoaded(true))
        .catch(err => console.warn('Font load error:', err));
    }, []);

    const handleSignup = async () => {
        if (email === '' || password === '' || confirmPassword === '') {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await signUp(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <Text style={styles.title}>DIGICLO</Text>
            <View style={styles.form}>
                <Text style={styles.header}>Create an Account</Text>

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    style={styles.input}
                    editable={!loading}
                />

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    editable={!loading}
                />
                
                <TextInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={styles.input}
                    editable={!loading}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleSignup}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.footer}>
                    Already have an account?{' '}
                    <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                        Login
                    </Text>
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    title: { fontFamily: 'Inter-Bold', fontSize: 32, color: '#172251', textAlign: 'center', marginBottom: 20 },
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: 'white'},
    form: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
    header: { fontFamily: 'Inter-SemiBold', color: '#293869', fontSize: 20, marginBottom: 20 },
    label: { fontFamily: 'Inter-Regular', color: 'white', marginBottom: 5 },
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
