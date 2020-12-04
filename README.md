# todoist-quickadd

Add the powerful Todoist Quick Add anywhere on the web. The experience is simple, beautiful, and fast.

The Todoist Quick Add also supports all of the powerful features, such as natrual language parsing.


## Installation

Use [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/lang/en/docs/install/) to install:

```sh
npm install @doist/todoist-quickadd
# or
yarn add @doist/todoist-quickadd
```


## Usage (vanilla JavaScript)

```javascript
import {showQuickAdd} from '@doist/todoist.quickadd'

showQuickAdd({
    content: 'Hello world',
    priority: 3,
    date: 'today',
})
```


## Usage (React)

```javascript
import { useState, useEffect } from 'react'

import {showQuickAdd} from '@doist/todoist.quickadd'

function Todoist() {
    const [content, setContent] = useState<string | null>(null)

    // Set up store listener
    useEffect(() => {
        const todoistListener = Store.addListener(() => {
            setContent(TodoistStore.getState().content)
        })
        return () => todoistListener && todoistListener.remove()
    }, [])

    // Handle content change
    useEffect(() => {
        function onLoadingError() {
            alert('Could not load Todoist Quick Add. Please try again later.')
        }

        if (content) {
            StoreActions.resetContent()

            showQuickAdd({
                content: content,
                onLoadingError: onLoadingError,
            })
        }
    }, [content])

    return null
}
```


## showQuickAdd API

The `showQuickAdd` function can take the following parameters. All of them are
optional:

| Name           | Type                    | Description                                                                                 |
| -------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| content        | string                  | The preset content                                                                          |
| priority       | number between 1 and 4  | The preset priority                                                                         |
| theme          | number between 1 and 11 | Force a specific Todoist theme (e.g, `2` for Todoist Red,<br>and `11` for Todoist Darkmode) |
| project_id     | number                  | The preset project (by default it's the Inbox)                                              |
| onAdd          | (item: any) => void     | Callback that will be called when a task is added.                                          |
| onClose        | () => void              | Callback that will be called when the Quick Add is closed                                   |
| onLoadingError | () => void              | Callback that will be called when the Quick Add fails to load                               |
| todoistHost    | string                  | An optional Todoist host, e.g. `staging.todoist.com`                                        |


## Changelog

We're maintaining a [changelog](./CHANGELOG.md) in this repository. Our versioning follows [semantic versioning](https://semver.org/).


## Releasing

A new version of todoist-quickadd is published both on npm and GitHub Package Registry whenever a new release on GitHub is created. A GitHub Action will automatically perform all the necessary steps.

The Action will release the version number that's specified inside the `package.json`'s `version` field so make sure that it reflects the version you want to publish. Additionally, the Action can be triggered manually in case something went wrong in the automation.


## Contributing

Contributions are welcome.


## License

This project is distributed under the [MIT License](./LICENSE).
