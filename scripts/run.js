import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const mode=process.argv[2];if(!['dev','start'].includes(mode))throw new Error('Use dev or start');
const backend=spawn(process.execPath,[...(mode==='dev'?['--watch']:[]),'src/server.js'],{cwd:resolve('backend'),stdio:'inherit'});
const frontend=spawn(process.execPath,[resolve('node_modules/next/dist/bin/next'),mode==='dev'?'dev':'start','--hostname','127.0.0.1'],{cwd:resolve('frontend'),stdio:'inherit'});
let stopping=false;function stop(code=0){if(stopping)return;stopping=true;backend.kill('SIGTERM');frontend.kill('SIGTERM');process.exitCode=code;}
for(const child of [backend,frontend]){child.on('error',error=>{console.error(error);stop(1);});child.on('exit',code=>stop(code??1));}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
