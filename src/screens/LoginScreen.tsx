import React, { useState, useEffect} from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import * as Font from 'expo-font';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: { setIsLoggedIn: (value: boolean) => void };
    Signup: { setIsLoggedIn: (value: boolean) => void };
    MainApp: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {

    const [fontsLoaded, setFontsLoaded] = useState(false);

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

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const route = useRoute();
    const { setIsLoggedIn } = route.params as RootStackParamList['Login'];

    const handleLogin = () => {
        if (email === '' || password === '') {
            setError('Please fill in all fields');
            return;
        }
        console.log('Logged in with:', email, password);
        setError('');
        setIsLoggedIn(true);
    }

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <Text style={styles.title}>DigiClo</Text>
            <View style={styles.form}>
                <Text style={styles.header}>Login</Text>

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    style={styles.input}
                />

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                
                <Text style={styles.footer}>
                    Don’t have an account?{' '}
                <Text
                    style={styles.link}
                    onPress={() => navigation.navigate('Signup', { setIsLoggedIn })}
                >
                    Sign up
                </Text>
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    title: { fontFamily: 'Inter-Bold', fontSize: 32, fontWeight: 'bold', color: '#172251', textAlign: 'center', marginBottom: 20 },
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
    buttonText: {
        fontFamily: 'Inter-Bold',
        color: 'white',
        fontSize: 16,
    },
    error: { fontFamily: 'Inter-Regular', color: 'red', marginBottom: 10 },
    footer: { fontFamily: 'Inter-Regular', color: 'black', marginTop: 20, textAlign: 'center' },
    link: {
        fontFamily: 'Inter-Regular',
        fontWeight: 'bold',
        color: '#4B6599',
    },
});
