# Node Modules Check

## Description

This script looks up your package.json and tells you if there are any outdated packages. In case of outdated packages the script returns an exit code 1, otherwise 0. It uses `npm outdated --json` under the hood.

### Features

* ignore specific packages to be marked as outdated
* sort packages by version difference (major → minor → patch)
* indicate version difference by color
* display type of dependency
* show the `homepage` setting from the package.json of the outdated package

<p align="center">
  <img width="800" src="docs/assets/node-modules-check.svg">
</p>

## Installation

```bash
npm install --save-dev @sum.cumo/node-modules-check
```

## Usage

```bash
check-node-modules
```

### Configuration

You can set up packages that should be ignored in a configuration file.

Example:

```json
{
  "ignore": [
    "eslint"
  ],
  "ignoreRegex": [
    "([a-z])." //regex can be used as well
  ],
  "ignoreDev": true, // ignore dev dependencies
  "ignoreSemver": [ // ignore semantic version
    "prerelease"
  ]
}
```

The configuration file can be specified through

```bash
check-node-modules --config path/to/some/config/file
```

or by placing a file named `.check-node-modules.config.json` in your projects folder.

### Purpose example: GitLab CI

At sum.cumo we run this check in a [scheduled pipeline in GitLab CI](https://docs.gitlab.com/ee/user/project/pipelines/schedules.html) in order to check for outdated node modules regularly and automatically.

### Dev workflow

1. `npm install`  
1. `./bin/check.js`

This will run the package on itself.

#### SVG creation

##### Dependencies

- [asciinema](https://github.com/asciinema/asciinema)
- [svg-term-cli](https://github.com/marionebl/svg-term-cli)

##### Commands

1. Create the `.cast` file:  
    ```bash
    asciinema rec node-modules-check.cast
    ```
1. Create the `.svg` file:  
    ```bash
    cat node-modules-check.cast | svg-term-cli --out node-modules-check.svg --profile=Seti --height=30 --width=100 --term iterm2 --window
    ```

## License

Copyright 2019 [sum.cumo GmbH](https://www.sumcumo.com/)

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

----

[Learn more about sum.cumo](https://www.sumcumo.com/en/) or [work on open source projects](https://www.sumcumo.com/jobs/), too!
