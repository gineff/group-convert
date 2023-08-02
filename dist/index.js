"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const node_path_1 = __importDefault(require("node:path"));
const glob_1 = require("glob");
const utils_1 = require("./utils");
const ini_1 = __importDefault(require("ini"));
class Converter {
    file;
    options = [];
    range = [0, 0];
    progress = {};
    constructor(props) {
        Object.assign(this, props);
    }
    start() {
        console.log('start');
        return new Promise((resolve, reject) => {
            const ffmpeg = (0, node_child_process_1.spawn)('ffmpeg', this.options);
            ffmpeg.on('close', code => {
                resolve(code);
            });
            ffmpeg.on('error', e => {
                reject(e);
            });
            ffmpeg.stderr.on('data', data => {
                console.error(`ffmpeg: ${data}`);
            });
            ffmpeg.stdout.on('data', data => {
                const { bitrate, total_size, out_time_ms, progress } = ini_1.default.decode(data.toString());
                this.progress = {
                    bitrate,
                    status: progress,
                    totalSize: total_size,
                    outTimeMs: out_time_ms,
                };
            });
        });
    }
    toString() {
        const width = 70;
        let progressText = '';
        let percentage = 0;
        try {
            const value = Math.abs(this.progress.outTimeMs) / 1000000 || 0;
            percentage = (value / this.range[1]) * 100;
            const progress = Math.round((width * percentage) / 100);
            progressText = '='.repeat(progress).padEnd(width, ' ');
        }
        catch (e) {
            console.log(e);
        }
        return `[${progressText}] | ${(this.range[0] +
            '-' +
            this.range[1]).padStart(7, ' ')} | ${percentage.toFixed(2)}% \r\n`;
    }
}
const parseFileOutput = (filePath, _output) => {
    const { root, dir, name, ext } = node_path_1.default.parse(filePath);
    const { root: _root, dir: _dir, name: _name, ext: _ext } = node_path_1.default.parse(_output);
    const outputFileName = `${_name.replace('*', name)}${_ext.replace('.*', ext)}`;
    if (_dir === '*') {
        return node_path_1.default.join(root, dir, outputFileName);
    }
    return node_path_1.default.join(_root, _dir, outputFileName);
};
const startProcess = async () => {
    const [args, restArg] = (0, utils_1.extractArgs)(process.argv.slice(2), ['-i']);
    const files = await (0, glob_1.glob)(args['-i']);
    const output = restArg.splice(-1)[0];
    const converters = [];
    console.log('files', files);
    try {
        for (const file of files) {
            const outputFile = parseFileOutput(file, output);
            const converter = new Converter({
                file,
                options: ['-i', file, ...restArg, outputFile],
            });
            converters.push(converter);
        }
        for (const converter of converters) {
            await converter.start();
        }
    }
    catch (e) {
        console.log('error', e);
    }
};
startProcess();
//# sourceMappingURL=index.js.map