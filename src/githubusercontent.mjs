#!/usr/bin/env -S corepack yarn node

import { writeFile } from 'fs/promises'
import http2 from 'http2'
import { isIP } from 'net'
import { stderr } from 'process'

if (process.argv.length < 4) {
  stderr.write(`ERROR: Missing required arguments.
`)
}

const easylist = {
  name: `acid-chicken/little-snitch-rules#easylist`,
  descripion: `Built from EasyList`,
  [`denied-remote-addresses`]: new Set(),
  [`denied-remote-domains`]: new Set(),
}
const easyprivacy = {
  name: `acid-chicken/little-snitch-rules#easyprivacy`,
  descripion: `Built from EasyPrivacy`,
  [`denied-remote-addresses`]: new Set(),
  [`denied-remote-domains`]: new Set(),
}
const session = http2.connect(`https://raw.githubusercontent.com`)

/**
 * @arg {String} entry
 * @arg {Set.<String>} resultAddress
 * @arg {Set.<String>} resultDomains
 */
function processEntry(entry, resultAddress, resultDomains) {
  if (!entry.startsWith(`||`) || !entry.endsWith(`^`)) {
    return
  }

  entry = entry.slice(2, -1).replace(/(?<=^[\d.]*\.)0+(?=\d[\d.]*$)/g, ``)

  if (isIP(entry)) {
    resultAddress.add(entry)
  } else {
    resultDomains.add(entry)
  }
}

/**
 * @arg {String} path
 * @arg {Set.<String>} resultAddress
 * @arg {Set.<String>} resultDomains
 */
async function fetch(path, resultAddress, resultDomains) {
  const request = session.request({
    [http2.constants.HTTP2_HEADER_METHOD]: `GET`,
    [http2.constants.HTTP2_HEADER_PATH]: path,
  })
  const [responseHeaders, responseFlags] = await new Promise((resolve) => request.on(`response`, (headers, flags) => resolve([headers, flags])))

  if (responseHeaders[http2.constants.HTTP2_HEADER_STATUS] !== 200) {
    stderr.write(`ERROR: "${path}" ${http2.constants.HTTP2_HEADER_STATUS} = ${responseHeaders[http2.constants.HTTP2_HEADER_STATUS]}
  `)
    process.exit(1)
  }

  let remain = ``

  request.setEncoding(`utf8`)

  for await (const responseChunk of request) {
    const [entry, ...rest] = /** @type {String} */ (responseChunk).split(`
`)

    remain += entry

    if (rest.length) {
      processEntry(remain, resultAddress, resultDomains)

      for (const entry of rest.slice(0, -1)) {
        processEntry(entry, resultAddress, resultDomains)
      }

      remain = rest.at(-1)
    }
  }
}

async function writeResult(name, result) {
  await writeFile(name, JSON.stringify(result, (key, value) => value instanceof Set ? Array.from(value) : value, 2))
}

await Promise.all([
  Promise.all([
    fetch(`/easylist/easylist/master/easylist/easylist_adservers.txt`, easylist[`denied-remote-addresses`], easylist[`denied-remote-domains`]),
    fetch(`/easylist/easylist/master/easylist/easylist_specific_block.txt`, easylist[`denied-remote-addresses`], easylist[`denied-remote-domains`]),
    fetch(`/easylist/easylist/master/easylist/easylist_thirdparty.txt`, easylist[`denied-remote-addresses`], easylist[`denied-remote-domains`]),
  ]).then(() => writeResult(process.argv[2], easylist)),
  Promise.all([
    fetch(`/easylist/easylist/master/easyprivacy/easyprivacy_specific.txt`, easyprivacy[`denied-remote-addresses`], easyprivacy[`denied-remote-domains`]),
    fetch(`/easylist/easylist/master/easyprivacy/easyprivacy_specific_cname.txt`, easyprivacy[`denied-remote-addresses`], easyprivacy[`denied-remote-domains`]),
    fetch(`/easylist/easylist/master/easyprivacy/easyprivacy_specific_international.txt`, easyprivacy[`denied-remote-addresses`], easyprivacy[`denied-remote-domains`]),
    fetch(`/easylist/easylist/master/easyprivacy/easyprivacy_thirdparty.txt`, easyprivacy[`denied-remote-addresses`], easyprivacy[`denied-remote-domains`]),
    fetch(`/easylist/easylist/master/easyprivacy/easyprivacy_thirdparty_international.txt`, easyprivacy[`denied-remote-addresses`], easyprivacy[`denied-remote-domains`]),
    fetch(`/easylist/easylist/master/easyprivacy/easyprivacy_trackingservers.txt`, easyprivacy[`denied-remote-addresses`], easyprivacy[`denied-remote-domains`]),
  ]).then(() => writeResult(process.argv[3], easyprivacy)),
])

session.close()
