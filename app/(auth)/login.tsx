import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { Link } from "expo-router";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { friendlyError } from "@/lib/errors";
import { normalizeEmail, validateEmail } from "@/lib/validation";
import { styles } from "@/theme/styles";
import { Brand } from "@/components/Brand";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function signIn() {
    const e = { email: validateEmail(email), password: password ? null : "Enter your password." };
    setErrors(e); setFormError(null);
    if (e.email || e.password) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
      if (error) setFormError(friendlyError(error, "Sign in failed. Please try again."));
      // On success the session listener updates AuthContext and the route guard moves to the tabs.
    } catch (err) {
      setFormError(friendlyError(err));
    } finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#080812" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 26 }} keyboardShouldPersistTaps="handled">
        <Brand subtitle="YOUR ENTERTAINMENT UNIVERSE" />
        <Text style={styles.authTitle}>Welcome back</Text>
        <Text style={styles.muted}>Sign in to continue to StreamVerse.</Text>
        {!isSupabaseConfigured ? <Banner kind="error" text="Supabase is not configured. Copy .env.example to .env and add your project URL and anon key." /> : null}
        <Field label="EMAIL" placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" value={email} onChangeText={setEmail} error={errors.email} />
        <Field label="PASSWORD" placeholder="Your password" secure textContentType="password" autoComplete="password" value={password} onChangeText={setPassword} error={errors.password} onSubmitEditing={signIn} />
        {formError ? <Banner kind="error" text={formError} /> : null}
        <Button title="Sign in" onPress={signIn} loading={busy} />
        <Text style={[styles.muted, { marginTop: 18, textAlign: "center" }]}><Link href="/(auth)/forgot-password" style={styles.link}>Forgot password?</Link></Text>
        <Text style={[styles.muted, { textAlign: "center" }]}>New to StreamVerse? <Link href="/(auth)/signup" style={styles.link}>Create an account</Link></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
