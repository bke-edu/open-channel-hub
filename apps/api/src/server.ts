import { buildApp } from './app.js';
import { EnvironmentConfigurationError, parseEnvironment } from './config/environment.js';
import { loadRuntimeConnections } from './connections/load-runtime-connections.js';
import { createFacebookPageFeature } from './facebook-page/create-facebook-page-feature.js';
import { toFacebookPageConnectionConfigurations } from './facebook-page/facebook-page-connection-configurations.js';
import { createRuntimeInboxFeatures } from './inbox/create-runtime-inbox-features.js';
import type { InboxFeature } from './inbox/inbox-feature.js';
import { createRuntimeDashboardFeature } from './dashboard/create-runtime-dashboard-feature.js';
import type { DashboardFeature } from './dashboard/dashboard-feature.js';
import { loadDashboardGoogleOAuthClient } from './dashboard/dashboard-google-oauth.js';
import { createTelegramBotFeature } from './telegram-bot/create-telegram-bot-feature.js';
import {
  loadTelegramBotConnectionConfigurations,
  toTelegramBotConnectionConfigurations
} from './telegram-bot/telegram-bot-connection-configurations.js';
import { createZaloOaFeature } from './zalo-oa/create-zalo-oa-feature.js';
import { toZaloOaConnectionConfigurations } from './zalo-oa/zalo-oa-connection-configurations.js';
import { createZaloUserFeature } from './zalo-user/create-zalo-user-feature.js';
import { toZaloUserConnectionConfigurations } from './zalo-user/zalo-user-connection-configurations.js';
import { createWhatsAppBusinessFeature } from './whatsapp-business/create-whatsapp-business-feature.js';
import { toWhatsAppBusinessConnectionConfigurations } from './whatsapp-business/whatsapp-business-connection-configurations.js';
import { createPostgresDatabase } from '@open-channel-hub/storage-postgres';
import type {
  Channel,
  ConnectionRegistration,
  ConnectorCapabilityId
} from '@open-channel-hub/contracts';

const DASHBOARD_CONNECTION_PRESENTATIONS: Readonly<
  Record<
    Channel,
    Readonly<{
      capabilities: readonly ConnectorCapabilityId[];
      displayName: string;
      inboundRoute: string;
      operatorUrl?: string;
      readerRoute: string;
    }>
  >
> = Object.freeze({
  facebook_page: Object.freeze({
    capabilities: Object.freeze(['message.receive.text'] as const),
    displayName: 'Facebook Page',
    inboundRoute: '/v1/webhooks/meta hoặc /v1/webhooks/facebook-page',
    readerRoute: '/v1/facebook-page/inbound-events'
  }),
  facebook_user: Object.freeze({
    capabilities: Object.freeze([] as const),
    displayName: 'Facebook User',
    inboundRoute: 'Chưa có route',
    readerRoute: 'Chưa có route'
  }),
  telegram_bot: Object.freeze({
    capabilities: Object.freeze(['message.receive.text', 'message.send.text'] as const),
    displayName: 'Telegram Bot',
    inboundRoute: '/v1/webhooks/telegram-bot',
    readerRoute: '/v1/telegram-bot/inbound-events'
  }),
  telegram_user: Object.freeze({
    capabilities: Object.freeze([] as const),
    displayName: 'Telegram User',
    inboundRoute: 'Chưa có route',
    readerRoute: 'Chưa có route'
  }),
  whatsapp_business: Object.freeze({
    capabilities: Object.freeze(['message.receive.text'] as const),
    displayName: 'WhatsApp Business',
    inboundRoute: '/v1/webhooks/meta hoặc /v1/webhooks/whatsapp-business',
    readerRoute: '/v1/whatsapp-business/inbound-events'
  }),
  whatsapp_user: Object.freeze({
    capabilities: Object.freeze([] as const),
    displayName: 'WhatsApp User',
    inboundRoute: 'Chưa có route',
    readerRoute: 'Chưa có route'
  }),
  zalo_oa: Object.freeze({
    capabilities: Object.freeze(['message.receive.text'] as const),
    displayName: 'Zalo Official Account',
    inboundRoute: '/v1/webhooks/zalo-oa',
    readerRoute: '/v1/zalo-oa/inbound-events'
  }),
  zalo_user: Object.freeze({
    capabilities: Object.freeze(['message.receive.text'] as const),
    displayName: 'Zalo User · nhóm',
    inboundRoute: '/v1/experimental/zalo-user/:connectionId/events',
    operatorUrl: 'http://127.0.0.1:9473/operator/login',
    readerRoute: '/v1/zalo-user/inbound-events'
  })
});

const environment = parseEnvironment(process.env);
const postgres =
  environment.postgres === undefined
    ? undefined
    : await createPostgresDatabase(environment.postgres);

try {
  if (postgres !== undefined) {
    await postgres.checkReadiness();
  }

  let telegramBot: Awaited<ReturnType<typeof createTelegramBotFeature>> | undefined;
  let telegramBots: readonly Awaited<ReturnType<typeof createTelegramBotFeature>>[] | undefined;
  let zaloOas: readonly Awaited<ReturnType<typeof createZaloOaFeature>>[] | undefined;
  let zaloUsers: readonly Awaited<ReturnType<typeof createZaloUserFeature>>[] | undefined;
  let facebookPages: readonly Awaited<ReturnType<typeof createFacebookPageFeature>>[] | undefined;
  let whatsappBusinesses:
    readonly Awaited<ReturnType<typeof createWhatsAppBusinessFeature>>[] | undefined;
  let inboxes: readonly InboxFeature[] | undefined;
  let dashboard: DashboardFeature | undefined;

  if (environment.connectorRuntime.enabled) {
    const inboundEventReader = postgres?.inboundEventReader;
    const inboundEventStore = postgres?.inboundEventStore;
    const connectionRegistry = postgres?.connectionRegistry;

    if (
      inboundEventReader === undefined ||
      inboundEventStore === undefined ||
      connectionRegistry === undefined
    ) {
      throw new EnvironmentConfigurationError();
    }

    const configuredConnectionConfiguration = await loadRuntimeConnections(
      environment.connectorRuntime
    );
    const configuredConnections = configuredConnectionConfiguration?.connections;
    const configuredInboxes = configuredConnectionConfiguration?.inboxes;
    const telegramConnections =
      configuredConnections === undefined
        ? await loadTelegramBotConnectionConfigurations(environment.connectorRuntime)
        : toTelegramBotConnectionConfigurations(configuredConnections);
    const zaloOaConnections =
      configuredConnections === undefined
        ? Object.freeze([])
        : toZaloOaConnectionConfigurations(configuredConnections);
    const facebookPageConnections =
      configuredConnections === undefined
        ? Object.freeze([])
        : toFacebookPageConnectionConfigurations(configuredConnections);
    const zaloUserConnections =
      configuredConnections === undefined
        ? Object.freeze([])
        : toZaloUserConnectionConfigurations(configuredConnections);
    const whatsappBusinessConnections =
      configuredConnections === undefined
        ? Object.freeze([])
        : toWhatsAppBusinessConnectionConfigurations(configuredConnections);
    const [
      telegramFeatures,
      zaloOaFeatures,
      zaloUserFeatures,
      facebookPageFeatures,
      whatsappBusinessFeatures
    ] = await Promise.all([
      Promise.all(
        telegramConnections.map(async (connection) =>
          createTelegramBotFeature(connection, {
            readInboundEvents: async (input) => inboundEventReader.list(input),
            receiveEvents: async (events) => {
              await inboundEventStore.append(events);
            }
          })
        )
      ),
      Promise.all(
        zaloOaConnections.map(async (connection) =>
          createZaloOaFeature(connection, {
            readInboundEvents: async (input) => inboundEventReader.list(input),
            receiveEvents: async (events) => {
              await inboundEventStore.append(events);
            }
          })
        )
      ),
      Promise.all(
        zaloUserConnections.map(async (connection) =>
          createZaloUserFeature(connection, {
            readInboundEvents: async (input) => inboundEventReader.list(input),
            receiveEvents: async (events) => {
              await inboundEventStore.append(events);
            }
          })
        )
      ),
      Promise.all(
        facebookPageConnections.map(async (connection) =>
          createFacebookPageFeature(connection, {
            readInboundEvents: async (input) => inboundEventReader.list(input),
            receiveEvents: async (events) => {
              await inboundEventStore.append(events);
            }
          })
        )
      ),
      Promise.all(
        whatsappBusinessConnections.map(async (connection) =>
          createWhatsAppBusinessFeature(connection, {
            readInboundEvents: async (input) => inboundEventReader.list(input),
            receiveEvents: async (events) => {
              await inboundEventStore.append(events);
            }
          })
        )
      )
    ]);

    await connectionRegistry.ensureRegistered([
      ...telegramFeatures.map((feature) => feature.registration),
      ...zaloOaFeatures.map((feature) => feature.registration),
      ...zaloUserFeatures.map((feature) => feature.registration),
      ...facebookPageFeatures.map((feature) => feature.registration),
      ...whatsappBusinessFeatures.map((feature) => feature.registration)
    ]);

    if (configuredConnections !== undefined) {
      if (telegramFeatures.length > 0) {
        telegramBots = Object.freeze(telegramFeatures);
      }

      if (zaloOaFeatures.length > 0) {
        zaloOas = Object.freeze(zaloOaFeatures);
      }

      if (zaloUserFeatures.length > 0) {
        zaloUsers = Object.freeze(zaloUserFeatures);
      }

      if (facebookPageFeatures.length > 0) {
        facebookPages = Object.freeze(facebookPageFeatures);
      }

      if (whatsappBusinessFeatures.length > 0) {
        whatsappBusinesses = Object.freeze(whatsappBusinessFeatures);
      }

      if (configuredInboxes !== undefined) {
        const inboundEventFeedReader = postgres?.inboundEventFeedReader;
        const outboundReplyCommandStore = postgres?.outboundReplyCommandStore;
        const outboundReplyCommandHistoryReader = postgres?.outboundReplyCommandHistoryReader;
        const outboundTelegramDeliveryAuthorizationStore =
          postgres?.outboundTelegramDeliveryAuthorizationStore;

        if (
          inboundEventFeedReader === undefined ||
          outboundReplyCommandStore === undefined ||
          outboundReplyCommandHistoryReader === undefined ||
          outboundTelegramDeliveryAuthorizationStore === undefined
        ) {
          throw new EnvironmentConfigurationError();
        }

        inboxes = createRuntimeInboxFeatures(
          configuredInboxes,
          inboundEventFeedReader,
          outboundReplyCommandStore,
          outboundReplyCommandHistoryReader,
          outboundTelegramDeliveryAuthorizationStore
        );

        const dashboardConfiguration = configuredConnectionConfiguration?.dashboard;

        if (dashboardConfiguration !== undefined) {
          if (environment.dashboardGoogleOAuth === undefined) {
            // The dashboard has one authentication path: verified Google
            // identity. Refuse a password-only deployment instead of
            // starting a page that can never be entered safely.
            throw new EnvironmentConfigurationError();
          }

          const dashboardGoogleIdentityStore = postgres?.dashboardGoogleIdentityStore;
          const dashboardSessionStore = postgres?.dashboardSessionStore;

          if (dashboardSessionStore === undefined) {
            throw new EnvironmentConfigurationError();
          }

          if (
            environment.dashboardGoogleOAuth !== undefined &&
            dashboardGoogleIdentityStore === undefined
          ) {
            throw new EnvironmentConfigurationError();
          }

          let googleAuthentication:
            | Readonly<{
                client: Awaited<ReturnType<typeof loadDashboardGoogleOAuthClient>>;
                identityStore: NonNullable<typeof dashboardGoogleIdentityStore>;
              }>
            | undefined;

          if (environment.dashboardGoogleOAuth !== undefined) {
            const identityStore = dashboardGoogleIdentityStore;

            if (identityStore === undefined) {
              throw new EnvironmentConfigurationError();
            }

            googleAuthentication = Object.freeze({
              client: await loadDashboardGoogleOAuthClient({
                clientIdFile: environment.dashboardGoogleOAuth.clientIdFile,
                clientSecretFile: environment.dashboardGoogleOAuth.clientSecretFile,
                redirectUri: `${dashboardConfiguration.publicOrigin}/operator/auth/google/callback`
              }),
              identityStore
            });
          }

          dashboard = createRuntimeDashboardFeature(
            dashboardConfiguration,
            inboxes,
            dashboardSessionStore,
            {
              ...(googleAuthentication === undefined ? {} : { googleAuthentication }),
              connections: toDashboardConnections([
                ...telegramFeatures.map((feature) => feature.registration),
                ...zaloOaFeatures.map((feature) => feature.registration),
                ...zaloUserFeatures.map((feature) => feature.registration),
                ...facebookPageFeatures.map((feature) => feature.registration),
                ...whatsappBusinessFeatures.map((feature) => feature.registration)
              ])
            }
          );
        }
      }
    } else {
      const feature = telegramFeatures[0];

      if (feature === undefined) {
        throw new EnvironmentConfigurationError();
      }

      telegramBot = feature;
    }
  }
  if (environment.dashboardGoogleOAuth !== undefined && dashboard === undefined) {
    throw new EnvironmentConfigurationError();
  }
  const app = await buildApp({
    ...(postgres === undefined
      ? {}
      : {
          readiness: Object.freeze({
            check: async (): Promise<void> => postgres.checkReadiness()
          })
        }),
    sourceOfferUrl: environment.sourceOfferUrl,
    ...(telegramBot === undefined ? {} : { telegramBot }),
    ...(telegramBots === undefined ? {} : { telegramBots }),
    ...(zaloOas === undefined ? {} : { zaloOas }),
    ...(zaloUsers === undefined ? {} : { zaloUsers }),
    ...(facebookPages === undefined ? {} : { facebookPages }),
    ...(inboxes === undefined ? {} : { inboxes }),
    ...(dashboard === undefined ? {} : { dashboard }),
    ...(whatsappBusinesses === undefined ? {} : { whatsappBusinesses })
  });

  if (postgres !== undefined) {
    app.addHook('onClose', async (): Promise<void> => postgres.close());
  }

  const close = async (): Promise<void> => {
    await app.close();
  };

  process.once('SIGINT', () => {
    void close();
  });
  process.once('SIGTERM', () => {
    void close();
  });

  await app.listen({ host: environment.HOST, port: environment.PORT });
} catch (error) {
  await postgres?.close();
  throw error;
}

function toDashboardConnections(registrations: readonly ConnectionRegistration[]) {
  return registrations.map((registration) => {
    const presentation = DASHBOARD_CONNECTION_PRESENTATIONS[registration.channel];

    return Object.freeze({
      capabilities: presentation.capabilities,
      channel: registration.channel,
      connectorId: registration.connectorId,
      displayName: presentation.displayName,
      id: registration.id,
      inboundRoute: presentation.inboundRoute,
      ...(presentation.operatorUrl === undefined ? {} : { operatorUrl: presentation.operatorUrl }),
      readerRoute: presentation.readerRoute,
      tier: registration.tier
    });
  });
}
