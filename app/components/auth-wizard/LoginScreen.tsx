import useAuth from "@/app/context/AuthContext";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { login, isLoading } = useAuth();
  const navigation = useNavigation<LoginNavigationProp>();

  /**
   * Gère le processus de connexion
   * Valide les entrées et affiche les erreurs appropriées
   */
  async function handleLogin() {
    // Feedback haptique
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>DeliveCROUS</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Connexion</Text>

            <View style={styles.inputContainer}>
              <FontAwesome
                name="envelope"
                size={18}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!showLoader}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome
                name="lock"
                size={18}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!showLoader}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={showLoader}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={18}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, showLoader && styles.disabledButton]}
              onPress={handleLogin}
              disabled={showLoader}
              activeOpacity={0.8}
            >
              {showLoader ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pas encore de compte? </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("Register");
                }}
                disabled={showLoader}
              >
                <Text
                  style={[
                    styles.registerLink,
                    showLoader && styles.disabledLink,
                  ]}
                >
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0066CC",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  passwordInput: {
    paddingRight: 40,
  },
  showPasswordButton: {
    position: "absolute",
    right: 12,
    height: 48,
    justifyContent: "center",
  },
  loginButton: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#A0C8E6",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  registerText: {
    fontSize: 15,
    color: "#666",
  },
  registerLink: {
    fontSize: 15,
    color: "#0066CC",
    fontWeight: "bold",
  },
  disabledLink: {
    opacity: 0.5,
  },
});
