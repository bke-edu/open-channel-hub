import { randomUUID } from 'node:crypto';

import type { CanonicalEvent } from '@open-channel-hub/contracts';
import type { OutboundReplyCommandHistoryEntry } from '@open-channel-hub/domain';

import type { DashboardConnection } from './dashboard-feature.js';

export interface DashboardLoginPageInput {
  readonly csrfToken: string;
  readonly googleAuthenticationEnabled: boolean;
  readonly message?: 'invalid' | 'throttled';
}

export interface DashboardPageInput {
  readonly connectionIds: readonly string[];
  readonly connections?: readonly DashboardConnection[];
  readonly csrfToken: string;
  readonly events: readonly CanonicalEvent[];
  readonly googleAuthenticationEnabled: boolean;
  readonly inboxes: readonly Readonly<{ id: string }>[];
  readonly nextCursor?: string;
  readonly principalId: string;
  readonly replyIntentEnabled: boolean;
  readonly selectedInboxId: string;
}

export interface DashboardOutboundCommandHistoryPageInput {
  readonly commands: readonly OutboundReplyCommandHistoryEntry[];
  readonly connectionIds: readonly string[];
  readonly connections?: readonly DashboardConnection[];
  readonly csrfToken: string;
  readonly googleAuthenticationEnabled: boolean;
  readonly inboxes: readonly Readonly<{ id: string }>[];
  readonly nextCursor?: string;
  readonly principalId: string;
  readonly selectedInboxId: string;
  readonly telegramDeliveryAuthorizationEnabled: boolean;
}

export interface DashboardConnectionsPageInput {
  readonly connectionIds: readonly string[];
  readonly connections: readonly DashboardConnection[];
  readonly csrfToken: string;
  readonly googleAuthenticationEnabled: boolean;
  readonly inboxes: readonly Readonly<{ id: string }>[];
  readonly principalId: string;
  readonly selectedInboxId: string;
}

export interface DashboardGuidePageInput {
  readonly connectionIds: readonly string[];
  readonly connections: readonly DashboardConnection[];
  readonly csrfToken: string;
  readonly googleAuthenticationEnabled: boolean;
  readonly inboxes: readonly Readonly<{ id: string }>[];
  readonly principalId: string;
  readonly selectedInboxId: string;
}

/** Renders the Google-only no-script login page. */
export const renderDashboardLoginPage = (input: DashboardLoginPageInput): string =>
  renderDocument({
    body: `
      <main class="login-shell" aria-labelledby="dashboard-title">
        <section class="login-panel">
          <p class="eyebrow">OPEN CHANNEL HUB</p>
          <h1 id="dashboard-title">Bảng tín hiệu</h1>
          <p class="lede">Đăng nhập để xem các tin nhắn đã được cấp quyền.</p>
          ${
            input.message === undefined
              ? ''
              : `<p class="notice" role="status">${
                  input.message === 'throttled'
                    ? 'Đã có quá nhiều lần thử. Hãy chờ một lát rồi thử lại.'
                    : 'Thông tin đăng nhập không hợp lệ.'
                }</p>`
          }
          ${
            input.googleAuthenticationEnabled
              ? `<p class="login-security-note">Quyền truy cập được xác minh bởi Google. Open Channel Hub không nhận hay lưu mật khẩu vận hành.</p>
                 <a class="google-sign-in" href="/operator/auth/google/login">Đăng nhập bằng Google</a>`
              : `<p class="notice" role="alert">Đăng nhập Google chưa được cấu hình cho máy chủ này.</p>`
          }
        </section>
      </main>`
  });

/** Renders only canonical persisted content and escapes every dynamic field. */
export const renderDashboardPage = (input: DashboardPageInput): string => {
  const inboxOptions = input.inboxes
    .map(
      (inbox) =>
        `<option value="${escapeAttribute(inbox.id)}"${
          inbox.id === input.selectedInboxId ? ' selected' : ''
        }>${escapeHtml(inbox.id)}</option>`
    )
    .join('');
  const eventRows =
    input.events.length === 0
      ? '<p class="empty-state">Chưa có tín hiệu nào trong phạm vi này.</p>'
      : `<ol class="event-list">${input.events
          .map((event) => renderEvent(event, input))
          .join('')}</ol>`;
  const nextPage =
    input.nextCursor === undefined
      ? ''
      : `<a class="next-page" href="/operator?inbox=${encodeURIComponent(
          input.selectedInboxId
        )}&cursor=${encodeURIComponent(input.nextCursor)}">Xem trang tiếp theo</a>`;

  return renderDocument({
    body: `
      <main class="dashboard-shell" aria-labelledby="dashboard-title">
        ${renderDashboardHeader(input.csrfToken, input.googleAuthenticationEnabled)}
        ${renderDashboardNavigation(input.selectedInboxId, 'inbox')}
        <section class="scope-bar" aria-label="Phạm vi hộp thư">
          <form action="/operator" method="get">
            <label for="inbox">Hộp thư</label>
            <select id="inbox" name="inbox">${inboxOptions}</select>
            <button class="quiet-button" type="submit">Đổi phạm vi</button>
          </form>
          <a class="quiet-link" href="/operator/outbound-commands?inbox=${encodeURIComponent(
            input.selectedInboxId
          )}">Ý định trả lời đang chờ</a>
          <p>Người vận hành: <strong>${escapeHtml(input.principalId)}</strong></p>
        </section>
        ${renderDashboardSummary({
          connectionCount: input.connectionIds.length,
          eventCount: input.events.length,
          label: 'Tín hiệu trong trang',
          writable: input.replyIntentEnabled
        })}
        ${renderWorkflowRail('inbound')}
        ${renderConnectionScope(input.connectionIds, input.connections)}
        <section class="ledger" aria-labelledby="ledger-title">
          <div class="ledger-heading">
            <p class="eyebrow">SỔ SỰ KIỆN / MỚI NHẤT TRƯỚC</p>
            <h2 id="ledger-title">${escapeHtml(input.selectedInboxId)}</h2>
          </div>
          ${eventRows}
          ${nextPage}
        </section>
      </main>`
  });
};

/** Renders queued reply intents without exposing a bearer or delivery path. */
export const renderDashboardOutboundCommandHistoryPage = (
  input: DashboardOutboundCommandHistoryPageInput
): string => {
  const inboxLinks = input.inboxes
    .map(
      (inbox) =>
        `<a class="scope-link" href="/operator/outbound-commands?inbox=${encodeURIComponent(
          inbox.id
        )}"${inbox.id === input.selectedInboxId ? ' aria-current="page"' : ''}>${escapeHtml(
          inbox.id
        )}</a>`
    )
    .join('');
  const commandRows =
    input.commands.length === 0
      ? '<p class="empty-state">Chưa có ý định trả lời nào đang chờ trong phạm vi này.</p>'
      : `<ol class="command-list">${input.commands
          .map((command) => renderOutboundCommand(command, input))
          .join('')}</ol>`;
  const nextPage =
    input.nextCursor === undefined
      ? ''
      : `<a class="next-page" href="/operator/outbound-commands?inbox=${encodeURIComponent(
          input.selectedInboxId
        )}&cursor=${encodeURIComponent(input.nextCursor)}">Xem trang tiếp theo</a>`;

  return renderDocument({
    body: `
      <main class="dashboard-shell" aria-labelledby="dashboard-title">
        ${renderDashboardHeader(input.csrfToken, input.googleAuthenticationEnabled)}
        ${renderDashboardNavigation(input.selectedInboxId, 'history')}
        <section class="scope-bar" aria-label="Phạm vi hộp thư">
          <nav class="scope-links" aria-label="Chọn hộp thư">
            <span class="scope-label">Hộp thư</span>
            ${inboxLinks}
          </nav>
          <a class="quiet-link" href="/operator?inbox=${encodeURIComponent(
            input.selectedInboxId
          )}">Xem tin nhắn đến</a>
          <p>Người vận hành: <strong>${escapeHtml(input.principalId)}</strong></p>
        </section>
        ${renderDashboardSummary({
          connectionCount: input.connectionIds.length,
          eventCount: input.commands.length,
          label: 'Ý định trong trang',
          writable: input.telegramDeliveryAuthorizationEnabled,
          writableLabel: 'phê duyệt Telegram'
        })}
        ${renderWorkflowRail('outbound')}
        ${renderConnectionScope(input.connectionIds, input.connections)}
        <section class="ledger" id="evidence-ledger" aria-labelledby="ledger-title">
          <div class="ledger-heading">
            <p class="eyebrow">Ý ĐỊNH TRẢ LỜI / MỚI NHẤT TRƯỚC</p>
            <h2 id="ledger-title">${escapeHtml(input.selectedInboxId)}</h2>
            <p class="ledger-note">Các mục này mới chỉ được ghi nhận. Nhãn bên dưới chỉ nói điều sổ bền đã lưu, không tự gọi bất kỳ tin nào là đã giao hoặc đã đọc.</p>
          </div>
          ${commandRows}
          ${nextPage}
        </section>
      </main>`
  });
};

/** Renders the connection inventory that was previously invisible behind the inbox. */
export const renderDashboardConnectionsPage = (input: DashboardConnectionsPageInput): string => {
  const scopedConnections = connectionsInScope(input.connections, input.connectionIds);
  const cards =
    scopedConnections.length === 0
      ? '<p class="empty-state">Chưa có bản mô tả kết nối an toàn trong phạm vi này.</p>'
      : `<div class="connection-grid">${scopedConnections.map(renderConnectionCard).join('')}</div>`;

  return renderDocument({
    body: `
      <main class="dashboard-shell" aria-labelledby="connections-title">
        ${renderDashboardHeader(input.csrfToken, input.googleAuthenticationEnabled)}
        ${renderDashboardNavigation(input.selectedInboxId, 'connections')}
        ${renderDashboardScopeSelector(input.inboxes, input.selectedInboxId, input.principalId)}
        <section class="page-intro">
          <p class="eyebrow">BẢN ĐỒ KẾT NỐI / KHÔNG CÓ BÍ MẬT</p>
          <h2 id="connections-title">Kết nối trong hộp thư</h2>
          <p>Đây là toàn bộ đường vào mà máy chủ đã nạp cho phạm vi này. Mỗi thẻ nói rõ kênh nhận, năng lực đã khai báo và đường đọc tương ứng.</p>
        </section>
        ${renderConnectionScope(input.connectionIds, input.connections)}
        ${cards}
      </main>`
  });
};

/** Explains the complete backend-to-operator journey without implying provider dispatch. */
export const renderDashboardGuidePage = (input: DashboardGuidePageInput): string => {
  const capabilityRows = connectionsInScope(input.connections, input.connectionIds)
    .map(
      (connection) => `<li class="capability-row">
        <div><strong>${escapeHtml(connection.displayName)}</strong><code>${escapeHtml(connection.id)}</code></div>
        <p>${capabilityDescription(connection)}</p>
        <span class="capability-route">Đọc: ${escapeHtml(connection.readerRoute)}</span>
      </li>`
    )
    .join('');

  return renderDocument({
    body: `
      <main class="dashboard-shell" aria-labelledby="guide-title">
        ${renderDashboardHeader(input.csrfToken, input.googleAuthenticationEnabled)}
        ${renderDashboardNavigation(input.selectedInboxId, 'guide')}
        ${renderDashboardScopeSelector(input.inboxes, input.selectedInboxId, input.principalId)}
        <section class="page-intro">
          <p class="eyebrow">BẢNG NĂNG LỰC / ĐƯỜNG ĐI DỮ LIỆU</p>
          <h2 id="guide-title">Máy chủ đang làm được gì?</h2>
          <p>Trang này nối từng khả năng backend với nơi mày xem hoặc thao tác được trong giao diện. Những thứ chưa có đường an toàn sẽ hiện thẳng là chưa bật, không núp sau một cái nút đẹp.</p>
        </section>
        <section class="guide-grid" aria-label="Các chặng vận hành">
          <article class="guide-card guide-card-active"><span>01</span><h3>Tin đến</h3><p>Webhook hoặc cầu nối đã xác thực → chuẩn hoá → ghi sổ → hiển thị trong hộp thư.</p><a href="/operator?inbox=${encodeURIComponent(input.selectedInboxId)}">Mở tin đến</a></article>
          <article class="guide-card guide-card-active"><span>02</span><h3>Ý định trả lời</h3><p>Form gắn với đúng sự kiện nguồn; máy chủ tự suy ra đích, ghi bền và chống gửi trùng.</p><a href="/operator/outbound-commands?inbox=${encodeURIComponent(input.selectedInboxId)}">Mở hàng đợi</a></article>
          <article class="guide-card guide-card-active"><span>03</span><h3>Bằng chứng</h3><p>Quyền, điều kiện Telegram và dấu vết lần thử chỉ được hiển thị theo những gì sổ bền đã ghi.</p><a href="/operator/outbound-commands?inbox=${encodeURIComponent(input.selectedInboxId)}#evidence-ledger">Xem bằng chứng</a></article>
          <article class="guide-card guide-card-paused"><span>04</span><h3>Gửi nhà cung cấp</h3><p>Chưa có bộ tự gửi, tự gửi lại hay trạng thái giao hàng. Không có dữ liệu giả để gọi là đã gửi.</p><span class="paused-label">TẠM DỪNG CÓ CHỦ Ý</span></article>
        </section>
        <section class="capability-panel" aria-labelledby="capability-title">
          <div class="ledger-heading"><p class="eyebrow">KẾT NỐI ĐANG CẤP QUYỀN</p><h2 id="capability-title">Năng lực từng kênh</h2></div>
          <ul class="capability-list-large">${capabilityRows || '<li class="empty-state">Không có kết nối trong phạm vi.</li>'}</ul>
        </section>
      </main>`
  });
};

const renderDashboardHeader = (csrfToken: string, googleAuthenticationEnabled: boolean): string => `
  <header class="dashboard-header">
    <div>
      <p class="eyebrow">OPEN CHANNEL HUB / BẢNG ĐIỀU HÀNH</p>
      <h1 id="dashboard-title">Bảng tín hiệu</h1>
      <p class="header-subtitle">Một nơi nhìn thấy toàn bộ đường tin, quyền thao tác và phần còn đang khoá.</p>
    </div>
    <div class="header-actions">
      <form action="/operator/logout" method="post">
        <input type="hidden" name="csrf" value="${escapeAttribute(csrfToken)}">
        <button class="quiet-button" type="submit">Đăng xuất</button>
      </form>
      ${
        googleAuthenticationEnabled
          ? `<form action="/operator/auth/google/link" method="post">
               <input type="hidden" name="csrf" value="${escapeAttribute(csrfToken)}">
               <button class="quiet-button" type="submit">Liên kết Google</button>
             </form>`
          : ''
      }
    </div>
  </header>`;

const renderDashboardNavigation = (
  selectedInboxId: string,
  active: 'connections' | 'guide' | 'history' | 'inbox'
): string => {
  const query = `?inbox=${encodeURIComponent(selectedInboxId)}`;
  const item = (key: typeof active, href: string, label: string, hint: string): string =>
    `<a class="dashboard-nav-item${active === key ? ' dashboard-nav-active' : ''}" href="${href}"${
      active === key ? ' aria-current="page"' : ''
    }><strong>${label}</strong><small>${hint}</small></a>`;

  return `<nav class="dashboard-nav" aria-label="Bảng điều hành">
    ${item('inbox', `/operator${query}`, 'Tin đến', 'Sổ sự kiện mới nhất')}
    ${item('connections', `/operator/connections${query}`, 'Kết nối', 'Kênh và đường đọc')}
    ${item('history', `/operator/outbound-commands${query}`, 'Ý định &amp; bằng chứng', 'Hàng đợi bền')}
    ${item('guide', `/operator/guide${query}`, 'Năng lực', 'Backend ↔ giao diện')}
  </nav>`;
};

const renderDashboardScopeSelector = (
  inboxes: readonly Readonly<{ id: string }>[],
  selectedInboxId: string,
  principalId: string
): string => {
  const options = inboxes
    .map(
      (inbox) =>
        `<option value="${escapeAttribute(inbox.id)}"${
          inbox.id === selectedInboxId ? ' selected' : ''
        }>${escapeHtml(inbox.id)}</option>`
    )
    .join('');

  return `<section class="scope-bar" aria-label="Phạm vi hộp thư">
    <form action="/operator" method="get">
      <label for="inbox">Hộp thư</label>
      <select id="inbox" name="inbox">${options}</select>
      <button class="quiet-button" type="submit">Đổi phạm vi</button>
    </form>
    <p>Người vận hành: <strong>${escapeHtml(principalId)}</strong></p>
  </section>`;
};

const renderDashboardSummary = (
  input: Readonly<{
    connectionCount: number;
    eventCount: number;
    label: string;
    writable: boolean;
    writableLabel?: string;
  }>
): string => `
  <section class="summary-grid" aria-label="Tóm tắt phạm vi">
    <article class="summary-card"><span class="summary-index">01</span><strong>${String(input.eventCount)}</strong><span>${escapeHtml(input.label)}</span></article>
    <article class="summary-card"><span class="summary-index">02</span><strong>${String(input.connectionCount)}</strong><span>kết nối đang theo dõi</span></article>
    <article class="summary-card"><span class="summary-index">03</span><strong>${input.writable ? 'BẬT' : 'ĐỌC'}</strong><span>${input.writable ? escapeHtml(input.writableLabel ?? 'được ghi ý định') : 'chỉ xem trong phạm vi'}</span></article>
    <article class="summary-card summary-card-muted"><span class="summary-index">04</span><strong>0</strong><span>tác vụ tự gửi nhà cung cấp</span></article>
  </section>`;

const renderConnectionCard = (connection: DashboardConnection): string => {
  const capabilities = connection.capabilities
    .map(
      (capability) =>
        `<li class="evidence-chip evidence-positive">${capabilityLabel(capability)}</li>`
    )
    .join('');
  const bridgeCapabilities =
    connection.channel === 'zalo_user'
      ? '<li class="evidence-chip evidence-positive">Gửi chữ + ảnh trong bảng nhóm</li>'
      : '';
  const unsupported =
    connection.capabilities.length === 0
      ? '<li class="evidence-chip evidence-muted">Chưa khai báo năng lực</li>'
      : '';
  const bridgeAction =
    connection.operatorUrl === undefined
      ? ''
      : `<a class="connection-action" href="${escapeAttribute(connection.operatorUrl)}" rel="noreferrer">Mở bảng nhóm Zalo User <span>↗</span></a>`;

  return `<article class="connection-card">
    <div class="connection-card-top"><span class="channel-kicker">${escapeHtml(connection.displayName)}</span><span class="connection-status"><i aria-hidden="true"></i> ĐÃ NẠP</span></div>
    <h3><code>${escapeHtml(connection.id)}</code></h3>
    <p class="connection-meta">${escapeHtml(connection.tier)} · ${escapeHtml(connection.connectorId)}</p>
    <ul class="evidence-list">${capabilities}${bridgeCapabilities}${unsupported}</ul>
    <dl class="connection-routes">
      <div><dt>Đường vào</dt><dd><code>${escapeHtml(connection.inboundRoute)}</code></dd></div>
      <div><dt>Đường đọc</dt><dd><code>${escapeHtml(connection.readerRoute)}</code></dd></div>
    </dl>
    ${
      connection.operatorUrl === undefined
        ? ''
        : `<p class="connection-note">Bảng nhóm cục bộ, mặc định ở cổng 9473; có QR và tự nối lại.</p>${bridgeAction}`
    }
  </article>`;
};

const capabilityLabel = (capability: string): string => {
  switch (capability) {
    case 'message.receive.text':
      return 'Nhận tin chữ';
    case 'message.send.text':
      return 'Có năng lực gửi chữ';
    default:
      return capability;
  }
};

const capabilityDescription = (connection: DashboardConnection): string => {
  const labels = connection.capabilities.map(capabilityLabel);

  if (connection.channel === 'zalo_user') {
    return 'Cầu nối Zalo User nhận tin nhóm vào sổ; bảng nhóm cục bộ còn có QR, tự nối lại, gửi chữ và gửi ảnh.';
  }

  if (labels.length === 0) {
    return 'Kênh này chưa có bộ kết nối tương ứng trong bản build hiện tại.';
  }

  return `${labels.join(' · ')}. Dashboard chỉ ghi ý định trả lời; chưa tự gọi nhà cung cấp.`;
};

/** A truthful map of the operational path; it never implies a dispatch exists. */
const renderWorkflowRail = (active: 'inbound' | 'outbound'): string => `
  <section class="workflow-rail" aria-label="Luồng vận hành hiện có">
    <p class="eyebrow">LUỒNG VẬN HÀNH</p>
    <ol>
      <li class="workflow-step ${active === 'inbound' ? 'workflow-active' : ''}">
        <span>01</span><strong>Tin đến</strong><small>Đã lưu theo phạm vi hộp thư</small>
      </li>
      <li class="workflow-step ${active === 'outbound' ? 'workflow-active' : ''}">
        <span>02</span><strong>Ý định trả lời</strong><small>Chỉ ghi bền, không chọn người nhận</small>
      </li>
      <li class="workflow-step ${active === 'outbound' ? 'workflow-active' : ''}">
        <span>03</span><strong>Bằng chứng</strong><small>Quyền, điều kiện Telegram và lần thử đã ghi</small>
      </li>
      <li class="workflow-step workflow-paused">
        <span>04</span><strong>Gửi nhà cung cấp</strong><small>Chưa bật — không có bộ tự gửi hoặc gửi lại</small>
      </li>
    </ol>
  </section>`;

/** Connection IDs are already inside the selected server-side inbox scope. */
const renderConnectionScope = (
  connectionIds: readonly string[],
  connections: readonly DashboardConnection[] = []
): string => `
  <section class="connection-scope" aria-label="Kết nối đang theo dõi">
    <div>
      <p class="eyebrow">KẾT NỐI TRONG PHẠM VI</p>
      <p>Những đường vào dưới đây được máy chủ chọn theo hộp thư này; trình duyệt không tự đổi hoặc thêm kết nối.</p>
    </div>
    <ul>${connectionIds
      .map((connectionId) => {
        const connection = connections.find((candidate) => candidate.id === connectionId);
        return `<li><code>${escapeHtml(connectionId)}</code>${
          connection === undefined ? '' : `<small>${escapeHtml(connection.displayName)}</small>`
        }</li>`;
      })
      .join('')}</ul>
  </section>`;

const connectionsInScope = (
  connections: readonly DashboardConnection[],
  connectionIds: readonly string[]
): readonly DashboardConnection[] =>
  connections.filter((connection) => connectionIds.includes(connection.id));

const renderEvent = (event: CanonicalEvent, input: DashboardPageInput): string => `
  <li class="event-card">
    <div class="event-meta">
      <span>${escapeHtml(event.channel)}</span>
      <time datetime="${escapeAttribute(event.occurredAt)}">${escapeHtml(event.occurredAt)}</time>
    </div>
    <p class="event-message">${escapeHtml(event.message.text)}</p>
    <dl>
      <div><dt>Kết nối</dt><dd>${escapeHtml(event.connectionId)}</dd></div>
    </dl>
    ${input.replyIntentEnabled ? renderReplyIntentForm(event, input) : ''}
  </li>`;

/**
 * Associates one native form with one persisted inbound event. The only
 * editable value is reply text; source identity and the UUID idempotency key
 * are freshly generated server-side and encoded as escaped hidden inputs.
 */
const renderReplyIntentForm = (event: CanonicalEvent, input: DashboardPageInput): string => `
  <form action="/operator/reply-intents" method="post" class="reply-intent-form">
    <input type="hidden" name="csrf" value="${escapeAttribute(input.csrfToken)}">
    <input type="hidden" name="inbox" value="${escapeAttribute(input.selectedInboxId)}">
    <input type="hidden" name="sourceConnectionId" value="${escapeAttribute(event.connectionId)}">
    <input type="hidden" name="sourceProviderEventId" value="${escapeAttribute(event.providerEventId)}">
    <input type="hidden" name="clientOperationId" value="${escapeAttribute(randomUUID())}">
    <label>
      <span>Nội dung trả lời</span>
      <textarea maxlength="2000" name="text" required rows="4"></textarea>
    </label>
    <button type="submit">Ghi ý định trả lời</button>
  </form>`;

const renderOutboundCommand = (
  command: OutboundReplyCommandHistoryEntry,
  input: DashboardOutboundCommandHistoryPageInput
): string => `
  <li class="command-card">
    <div class="event-meta">
      <span>ĐÃ GHI, CHƯA GỬI</span>
      <time datetime="${escapeAttribute(command.createdAt)}">${escapeHtml(command.createdAt)}</time>
    </div>
    <p class="event-message">${escapeHtml(command.text)}</p>
    <dl>
      <div><dt>Kết nối</dt><dd>${escapeHtml(command.sourceConnectionId)}</dd></div>
    </dl>
    ${renderOutboundCommandEvidence(command)}
    ${
      input.telegramDeliveryAuthorizationEnabled && command.telegramDeliveryAuthorizationEligible
        ? renderTelegramDeliveryAuthorizationForm(command, input)
        : ''
    }
  </li>`;

/**
 * Shows only bounded, local ledger facts. In particular it never renders a
 * reply target, provider message ID, raw response, source-message metadata,
 * scope fingerprint, or authorization identity.
 */
const renderOutboundCommandEvidence = (command: OutboundReplyCommandHistoryEntry): string => {
  const authorization = command.authorizationRecorded
    ? '<li class="evidence-chip evidence-positive">Nguồn quyền đã ghi</li>'
    : '<li class="evidence-chip evidence-muted">Nguồn quyền chưa có trong sổ</li>';
  const telegramPrivateReply = command.telegramPrivateReplyEligibilityRecorded
    ? '<li class="evidence-chip evidence-positive">Nguồn Telegram riêng đã xác minh</li>'
    : '';
  const telegramAuthorization = command.telegramDeliveryAuthorizationRecorded
    ? '<li class="evidence-chip evidence-positive">Chấp thuận Telegram đã ghi</li>'
    : '';

  return `
    <section class="command-evidence" aria-label="Bằng chứng đã ghi">
      <p class="evidence-title">Bằng chứng đã ghi</p>
      <ul class="evidence-list">
        <li class="evidence-chip ${deliveryEvidenceClass(command.deliveryEvidenceStatus)}">${deliveryEvidenceLabel(command.deliveryEvidenceStatus)}</li>
        ${authorization}
        ${telegramPrivateReply}
        ${telegramAuthorization}
      </ul>
      <p class="ledger-note">Chưa có tin nào được gọi là đã giao hoặc đã đọc.</p>
    </section>`;
};

const deliveryEvidenceLabel = (
  status: OutboundReplyCommandHistoryEntry['deliveryEvidenceStatus']
): string => {
  switch (status) {
    case 'not_attempted':
      return 'Chưa có lần thử nào được ghi';
    case 'outcome_unknown':
      return 'Đã có lần thử, chưa có kết quả chắc chắn';
    case 'provider_accepted':
      return 'Nhà cung cấp đã nhận yêu cầu';
    case 'provider_rejected':
      return 'Nhà cung cấp đã từ chối yêu cầu';
  }
};

const deliveryEvidenceClass = (
  status: OutboundReplyCommandHistoryEntry['deliveryEvidenceStatus']
): string => {
  switch (status) {
    case 'not_attempted':
      return 'evidence-muted';
    case 'outcome_unknown':
      return 'evidence-warning';
    case 'provider_accepted':
      return 'evidence-positive';
    case 'provider_rejected':
      return 'evidence-danger';
  }
};

/**
 * The command ID is a non-secret, server-validated transport reference. This
 * form records only an immutable approval fact; it cannot send, retry, or
 * create a delivery attempt.
 */
const renderTelegramDeliveryAuthorizationForm = (
  command: OutboundReplyCommandHistoryEntry,
  input: DashboardOutboundCommandHistoryPageInput
): string => `
  <form action="/operator/telegram-delivery-authorizations" method="post" class="reply-intent-form">
    <input type="hidden" name="csrf" value="${escapeAttribute(input.csrfToken)}">
    <input type="hidden" name="inbox" value="${escapeAttribute(input.selectedInboxId)}">
    <input type="hidden" name="commandId" value="${escapeAttribute(command.id)}">
    <p class="ledger-note">Có thể ghi chấp thuận Telegram cho mục này. Thao tác này chưa gửi tin.</p>
    <button type="submit">Ghi chấp thuận Telegram</button>
  </form>`;

const renderDocument = (input: Readonly<{ body: string }>): string => `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <title>Open Channel Hub</title>
    <link href="/operator/assets/dashboard.css" rel="stylesheet">
  </head>
  <body><a class="skip-link" href="#dashboard-title">Bỏ qua điều hướng</a>${input.body}
  </body>
</html>`;

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });

const escapeAttribute = (value: string): string => escapeHtml(value);
