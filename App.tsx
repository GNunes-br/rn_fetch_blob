import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';

const pdfUrl: string = 'http://www.africau.edu/images/default/sample.pdf';

const App = () => {
  const [filePath, setFilePath] = useState<string>('');
  const [fileExists, setFileExists] = useState<boolean>(false);

  useEffect(() => {
    RNFetchBlob.fs
      .exists(filePath)
      .then(exist => {
        setFileExists(exist);
      })
      .catch(e => {
        setError(e);
      });
  }, [filePath]);

  const pathToSave: string =
    Platform.OS === 'ios'
      ? RNFetchBlob.fs.dirs.DocumentDir
      : RNFetchBlob.fs.dirs.DownloadDir;

  async function handleOnRequest() {
    try {
      const rnFetchBlob: RNFetchBlob = RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          mediaScannable: true,
          title: 'test',
          mime: 'application/pdf',
          path: `${pathToSave}/test.pdf`,
        },
      });

      const response = await rnFetchBlob.fetch('GET', pdfUrl, {});

      setFilePath(response.path());
      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        await RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (error) {
      ToastAndroid.show(error.message, 5000);
    }
  }

  async function handleOnOpenFile() {
    try {
      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        await RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (error) {
      ToastAndroid.show(error.message, 5000);
    }
  }

  async function handleOnShareFile() {
    try {
      await Share.open({
        url: `file://${filePath}`,
      });
    } catch (error) {
      ToastAndroid.show(error.message, 5000);
    }
  }

  function renderButton(text: string, onPress: () => void, disabled = false) {
    return (
      <TouchableOpacity
        style={disabled ? styles.disabledButton : styles.button}
        onPress={onPress}
        disabled={disabled}>
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.page}>
      {fileExists
        ? renderButton('Abrir', handleOnOpenFile)
        : renderButton('Baixar', handleOnRequest)}
      {renderButton('Compartilhar', handleOnShareFile, !fileExists)}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#61DAFB',
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#D9D9D9',
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});
