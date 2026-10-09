// Betaling med Stripe Payment Links: appen åbner Stripes egen betalingsside i en browser.
// Ingen server og ingen hemmelig nøgle — linket kommer fra Stripe Dashboard via .env.
// Ved Firebase-integration: lad en Cloud Function modtage Stripes webhook (checkout.session.completed)
// og sætte abonnementet på brugeren, i stedet for at appen selv markerer det.

import * as WebBrowser from 'expo-web-browser';
import { STRIPE } from '../config';
import { getSubscription, saveSubscription } from './storageService';

export function isPaymentConfigured() {
  return STRIPE.paymentLink.startsWith('https://buy.stripe.com/');
}

// Links fra sandkassen indeholder "test_" og flytter ingen rigtige penge.
export function isTestMode() {
  return STRIPE.paymentLink.includes('/test_');
}

// Åbner betalingssiden. Returnerer, når brugeren lukker browseren igen.
export async function openCheckout() {
  return WebBrowser.openBrowserAsync(STRIPE.paymentLink);
}

export async function getProStatus() {
  const sub = await getSubscription();
  return sub && sub.active ? sub : null;
}

// Uden server kan appen ikke selv se, om betalingen gik igennem — brugeren bekræfter det i testen.
export async function markProAfterTestPayment() {
  return saveSubscription({ active: true, test: isTestMode(), since: Date.now() });
}

export async function resetPro() {
  return saveSubscription(null);
}
