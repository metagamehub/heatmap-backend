"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaverseUrl = exports.getMetaverseAddress = exports.heatmapMvLandsPerRequest = void 0;
const dotenv_1 = require("dotenv");
dotenv_1.config();
exports.heatmapMvLandsPerRequest = {
    sandbox: {
        lands: 1000,
    },
    decentraland: {
        lands: 1200,
    },
    'axie-infinity': { lands: 1200 },
    'somnium-space': { lands: 200 },
};
exports.getMetaverseAddress = (metaverse) => {
    switch (metaverse) {
        case 'sandbox':
            return '0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38';
        case 'decentraland':
            return '0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d';
        case 'somnium-space':
            return '0x913ae503153d9A335398D0785Ba60A2d63dDB4e2';
        default:
            return 'None';
    }
};
exports.metaverseUrl = (metaverse) => {
    const urls = {
        'somnium-space': process.env.SOMNIUM_URL,
        sandbox: process.env.SANDBOX_URL,
        decentraland: process.env.DECENTRALAND_URL,
        'axie-infinity': process.env.AXIE_URL,
    };
    return urls[metaverse];
};
