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
const changeOne=await read(sourceA,'get_change',[1]);
const auditOne=await read(sourceB,'get_audit',[1]);
const auditTwo=await read(sourceB,'get_audit',[2]);
const expectedTrace=JSON.parse(readFileSync('examples/scope1_allowed_trace.json','utf8'));
const expectedBreachTrace=JSON.parse(readFileSync('examples/scope1_breach_trace.json','utf8'));
const auditDigest='e6ce66c283abba292a41aa3ce0cc6d83d6b004fb1b9bcbc2eec27d9ef5a93df2';
// Canonicalize keys recursively, exactly as Python sort_keys=True does.
const sorted=value=>Array.isArray(value)?value.map(sorted):
  value&&typeof value==='object'?Object.fromEntries(
    Object.keys(value).sort().map(k=>[k,sorted(value[k])])):value;
const canonicalTrace=JSON.stringify(sorted(expectedTrace));
const canonicalBreachTrace=JSON.stringify(sorted(expectedBreachTrace));
const breachDigest='6b0c3d450f4c057a4fd77e2a30e31453052c6b0219ac8e8602cd8218fba32db2';

const initialSha='facc957baeedb76db936131d228e88f3ce5455e35652938a5b06882bad5550c9';
const initialPrincipal='0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb';
const initialAgent='0xd6b8a3a5eb329410d9504784812b8569afa8c2af';
const expectedChangePolicy={
 ...scopeOne?.history?.[0]?.policy,
 allowed_actions:['read_ticket','tag_ticket','write_summary']
};
const expectedChangeSHA=sha(JSON.stringify(sorted(expectedChangePolicy)));
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
  JSON.stringify(sorted(auditOne?.steps))===canonicalTrace,
 audit1_consensus_finalized:auditOne?.state==='ASSESSED'&&auditOne?.verdict==='UNVERIFIED',
 audit1_semantic_labels:auditOne?.labels?.scope_alignment==='PASS'&&
  auditOne?.labels?.sequence_integrity==='PASS'&&
  auditOne?.labels?.evidence_sufficiency==='REVIEW',
 audit2_exists:auditTwo?.id===2&&bStats?.audits>=2,
 audit2_source_binding:auditTwo?.registry===sourceA.toLowerCase()&&auditTwo?.scope_id===1,
 audit2_scope_snapshot:auditTwo?.scope_version===1&&auditTwo?.scope_sha256===initialSha&&
  auditTwo?.scope_sha256===scopeOne?.history?.[0]?.policy_sha256,
 audit2_agent_identity:auditTwo?.agent===initialAgent&&auditTwo?.agent===scopeOne?.agent,
 audit2_trace_matches_fixture:auditTwo?.trace_sha256===breachDigest&&
  sha(canonicalBreachTrace)===breachDigest&&
  JSON.stringify(sorted(auditTwo?.steps))===canonicalBreachTrace,
 audit2_forbidden_action_frozen:auditTwo?.frozen_policy?.forbidden_actions?.includes('external_export')===true&&
  auditTwo?.steps?.[1]?.action==='external_export',
 audit2_assessed_breach:auditTwo?.state==='ASSESSED'&&auditTwo?.verdict==='BREACH',
 audit2_violation_labels:auditTwo?.labels?.scope_alignment==='VIOLATION'&&
  auditTwo?.labels?.sequence_integrity==='PASS'&&
  auditTwo?.labels?.evidence_sufficiency==='REVIEW',
 audit2_deterministic_veto:Array.isArray(auditTwo?.deterministic_out_of_scope_steps)&&
  auditTwo.deterministic_out_of_scope_steps.length===1&&
  auditTwo.deterministic_out_of_scope_steps[0]===2,
 audit2_unacknowledged:auditTwo?.principal_ack==='NONE',
 change1_exists:changeOne?.id===1&&changeOne?.scope_id===1&&aStats?.changes>=1,
 change1_agent_proposer:changeOne?.proposer===initialAgent&&changeOne?.proposer===scopeOne?.agent,
 change1_frozen_base:changeOne?.base_version===1&&changeOne?.base_sha256===initialSha&&
  sha(JSON.stringify(sorted(changeOne?.old_policy)))===initialSha,
 change1_exact_expansion:JSON.stringify(sorted(changeOne?.new_policy))===JSON.stringify(sorted(expectedChangePolicy))&&
  changeOne?.new_sha256===expectedChangeSHA,
 change1_accepted_expansion:changeOne?.label==='EXPANDED'&&
  (changeOne?.state==='ASSESSMENT_ACCEPTED'||changeOne?.state==='ACTIVATED'),
 change1_principal_approved:changeOne?.principal_approved===true,
 change1_activation_requires_both:changeOne?.state!=='ACTIVATED'||
  (changeOne?.principal_approved===true&&changeOne?.agent_approved===true),
 change1_active_scope_consistent:changeOne?.state==='ACTIVATED'?
   (activeOne?.version===2&&activeOne?.policy_sha256===expectedChangeSHA):
   (activeOne?.version===1&&activeOne?.policy_sha256===initialSha)

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
  state:auditOne?.state,verdict:auditOne?.verdict,labels:auditOne?.labels,agent:auditOne?.agent},
 change1:{id:changeOne?.id,scope_id:changeOne?.scope_id,base_version:changeOne?.base_version,
  base_sha256:changeOne?.base_sha256,new_sha256:changeOne?.new_sha256,
  proposer:changeOne?.proposer,state:changeOne?.state,label:changeOne?.label,
  principal_approved:changeOne?.principal_approved,agent_approved:changeOne?.agent_approved},
 audit2:{id:auditTwo?.id,scope_id:auditTwo?.scope_id,scope_version:auditTwo?.scope_version,
  policy_sha256:auditTwo?.scope_sha256,trace_sha256:auditTwo?.trace_sha256,
  state:auditTwo?.state,verdict:auditTwo?.verdict,labels:auditTwo?.labels,agent:auditTwo?.agent},
 limitations:'At LATEST_FINAL, checks Audit #1 UNVERIFIED and Audit #2 BREACH with exact labels, veto step, and immutable fixture. The user-provided accepted assess_change(1) receipt reports EXPANDED, and LATEST_FINAL verifies the same classification and activation safeguards. A read-only state attestation is not an Explorer receipt for the assess_trace(2) transaction; external actions remain fictional.'
},null,2));
