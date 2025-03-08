import { Stack } from "expo-router";

/**
 * Layout racine définissant la configuration globale de navigation
 * pour l'application en utilisant Expo Router
 * 
 * Ce composant configure un navigateur Stack sans en-têtes par défaut
 * pour toutes les routes de l'application.
 */
export default function RootLayout() {
  // Retourne un navigateur Stack avec l'option d'en-tête désactivée par défaut
  return <Stack screenOptions={{ headerShown: false }} />;
}
