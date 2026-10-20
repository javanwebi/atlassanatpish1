#!/usr/bin/env python3
"""Configure a new stack without reading/writing managed-project credentials."""
from pathlib import Path
from urllib.parse import quote
import json, os, secrets, sys
root=Path(sys.argv[1]); env_file=root/'stack/.env'
lines=env_file.read_text().splitlines()
values={}
for line in lines:
    if line.strip() and not line.lstrip().startswith('#') and '=' in line:
        key,value=line.split('=',1); values[key.strip()]=value.strip().strip('\"').strip("'")
required=['POSTGRES_PASSWORD','ANON_KEY','SERVICE_ROLE_KEY','JWT_SECRET']
if any(not values.get(k) for k in required): raise SystemExit('Official key generation did not produce all required secrets')
origin=os.environ.get('SANATPISH_PUBLIC_ORIGIN','http://127.0.0.1:3000').rstrip('/')
if origin!='http://127.0.0.1:3000' and not origin.startswith('https://'): raise SystemExit('Public origin must use HTTPS')
public_api=origin+'/supabase'
changes={'SITE_URL':origin,'API_EXTERNAL_URL':public_api+'/auth/v1','SUPABASE_PUBLIC_URL':public_api,'ENABLE_PHONE_SIGNUP':'false','ENABLE_PHONE_AUTOCONFIRM':'false'}
seen=set(); result=[]
for line in lines:
    key=line.split('=',1)[0].strip()
    if key in changes: result.append(key+'='+changes[key]); seen.add(key)
    else: result.append(line)
result.extend(k+'='+v for k,v in changes.items() if k not in seen)
env_file.write_text('\n'.join(result)+'\n');env_file.chmod(0o600)
app={
 'NODE_ENV':'production','PORT':'3000','DATA_BACKEND':'postgres','DATABASE_SCHEMA':'adopted','DATABASE_ENV':'development',
 'DATABASE_URL':'postgresql://postgres:'+quote(values['POSTGRES_PASSWORD'],safe='')+'@db:5432/postgres',
 'SUPABASE_URL':'http://api-gw:8000','SUPABASE_PUBLISHABLE_KEY':values['ANON_KEY'],
 'SUPABASE_SERVICE_ROLE_KEY':values['SERVICE_ROLE_KEY'],'SUPABASE_SMS_READY':'false',
 'PORTAL_SESSION_SECRET':secrets.token_hex(48),'APP_URL':origin,
}
app_file=root/'app.env'
if app_file.exists():raise SystemExit('Application environment already exists; refusing to rotate secrets')
app_file.write_text(''.join(k+'='+v+'\n' for k,v in app.items()));app_file.chmod(0o600)
(root/'state.json').write_text(json.dumps({'schema':'adopted','stage':'development','data_import_verified':False,'public_origin':origin},indent=2)+'\n')
