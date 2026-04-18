// check.ts (Compilation check script)
import * as ci from 'miniprogram-ci';
import * as path from 'path';

const PROJECT_PATH: string = path.join(__dirname, '../../');

// --- Workaround for miniprogram-ci bug ---
// This is bug at node25, not in node22 (Note: Jenkins uses node22)
// miniprogram-ci expects global.localStorage to have a `getItem` method in its debug.js, causing crash.
// if (typeof globalThis !== 'undefined') {
//     try {
//         Object.defineProperty(globalThis, 'localStorage', {
//             value: {
//                 getItem: () => null,
//                 setItem: () => {},
//                 removeItem: () => {},
//                 clear: () => {}
//             },
//             configurable: true,
//             enumerable: true,
//             writable: true
//         });
//     } catch (e) {
//         // Ignore if it cannot be redefined
//     }
// }

(async (): Promise<void> => {
    try {
        console.log('Starting deep compilation check...');

        const privateKeyPath: string | undefined = process.env.WECHAT_KEY_PATH;
        const appid: string | undefined = process.env.WECHAT_APPID;

        const version: string = process.env.BUILD_NUMBER || '0.0.0';

        // Validation of environment variables
        if (!privateKeyPath || !appid) {
            throw new Error('Missing environment variables: WECHAT_KEY_PATH or WECHAT_APPID');
        }

        const project = new ci.Project({
            appid: appid, // AppID injected from Jenkins environment
            type: 'miniProgram',
            projectPath: PROJECT_PATH,
            privateKeyPath: privateKeyPath,
            ignores: ['node_modules/**/*', '.git/**/*'],
        });

        await ci.packNpmManually({
            packageJsonPath: path.join(PROJECT_PATH, 'package.json'),
            miniprogramNpmDistDir: path.join(PROJECT_PATH, 'miniprogram'),
        });

        await ci.preview({
            project,
            version: version,
            desc: 'CI Compilation Check',
            setting: {
                es6: true,
                minify: true,
                minifyJS: true,
                minifyWXML: true,
                minifyWXSS: true,
            },
            qrcodeFormat: 'image',
            qrcodeOutputDest: path.join(process.cwd(), 'preview_QR.jpg'),
            onProgressUpdate: console.log,
        });

        console.log('Compilation check passed!');
        
    } catch (error: unknown) {
        console.error('Compilation failed:');
        console.error(error);
        process.exit(1); 
    }
})();