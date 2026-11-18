/** READ-ONLY Studionet source+LATEST_FINAL deployment attestation.
 * No wallet, no transaction sends; no consensus outcome is manufactured.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createClient} from 'genlayer-stable';
import {studionet} from 'genlayer-stable/chains';
import {TransactionHashVariant} from 'genlayer-stable/types';

const sourceA=process.env.SCOPETRACE_SCOPEDELTA_ADDRESS||'0xEE7B3883e8a52A48368AdB0528F49730A0aE1689';
const sourceB=process.env.SCOPETRACE_TRACEBOUND_ADDRESS||'0xaD4de51008032F665d44964B1589B7D112156a32';
if(sourceA.toLowerCase()===sourceB.toLowerCase())throw Error('A and B must be distinct deployments.');
const client=createClient({chain:studionet});
const canonical=s=>String(s).replace(/\r\n/g,'\n').replace(/\n+$/,'');
const sha=s=>createHash('sha256').update(s).digest('hex');

async function verifySource(name,address,path){
 const expected=canonical(readFileSync(path,'utf8'));
 const code=await client.getContractCode(address);
 if(typeof code!=='string'||!code.startsWith('# { "Depends": "py-genlayer:')){
  throw new Error(name+': deployed code is not visible/FINALIZED at '+address);
 }
 const actual=canonical(code);
 if(expected!==actual)throw Error(name+': deployed code differs from GitHub. '+JSON.stringify({
   expected_sha256:sha(expected),deployed_sha256:sha(actual)
 }));
 return sha(actual);
}
async function read(address,fn,args=[]){
 const result=await client.readContract({
  address,functionName:fn,args,
  transactionHashVariant:TransactionHashVariant.LATEST_FINAL
 });
 return typeof result==='string'&&result.startsWith('{')?JSON.parse(result):result;
}
const a_sha=await verifySource('ScopeDelta',sourceA,'contracts/scope_delta.py');
const b_sha=await verifySource('TraceBound',sourceB,'contracts/trace_bound.py');
const aStats=await read(sourceA,'stats');
const bStats=await read(sourceB,'stats');
const bAddress=await read(sourceB,'get_registry');
const scopeOne=await read(sourceA,'get_scope',[1]);
const activeOne=await read(sourceA,'get_active_scope',[1]);
const auditOne=await read(sourceB,'get_audit',[1]);
const expectedTrace=JSON.parse(readFileSync('examples/scope1_allowed_trace.json','utf8'));
const auditDigest='e6ce66c283abba292a41aa3ce0cc6d83d6b004fb1b9bcbc2eec27d9ef5a93df2';
// Canonicalize keys recursively, exactly as Python sort_keys=True does.
const sorted=value=>Array.isArray(value)?value.map(sorted):
  value&&typeof value==='object'?Object.fromEntries(
    Object.keys(value).sort().map(k=>[k,sorted(value[k])])):value;
const canonicalTrace=JSON.stringify(sorted(expectedTrace));

const initialSha='facc957baeedb76db936131d228e88f3ce5455e35652938a5b06882bad5550c9';
const initialPrincipal='0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb';
const initialAgent='0xd6b8a3a5eb329410d9504784812b8569afa8c2af';
const expected={
 scope_name:aStats?.name==='SCOPEDELTA',
 scope_version:aStats?.version==='1.0.0',
 trace_name:bStats?.name==='TRACEBOUND',
 trace_version:bStats?.version==='1.0.0',
 constructor_reference:typeof bAddress==='string'&&bAddress.toLowerCase()===sourceA.toLowerCase(),
 public_stats_reference:typeof bStats?.source_registry==='string'&&bStats.source_registry.toLowerCase()===sourceA.toLowerCase(),
 source_contract_distinct:sourceA.toLowerCase()!==sourceB.toLowerCase(),
 scope1_exists:scopeOne?.id===1&&aStats.scopes>=1,
 scope1_identities:scopeOne?.principal===initialPrincipal&&scopeOne?.agent===initialAgent,
 scope1_initial_policy_sha256:scopeOne?.history?.[0]?.policy_sha256===initialSha,
 scope1_initial_version:scopeOne?.history?.[0]?.version===1,
 scope1_latest_final_readback:activeOne?.id===1&&activeOne?.version===scopeOne?.active_version&&
  activeOne?.policy_sha256===scopeOne?.active?.policy_sha256,
 audit1_exists:auditOne?.id===1&&bStats?.audits>=1,
 audit1_source_binding:auditOne?.registry===sourceA.toLowerCase()&&auditOne?.scope_id===1,
 audit1_scope_snapshot:auditOne?.scope_version===1&&auditOne?.scope_sha256==='facc957baeedb76db936131d228e88f3ce5455e35652938a5b06882bad5550c9'&&
  auditOne?.scope_sha256===scopeOne?.history?.[0]?.policy_sha256,
 audit1_agent_identity:auditOne?.agent==='0xd6b8a3a5eb329410d9504784812b8569afa8c2af'&&auditOne?.agent===scopeOne?.agent,
 audit1_trace_matches_fixture:auditOne?.trace_sha256===auditDigest&&
  sha(canonicalTrace)===auditDigest&&
  JSON.stringify(sorted(auditOne?.steps))===canonicalTrace

};
if(Object.values(expected).some(ok=>!ok))throw Error('LATEST_FINAL contract policy/binding mismatch: '+JSON.stringify({expected,aStats,bStats,bAddress}));
console.log(JSON.stringify({
 verified:true,network:'Studionet',chain_id:61999,finality:'LATEST_FINAL',no_wallet:true,no_write:true,
 scopeDelta:{address:sourceA,source_sha256:a_sha,stats:aStats},
 traceBound:{address:sourceB,source_sha256:b_sha,stats:bStats,stored_registry_address:bAddress},
 checks:expected,
 scope1:{initial_sha256:initialSha,latest_final_version:activeOne?.version,principal:scopeOne?.principal,agent:scopeOne?.agent},
 audit1:{id:auditOne?.id,scope_id:auditOne?.scope_id,scope_version:auditOne?.scope_version,
  policy_sha256:auditOne?.scope_sha256,trace_sha256:auditOne?.trace_sha256,
  state:auditOne?.state,verdict:auditOne?.verdict,agent:auditOne?.agent},
 limitations:'Read-only confirmation of Scope #1 and submitted Audit #1 cross-contract state. AI assessment and verdict not yet established by this run.'
},null,2));
