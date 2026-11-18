"""Local GenLayer shim: exercises real Python contract source, NOT network consensus."""
import importlib.util
import json
import hashlib
import sys
import types
import unittest
from pathlib import Path

class UserError(Exception): pass
class Address:
    def __init__(self, value): self.as_hex = value.lower()
class TreeMap(dict): 
    def __class_getitem__(cls, item): return cls
class UInt(int): pass
class Return:
    def __init__(self, value): self.calldata = value
class VM:
    UserError = UserError
    Return = Return
    def run_nondet_unsafe(self, lead, validate):
        result = lead()
        if not validate(Return(result)):
            raise RuntimeError("validator disagreement")
        return result
class Dummy:
    pass
gl = Dummy()
gl.Contract = type("Contract", (), {})
gl.public = Dummy()
gl.public.write = lambda f:f
gl.public.view = lambda f:f
gl.vm = VM()
gl.message = Dummy()
gl.message.sender_address = Address("0x"+"1"*40)
gl.nondet = Dummy()
gl.nondet.exec_prompt = lambda *args,**kwargs: '{"label":"SAME"}'
gl.get_contract_at = lambda x:None
package = types.ModuleType("genlayer")
package.gl = gl
package.Address = Address
package.u256 = UInt
package.TreeMap = TreeMap
sys.modules["genlayer"] = package
ROOT = Path(__file__).resolve().parents[1]
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT/path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
a = load("scope_delta", "contracts/scope_delta.py")
b = load("trace_bound", "contracts/trace_bound.py")
OWNER = "0x"+"1"*40
AGENT = "0x"+"2"*40
OTHER = "0x"+"3"*40
REGISTRY = "0x"+"4"*40
POLICY = {
    "goal": "Summarize internal support tickets into a weekly report without sending personal data.",
    "constraints": "Only approved company workspace access; do not send private records to external hosts.",
    "allowed_actions": ["read_ticket", "write_summary"],
    "forbidden_actions": ["external_export", "transfer_funds"]
}
def actor(value): gl.message.sender_address = Address(value)
def canon(x): return json.dumps(x,sort_keys=True,separators=(",", ":"),ensure_ascii=True)
def steps(action="write_summary"):
    return [
      {"seq":1,"action":"read_ticket","note":"Read only authorized internal records for the reporting period.","evidence_sha256":"a"*64},
      {"seq":2,"action":action,"note":"Prepare the requested summary using the bound task evidence.","evidence_sha256":"b"*64}]
class LinkedSource:
    def __init__(self, contract):self.contract = contract
    def view(self): return self
    def get_active_scope(self, scope_id): return self.contract.get_active_scope(scope_id)
class ContractTests(unittest.TestCase):
    def setUp(self):
        actor(OWNER)
        self.a = a.ScopeDelta()
        self.a.scopes=TreeMap();self.a.changes=TreeMap()
        self.sid=self.a.create_scope(AGENT,canon(POLICY))
        gl.get_contract_at=lambda addr:LinkedSource(self.a)
        self.b=b.TraceBound(REGISTRY);self.b.audits=TreeMap()
        self.replies=[]
        def prompt(question, response_format=None):
            self.assertEqual(response_format, "json")
            self.assertTrue(self.replies, "more LLM calls than expected")
            return self.replies.pop(0)
        gl.nondet.exec_prompt=prompt
    def test_active_scope_has_bound_canonical_hash(self):
        active=json.loads(self.a.get_active_scope(self.sid))
        self.assertEqual(active["policy_sha256"],a.sha(a.canon(active["policy"])))
        self.assertEqual(active["version"],1)
    def test_wrong_wallet_cannot_propose_policy_change(self):
        actor(OTHER)
        with self.assertRaises(UserError):self.a.propose_change(self.sid,canon(POLICY|{"constraints":POLICY["constraints"]+" Another rule."}))
    def test_expansion_is_forced_even_if_ai_says_narrowed(self):
        bigger=POLICY|{"allowed_actions":POLICY["allowed_actions"]+["external_send"]}
        actor(AGENT)
        cid=self.a.propose_change(self.sid,canon(bigger))
        self.replies=[{"label":"NARROWED"},{"label":"EXPANDED"}]
        self.assertEqual(self.a.assess_change(cid),"EXPANDED")
        actor(OWNER);self.assertEqual(self.a.approve_change(cid),"ONE_APPROVAL")
        with self.assertRaises(UserError):self.a.activate_change(cid)
        actor(AGENT);self.assertEqual(self.a.approve_change(cid),"BOTH_APPROVED")
        self.assertEqual(self.a.activate_change(cid),"ACTIVATED")
        self.assertEqual(json.loads(self.a.get_active_scope(self.sid))["version"],2)
    def test_validator_disagreement_blocks_change_without_state_mutation(self):
        update=POLICY|{"goal":POLICY["goal"]+" Reporting should be limited to weekly summaries."}
        actor(AGENT);cid=self.a.propose_change(self.sid,canon(update))
        self.replies=[{"label":"NARROWED"},{"label":"EXPANDED"}]
        with self.assertRaises(RuntimeError):self.a.assess_change(cid)
        self.assertEqual(json.loads(self.a.get_change(cid))["state"],"SUBMITTED")
    def test_bad_json_or_ai_format_never_activates(self):
        with self.assertRaises(UserError):self.a.create_scope(AGENT,"{}")
        update=POLICY|{"goal":POLICY["goal"]+" Only for staff."}
        actor(AGENT);cid=self.a.propose_change(self.sid,canon(update))
        self.replies=[{"madeup":"PASS"}]
        self.assertEqual(self.a.assess_change(cid),"REVIEW")
        actor(OWNER)
        with self.assertRaises(UserError):self.a.approve_change(cid)
        self.assertEqual(self.a.reject_change(cid,"Not approved because the evaluation was uncertain."),"REJECTED")
    def test_trace_policy_reference_and_independent_consensus(self):
        actor(AGENT)
        s=steps();aid=self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
        gl.nondet.exec_prompt=lambda *_args,**_kwargs:canon({k:"PASS" for k in b.CRITERIA})
        self.assertEqual(self.b.assess_trace(aid),"COMPLIANT")
        entry=json.loads(self.b.get_audit(aid));self.assertEqual(entry["principal_ack"],"NONE")
        actor(OWNER);self.assertEqual(self.b.acknowledge_audit(aid,True),"ACKNOWLEDGED")
        actor(AGENT)
        with self.assertRaises(UserError):self.b.acknowledge_audit(aid,True)
    def test_deterministic_out_of_scope_action_vetoes_ai_pass(self):
        actor(AGENT);s=steps("external_export")
        aid=self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
        gl.nondet.exec_prompt=lambda *_args,**_kwargs:canon({k:"PASS" for k in b.CRITERIA})
        self.assertEqual(self.b.assess_trace(aid),"BREACH")
        self.assertEqual(json.loads(self.b.get_audit(aid))["deterministic_out_of_scope_steps"],[2])
    def test_stale_scope_change_blocks_trace_assessment(self):
        actor(AGENT);s=steps();aid=self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
        update=POLICY|{"goal":POLICY["goal"]+" Only once each week."}
        cid=self.a.propose_change(self.sid,canon(update))
        self.replies=[{"label":"NARROWED"},{"label":"NARROWED"}]
        self.a.assess_change(cid)
        actor(OWNER);self.a.approve_change(cid)
        actor(AGENT);self.a.approve_change(cid);self.a.activate_change(cid)
        with self.assertRaisesRegex(UserError,"scope changed"):self.b.assess_trace(aid)
    def test_trace_hash_mismatch_and_fake_source_rejected(self):
        actor(AGENT);s=steps()
        with self.assertRaises(UserError):self.b.submit_trace(self.sid,canon(s),"0"*64)
        gl.get_contract_at=lambda addr:types.SimpleNamespace(view=lambda:types.SimpleNamespace(
            get_active_scope=lambda id:canon(json.loads(self.a.get_active_scope(id))|{"policy_sha256":"0"*64})))
        with self.assertRaises(UserError):self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
    def test_multiple_parties_and_proposals_stay_independent(self):
        actor(OWNER)
        other=self.a.create_scope(OTHER,canon(POLICY))
        self.assertNotEqual(self.sid,other)
        actor(AGENT)
        update=POLICY|{"constraints":POLICY["constraints"]+" No weekend report."}
        self.a.propose_change(self.sid,canon(update))
        with self.assertRaisesRegex(UserError,"pending change"):self.a.propose_change(self.sid,canon(update))
    def test_adverse_semantic_violation_requires_independent_agreement(self):
        actor(AGENT);s=steps()
        aid=self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
        self.replies=[
          {"scope_alignment":"PASS","sequence_integrity":"VIOLATION","evidence_sufficiency":"PASS"},
          {"scope_alignment":"PASS","sequence_integrity":"PASS","evidence_sufficiency":"PASS"}]
        with self.assertRaisesRegex(RuntimeError,"validator disagreement"):
            self.b.assess_trace(aid)
        self.assertEqual(json.loads(self.b.get_audit(aid))["state"],"SUBMITTED")
    def test_independent_adverse_verdict_can_commit_breach(self):
        actor(AGENT);s=steps()
        aid=self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
        negative={"scope_alignment":"PASS","sequence_integrity":"PASS","evidence_sufficiency":"VIOLATION"}
        self.replies=[negative,negative]
        self.assertEqual(self.b.assess_trace(aid),"BREACH")
        actor(OWNER)
        self.assertEqual(self.b.acknowledge_audit(aid,False),"DISPUTED")
    def test_conservative_model_review_never_confirms_compliance(self):
        actor(AGENT);s=steps();aid=self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
        self.replies=[{"scope_alignment":"PASS","sequence_integrity":"REVIEW","evidence_sufficiency":"PASS"}]
        self.assertEqual(self.b.assess_trace(aid),"UNVERIFIED")
    def test_invalid_policy_and_addresses_fail_closed(self):
        actor(OWNER)
        with self.assertRaises(UserError):self.a.create_scope(OWNER,canon(POLICY))
        with self.assertRaises(UserError):self.a.create_scope("not-a-wallet",canon(POLICY))
        invalid=POLICY|{"forbidden_actions":["read_ticket"]}
        with self.assertRaises(UserError):self.a.create_scope(AGENT,canon(invalid))
    def test_removing_a_forbidden_action_is_an_expansion(self):
        actor(AGENT)
        less_forbidden=POLICY|{"forbidden_actions":["transfer_funds"]}
        cid=self.a.propose_change(self.sid,canon(less_forbidden))
        self.replies=[{"label":"NARROWED"},{"label":"EXPANDED"}]
        self.assertEqual(self.a.assess_change(cid),"EXPANDED")
        self.assertEqual(json.loads(self.a.get_scope(self.sid))["active_version"],1)
    def test_principal_must_acknowledge_and_only_once(self):
        actor(AGENT);s=steps();aid=self.b.submit_trace(self.sid,canon(s),b.sha(canon(s)))
        gl.nondet.exec_prompt=lambda *_a,**_k:canon({x:"PASS" for x in b.CRITERIA})
        self.b.assess_trace(aid)
        with self.assertRaises(UserError):self.b.acknowledge_audit(aid,True)
        actor(OWNER);self.b.acknowledge_audit(aid,True)
        with self.assertRaises(UserError):self.b.acknowledge_audit(aid,False)
if __name__=="__main__":unittest.main()
