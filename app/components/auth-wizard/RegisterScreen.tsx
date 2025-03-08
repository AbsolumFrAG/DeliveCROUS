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

// Type pour la navigation spécifique à l'écran d'inscription
type RegisterNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const navigation = useNavigation<RegisterNavigationProp>();
  const { register, isLoading } = useAuth();

  /**
   * Gère le processus d'inscription
   * Valide les entrées et redirige vers la connexion en cas de succès
   */
  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Tous les champs sont requis");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    setFormSubmitting(true);
    try {
      await register(email, password);
      Alert.alert("Succès", "Votre compte a été créé avec succès", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Une erreur est survenue lors de l'inscription"
      );
    } finally {
      setFormSubmitting(false);
    }
  }

  // État combiné pour afficher le loader pendant le chargement
  const showLoader = isLoading || formSubmitting;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!showLoader}
      />

      {showLoader ? (
        <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
      ) : (
        <Button title="S'inscrire" onPress={handleRegister} />
      )}

      <View style={styles.loginContainer}>
        <Text>Déjà un compte? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          disabled={showLoader}
        >
          <Text style={[styles.loginLink, showLoader && styles.disabledLink]}>
            Se connecter
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginLink: {
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
