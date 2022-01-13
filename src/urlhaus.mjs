#!/usr/bin/env -S corepack yarn node

import http2 from 'http2'
import { isIP } from 'net'
import { stderr, stdout } from 'process'

const result = {
  name: `acid-chicken/little-snitch-rules#urlhaus`,
  descripion: `Built from Malicious URL Blocklist`,
  [`denied-remote-addresses`]: [],
  [`denied-remote-domains`]: [],
}
const session = http2.connect(`https://malware-filter.pages.dev`)
const domainsRequest = session.request({
  [http2.constants.HTTP2_HEADER_METHOD]: `GET`,
  [http2.constants.HTTP2_HEADER_PATH]: `/urlhaus-filter-domains.txt`,
})
const [domainsResponseHeaders, domainsResponseFlags] = await new Promise((resolve) => domainsRequest.on(`response`, (headers, flags) => resolve([headers, flags])))

if (domainsResponseHeaders[http2.constants.HTTP2_HEADER_STATUS] !== 200) {
  stderr.write(`ERROR: ${http2.constants.HTTP2_HEADER_STATUS} = ${domainsResponseHeaders[http2.constants.HTTP2_HEADER_STATUS]}
`)
  process.exit(1)
}

/**
 * @arg {String} entry
 */
function processEntry(entry) {
  if (!entry || entry[0] === `#`) {
    return
  }

  if (isIP(entry)) {
    result[`denied-remote-addresses`].push(entry)
  } else {
    result[`denied-remote-domains`].push(entry)
  }
}

let remain = ``

domainsRequest.setEncoding(`utf8`)

for await (const domainsResponseChunk of domainsRequest) {
  const [entry, ...rest] = /** @type {String} */ (domainsResponseChunk).split(`
`)

  remain += entry

  if (rest.length) {
    processEntry(remain)

    for (const entry of rest.slice(0, -1)) {
      processEntry(entry)
    }

    remain = rest.at(-1)
  }
}

session.close()
stdout.write(`${JSON.stringify(result, null, 2)}
`)
