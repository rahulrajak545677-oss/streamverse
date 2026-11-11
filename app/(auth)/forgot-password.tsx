import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { Link } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import { friendlyError } from "@/lib/errors";
import { normalizeEmail, validateEmail } from "@/lib/validation";
import { styles } from "@/theme/styles";
import { Brand } from "@/components/Brand";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function send() {
    const e = validateEmail(email);
    setEmailError(e); setFormError(null); setSent(false);
    if (e) return;
    setBusy(true);
    try {
      // Must be listed under Authentication → URL Configuration → Redirect URLs in Supabase.
      const redirectTo = Linking.createURL("reset-password");
      const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo });
      if (error) setFormError(friendlyError(error, "Could not send the reset email. Please try again."));
      else setSent(true); // Same message whether or not the account exists (no account enumeration).
    } catch (err) {
      setFormError(friendlyError(err));
    } finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#080812" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 26 }} keyboardShouldPersistTaps="handled">
        <Brand subtitle="ACCOUNT RECOVERY" />
        <Text style={styles.authTitle}>Reset password</Text>
        <Text style={styles.muted}>Enter your email and we’ll send you a link to choose a new password.</Text>
        <Field label="EMAIL" placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" value={email} onChangeText={setEmail} error={emailError} onSubmitEditing={send} />
        {formError ? <Banner kind="error" text={formError} /> : null}
        {sent ? <Banner kind="success" text="If an account exists for that email, a reset link is on its way. Open it on this device." /> : null}
        <Button title="Send reset link" onPress={send} loading={busy} />
        <Text style={[styles.muted, { marginTop: 18, textAlign: "center" }]}><Link href="/(auth)/login" style={styles.link}>Back to sign in</Link></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
