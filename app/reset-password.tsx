import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import { parseAuthLink } from "@/lib/authLink";
import { friendlyError } from "@/lib/errors";
import { validatePassword } from "@/lib/validation";
import { styles } from "@/theme/styles";
import { colors } from "@/theme/colors";
import { Brand } from "@/components/Brand";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";

type Phase = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordScreen() {
  const url = Linking.useURL();
  const [phase, setPhase] = useState<Phase>("checking");
  const [problem, setProblem] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string | null; confirm?: string | null }>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Turn the emailed link into a temporary recovery session.
  useEffect(() => {
    let active = true;
    (async () => {
      const link = parseAuthLink(url);
      try {
        if (link?.kind === "code") {
          const { error } = await supabase.auth.exchangeCodeForSession(link.code);
          if (error) throw error;
        } else if (link?.kind === "tokens") {
          const { error } = await supabase.auth.setSession({ access_token: link.accessToken, refresh_token: link.refreshToken });
          if (error) throw error;
        } else if (link?.kind === "error") {
          throw new Error(link.message);
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) { if (url !== null) { setProblem("This reset link is missing or has expired. Request a new one."); setPhase("invalid"); } return; }
        }
        if (active) setPhase("ready");
      } catch (err) {
        if (active) { setProblem(friendlyError(err, "This reset link is invalid or has expired. Request a new one.")); setPhase("invalid"); }
      }
    })();
    return () => { active = false; };
  }, [url]);

  async function save() {
    const e = { password: validatePassword(password), confirm: confirm === password ? null : "Passwords do not match." };
    setErrors(e); setFormError(null);
    if (e.password || e.confirm) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setFormError(friendlyError(error, "Could not update your password. Please try again."));
      else { setPhase("done"); }
    } catch (err) { setFormError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 26 }} keyboardShouldPersistTaps="handled">
        <Brand subtitle="ACCOUNT RECOVERY" />
        <Text style={styles.authTitle}>Choose a new password</Text>
        {phase === "checking" ? <View style={{ marginTop: 24 }}><ActivityIndicator color={colors.accentSoft} /></View> : null}
        {phase === "invalid" ? <><Banner kind="error" text={problem ?? "Invalid link."} /><Button title="Request a new link" onPress={() => router.replace("/(auth)/forgot-password")} /></> : null}
        {phase === "ready" ? <>
          <Field label="NEW PASSWORD" placeholder="8+ characters, letters and numbers" secure textContentType="newPassword" value={password} onChangeText={setPassword} error={errors.password} />
          <Field label="CONFIRM PASSWORD" placeholder="Repeat password" secure textContentType="newPassword" value={confirm} onChangeText={setConfirm} error={errors.confirm} onSubmitEditing={save} />
          {formError ? <Banner kind="error" text={formError} /> : null}
          <Button title="Update password" onPress={save} loading={busy} />
        </> : null}
        {phase === "done" ? <><Banner kind="success" text="Your password has been updated." /><Button title="Continue" onPress={() => router.replace("/")} /></> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
