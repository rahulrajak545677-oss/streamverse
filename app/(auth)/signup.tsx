import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import { friendlyError } from "@/lib/errors";
import { normalizeEmail, validateEmail, validatePassword } from "@/lib/validation";
import { styles } from "@/theme/styles";
import { Brand } from "@/components/Brand";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null; confirm?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function signUp() {
    const e = { email: validateEmail(email), password: validatePassword(password), confirm: confirm === password ? null : "Passwords do not match." };
    setErrors(e); setFormError(null); setNotice(null);
    if (e.email || e.password || e.confirm) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: normalizeEmail(email), password });
      if (error) setFormError(friendlyError(error, "Could not create your account. Please try again."));
      // With email confirmation on, an already-registered address returns a user with no identities.
      else if (data.user && data.user.identities && data.user.identities.length === 0) setFormError("An account with this email already exists. Try signing in.");
      else if (!data.session) setNotice("Check your inbox and confirm your email address, then sign in.");
      // If a session was returned, the route guard moves to the tabs automatically.
    } catch (err) {
      setFormError(friendlyError(err));
    } finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#080812" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 26 }} keyboardShouldPersistTaps="handled">
        <Brand subtitle="JOIN THE UNIVERSE" />
        <Text style={styles.authTitle}>Create account</Text>
        <Text style={styles.muted}>One account for your saved services and activity.</Text>
        <Field label="EMAIL" placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" value={email} onChangeText={setEmail} error={errors.email} />
        <Field label="PASSWORD" placeholder="8+ characters, letters and numbers" secure textContentType="newPassword" autoComplete="password-new" value={password} onChangeText={setPassword} error={errors.password} />
        <Field label="CONFIRM PASSWORD" placeholder="Repeat password" secure textContentType="newPassword" value={confirm} onChangeText={setConfirm} error={errors.confirm} onSubmitEditing={signUp} />
        {formError ? <Banner kind="error" text={formError} /> : null}
        {notice ? <Banner kind="success" text={notice} /> : null}
        <Button title="Create account" onPress={signUp} loading={busy} />
        <Text style={[styles.muted, { marginTop: 18, textAlign: "center" }]}>Already registered? <Link href="/(auth)/login" style={styles.link}>Sign in</Link></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
