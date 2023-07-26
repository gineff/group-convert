type Extracted = Record<string, string>
type RestArgv = string[]
export type ResultArgsUnion = [Extracted, RestArgv]

export default (argv: string[], flags: string[]): ResultArgsUnion => {
  const extracted: Extracted = {}
  const restArgv = flags.reduce((accumulator, flag) => {
    const index = accumulator.indexOf(flag)
    if (~index) {
      const [_flag, value] = accumulator.splice(
        index,
        flag.startsWith('-') ? 2 : 1
      )
      extracted[flag] = value
    }
    return accumulator
  }, argv)

  return [extracted, restArgv]
}
