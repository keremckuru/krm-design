import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { initialProjects } from './seed.js';
export function passwordHash(password) { const salt=randomBytes(16).toString('hex'); return salt+':'+scryptSync(password,salt,64).toString('hex'); }
export function verifyPassword(password, hash) { const [salt,value]=hash.split(':'); const expected=Buffer.from(value,'hex'); const actual=scryptSync(password,salt,64); return actual.length===expected.length && timingSafeEqual(actual,expected); }
export function openDatabase(path) {
 if(path!==':memory:') mkdirSync(dirname(path),{recursive:true});
 const db=new DatabaseSync(path);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS projects(slug TEXT PRIMARY KEY,data TEXT NOT NULL,published INTEGER NOT NULL DEFAULT 0,deleted INTEGER NOT NULL DEFAULT 0,position INTEGER NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS project_visibility ON projects(deleted,published,position);
 CREATE TABLE IF NOT EXISTS media(key TEXT PRIMARY KEY,created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS project_media(slug TEXT NOT NULL REFERENCES projects(slug),key TEXT NOT NULL REFERENCES media(key),PRIMARY KEY(slug,key));
 CREATE INDEX IF NOT EXISTS media_lookup ON project_media(key);
 CREATE TABLE IF NOT EXISTS revisions(id INTEGER PRIMARY KEY,slug TEXT NOT NULL,data TEXT NOT NULL,created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS users(email TEXT PRIMARY KEY,password TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,email TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,data TEXT NOT NULL,created TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',fingerprint TEXT UNIQUE);
 CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
 INSERT OR IGNORE INTO settings(id,data) VALUES(1,'{"email":"kerim.kuru59@gmail.com","terms":""}');
 INSERT OR IGNORE INTO meta(key,value) VALUES('orderRevision','1');`);
 if(!db.prepare("SELECT 1 FROM meta WHERE key='seeded'").get()) transaction(db,()=>{
  for(const [index,p] of initialProjects.entries()) db.prepare('INSERT OR IGNORE INTO projects(slug,data,published,position,updated) VALUES(?,?,?,?,?)').run(p.slug,JSON.stringify({...p,homepage:true}),+p.published,index,new Date().toISOString());
  db.prepare("INSERT INTO meta(key,value) VALUES('seeded','1')").run();
 });
 return db;
}
export function transaction(db,fn) { db.exec('BEGIN IMMEDIATE'); try { const result=fn(); db.exec('COMMIT'); return result; } catch(error) { db.exec('ROLLBACK'); throw error; } }
export function projectFromRow(row) { return {...JSON.parse(row.data),published:!!row.published,deleted:!!row.deleted,order:row.position,revision:row.revision,updated:row.updated}; }
