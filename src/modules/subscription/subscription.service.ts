import type Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

const createCheckoutSessions = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
    }

    const sesseion = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id },
    });

    return sesseion.url;
  });
  return transactionResult;
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret as string;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      const session: Stripe.Checkout.Session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    case "customer.subscription.updated":
      await handleChangeSubscription(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleChangeSubscription(event.data.object);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }
};

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    throw new Error("Webhook Failed!");
  }

  const stripeSubscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const currentPeriodEndInMillisec =
    stripeSubscription.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndInMillisec * 1000);

  // console.log(currentPeriodEnd, "end");

  await prisma.subscription.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
    },
  });
};

const handleChangeSubscription = async (payload: Stripe.Subscription) => {
  const subscriptionId = payload.id;

  const status =
    payload.status === "active"
      ? SubscriptionStatus.ACTIVE
      : payload.status === "trialing"
        ? SubscriptionStatus.ACTIVE
        : payload.status === "canceled"
          ? SubscriptionStatus.CANCELED
          : SubscriptionStatus.EXPIRED;

  const stripeSubscription =
    await stripe.subscriptions.retrieve(subscriptionId);

  const currentPeriodEndInMillisec =
    stripeSubscription.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndInMillisec * 1000);

  const isSubscriptionExist = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId: subscriptionId,
    },
  });

  if (!isSubscriptionExist) {
    console.log(
      `Webhook : NO subscription found for subscription id : ${subscriptionId}`,
    );
  }

  await prisma.subscription.update({
    where: {
      stripeSubscriptionId: subscriptionId,
    },
    data: {
      status,
      currentPeriodEnd,
    },
  });
};

export const subscriptionServices = {
  createCheckoutSessions,
  handleWebhook,
};
