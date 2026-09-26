/* eslint-disable react-refresh/only-export-components -- lazy-loaded on demand, never hot-reloaded as a component module */
/**
 * PDF version of the resume, rendered in the browser with @react-pdf/renderer (free, no server).
 * Loaded on demand (dynamic import) so the PDF engine never weighs down other pages.
 * Uses the built-in Helvetica font: Latin text only (react-pdf cannot shape Bangla script).
 */
import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { Resume } from './schema';

const GREEN = '#006a4e';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#14201b', lineHeight: 1.4 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold' },
  headline: { fontSize: 11, color: GREEN, marginTop: 2 },
  contact: { marginTop: 6, color: '#5b6660' },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#dde3df',
    paddingBottom: 3,
    marginBottom: 6,
  },
  itemTitle: { fontFamily: 'Helvetica-Bold' },
  muted: { color: '#5b6660' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { marginBottom: 6 },
  skills: { flexDirection: 'row', flexWrap: 'wrap' },
  skill: { marginRight: 10, marginBottom: 3 },
});

function ResumeDocument({ resume }: { resume: Resume }) {
  const contact = [resume.email, resume.phone, resume.location].filter(Boolean).join('  ·  ');
  const education = resume.education.filter((e) => e.degree || e.institution);
  const experience = resume.experience.filter((e) => e.role || e.organization);

  return (
    <Document title={resume.fullName ? `${resume.fullName} - Resume` : 'Resume'} creator="Bondhu">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.fullName || 'Your Name'}</Text>
        {resume.headline && <Text style={styles.headline}>{resume.headline}</Text>}
        {contact && <Text style={styles.contact}>{contact}</Text>}

        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text>{resume.summary}</Text>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((e, i) => (
              <View key={i} style={styles.item} wrap={false}>
                <View style={styles.row}>
                  <Text style={styles.itemTitle}>
                    {e.role}
                    {e.organization ? `, ${e.organization}` : ''}
                  </Text>
                  <Text style={styles.muted}>{e.period}</Text>
                </View>
                {e.description && <Text>{e.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((e, i) => (
              <View key={i} style={[styles.item, styles.row]} wrap={false}>
                <Text>
                  <Text style={styles.itemTitle}>{e.degree}</Text>
                  {e.institution ? `, ${e.institution}` : ''}
                </Text>
                <Text style={styles.muted}>{e.year}</Text>
              </View>
            ))}
          </View>
        )}

        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skills}>
              {resume.skills.map((s, i) => (
                <Text key={i} style={styles.skill}>
                  • {s}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

/** Render the resume to a PDF and trigger a download. */
export async function downloadResumePdf(resume: Resume) {
  const blob = await pdf(<ResumeDocument resume={resume} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(resume.fullName || 'resume').replace(/[^\w-]+/g, '_')}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
