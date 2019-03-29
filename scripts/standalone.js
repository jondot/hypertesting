#!/usr/bin/env node
const fs = require('fs-extra')
const execa = require('execa')
const path = require('path')

const package = require(path.join(__dirname, '../package.json'))
const wd = path.join(__dirname, '../standalone')
const v = package.version
const name = package.name

const plats = ['macos', /*'win.exe', */ 'linux']

const main = async () => {
  for (const plat of plats) {
    console.log(`standalone: packing ${plat}`)
    const file = `${name}-${plat}`

    await fs.remove(`${wd}/tar-${file}`)
    await fs.mkdir(`${wd}/tar-${file}`)
    // give Windows special treatment: it should be a zip file and keep an .exe suffix
    if (plat === 'win.exe') {
      await fs.move(`${wd}/${file}`, `${wd}/tar-${file}/hytest.exe`)
      await execa.shell(
        `cd ${wd}/tar-${file} && zip ../hytest.${plat}.v${v}.zip hytest.exe`
      )
    } else {
      await fs.move(`${wd}/${file}`, `${wd}/tar-${file}/hytest`)
      await execa.shell(
        `cd ${wd}/tar-${file} && tar -czvf ../hytest.${plat}.v${v}.tar.gz hytest`
      )
    }
    await fs.remove(`${wd}/tar-${file}`)
  }

  console.log('standalone: done.')
  console.log((await execa.shell(`ls ${wd}`)).stdout)
}

main()
