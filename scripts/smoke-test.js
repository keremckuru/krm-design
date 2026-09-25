import { spawn } from 'node:child_process';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import assert from 'node:assert/strict';
import { openDatabase,passwordHash } from '../backend/src/database.js';
const dir=await mkdtemp(join(tmpdir(),'krm-smoke-'));
const db=openDatabase(join(dir,'portfolio.sqlite'));db.prepare('INSERT INTO users VALUES(?,?)').run('smoke@example.com',passwordHash('only-for-automated-tests'));db.close();
const backendPort=4035,frontendPort=3035,origin=`http://127.0.0.1:${frontendPort}`;
const logs=[];const processes=[];let checks=0;
function launch(args,cwd,env){const child=spawn(process.execPath,args,{cwd,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});for(const stream of [child.stdout,child.stderr])stream.on('data',data=>logs.push(data.toString()));processes.push(child);return child;}
async function ready(url){for(let i=0;i<100;i++){try{const response=await fetch(url);if(response.ok)return;}catch{}await new Promise(r=>setTimeout(r,150));}throw new Error('Service did not become ready: '+url);}
try{
 launch(['src/server.js'],resolve('backend'),{DATA_DIR:dir,BACKEND_PORT:String(backendPort),PUBLIC_ORIGIN:origin});
 launch([resolve('node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(frontendPort)],resolve('frontend'),{BACKEND_URL:`http://127.0.0.1:${backendPort}`});
 await ready(`http://127.0.0.1:${backendPort}/api/health`);await ready(origin+'/api/health');
 for(const path of ['/','/projects','/projects/fenerbahce-adidas','/world','/about','/contact','/info','/admin/login']){const response=await fetch(origin+path);assert.equal(response.status,200,path);const html=await response.text();assert.ok(!html.includes('Application error'),path);assert.ok(html.includes('<html'),path);checks++;console.log('PASS',path);}
 const admin=await fetch(origin+'/admin',{redirect:'manual'});assert.equal(admin.status,307);assert.equal(admin.headers.get('location'),'/admin/login');checks++;
 const privateApi=await fetch(origin+'/api/projects');assert.equal(privateApi.status,401);checks++;
 const missing=await fetch(origin+'/projects/does-not-exist');assert.equal(missing.status,404);checks++;
 const login=await fetch(origin+'/api/auth/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({email:'smoke@example.com',password:'only-for-automated-tests'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];checks++;
 const authorized=await fetch(origin+'/admin',{headers:{cookie}});assert.equal(authorized.status,200);assert.match(await authorized.text(),/admin-layout/);checks++;
 const projects=await fetch(origin+'/api/projects',{headers:{cookie}});assert.equal(projects.status,200);assert.ok(projects.headers.get('x-order-revision'));const list=await projects.json();checks++;
 const save=await fetch(origin+'/api/projects',{method:'POST',headers:{cookie,origin,'content-type':'application/json'},body:JSON.stringify({...list[0],title:'Smoke test update',originalSlug:list[0].slug})});assert.equal(save.status,200);checks++;
 const detail=await fetch(origin+'/projects/'+list[0].slug);assert.match(await detail.text(),/<title>Smoke test update — KRM Design<\/title>/);checks++;
 const logout=await fetch(origin+'/api/auth/logout',{method:'POST',headers:{cookie,origin}});assert.equal(logout.status,200);assert.equal((await fetch(origin+'/api/projects',{headers:{cookie}})).status,401);checks++;
 console.log(`PASS ${checks} production HTTP checks (real Next server + backend + proxy + session).`);
}catch(error){console.error(logs.join('\n'));throw error;}finally{await Promise.all(processes.map(child=>new Promise(resolve=>{child.once('exit',resolve);child.kill('SIGTERM');})));await rm(dir,{recursive:true,force:true});}
