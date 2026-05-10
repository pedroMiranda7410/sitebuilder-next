// Cole no topo do script.js do site estático
// após definir SITE_SLUG e API_URL

let currentLang = 'pt'

function t(field) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[currentLang] ?? field['pt'] ?? field['en'] ?? ''
}

function setLanguage(lang) {
  currentLang = lang
  // re-renderiza todas as seções com o novo idioma
  if (window.__siteData) renderAll(window.__siteData)
}

// Ao buscar dados da API, salva globalmente
async function fetchSiteData() {
  try {
    const res = await fetch(`${API_URL}/api/site/${SITE_SLUG}`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    window.__siteData = data
    // Define idioma padrão do tenant
    currentLang = data.tenant.default_lang ?? 'pt'
    return data
  } catch {
    return null
  }
}

// Uso nos renders:
// element.textContent = t(section.content.title)
// → pega automaticamente o idioma ativo
