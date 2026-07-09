import Stripe from "stripe";
import config from "../config";

export const stripe = new Stripe(config.stripe_secret_key || "sk_test_placeholder", {
    apiVersion: "2026-06-24.dahlia"
});