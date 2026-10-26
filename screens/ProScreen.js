import { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../styles';
import {
  isPaymentConfigured, isTestMode, openCheckout, getProStatus, markProAfterTestPayment, resetPro,
} from '../services/paymentService';
import { formatDate } from '../utils';
import { PRO, STRIPE_TEST_CARDS } from '../constants';

export default function ProScreen({ navigation }) {
  const [pro, setPro] = useState(null);
  const [opening, setOpening] = useState(false);

  useFocusEffect(useCallback(() => {
    getProStatus().then(setPro);
  }, []));

  const subscribe = async () => {
    setOpening(true);
    try {
      await openCheckout();
    } finally {
      setOpening(false);
    }
    // Uden server kan appen ikke se resultatet — spørg brugeren, når browseren er lukket.
    Alert.alert('Gennemførte du betalingen?', 'Svar ja, hvis Stripe viste en kvittering.', [
      { text: 'Nej', style: 'cancel' },
      {
        text: 'Ja',
        onPress: async () => setPro(await markProAfterTestPayment()),
      },
    ]);
  };

  const reset = async () => {
    await resetPro();
    setPro(null);
  };

  return (
    <ScrollView style={styles.boardRoot} contentContainerStyle={styles.profileScroll}>
      <View style={styles.resultHero}>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeEmoji}>⭐</Text>
        </View>
        <Text style={styles.resultTitle}>{PRO.name}</Text>
        <Text style={styles.resultSub}>{pro ? 'Du har Pro — god træning!' : PRO.price}</Text>
      </View>

      <View style={styles.prepSection}>
        <Text style={styles.prepHeading}>Det får du</Text>
        {PRO.benefits.map((b) => (
          <Text key={b} style={styles.prepItem}>✓ {b}</Text>
        ))}
      </View>

      {pro && (
        <View style={styles.prepSection}>
          <Text style={styles.prepHeading}>Dit abonnement</Text>
          <Text style={styles.prepItem}>
            Aktivt siden {formatDate(pro.since)}{pro.test ? ' · testbetaling i Stripes sandkasse' : ''}
          </Text>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={reset}>
            <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Nulstil test</Text>
          </TouchableOpacity>
        </View>
      )}

      {!pro && !isPaymentConfigured() && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Betaling er ikke sat op endnu. Opret et Payment Link i Stripe Dashboard (sandkassen), og indsæt
            det i .env som EXPO_PUBLIC_STRIPE_PAYMENT_LINK. Genstart derefter med npx expo start -c.
          </Text>
        </View>
      )}

      {!pro && isPaymentConfigured() && (
        <>
          {isTestMode() && (
            <View style={styles.prepSection}>
              <Text style={styles.prepHeading}>🧪 Sandkasse — ingen rigtige penge</Text>
              {STRIPE_TEST_CARDS.map((c) => (
                <Text key={c.number} style={styles.prepItem}>{c.number} · {c.result}</Text>
              ))}
              <Text style={styles.strongNote}>Udløb: en vilkårlig fremtidig dato · CVC: tre vilkårlige cifre</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.button, opening && styles.buttonDisabled]}
            disabled={opening}
            onPress={subscribe}
          >
            <Text style={styles.buttonText}>{opening ? 'Åbner Stripe…' : `Abonnér · ${PRO.price}`}</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.goBack()}>
        <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Tilbage</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
