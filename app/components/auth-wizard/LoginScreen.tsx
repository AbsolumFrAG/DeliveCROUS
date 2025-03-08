import useAuth from "@/app/context/AuthContext";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Type pour la navigation spécifique à l'écran de connexion
type LoginNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { login, isLoading } = useAuth();
  const navigation = useNavigation<LoginNavigationProp>();

  /**
   * Gère le processus de connexion
   * Valide les entrées et affiche les erreurs appropriées
   */
  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez saisir votre email et mot de passe");
      return;
    }

    setFormSubmitting(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Une erreur est survenue lors de la connexion"
      );
    } finally {
      setFormSubmitting(false);
    }
  }

  // État combiné pour afficher le loader pendant le chargement
  const showLoader = isLoading || formSubmitting;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!showLoader}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!showLoader}
      />
      {showLoader ? (
        <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} />
      )}
      <View style={styles.registerContainer}>
        <Text>Pas encore de compte? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          disabled={showLoader}
        >
          <Text
            style={[styles.registerLink, showLoader && styles.disabledLink]}
          >
            S'inscrire
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerLink: {
    color: "#0066CC",
    fontWeight: "bold",
  },
  disabledLink: {
    opacity: 0.5,
  },
  loader: {
    marginVertical: 12,
  },
});
