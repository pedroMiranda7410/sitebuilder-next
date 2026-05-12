/**
 * Event Form Snippet
 *
 * Renderiza dinamicamente o formulário de inscrição de um evento a partir do
 * formSchema retornado pela API pública (GET /api/site/[slug]).
 *
 * Usage:
 *   const html = renderEventForm(event, 'pt')
 *   document.querySelector('#signup-form-container').innerHTML = html
 *   initEventForm(event, 'pt', apiBaseUrl)
 */

/**
 * Helper: obtém o valor localizado de um campo lang-map.
 * @param {Object|string} langMap - { pt: "...", en: "..." } ou string
 * @param {string} lang
 * @returns {string}
 */
function t(langMap, lang) {
  if (!langMap) return '';
  if (typeof langMap === 'string') return langMap;
  return langMap[lang] ?? langMap['pt'] ?? langMap['en'] ?? '';
}

/**
 * Renderiza o HTML do formulário de inscrição.
 * @param {Object} event - objeto de evento da API pública
 * @param {string} lang  - idioma ('pt', 'en', …)
 * @returns {string} HTML string
 */
function renderEventForm(event, lang) {
  if (!event.collect_signups || !event.registration_open) return '';

  const fields = [...(event.form_schema ?? [])].sort((a, b) => a.position - b.position);

  return fields.map(field => {
    const label       = t(field.label, lang);
    const placeholder = t(field.placeholder, lang) || '';
    const reqAttr     = field.required ? 'required' : '';
    const reqStar     = field.required ? ' *' : '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return `
<div class="form-field" data-field-id="${field.id}">
  <label class="form-label">${label}${reqStar}</label>
  <input type="${field.type}"
         class="form-input"
         placeholder="${placeholder}"
         ${reqAttr}
         data-field-id="${field.id}">
</div>`;

      case 'textarea':
        return `
<div class="form-field" data-field-id="${field.id}">
  <label class="form-label">${label}${reqStar}</label>
  <textarea class="form-textarea"
            placeholder="${placeholder}"
            ${reqAttr}
            data-field-id="${field.id}"></textarea>
</div>`;

      case 'select': {
        const options = (field.options ?? []).map(opt =>
          `<option value="${opt.value}">${t(opt.label, lang)}</option>`
        ).join('');
        return `
<div class="form-field" data-field-id="${field.id}">
  <label class="form-label">${label}${reqStar}</label>
  <select class="form-select"
          ${reqAttr}
          data-field-id="${field.id}">
    <option value="">Selecione...</option>
    ${options}
  </select>
</div>`;
      }

      case 'checkbox': {
        const checkboxes = (field.options ?? []).map(opt => `
  <label class="form-checkbox-option">
    <input type="checkbox"
           name="${field.id}"
           value="${opt.value}">
    ${t(opt.label, lang)}
  </label>`).join('');
        return `
<div class="form-field" data-field-id="${field.id}">
  <label class="form-label">${label}</label>
  <div class="form-checkbox-group">${checkboxes}
  </div>
</div>`;
      }

      case 'radio': {
        const radios = (field.options ?? []).map(opt => `
  <label class="form-radio-option">
    <input type="radio"
           name="${field.id}"
           value="${opt.value}"
           ${reqAttr}>
    ${t(opt.label, lang)}
  </label>`).join('');
        return `
<div class="form-field" data-field-id="${field.id}">
  <label class="form-label">${label}${reqStar}</label>
  <div class="form-radio-group">${radios}
  </div>
</div>`;
      }

      case 'toggle':
        return `
<div class="form-field form-field--toggle" data-field-id="${field.id}">
  <label class="form-toggle-label">
    <input type="checkbox"
           class="form-toggle-input"
           data-field-id="${field.id}"
           ${reqAttr}>
    <span class="form-toggle-track"></span>
    ${label}${reqStar}
  </label>
</div>`;

      case 'heading':
        return `<h3 class="form-heading">${label}</h3>`;

      case 'paragraph':
        return `<p class="form-paragraph">${label}</p>`;

      default:
        return '';
    }
  }).join('\n');
}

/**
 * Coleta as respostas do formulário renderizado.
 * @param {Array} formSchema
 * @returns {Object} responses  { fieldId: value, ... }
 */
function collectFormResponses(formSchema) {
  const responses = {};

  formSchema.forEach(field => {
    if (field.type === 'heading' || field.type === 'paragraph') return;

    if (field.type === 'checkbox') {
      const checked = document.querySelectorAll(`input[name="${field.id}"]:checked`);
      responses[field.id] = Array.from(checked).map(el => el.value);
    } else if (field.type === 'toggle') {
      const el = document.querySelector(`[data-field-id="${field.id}"].form-toggle-input`);
      responses[field.id] = el ? el.checked : false;
    } else {
      const el = document.querySelector(`[data-field-id="${field.id}"]`);
      if (el) responses[field.id] = el.value;
    }
  });

  return responses;
}

/**
 * Envia as respostas do formulário para a API.
 * @param {string} eventSlug
 * @param {Array}  formSchema
 * @param {string} apiBaseUrl  - ex: "https://api.example.com"
 * @returns {Promise<{ success: boolean, errors?: string[] }>}
 */
async function submitEventSignup(eventSlug, formSchema, apiBaseUrl) {
  const responses = collectFormResponses(formSchema);

  const res = await fetch(`${apiBaseUrl}/api/event/${eventSlug}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses }),
  });

  return await res.json();
}

/**
 * Inicializa o formulário: renderiza e conecta o submit.
 * @param {Object}   event
 * @param {string}   lang
 * @param {string}   apiBaseUrl
 * @param {Object}   [opts]
 * @param {string}   [opts.containerId='signup-form-container']
 * @param {Function} [opts.onSuccess]
 * @param {Function} [opts.onError]
 */
function initEventForm(event, lang, apiBaseUrl, opts = {}) {
  const containerId = opts.containerId ?? 'signup-form-container';
  const container   = document.getElementById(containerId);
  if (!container) return;

  if (!event.collect_signups || !event.registration_open) {
    container.innerHTML = '';
    return;
  }

  const formHtml = renderEventForm(event, lang);
  container.innerHTML = `
<form id="event-signup-form" novalidate>
  ${formHtml}
  <div id="form-error" class="form-error" style="display:none"></div>
  <button type="submit" class="form-submit">Enviar inscrição</button>
</form>`;

  const form = document.getElementById('event-signup-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    const errorEl   = document.getElementById('form-error');
    submitBtn.disabled = true;
    errorEl.style.display = 'none';

    const result = await submitEventSignup(event.slug, event.form_schema ?? [], apiBaseUrl);

    if (result.success) {
      if (opts.onSuccess) {
        opts.onSuccess();
      } else {
        container.innerHTML = '<p class="form-success">Inscrição realizada com sucesso!</p>';
      }
    } else {
      const msgs = result.errors ?? [result.error ?? 'Erro ao enviar inscrição'];
      errorEl.textContent = msgs.join(' · ');
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      if (opts.onError) opts.onError(msgs);
    }
  });
}
