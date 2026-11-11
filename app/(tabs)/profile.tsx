import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { useAuth } from "@/context/AuthContext";
import { deleteAccount, fetchProfile, updateProfile } from "@/lib/api";
import { friendlyError } from "@/lib/errors";
import { validateDisplayName, validateUsername } from "@/lib/validation";
import { styles } from "@/theme/styles";
import { colors } from "@/theme/colors";

const DELETE_PHRASE = "DELETE";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState({ username: "", displayName: "" });
  const [errors, setErrors] = useState<{ username?: string | null; displayName?: string | null }>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setLoadError(null);
    try {
      const p = await fetchProfile(userId);
      const u = p?.username ?? ""; const d = p?.display_name ?? "";
      setUsername(u); setDisplayName(d); setSaved({ username: u, displayName: d });
    } catch (e) { setLoadError(friendlyError(e, "Could not load your profile.")); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const dirty = username.trim() !== saved.username || displayName.trim() !== saved.displayName;

  async function save() {
    if (!userId) return;
    const e = { username: validateUsername(username), displayName: validateDisplayName(displayName) };
    setErrors(e); setMsg(null);
    if (e.username || e.displayName) return;
    setSaving(true);
    try {
      const u = username.trim(); const d = displayName.trim();
      await updateProfile(userId, { username: u || null, display_name: d || null });
      setSaved({ username: u, displayName: d }); setUsername(u); setDisplayName(d);
      setMsg({ kind: "success", text: "Profile updated." });
    } catch (err) { setMsg({ kind: "error", text: friendlyError(err, "Could not save your profile.") }); }
    finally { setSaving(false); }
  }

  function confirmSignOut() {
    Alert.alert("Sign out?", "You will need to sign in again to use StreamVerse.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: async () => {
        setSigningOut(true);
        try { await signOut(); } // route guard moves to the login screen
        catch (err) { setMsg({ kind: "error", text: friendlyError(err, "Sign out failed. Please try again.") }); setSigningOut(false); }
      } }
    ]);
  }

  async function doDelete() {
    if (phrase.trim() !== DELETE_PHRASE) return;
    setDeleting(true); setDeleteError(null);
    try { await deleteAccount(); } // signs out afterwards; route guard returns to login
    catch (err) { setDeleteError(friendlyError(err, "Could not delete your account. Please try again.")); setDeleting(false); }
  }

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const initials = (displayName || username || user?.email || "SV").trim().slice(0, 2).toUpperCase();
  const memberSince = user?.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : null;

  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>Your profile</Text>
      <View style={styles.profileCard}>
        <Text style={styles.avatar}>{initials}</Text>
        <Text style={styles.sectionTitle}>{displayName || username || "StreamVerse member"}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
        {memberSince ? <Text style={[styles.muted, { fontSize: 12 }]}>Member since {memberSince}</Text> : null}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Profile details</Text>
      {loading ? <ActivityIndicator color={colors.accentSoft} style={{ marginTop: 14 }} /> : <>
        {loadError ? <><Banner kind="error" text={loadError} /><Button title="Retry" onPress={load} variant="secondary" /></> : <>
          <Field label="DISPLAY NAME" placeholder="Your name" value={displayName} onChangeText={setDisplayName} maxLength={50} error={errors.displayName} />
          <Field label="USERNAME" placeholder="3–24 letters, numbers, underscores" autoCapitalize="none" autoCorrect={false} value={username} onChangeText={setUsername} maxLength={24} error={errors.username} />
          {msg ? <Banner kind={msg.kind} text={msg.text} /> : null}
          <Button title="Save changes" onPress={save} loading={saving} disabled={!dirty} />
        </>}
      </>}

      <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Activity</Text>
      <Button title="View recent activity" onPress={() => router.push("/recent")} variant="secondary" />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Privacy</Text>
        <Text style={styles.noticeText}>
          StreamVerse stores your email, optional profile name, saved services and recently opened services, protected so that only your account can read them.{"\n\n"}
          We never ask for your Netflix, Spotify or other provider passwords; those sign-ins happen on the provider’s own app or site.{"\n\n"}
          Deleting your account permanently removes all of this data.
        </Text>
      </View>

      <Button title="Sign out" onPress={confirmSignOut} loading={signingOut} variant="secondary" />

      <Text style={[styles.sectionTitle, { marginTop: 30, color: colors.danger }]}>Danger zone</Text>
      {!confirmingDelete ? <Button title="Delete account" onPress={() => setConfirmingDelete(true)} variant="danger" /> : <View>
        <Banner kind="error" text="This permanently deletes your account, saved services and activity. It cannot be undone." />
        <Field label={`TYPE ${DELETE_PHRASE} TO CONFIRM`} autoCapitalize="characters" autoCorrect={false} value={phrase} onChangeText={setPhrase} />
        {deleteError ? <Banner kind="error" text={deleteError} /> : null}
        <Button title="Permanently delete my account" onPress={doDelete} loading={deleting} disabled={phrase.trim() !== DELETE_PHRASE} variant="danger" />
        <Button title="Cancel" onPress={() => { setConfirmingDelete(false); setPhrase(""); setDeleteError(null); }} disabled={deleting} variant="secondary" />
      </View>}

      <Text style={[styles.muted, { textAlign: "center", marginTop: 28 }]}>StreamVerse v{version}</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}
