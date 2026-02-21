const API_CHARACTERS_URL = 'https://api.jikan.moe/v4/anime/11061/characters'

const reloadCharactersBtn = document.querySelector('#reload-characters-btn')
const charactersStatus = document.querySelector('#characters-status')
const charactersList = document.querySelector('#characters-list')

const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const normalizeCharacters = (payload) => {
    if (Array.isArray(payload?.data)) return payload.data
    return []
}

const getCharacterImage = (entry) => {
    return entry?.character?.images?.jpg?.image_url
        || entry?.character?.images?.webp?.image_url
        || '../images/image.png'
}

const getVoiceActors = (entry) => {
    if (!Array.isArray(entry?.voice_actors)) return '-'

    const names = entry.voice_actors
        .filter((item) => item?.person?.name)
        .map((item) => item.person.name)
        .slice(0, 2)

    return names.length ? names.join(', ') : '-'
}

const setStatus = (message, isError = false) => {
    if (!charactersStatus) return
    charactersStatus.textContent = message
    charactersStatus.classList.toggle('characters_status_error', isError)
}

const renderCharacters = (characters) => {
    if (!charactersList) return

    if (!characters.length) {
        charactersList.innerHTML = ''
        setStatus('Персонажи не найдены', true)
        return
    }

    charactersList.innerHTML = characters.map((entry) => {
        const name = escapeHtml(entry?.character?.name || 'Unknown character')
        const japaneseName = escapeHtml(entry?.character?.name_kanji || '-')
        const role = escapeHtml(entry?.role || '-')
        const favorites = escapeHtml(entry?.favorites ?? '-')
        const voiceActors = escapeHtml(getVoiceActors(entry))
        const image = escapeHtml(getCharacterImage(entry))
        const profileUrl = escapeHtml(entry?.character?.url || '')

        return `
            <article class="character">
                <div class="character__inner">
                    <img src="${image}" alt="${name}" class="character__image" loading="lazy">
                    <div class="character__info">
                        <h3 class="character__name">${name}</h3>
                        <p class="character__meta"><strong>JP:</strong> ${japaneseName}</p>
                        <p class="character__meta"><strong>Role:</strong> ${role}</p>
                        <p class="character__meta"><strong>Favorites:</strong> ${favorites}</p>
                        <p class="character__meta"><strong>Voice:</strong> ${voiceActors}</p>
                    </div>
                </div>
            </article>
        `
    }).join('')

    setStatus(`Загружено персонажей: ${characters.length}`)
}

const loadCharacters = async () => {
    if (!charactersList) return

    try {
        setStatus('Загрузка...')
        const response = await fetch(API_CHARACTERS_URL)
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText || 'request failed'}`)
        }

        const payload = await response.json()
        const characters = normalizeCharacters(payload)
        renderCharacters(characters)
    } catch (error) {
        charactersList.innerHTML = ''
        if (error instanceof Error && error.message.includes('429')) {
            setStatus('Jikan API rate limit. Подожди немного и нажми Reload.', true)
        } else {
            setStatus('Не удалось загрузить персонажей из Jikan API.', true)
        }
        console.error('Failed to load Jikan characters:', error)
    }
}

const init = () => {
    reloadCharactersBtn?.addEventListener('click', loadCharacters)
    loadCharacters()
}

init()
