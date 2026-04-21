import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const PACKS = {
  standard: {
    name: 'Standard Pack',
    credits: 10,
    amount_cents: 199,
  },
  premium: {
    name: 'Premium Pack',
    credits: 10,
    amount_cents: 499,
  }
}