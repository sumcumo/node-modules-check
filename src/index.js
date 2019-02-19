const { exec } = require('child_process')
const Table = require('easy-table')
const semver = require('semver')
const chalk = require('chalk')
const figures = require('figures')
const boxen = require('boxen')
const fs = require('fs')
const { argv } = require('yargs')

const configFileDefaultPath = '.check-node-modules.config.json'
const hasConfigFileDefault = fs.existsSync(configFileDefaultPath)
const configFileArg = argv.config
let options = {
  ignore: [],
  ignoreRegex: [],
}

if (hasConfigFileDefault || configFileArg) {
  const file = configFileArg || configFileDefaultPath
  const data = fs.readFileSync(file, 'utf8')
  options = JSON.parse(data)
}

const sorting = ['major', 'minor', 'patch', 'prerelease', 'premajor', 'preminor']

const diff2chalk = (diff) => {
  const data = {
    major: chalk.red,
    minor: chalk.yellow,
    patch: chalk.blue,
    prerelease: chalk.magenta,
    premajor: chalk.green,
    preminor: chalk.bold.cyan,
    ignored: v => v,
  }

  if (data[diff]) {
    return data[diff]
  }
  console.warn(`unhandled semver ${diff}`)
  return chalk.grey
}

const homepage = (name) => {
  const packageJsonPath = `${process.cwd()}/node_modules/${name}/package.json`
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const module = require(packageJsonPath)

  return module.homepage
}

const differences = {}
let shownOutdatedModules = 0

module.exports = () => {
  console.info('searching for node module updates…')

  exec('npm outdated --json --long', (_err, stdout, _stderr) => {
    if (stdout) {
      const outdatedModules = JSON.parse(stdout)
      const moduleKeys = Object.keys(outdatedModules)
      const ignoredModules = []

      if (moduleKeys.length > 0) {
        const rows = []
        moduleKeys.forEach((moduleKey) => {
          const currentVersion = outdatedModules[moduleKey].current
          const latestVersion = outdatedModules[moduleKey].latest
          const { type } = outdatedModules[moduleKey]

          rows.push({
            moduleKey,
            currentVersion,
            latestVersion,
            type,
            homepage: homepage(moduleKey),
          })

          let diff = semver.diff(currentVersion, latestVersion)

          let matchesIgnore
          if (options.ignore.length > 0) {
            options.ignore.forEach((pattern) => {
              matchesIgnore = moduleKey.match(pattern)
            })
          }
          if (options.ignoreRegex.length > 0) {
            options.ignoreRegex.forEach((pattern) => {
              matchesIgnore = moduleKey.match(pattern)
            })
          }

          if (matchesIgnore) {
            diff = 'ignored'
            ignoredModules.push(moduleKey)
          } else {
            shownOutdatedModules += 1
          }

          differences[moduleKey] = diff
        })

        if (ignoredModules.length > 0) {
          console.info(`${chalk.bold.red.underline('ignoring:\n')} ${ignoredModules.join('\n ')}`)
        }

        if (shownOutdatedModules > 0) {
          const table = new Table()
          rows.forEach((row) => {
            const diff = differences[row.moduleKey]
            if (diff !== 'ignored') {
              table.cell(figures.circleFilled, diff2chalk(diff)(figures.circleFilled))
              table.cell('Package', row.moduleKey)
              table.cell('Current', row.currentVersion)
              table.cell('Latest', row.latestVersion)
              table.cell('Type', row.type)
              table.cell('Homepage', row.homepage)
              table.newRow()
            }
          })

          // major -> minor -> patch
          table.sort((a, b) => {
            const diffA = sorting.indexOf(differences[a.Package])
            const diffB = sorting.indexOf(differences[b.Package])

            if (diffA !== diffB) {
              return diffA > diffB ? 1 : -1
            }

            // if same difference, than by name
            return a.Package < b.Package ? -1 : 1
          })

          console.info('')

          console.info(table.toString())

          const legends = sorting.map(value => diff2chalk(value)(value))
          console.info(legends.join(' | '))

          console.info('')

          const texts = [
            `${' '.repeat(3)}If you want to upgrade to the latest version, please run:`,
            `${' '.repeat(15)}${chalk.bold.magenta('npm install <package>@latest')}`,
            'This will update your package.json and install the latest version.',
          ]
          console.info(boxen(texts.join('\n'), {
            borderColor: 'green',
            borderStyle: 'round',
            padding: 1,
            margin: 1,
          }))

          process.exit(1)
        }
      }
    }

    console.info(chalk.green('Everything is up to date!'))
    process.exit(0)
  })
}
