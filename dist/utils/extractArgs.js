"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (argv, flags) => {
    const extracted = {};
    const restArgv = flags.reduce((accumulator, flag) => {
        const index = accumulator.indexOf(flag);
        if (~index) {
            const [_flag, value] = accumulator.splice(index, flag.startsWith('-') ? 2 : 1);
            extracted[flag] = value;
        }
        return accumulator;
    }, argv);
    return [extracted, restArgv];
};
//# sourceMappingURL=extractArgs.js.map