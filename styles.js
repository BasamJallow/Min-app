import { StyleSheet } from 'react-native';

const LIME = '#a3e635';
const LIME_DARK = '#65a30d';
const BG = '#0f1521';
const CARD = '#1a2333';
const BORDER = '#2a3648';
const TEXT = '#f1f5f9';
const MUTED = '#94a3b8';
const CORAL = '#fb7185';
const FLAME = '#fb923c';
const LOCK = '#334155';
const LOCK_DARK = '#1e293b';

export const palette = { LIME, LIME_DARK, BG, CARD, BORDER, TEXT, MUTED, CORAL, FLAME, LOCK, LOCK_DARK };

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: BG,
    padding: 20,
    paddingTop: 28,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: TEXT,
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: MUTED,
    marginBottom: 20,
    lineHeight: 22,
  },

  input: {
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    minHeight: 130,
    textAlignVertical: 'top',
    fontSize: 16,
    color: TEXT,
    marginBottom: 20,
  },

  // Duolingo-agtig knap med "3D"-kant nedenunder
  button: {
    backgroundColor: LIME,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    borderBottomWidth: 5,
    borderBottomColor: LIME_DARK,
  },
  buttonDisabled: {
    backgroundColor: '#334155',
    borderBottomColor: '#1e293b',
  },
  buttonSecondary: {
    backgroundColor: '#334155',
    borderBottomColor: '#1e293b',
  },
  buttonSecondaryText: {
    color: TEXT,
  },
  buttonText: {
    color: BG,
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  progressBar: {
    height: 16,
    backgroundColor: CARD,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 2,
    borderColor: BORDER,
  },
  progressFill: {
    height: '100%',
    backgroundColor: LIME,
    borderRadius: 8,
  },
  xpText: {
    textAlign: 'right',
    marginTop: 8,
    color: LIME,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  list: { marginTop: 22 },

  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: BORDER,
    borderBottomWidth: 5,
  },
  cardDone: {
    borderColor: LIME,
    borderBottomColor: LIME_DARK,
    backgroundColor: '#1c2a1a',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  cardCount: {
    fontSize: 12,
    color: LIME,
    marginTop: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  categoryTag: {
    fontSize: 12,
    color: LIME,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  question: {
    fontSize: 23,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 26,
    lineHeight: 31,
    letterSpacing: -0.4,
  },

  option: {
    borderWidth: 2,
    borderColor: BORDER,
    borderBottomWidth: 4,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
  },
  optionCorrect: {
    borderColor: LIME,
    borderBottomColor: LIME_DARK,
    backgroundColor: '#1c2a1a',
  },
  optionText: {
    fontSize: 16,
    lineHeight: 23,
    color: TEXT,
  },

  feedbackBox: {
    marginTop: 26,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#1c2a1a',
    borderWidth: 2,
    borderColor: LIME,
  },
  feedbackLabel: {
    fontWeight: '900',
    fontSize: 17,
    marginBottom: 8,
    color: LIME,
    letterSpacing: 0.3,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#cbd5e1',
  },

  boardRoot: {
    flex: 1,
    backgroundColor: BG,
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  hudLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: LIME,
    letterSpacing: -0.5,
  },
  hudStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
  },
  hudStatIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  hudStatText: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT,
  },
  hudFlameText: {
    color: FLAME,
  },
  hudXpText: {
    color: LIME,
  },

  banner: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: LIME,
    borderRadius: 18,
    borderBottomWidth: 5,
    borderBottomColor: LIME_DARK,
    padding: 18,
  },
  bannerLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: LIME_DARK,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: BG,
    letterSpacing: -0.4,
  },
  bannerReadiness: {
    fontSize: 13,
    color: BG,
    marginTop: 4,
    fontWeight: '900',
  },
  bannerSub: {
    fontSize: 13,
    color: LIME_DARK,
    marginTop: 6,
    fontWeight: '700',
  },

  path: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pathRow: {
    width: '100%',
    marginBottom: 34,
    alignItems: 'center',
  },
  // Zigzag-forskydning af noderne på banen
  pathOffset0: { transform: [{ translateX: 0 }] },
  pathOffset1: { transform: [{ translateX: -70 }] },
  pathOffset2: { transform: [{ translateX: 70 }] },
  pathOffset3: { transform: [{ translateX: -40 }] },
  nodeWrap: {
    alignItems: 'center',
  },
  startPill: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: BORDER,
    borderBottomWidth: 4,
  },
  startPillText: {
    color: LIME_DARK,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: 13,
  },
  node: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: LIME,
    borderBottomWidth: 8,
    borderBottomColor: LIME_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    backgroundColor: '#fbbf24',
    borderBottomColor: '#b45309',
  },
  nodeLocked: {
    backgroundColor: LOCK,
    borderBottomColor: LOCK_DARK,
  },
  nodeIcon: {
    fontSize: 38,
  },
  nodeIconLocked: {
    opacity: 0.5,
  },
  nodeLabel: {
    marginTop: 12,
    color: TEXT,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  nodeLabelLocked: {
    color: MUTED,
  },
  nodeProgress: {
    marginTop: 3,
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  nodeProgressDone: {
    color: LIME,
  },

  profileScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: LIME,
    borderBottomWidth: 6,
    borderBottomColor: LIME_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 44,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: TEXT,
    letterSpacing: -0.4,
  },
  profileSub: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: BORDER,
    borderBottomWidth: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: LIME,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: MUTED,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: BORDER,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: BORDER,
    borderBottomWidth: 4,
  },
  historyDate: {
    fontSize: 11,
    color: LIME,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  historyPreview: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 21,
    marginBottom: 8,
  },
  historySkills: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '700',
  },

  // Kompetenceoversigt på Categories-skærmen
  competenceRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  competenceCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER,
    borderBottomWidth: 3,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  competenceIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  competencePct: {
    fontSize: 15,
    fontWeight: '900',
    color: LIME,
    letterSpacing: -0.3,
  },
  competencePctEmpty: {
    color: MUTED,
  },
  competenceLabel: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // Resultatskærm
  resultHero: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  resultBadge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: LIME,
    borderBottomWidth: 8,
    borderBottomColor: LIME_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultBadgeEmoji: {
    fontSize: 60,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: TEXT,
    letterSpacing: -0.5,
  },
  resultSub: {
    fontSize: 14,
    color: MUTED,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  resultStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  resultStat: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BORDER,
    borderBottomWidth: 4,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resultStatValue: {
    fontSize: 26,
    fontWeight: '900',
    color: LIME,
  },
  resultStatLabel: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultEmpty: {
    marginBottom: 8,
  },
  resultSectionGap: {
    marginTop: 18,
  },
  resultBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 8,
  },
  resultBreakdownIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  resultBreakdownText: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    lineHeight: 19,
  },

  // Historik-skærm
  historyTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: TEXT,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  historyScorePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#1c2a1a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: LIME_DARK,
    marginTop: 8,
  },
  historyScoreText: {
    color: LIME,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  historyCategory: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: CARD,
  },
  bottomNavItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bottomNavIcon: {
    fontSize: 24,
  },
  bottomNavIconActive: {
    color: LIME,
  },
});