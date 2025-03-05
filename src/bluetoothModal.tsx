import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Button, Dimensions } from "react-native";
import { useBluetoothContext } from "./useBluetooth";


const BluetoothOverlay = () => {
    const [isPopupVisible, setPopupVisible] = useState(true);
    const {
        device,
        isConnected,
        proceedToFindDeviceAndConnect,
    } = useBluetoothContext();



    const handleReconnect = async () => {
        console.log("THIS IS CLICKED")
        proceedToFindDeviceAndConnect();
    };
    if (device && isConnected) {
        return null
    }

    const togglePopup = () => {
        setPopupVisible(!isPopupVisible);
    };

    return (
        <View style={styles.container}>
            <Modal
                visible={isPopupVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={togglePopup}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.popupContainer}>
                        <Text style={styles.popupText}>Bluetooth device is not detected!</Text>

                        <View style={styles.inlineButtonsContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleReconnect}>
                                <Text style={styles.popupButtonText}>Reconnect</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={togglePopup}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    inlineButtonsContainer: {
        flexDirection: 'row', // Align buttons horizontally
        justifyContent: 'center', // Add space between buttons
        width: '100%',
        marginBottom: 10,
    },
    popupButton: {
        backgroundColor: '#34c759',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    popupButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    popupContainer: {
        width: Dimensions.get('window').width * 0.8, // 80% of screen width
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    popupText: {
        fontSize: 18,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        margin:5,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default BluetoothOverlay;