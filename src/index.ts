// Types
type ShowParams = {
    todoistHost?: string
    content?: string
    priority?: 1 | 2 | 3 | 4
    date?: string
    theme?: number
    project_id?: number
    onAdd?: (item: any) => void
    onClose?: () => void
    onLoadingError?: () => void
}

// Constants
let WINDOW: Window | null = null
let CURRENT_PARAMS: ShowParams | null = null

export function showQuickAdd(parms: ShowParams = {}) {
    let todoistHost = parms.todoistHost
    if (!todoistHost) {
        todoistHost = 'todoist.com'
    }

    let content = parms.content
    if (!content) {
        const title = document.title.replace(/\[/g, '(').replace(/\]/g, ')')
        content = '[' + title + '](' + window.location + ')'
    }

    if (WINDOW) {
        WINDOW.close()
    }

    setupDataBus()

    CURRENT_PARAMS = parms

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

    urlParms += 'view_mode=window'

    const url = 'https://' + todoistHost + '/add' + urlParms

    /**
     * We're opening the quick add page in a new window. The window will be
     * centered on the screen.
     */
    const width = 550
    const height = 500
    const left = window.screen.availWidth / 2 - width / 2
    const top = window.screen.availHeight / 2 - height / 2
    var windowFeatures =
        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no,'

    windowFeatures += 'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
    windowFeatures += 'screenX=' + left + ',screenY=' + top
    WINDOW = window.open(url, 'todoist-quickadd-window', windowFeatures)
}

function remove() {
    if (WINDOW) {
        WINDOW.close()
    }
    teardownDataBus()
    WINDOW = null
    CURRENT_PARAMS = null
}

function dataBus(event: MessageEvent) {
    const data = event.data
    if (data && data.service === 'Todoist Quick Add SDK') {
        switch (data.type) {
            case 'LOADED_ADD_VIEW':
                break

            case 'TASK_ADDED':
                if (CURRENT_PARAMS && CURRENT_PARAMS.onAdd) {
                    CURRENT_PARAMS.onAdd(data.data.item)
                }
                remove()
                break

            case 'CLOSE_ADD_VIEW':
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
