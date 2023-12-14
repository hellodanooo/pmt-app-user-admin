// src/screen/QReader.tsx
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

interface QRReaderProps {
  onQRCodeScanned: (code: string) => void;
}

const QRReader: React.FC<QRReaderProps> = ({ onQRCodeScanned }) => {
  const onSuccess = (e: any) => {
    onQRCodeScanned(e.data);
    Linking.openURL(e.data).catch(err =>
      console.error('An error occured', err)
    );
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.torch}
      topContent={
        <Text style={styles.centerText}>
          Scan the QR code.
        </Text>
      }
      bottomContent={
        <TouchableOpacity style={styles.buttonTouchable}>
          <Text style={styles.buttonText}>OK. Got it!</Text>
        </TouchableOpacity>
      }
      cameraType='back'
      cameraStyle={styles.cameraStyle}
    />
  );
};

const styles = StyleSheet.create({
  centerText: {
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  },
  cameraStyle: {
    // Add your styling here
  }
});

export default memo(QRReader);