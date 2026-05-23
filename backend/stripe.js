import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const PACKS = {
  standard_10: {
    name: 'Standard Pack - 10 Queries',
    credits: 10,
    amount_cents: 199,
  },
  standard_50: {
    name: 'Standard Pack - 50 Queries',
    credits: 50,
    amount_cents: 999,
  },
  standard_100: {
    name: 'Standard Pack - 100 Queries',
    credits: 100,
    amount_cents: 1799,
  },
  standard_500: {
    name: 'Standard Pack - 500 Queries',
    credits: 500,
    amount_cents: 7999,
  },
  premium_10: {
    name: 'Premium Pack - 10 Queries',
    credits: 10,
    amount_cents: 499,
  },
  premium_50: {
    name: 'Premium Pack - 50 Queries',
    credits: 50,
    amount_cents: 2499,
  },
  premium_100: {
    name: 'Premium Pack - 100 Queries',
    credits: 100,
    amount_cents: 4499,
  },
  premium_500: {
    name: 'Premium Pack - 500 Queries',
    credits: 500,
    amount_cents: 19999,
  },
}