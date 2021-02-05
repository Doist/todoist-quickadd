// Types
type ShowParams = {
    todoistHost?: string
    content?: string
    priority?: 1 | 2 | 3 | 4
    date?: string
    theme?: number
    project_id?: number
    view_mode?: 'window'
    onAdd?: (item: any) => void
    onClose?: () => void
    onLoadingError?: () => void
}

// Constants
const LOADING_TIMEOUT = 5000 // 5 seconds
let TIMEOUT_FN: ReturnType<typeof setTimeout>
let IFRAME: HTMLElement | null = null
let WINDOW: Window | null = null
let LOADED = false
let CURRENT_PARAMS: ShowParams | null = null

export function showQuickAdd(parms: ShowParams = {}) {
    let todoistHost = parms.todoistHost
    if (!todoistHost) {
        todoistHost = 'todoist.com'
    }

    let content = parms.content
    if (!content) {
        const title = document.title.replace(/\[/g, '(').replace(/\]/g, ')')
        content = '[' + title + ']' + '(' + window.location + ')'
    }

    if (IFRAME) {
        remove()
    }

    setupDataBus()

    CURRENT_PARAMS = parms

    const iframe = document.createElement('iframe')
    let urlParms = '?'
    urlParms += 'content=' + encodeURIComponent(content)
    if (parms.priority) {
        urlParms += '&priority=' + encodeURIComponent(parms.priority)
    }
    if (parms.date) {
        urlParms += '&date=' + encodeURIComponent(parms.date)
    }
    if (parms.theme) {
        urlParms += '&theme=' + encodeURIComponent(parms.theme)
    }
    if (parms.project_id) {
        urlParms += '&project_id=' + encodeURIComponent(parms.project_id)
    }

    const url = 'https://' + todoistHost + '/add' + urlParms
    if (parms.view_mode === 'window') {
        /**
         * We're opening the quick add page in a new window. The window will be
         * centered on the screen.
         */
        const width = 450
        const height = 550
        const left = window.screen.availWidth / 2 - width / 2
        const top = window.screen.availHeight / 2 - height / 2
        var windowFeatures =
            'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no,'

        windowFeatures +=
            'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
        windowFeatures += 'screenX=' + left + ',screenY=' + top
        WINDOW = window.open(url, 'todoist-quickadd-window', windowFeatures)
    } else {
        iframe.src = url
        const iframeStyle = `
            width: 100vw !important;
            height: 100vh !important;
            border: 0 !important;
            margin: 0 !important;
            position: fixed !important;
            z-index: 10000000 !important;
            top: 0 !important;
            left: 0 !important;
            background: rgba(0, 0, 0, 0.3) !important;`
        iframe.setAttribute('style', iframeStyle)
        document.body.appendChild(iframe)
        IFRAME = iframe
        setLoadingTimeout()
    }
}

function remove() {
    if (IFRAME) {
        IFRAME.remove()
    }
    if (WINDOW) {
        WINDOW.close()
    }
    teardownDataBus()
    clearLoadingTimeout()
    IFRAME = null
    WINDOW = null
    LOADED = false
    CURRENT_PARAMS = null
}

function dataBus(event: MessageEvent) {
    const data = event.data
    if (data && data.service == 'Todoist Quick Add SDK') {
        switch (data.type) {
            case 'LOADED_ADD_VIEW':
                LOADED = true
                clearLoadingTimeout()
                break

            case 'TASK_ADDED':
                clearLoadingTimeout()
                if (CURRENT_PARAMS && CURRENT_PARAMS.onAdd) {
                    CURRENT_PARAMS.onAdd(data.data.item)
                }
                remove()
                break

            case 'CLOSE_ADD_VIEW':
                clearLoadingTimeout()
                if (CURRENT_PARAMS && CURRENT_PARAMS.onClose) {
                    CURRENT_PARAMS.onClose()
                }
                remove()
                break
        }
    }
}

function setupDataBus() {
    window.addEventListener('message', dataBus)
}

function teardownDataBus() {
    window.removeEventListener('message', dataBus)
}

function setLoadingTimeout() {
    TIMEOUT_FN = setTimeout(() => {
        if (!LOADED) {
            if (CURRENT_PARAMS && CURRENT_PARAMS.onLoadingError) {
                CURRENT_PARAMS.onLoadingError()
            } else {
                alert('Could not load Todoist Quick Add. Please try again later.')
            }
            remove()
        }
    }, LOADING_TIMEOUT)
}

function clearLoadingTimeout() {
    clearTimeout(TIMEOUT_FN)
}
