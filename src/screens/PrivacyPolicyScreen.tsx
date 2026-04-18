import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const EFFECTIVE_DATE = 'April 18, 2026';
const CONTACT_EMAIL = 'privacy@restaurantmatcher.app';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.meta}>
          Restaurant Matcher · Version {APP_VERSION}{'\n'}Effective: {EFFECTIVE_DATE}
        </Text>

        <Section title="1. Introduction">
          <Paragraph>
            Restaurant Matcher ("we", "our", or "the app") helps groups of people discover and agree
            on nearby restaurants. This Privacy Policy explains what information we collect, why we
            collect it, and how it is used.
          </Paragraph>
          <Paragraph>
            By using Restaurant Matcher, you agree to the practices described in this policy.
          </Paragraph>
        </Section>

        <Section title="2. Information We Collect">
          <Paragraph>We collect only the minimum data needed to operate the app:</Paragraph>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Display name</Text> — the name you enter when
            starting or joining a session. This is visible to other session participants only.
          </Bullet>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Precise location</Text> — used once per session to
            find nearby restaurants. Location is not stored on our servers; it is used only to query
            the Google Places API.
          </Bullet>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Session votes</Text> — your restaurant
            yes/no votes are stored temporarily in our database to enable real-time matching with your
            group. Sessions are not linked to any persistent identity.
          </Bullet>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Anonymous device identifier</Text> — Firebase
            generates an anonymous, randomly-assigned ID for your device. This ID has no connection
            to your name, email, or any personal account.
          </Bullet>
        </Section>

        <Section title="3. Information We Do NOT Collect">
          <Bullet>We do not collect your email address or phone number.</Bullet>
          <Bullet>We do not require account registration.</Bullet>
          <Bullet>We do not track your location continuously or in the background.</Bullet>
          <Bullet>We do not sell or share your data with advertisers.</Bullet>
          <Bullet>We do not use your data for profiling or targeted advertising.</Bullet>
          <Bullet>We do not access your camera, microphone, or photos.</Bullet>
        </Section>

        <Section title="4. How We Use Your Information">
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Location</Text> — sent to Google Places API to
            return a list of nearby restaurants. We do not store your location coordinates on our
            servers.
          </Bullet>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Display name &amp; votes</Text> — stored in Firebase
            Firestore for the duration of your session so that all participants can see group
            consensus in real time.
          </Bullet>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Calendar access</Text> — used only when you
            explicitly tap "Add to Calendar." We never read your existing calendar events.
          </Bullet>
        </Section>

        <Section title="5. Third-Party Services">
          <Paragraph>
            Restaurant Matcher relies on the following third-party services, each with their own
            privacy policies:
          </Paragraph>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Google Places API &amp; Maps SDK</Text> — provides
            restaurant data and maps. Subject to Google's Privacy Policy
            (policies.google.com/privacy).
          </Bullet>
          <Bullet>
            <Text style={{ fontWeight: '700' }}>Firebase (Google)</Text> — provides our real-time
            database and anonymous authentication. Subject to Google's Privacy Policy.
          </Bullet>
        </Section>

        <Section title="6. Data Retention">
          <Paragraph>
            Session data (names and votes) is retained in Firebase Firestore indefinitely unless
            manually purged. We recommend completing or abandoning sessions rather than leaving them
            open. Future app versions will automatically expire sessions after 24 hours.
          </Paragraph>
        </Section>

        <Section title="7. Children's Privacy">
          <Paragraph>
            Restaurant Matcher is not directed at children under 13. We do not knowingly collect
            personal information from children. If you believe a child has provided us with data,
            please contact us and we will delete it promptly.
          </Paragraph>
        </Section>

        <Section title="8. Your Rights">
          <Paragraph>
            Because we do not collect personal accounts or emails, we cannot link a request to a
            specific user. However:
          </Paragraph>
          <Bullet>
            You can uninstall the app to stop all data collection immediately.
          </Bullet>
          <Bullet>
            Deleting and reinstalling the app generates a new anonymous Firebase ID, effectively
            removing any prior linkage.
          </Bullet>
          <Bullet>
            EU/EEA residents with specific requests may contact us at the address below.
          </Bullet>
        </Section>

        <Section title="9. Security">
          <Paragraph>
            We use Firebase's built-in security and Firestore Security Rules to protect session data.
            All data is transmitted over HTTPS. However, no method of transmission over the internet
            is 100% secure.
          </Paragraph>
        </Section>

        <Section title="10. Changes to This Policy">
          <Paragraph>
            We may update this policy from time to time. When we do, we will revise the "Effective"
            date at the top. Continued use of the app after changes constitutes acceptance of the
            updated policy.
          </Paragraph>
        </Section>

        <Section title="11. Contact Us">
          <Paragraph>
            Questions about this Privacy Policy? Contact us at:{'\n'}
            <Text style={styles.email}>{CONTACT_EMAIL}</Text>
          </Paragraph>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 28,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF6B35',
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  email: {
    color: '#FF6B35',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
