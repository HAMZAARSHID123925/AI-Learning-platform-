"""Runtime failure injection without database fixtures or paid calls."""
import json
from pathlib import Path
from unittest.mock import MagicMock
import subprocess
import pytest
from app.modules.module6_adaptive.services import render_service as render
from app.modules.module6_adaptive.services.pipeline_errors import VideoPipelineError

@pytest.mark.parametrize("name,variable", [("node","VIDEO_NODE_BINARY"),("ffmpeg","FFMPEG_BINARY"),("ffprobe","FFPROBE_BINARY")])
def test_missing_executable_is_environment_failure(monkeypatch,name,variable):
    monkeypatch.delenv(variable,raising=False)
    monkeypatch.setattr(render.shutil,"which",lambda _:None)
    with pytest.raises(VideoPipelineError) as exc: render.resolve_executable(name,variable)
    assert exc.value.code=="VIDEO_RENDER_ENV_FAILED"

def test_configured_executable_is_resolved(monkeypatch,tmp_path):
    binary=tmp_path/"node.exe";binary.touch()
    monkeypatch.setenv("VIDEO_NODE_BINARY",str(binary))
    monkeypatch.setattr(render.shutil,"which",lambda value:value)
    assert render.resolve_executable("node","VIDEO_NODE_BINARY")==str(binary.resolve())

def test_missing_dependencies_fail_before_spawn(monkeypatch,tmp_path):
    monkeypatch.setattr(render,"VIDEO_RENDER_DIR",tmp_path)
    monkeypatch.setattr(render,"resolve_executable",lambda *args:"node")
    result=render.invoke_remotion_render("unused.json","unused.mp4")
    assert not result.success and result.error_code=="VIDEO_RENDER_ENV_FAILED"

@pytest.mark.parametrize("mode",["success","nonzero","timeout"])
def test_renderer_process_outcome(monkeypatch,tmp_path,mode):
    source=tmp_path/"input with spaces.json";source.write_text(json.dumps({"audio_manifest":{"scenes":[{"render_duration_seconds":1}]}}))
    output=tmp_path/"output with spaces.mp4"
    monkeypatch.setattr(render,"renderer_command",lambda:["node","tsx","render.ts"])
    proc=MagicMock();proc.pid=123;proc.returncode=0 if mode=="success" else 1
    proc.poll.return_value=None if mode=="timeout" else proc.returncode
    if mode=="timeout":proc.communicate.side_effect=[subprocess.TimeoutExpired("node",600),("","")]
    elif mode=="success":proc.communicate.return_value=(json.dumps({"success":True}),"")
    else:proc.communicate.return_value=("","Renderer startup failed")
    spawn=MagicMock(return_value=proc);monkeypatch.setattr(render.subprocess,"Popen",spawn)
    monkeypatch.setattr(render.subprocess,"run",MagicMock())
    monkeypatch.setattr(render.os,"killpg",MagicMock(),raising=False)
    result=render.invoke_remotion_render(str(source),str(output))
    assert spawn.call_args.kwargs["shell"] is False
    assert spawn.call_args.args[0][-2:]==[str(source.resolve()),str(output.resolve())]
    assert result.success==(mode=="success")
    if mode=="timeout":assert result.error_code=="VIDEO_RENDER_TIMEOUT"
    if mode=="nonzero":assert result.error_code=="VIDEO_RENDER_FAILED"

def test_corrupt_mp4_is_rejected_after_probe(monkeypatch,tmp_path):
    output=tmp_path/"corrupt.mp4";output.write_bytes(b"not real video")
    monkeypatch.setattr(render,"resolve_executable",lambda name,variable:name)
    probe={"format":{"duration":"1"},"streams":[{"codec_type":"video","width":1920,"height":1080,"r_frame_rate":"30/1"},{"codec_type":"audio"}]}
    monkeypatch.setattr(render.subprocess,"run",MagicMock(side_effect=[MagicMock(returncode=0,stdout=json.dumps(probe)),MagicMock(returncode=1,stderr="corrupt packet")]))
    result=render.validate_mp4_with_ffprobe(str(output),1)
    assert not result.valid and "decode failed" in result.errors[0]

@pytest.mark.parametrize("message,code",[("Chromium unavailable","VIDEO_RENDER_ENV_FAILED"),("Browser executable missing","VIDEO_RENDER_ENV_FAILED"),("Render timeout after 600s","VIDEO_RENDER_TIMEOUT"),("Scene component failed","VIDEO_RENDER_FAILED")])
def test_stage_specific_renderer_failure(message,code):
    assert render.renderer_failure_code(message)==code

def test_renderer_diagnostic_redaction_precedes_tail_truncation():
    from app.modules.module6_adaptive.services.pipeline_errors import safe_error
    signed="https://private.example/audio?X-Amz-Signature="+"s"*2000
    result=safe_error("prefix " + signed + " final failure",limit=None)[-1200:]
    assert "X-Amz" not in result and "s"*100 not in result
    assert "final failure" in result and "URL REDACTED" in result
