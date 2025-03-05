import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useBluetoothContext } from './useBluetooth';

const BluetoothScreen = () => {
    const {
        device,
        isConnected,
        bleStatus,
        scanForDevices,
        connectToDevice,
        proceedToFindDeviceAndConnect,
        disconnectFromDevice,
        reset,
        registerOnDataReceivedById,
        unregisterOnDataReceivedById
    } = useBluetoothContext();

    const [variables, setVariables] = useState<Record<string, string>>({});


    const handleDataReceived = (message: string) => {
        const splittedString = message.split('=')
        if (splittedString.length == 0) {
            return
        }
        const [key, value] = splittedString
        setVariables(prev => ({ ...prev, [key]: value }))
    };

    useEffect(() => {
        const id = "SETTING" + Date.now()
        registerOnDataReceivedById(id, handleDataReceived)
        console.log("REGISTER SETTING CALLBACK")
        return () => unregisterOnDataReceivedById(id)
    }, [])

    const handleReset = () => {
        setVariables({})
        reset()
    };

    return (
        <View style={styles.container}>
            <Text style={styles.status}>{bleStatus}</Text>
            <View style={styles.buttons}>
                <View style={styles.button}>
                    <Button title="SCAN" color="#036" onPress={scanForDevices} />
                </View>
                <View style={styles.button}>
                    <Button title="SCAN & CONNECT" color="#036" onPress={() => proceedToFindDeviceAndConnect()} />
                </View>
                {device && !isConnected && (
                    <View style={styles.button}>
                        <Button title="CONNECT" color="#036" onPress={() => connectToDevice()} />
                    </View>
                )}
                {device && isConnected && (
                    <View style={styles.button}>
                        <Button title="DISCONNECT" color="#036" onPress={disconnectFromDevice} />
                    </View>
                )}
                <View style={styles.button}>
                    <Button title="RESET" color="#036" onPress={handleReset} />
                </View>

            </View>
            <TextInput
                style={styles.textArea}
                value={Object.keys(variables).map(key => `${key}=${variables[key]}`).join('\n')}
                placeholder="Received messages will appear here"
                multiline
                editable={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    status: {
        marginBottom: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0ef'
    },
    textArea: {
        width: '100%',
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        marginTop: 10,
        color: 'white',
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
    },
    button: {
        padding: 5,
        height: 50
    }
});

export default BluetoothScreen;
