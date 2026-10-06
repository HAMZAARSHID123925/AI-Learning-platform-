"""Renderer-safe typed storyboard contract; no arbitrary provider fields."""
from __future__ import annotations
import copy, math, re
from fractions import Fraction
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator, field_validator

class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, str_strip_whitespace=True)

class Diagram(StrictModel):
    kind: Literal["none","fraction_bars","number_line","equation_steps","process","cycle","comparison"]
    labels: list[str]
    values: list[int | float]
    denominators: list[int]
    @model_validator(mode="after")
    def safe_quantities(self):
        n=len(self.labels)
        if any(not t.strip() or len(t)>48 for t in self.labels): raise ValueError("labels must be nonempty and <=48 characters")
        if any(isinstance(v,bool) or not math.isfinite(v) for v in self.values): raise ValueError("values must be finite numbers")
        if any(not 1<=d<=12 for d in self.denominators): raise ValueError("denominators must be integers from 1 through 12")
        if self.kind=="none" and (n or self.values or self.denominators): raise ValueError("none diagrams must have empty arrays")
        if self.kind=="fraction_bars":
            if not 1<=n<=3 or len(self.values)!=n or len(self.denominators)!=n or any(type(v) is not int or not 0<=v<=d for v,d in zip(self.values,self.denominators)): raise ValueError("fraction_bars needs 1-3 aligned integer quantities, each 0 through denominator")
            for label,v,d in zip(self.labels,self.values,self.denominators):
                m=re.fullmatch(r"\s*(\d+)\s*/\s*(\d+)\s*",label)
                if m and (int(m[2])==0 or Fraction(int(m[1]),int(m[2]))!=Fraction(v,d)): raise ValueError("fraction label does not match the displayed quantity")
        if self.kind=="number_line":
            if not 1<=n<=4 or len(self.values)!=n or self.denominators or any(not 0<=v<=1 for v in self.values): raise ValueError("number_line needs 1-4 labels and equally many positions in [0,1]; denominators must be empty")
            for label,v in zip(self.labels,self.values):
                m=re.fullmatch(r"\s*(\d+)\s*/\s*(\d+)\s*",label)
                if m and (int(m[2])==0 or abs(float(Fraction(int(m[1]),int(m[2])))-v)>0.001): raise ValueError("number-line fraction label does not match its position")
        if self.kind in {"equation_steps","process","cycle","comparison"} and (not 2<=n<=4 or self.values or self.denominators): raise ValueError("structured steps need 2-4 labels; values and denominators must be empty")
        if self.kind=="equation_steps" and any(re.fullmatch(r"\s*\d+\s*/\s*\d+\s*Ã·\s*\d+\s*",t) for t in self.labels): raise ValueError("Simplification must divide numerator and denominator explicitly")
        if self.kind=="equation_steps":
            for label in self.labels:
                match=re.fullmatch(r"\s*(\d+)\s*/\s*(\d+)\s*=\s*(\d+)\s*/\s*(\d+)\s*",label)
                if match:
                    a,b,c,d=map(int,match.groups())
                    if not b or not d or Fraction(a,b)!=Fraction(c,d):raise ValueError("Fraction equality is mathematically incorrect")
        return self

class VisualIntent(StrictModel):
    type: str = "none"
    concepts: list[str] = Field(default_factory=list)

class LessonPlan(StrictModel):
    title: str = Field(min_length=1,max_length=180)
    target_skill_name: str = ""
    learning_objectives: list[str] = Field(default_factory=list)
    student_misconceptions: list[str] = Field(default_factory=list)
    teaching_strategy: str = ""
    target_duration_seconds: int | float = Field(default=180,gt=0,le=600)

class ValidationNotes(StrictModel):
    grounding_check: str = ""
    misconception_alignment: str = ""
    grade_level_check: str = ""

class Scene(StrictModel):
    scene_id: str = Field(min_length=1,max_length=64,pattern=r"^[A-Za-z0-9_-]+$")
    visual_version: Literal[2]
    scene_type: Literal["intro","concept","comparison","diagram","example","misconception_correction","recap"]
    duration_seconds: int | float = Field(gt=0,le=600,allow_inf_nan=False)
    heading: str = Field(min_length=1,max_length=65)
    narration: str = Field(min_length=1,max_length=3000)
    visual_intent: VisualIntent
    on_screen_text: list[str] = Field(min_length=1,max_length=3)
    diagram: Diagram
    character_pose: Literal["explain","point","welcome","recap"]
    transition: Literal["fade","slide"]
    @field_validator("on_screen_text")
    @classmethod
    def teaching_text(cls, value):
        if any(not t.strip() or len(t)>80 for t in value): raise ValueError("Invalid teaching text: 1-3 nonempty strings <=80 characters")
        return value
    @field_validator("narration")
    @classmethod
    def narration_length(cls, value):
        if not 35<=len(value.split())<=85: raise ValueError("Narration length invalid: 35-85 words per scene")
        return value

class Storyboard(StrictModel):
    lesson_plan: LessonPlan
    scenes: list[Scene] = Field(min_length=8,max_length=8)
    validation: ValidationNotes = Field(default_factory=ValidationNotes)
    @model_validator(mode="after")
    def complete_lesson(self):
        if len({s.scene_id for s in self.scenes})!=8: raise ValueError("Duplicate or missing scene ID")
        if not 10<=sum(s.duration_seconds for s in self.scenes)<=600: raise ValueError("Invalid total duration")
        if sum(s.diagram.kind!="none" for s in self.scenes)<2: raise ValueError("Educational diagrams required")
        if not 360<=sum(len(s.narration.split()) for s in self.scenes)<=480: raise ValueError("Substantial narration required")
        return self

def normalize_storyboard(data):
    result=copy.deepcopy(data)
    if not isinstance(result,dict): return result
    for scene in result.get("scenes",[]) if isinstance(result.get("scenes"),list) else []:
        if not isinstance(scene,dict): continue
        for key in ("scene_id","heading","narration","scene_type","character_pose","transition"):
            if isinstance(scene.get(key),str): scene[key]=scene[key].strip()
        for key in ("scene_type","character_pose","transition"):
            if isinstance(scene.get(key),str): scene[key]=scene[key].casefold()
        if isinstance(scene.get("on_screen_text"),list): scene["on_screen_text"]=[t.strip() if isinstance(t,str) else t for t in scene["on_screen_text"]]
        diagram=scene.get("diagram")
        if isinstance(diagram,dict):
            if isinstance(diagram.get("kind"),str): diagram["kind"]=diagram["kind"].strip().casefold()
            if isinstance(diagram.get("labels"),list): diagram["labels"]=[t.strip() if isinstance(t,str) else t for t in diagram["labels"]]
            if diagram.get("kind")=="fraction_bars":
                for field in ("values","denominators"):
                    if isinstance(diagram.get(field),list):
                        diagram[field]=[int(v) if type(v) is float and math.isfinite(v) and v.is_integer() else v for v in diagram[field]]
    return result

def validation_errors(data):
    errors=[]
    try: Storyboard.model_validate(data)
    except ValidationError as exc:
        errors=[{"path":list(e["loc"]),"message":e["msg"]} for e in exc.errors(include_input=False,include_context=False,include_url=False)]
    # Pydantic after-model checks do not run when any child is invalid. Collect
    # independent cross-scene errors now so one targeted repair addresses them
    # together, rather than revealing a new error after every paid request.
    scenes=data.get("scenes") if isinstance(data,dict) else None
    if isinstance(scenes,list) and len(scenes)==8 and all(isinstance(s,dict) for s in scenes):
        if all(isinstance(s.get("narration"),str) for s in scenes):
            total=sum(len(s["narration"].split()) for s in scenes)
            if not 360<=total<=480:
                message=f"Substantial narration required: total {total}; expected 360-480 words. Rewrite 50-58 grounded words per scene."
                if not any("Substantial narration required" in e["message"] for e in errors):
                    errors.append({"path":[],"message":message})
        if all(isinstance(s.get("duration_seconds"),(int,float)) and math.isfinite(s["duration_seconds"]) for s in scenes):
            if not 10<=sum(s["duration_seconds"] for s in scenes)<=600 and not any("Invalid total duration" in e["message"] for e in errors):
                errors.append({"path":[],"message":"Invalid total duration: expected 10-600 seconds"})
        if all(isinstance(s.get("diagram"),dict) for s in scenes):
            if sum(s["diagram"].get("kind") not in (None,"none") for s in scenes)<2 and not any("Educational diagrams required" in e["message"] for e in errors):
                errors.append({"path":[],"message":"Educational diagrams required: at least two useful structured diagrams"})
        ids=[s.get("scene_id") for s in scenes]
        if all(isinstance(sid,str) for sid in ids) and len(set(ids))!=8:
            if not any("Duplicate or missing scene ID" in e["message"] for e in errors):errors.append({"path":[],"message":"Duplicate or missing scene ID"})
    return errors

def repair_fields(data,errors):
    if not isinstance(data,dict) or not isinstance(data.get("scenes"),list) or len(data["scenes"])!=8: return None
    requests={}
    allowed={"diagram","heading","narration","on_screen_text","visual_intent","character_pose","transition","duration_seconds","visual_version","scene_type"}
    for error in errors:
        path=error["path"]
        aggregate_field = ("narration" if "Substantial narration required" in error["message"] else "duration_seconds" if "Invalid total duration" in error["message"] else "diagram" if "Educational diagrams required" in error["message"] else None)
        if not path and aggregate_field:
            for scene in data["scenes"]:
                if not isinstance(scene,dict) or not isinstance(scene.get("scene_id"),str):return None
                requests[(scene["scene_id"],aggregate_field)]=True
            continue
        if len(path)<3 or path[0]!="scenes" or not isinstance(path[1],int) or path[2] not in allowed: return None
        scene=data["scenes"][path[1]]
        if not isinstance(scene,dict) or not isinstance(scene.get("scene_id"),str): return None
        requests[(scene["scene_id"],path[2])]=True
    return set(requests) or None

def apply_field_repair(draft,patch,allowed):
    if not isinstance(patch,dict) or set(patch)!={"repairs"} or not isinstance(patch["repairs"],list): raise ValueError("Field repair requires only a repairs array")
    result=copy.deepcopy(draft); scenes={s["scene_id"]:s for s in result["scenes"]}; seen=set()
    for row in patch["repairs"]:
        if not isinstance(row,dict) or set(row)!={"scene_id","field","value"}: raise ValueError("Invalid repair field shape")
        if not isinstance(row["scene_id"],str) or not isinstance(row["field"],str):raise ValueError("Repair identifiers must be strings")
        key=(row["scene_id"],row["field"])
        if key not in allowed or key in seen: raise ValueError("Repair contains duplicate, foreign or unrequested field")
        seen.add(key); scenes[key[0]][key[1]]=row["value"]
    if seen!=allowed: raise ValueError("Repair did not address every rejected field")
    return result
