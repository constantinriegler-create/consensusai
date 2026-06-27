import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// liteBonus: lite credits awarded alongside the primary credit type on purchase
export const PACKS = {
  standard_10: {
    name: 'Standard Pack - 10 Queries',
    credits: 10,
    amount_cents: 199,
    liteBonus: 10,
  },
  standard_50: {
    name: 'Standard Pack - 50 Queries',
    credits: 50,
    amount_cents: 999,
    liteBonus: 50,
  },
  standard_100: {
    name: 'Standard Pack - 100 Queries',
    credits: 100,
    amount_cents: 1499,
    liteBonus: 100,
  },
  standard_500: {
    name: 'Standard Pack - 500 Queries',
    credits: 500,
    amount_cents: 7599,
    liteBonus: 500,
  },
  premium_10: {
    name: 'Premium Pack - 10 Queries',
    credits: 10,
    amount_cents: 499,
    liteBonus: 20,
  },
  premium_50: {
    name: 'Premium Pack - 50 Queries',
    credits: 50,
    amount_cents: 2499,
    liteBonus: 100,
  },
  premium_100: {
    name: 'Premium Pack - 100 Queries',
    credits: 100,
    amount_cents: 3999,
    liteBonus: 200,
  },
  premium_500: {
    name: 'Premium Pack - 500 Queries',
    credits: 500,
    amount_cents: 18999,
    liteBonus: 1000,
  },
  lite_50: {
    name: 'Lite Pack - 50 Queries',
    credits: 50,
    amount_cents: 199,
  },
}