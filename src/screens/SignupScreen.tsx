import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView } from 'react-native';

type Props = {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    switchToLogin: () => void;
};

const SignupScreen : React.FC<Props> = ({setIsLoggedIn, switchToLogin}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleSignup = () => {
        if (email === '' || password === '' || confirmPassword === '') {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        console.log('Signed up with:', email, password);
        setError('');
        setIsLoggedIn(true);
    }

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <Text style={styles.title}>DigiClo</Text>
            <View style={styles.form}>
                <Text style={styles.header}>Create an Account</Text>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    placeholder = "Enter your email"
                    value = {email}
                    onChangeText = {setEmail}
                    keyboardType='email-address'
                    style = {styles.input}
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    placeholder = "Enter your password"
                    value = {password}
                    onChangeText = {setPassword}
                    secureTextEntry
                    style = {styles.input}
                />
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    placeholder = "Confirm your password"
                    value = {confirmPassword}
                    onChangeText = {setConfirmPassword}
                    secureTextEntry
                    style = {styles.input}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title="Sign Up" onPress={handleSignup} />
                <Text style={styles.footer} onPress={switchToLogin}>
                    Already have an account? Login
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    title: { fontSize: 32, fontWeight: 'bold', color: '#61dafb', textAlign: 'center', marginBottom: 20 },
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white'},
    form: { backgroundColor: '#282c34', padding: 20, borderRadius: 10 },
    header: { color: 'white', fontSize: 24, marginBottom: 20 },
    label: { color: 'white', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: 'white',padding: 10, marginBottom: 10, borderRadius: 5 },
    error: { color: 'red', marginBottom: 10 },
    footer: { color: 'white', marginTop: 20, textAlign: 'center' },
});