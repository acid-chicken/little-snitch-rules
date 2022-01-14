#!/usr/bin/env -S corepack yarn node

import { writeFile } from 'fs/promises'
import https from 'https'
import { stderr } from 'process'

if (process.argv.length < 3) {
  stderr.write(`ERROR: Missing required arguments.
`)
}

const as = {
  name: `acid-chicken/little-snitch-rules#as`,
  descripion: `Built from as`,
  [`denied-remote-addresses`]: new Set(),
  [`denied-remote-domains`]: new Set(),
}

/**
 * @arg {String} entry
 * @arg {Set.<String>} result
 */
function processEntry(entry, result) {
  entry = entry.replace(/(?<=^[\d.]*\.)0+(?=\d[\d.]*$)/g, ``)

  result.add(entry)
}

/**
 * @arg {String} path
 * @arg {Set.<String>} result
 */
async function fetch(path, result) {
  /** @type {import('http').IncomingMessage} */
  const response = await new Promise((resolve) => https.request({
    host: `pgl.yoyo.org`,
    method: `GET`,
    path,
  }, resolve).end())

  if (response.statusCode !== 200) {
    stderr.write(`ERROR: "${path}" statusCode = ${response.statusCode}
`)
    process.exit(1)
  }

  let remain = ``

  response.setEncoding(`utf8`)

  for await (const responseChunk of response) {
    const [entry, ...rest] = /** @type {String} */ (responseChunk).split(`
`)

    remain += entry

    if (rest.length) {
      processEntry(remain, result)

      for (const entry of rest.slice(0, -1)) {
        processEntry(entry, result)
      }

      remain = rest.at(-1)
    }
  }
}

async function writeResult(name, result) {
  await writeFile(name, JSON.stringify(result, (key, value) => value instanceof Set ? Array.from(value) : value, 2))
}

await Promise.all([
  fetch(`/as/serverlist.php?hostformat=plain&mimetype=plaintext`, as[`denied-remote-domains`]),
  fetch(`/as/iplist.php?format=&mimetype=plaintext`, as[`denied-remote-addresses`]),
]).then(() => writeResult(process.argv[2], as))
