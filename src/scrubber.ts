import L from 'lodash'

export interface ScrubEntry {
  path: string
  regex: string
  filler: string
}

const scrubber = (paths: (string | ScrubEntry)[], filler = 'scrubbed') => (
  obj: any
) => {
  if (obj.toJSON) {
    // eslint-disable-next-line
    obj = obj.toJSON()
  }
  const [setters, matchers] = L.partition(paths, L.isString)
  L.forEach(setters as string[], p => L.get(obj, p) && L.set(obj, p, filler))
  L.forEach(
    matchers as ScrubEntry[],
    ({ path, regex, filler: matcherFiller }) =>
      L.set(
        obj,
        path,
        L.get(obj, path).replace(new RegExp(regex), matcherFiller || filler)
      )
  )
  return obj
}

export default scrubber
