type Result = Record<string, string>
type RestArgv = string
export type ResultArgsUnion = [Result, RestArgv]

export const extractArgs = (argv: string, flags: string[]): ResultArgsUnion => {
  const result: Result = {}
  const restArgv = flags.reduce((accumulator, flag) => {
    const reg = new RegExp(`${flag}\s+(\S+)`, 'g')
    const match = argv.match(reg)
    if (!match) return accumulator
    const [, value] = Array.from(match)
    result[flag] = value
    return accumulator.replace(reg, '')
  },'')

  return [result, restArgv]
}
