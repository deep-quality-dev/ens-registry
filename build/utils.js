"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSecret = exports.sleep = void 0;
const crypto_1 = require("crypto");
const sleep = (m) => new Promise(r => setTimeout(r, m));
exports.sleep = sleep;
const randomSecret = () => {
    return `0x${(0, crypto_1.randomBytes)(32).toString('hex')}`;
};
exports.randomSecret = randomSecret;
//# sourceMappingURL=utils.js.map