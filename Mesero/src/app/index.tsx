import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Text, View, StyleSheet } from "react-native";

const PROD_WEB_URL = "https://despliegue-expo-go-testeo.vercel.app/";

export default function Index() {
  const [didAutoOpen, setDidAutoOpen] = useState(false);

  const openProdWeb = useCallback(async () => {
    await WebBrowser.openBrowserAsync(PROD_WEB_URL);
  }, []);

  useEffect(() => {
    if (didAutoOpen) return;
    setDidAutoOpen(true);
    void openProdWeb();
  }, [didAutoOpen, openProdWeb]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesero</Text>
      <Text style={styles.subtitle}>Abrir web en producción</Text>
      <View style={styles.spacer} />
      <Button title="Abrir" onPress={openProdWeb} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  spacer: {
    height: 16,
  },
});
