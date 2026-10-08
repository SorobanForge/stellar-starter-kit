/* eslint-disable */
const { spawn } = require('child_process');
const path = require('path');
const process = require('process');

const scriptName = process.argv[2];
const args = process.argv.slice(3);

if (!scriptName) {
  console.error('Error: No script name provided to run.js');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const scriptPath = path.join(__dirname, scriptName + (isWindows ? '.ps1' : '.sh'));

let cmd, cmdArgs;
if (isWindows) {
  cmd = 'powershell';
  cmdArgs = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...args];
} else {
  cmd = 'bash';
  cmdArgs = [scriptPath, ...args];
}

const child = spawn(cmd, cmdArgs, { stdio: 'inherit' });
child.on('exit', (code) => {
  process.exit(code);
});
