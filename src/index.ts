import { spawn } from 'node:child_process'
import path from 'node:path'
import { glob } from 'glob'
import { extractArgs } from './utils'
import ini from 'ini'

//import { createHash, makeDir } from './utils'
type ConverterProps = {
  file: string
  options: string[]
}

type Progress = {
  bitrate: string
  totalSize: number
  outTimeMs: number
  status: string
}

class Converter {
  file!: string
  options: string[] = []
  progress = {} as Progress
  constructor(props: ConverterProps) {
    Object.assign(this, props)
  }
  start() {
    console.log('start', this)
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', this.options)

      ffmpeg.on('close', code => {
        resolve(code)
      })

      ffmpeg.on('error', e => {
        reject(e)
      })

      ffmpeg.stderr.on('data', data => {
        console.error(`ffmpeg: ${data}`)
      })

      ffmpeg.stdout.on('data', data => {
        const { bitrate, total_size, out_time_ms, progress } = ini.decode(
          data.toString()
        )
        this.progress = {
          bitrate,
          status: progress,
          totalSize: total_size,
          outTimeMs: out_time_ms,
        }
      })
    })
  }
}

const parseFileOutput = (filePath: string, _output: string) => {
  const { root, dir, name, ext } = path.parse(filePath)
  console.log('root', root, 'dir', dir)
  const { root: _root, dir: _dir, name: _name, ext: _ext } = path.parse(_output)

  const outputFileName = `${_name.replace('*', name)}${_ext.replace('.*', ext)}`
  console.log('outputFileName', outputFileName)

  if (_dir === '*') {
    return path.join(root, dir, outputFileName)
  }
  return path.join(_root, _dir, outputFileName)
}

const startProcess = async () => {
  console.log(process.argv)
  const [args, restArg] = extractArgs(process.argv.slice(2), ['-i'])
  const files = await glob(args['-i'])
  const output: string = restArg.splice(-1)[0]
  const converters: Converter[] = []
  try {
    for (const file of files) {
      const outputFile = parseFileOutput(file, output)
      const converter = new Converter({
        file,
        options: ['-i', file, ...restArg, outputFile],
      })
      converters.push(converter)
    }

    for (const converter of converters) {
      await converter.start()
    }
  } catch (e) {
    console.log('error', e)
  }
}

startProcess()
