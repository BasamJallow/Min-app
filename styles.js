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