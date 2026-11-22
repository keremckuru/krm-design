import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { join } from 'node:path';
import { config } from './config.js';
import { openDatabase,passwordHash } from './database.js';
let muted=false;const output=new Writable({write(chunk,encoding,done){if(!muted)process.stdout.write(chunk,encoding);done();}});
const prompt=createInterface({input:process.stdin,output,terminal:true});
try{
 const email=(await prompt.question('Admin email: ')).trim().toLowerCase();
 process.stdout.write('Password (at least 12 characters; hidden): ');muted=true;
 const password=await prompt.question('');muted=false;process.stdout.write('\n');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12||password.length>256)throw new Error('Enter a valid email and a 12–256 character password.');
 const db=openDatabase(join(config.dataDir,'portfolio.sqlite'));
 db.prepare('INSERT INTO users(email,password) VALUES(?,?) ON CONFLICT(email) DO UPDATE SET password=excluded.password').run(email,passwordHash(password));
 db.prepare('DELETE FROM sessions WHERE email=?').run(email);db.close();console.log('Admin account saved. Open /admin/login.');
}catch(error){muted=false;console.error(error.message);process.exitCode=1;}finally{prompt.close();}
