"""Collect the test-report data.

Runs every check, or reads the results of the finished CI run for the pushed
HEAD, and writes build/report/data.json. build.py turns it into
docs/test-report.md and docs/test-report.html.

    python scripts/report/collect.py        # run every check locally (Docker, Node)
    python scripts/report/collect.py --ci   # use the CI run of the pushed HEAD (gh)
    python scripts/report/build.py
"""

from __future__ import annotations

import argparse
import ast
import inspect
import json
import re
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / "build" / "report"
FRONTEND = ROOT / "frontend-src"
INTEGRATION = ROOT / "custom_components" / "automation_pause"
BUNDLE = INTEGRATION / "frontend" / "automation-pause-card.js"

# Image, Dockerfile and requirements file per Home Assistant release, as in
# scripts/test-ha.ps1 and the pytest matrix of .github/workflows/test.yml.
RELEASES = {
    "newest": (
        "automation-pause-tests",
        "scripts/ha-tests.Dockerfile",
        "requirements-dev.txt",
    ),
    "oldest": (
        "automation-pause-tests-oldest",
        "scripts/ha-tests-oldest.Dockerfile",
        "requirements-dev-oldest.txt",
    ),
}
# This test checks the committed report. A report that holds its result would
# fail on every version bump before it is rebuilt, so it is left out.
SELF_TEST = "tests/test_report.py"
VERSIONS = (
    "import sys; from homeassistant.const import __version__ as v; "
    "print(v, sys.version.split()[0])"
)
HASSFEST_IMAGE = "ghcr.io/home-assistant/hassfest"


def sh(*args: str, cwd: Path = ROOT) -> subprocess.CompletedProcess:
    """Run a command and never raise: a missing tool is a failed check."""
    exe = shutil.which(args[0]) or args[0]
    try:
        return subprocess.run(
            [exe, *args[1:]],
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except OSError as err:
        return subprocess.CompletedProcess(args, 127, "", str(err))


def out(*args: str) -> str:
    return sh(*args).stdout.strip()


def last_line(proc: subprocess.CompletedProcess) -> str:
    lines = [x.strip() for x in (proc.stdout + proc.stderr).splitlines() if x.strip()]
    return lines[-1][:300] if lines else f"exit code {proc.returncode}"


def check(status: str, detail: str = "") -> dict:
    return {"status": status, "detail": detail}


def from_exit(proc: subprocess.CompletedProcess, ok: str = "") -> dict:
    if proc.returncode == 0:
        return check("pass", ok or last_line(proc))
    return check("fail", last_line(proc))


# --- JUnit and docstrings -----------------------------------------------------


def docstrings() -> dict[str, dict[str, str]]:
    """The docstring of every test function, by file and function name."""
    docs: dict[str, dict[str, str]] = {}
    for path in sorted((ROOT / "tests").rglob("test_*.py")):
        tree = ast.parse(path.read_text("utf-8"))
        docs[path.relative_to(ROOT).as_posix()] = {
            node.name: " ".join(inspect.cleandoc(doc).split())
            for node in ast.walk(tree)
            if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef)
            and (doc := ast.get_docstring(node))
        }
    return docs


def module_file(classname: str) -> str:
    """tests.ha.test_x(.TestClass) -> tests/ha/test_x.py"""
    parts = classname.split(".")
    for n in range(len(parts), 0, -1):
        rel = "/".join(parts[:n]) + ".py"
        if (ROOT / rel).is_file():
            return rel
    return "/".join(parts) + ".py"


def outcome(case: ET.Element) -> tuple[str, str]:
    for child in case:
        if child.tag in ("failure", "error"):
            text = child.get("message") or child.text or ""
            return "failed", " ".join(text.split())[:300]
        if child.tag == "skipped":
            kind = (child.get("type") or "") + (child.get("message") or "")
            return ("xfailed" if "xfail" in kind else "skipped"), ""
    return "passed", ""


def parse_pytest(path: Path, docs: dict) -> list[dict]:
    tests = []
    for case in ET.parse(path).getroot().iter("testcase"):
        rel = module_file(case.get("classname", ""))
        if rel == SELF_TEST:
            continue
        match = re.match(r"([^\[]+)(?:\[(.*)\])?$", case.get("name", ""))
        result, message = outcome(case)
        tests.append(
            {
                "file": rel,
                "name": match.group(1),
                "params": match.group(2) or "",
                "doc": docs.get(rel, {}).get(match.group(1), ""),
                "outcome": result,
                "message": message,
            }
        )
    return tests


def parse_vitest(path: Path) -> list[dict]:
    tests = []
    for case in ET.parse(path).getroot().iter("testcase"):
        *area, name = case.get("name", "").split(" > ")
        result, message = outcome(case)
        tests.append(
            {
                "file": case.get("classname", ""),
                "area": " > ".join(area),
                "name": name,
                "outcome": result,
                "message": message,
            }
        )
    return tests


def pytest_entry(release: str) -> dict:
    return {
        "requirements": RELEASES[release][2],
        "homeassistant": "",
        "python": "",
        "ran": False,
        "error": "",
        "tests": [],
    }


def read_versions(entry: dict, text: str) -> None:
    parts = text.split()
    if len(parts) == 2:
        entry["homeassistant"], entry["python"] = parts


# --- local run ----------------------------------------------------------------


def local_pytest(release: str, docs: dict) -> dict:
    image, dockerfile, _ = RELEASES[release]
    entry = pytest_entry(release)
    junit = BUILD / f"pytest-{release}.xml"
    junit.unlink(missing_ok=True)
    built = sh("docker", "build", "-q", "-f", dockerfile, "-t", image, ".")
    if built.returncode != 0:
        entry["error"] = f"docker build failed: {last_line(built)}"
        return entry
    read_versions(entry, out("docker", "run", "--rm", image, "python", "-c", VERSIONS))
    sh(
        "docker",
        "run",
        "--rm",
        "-v",
        f"{ROOT}:/src",
        "-v",
        f"{BUILD}:/out",
        image,
        "pytest",
        "-q",
        "-p",
        "no:cacheprovider",
        f"--junitxml=/out/{junit.name}",
    )
    if not junit.is_file():
        entry["error"] = "pytest wrote no JUnit file"
        return entry
    entry["ran"] = True
    entry["tests"] = parse_pytest(junit, docs)
    return entry


def local_ruff() -> dict:
    """ruff in the newest test image: the version pinned in requirements-dev.txt."""
    image = RELEASES["newest"][0]
    base = ("docker", "run", "--rm", "-v", f"{ROOT}:/src", image, "ruff")
    lint = sh(*base, "check", "--no-cache", ".")
    fmt = sh(*base, "format", "--check", "--no-cache", ".")
    return {"ruff_check": from_exit(lint), "ruff_format": from_exit(fmt)}


def local_mypy() -> dict:
    """mypy --strict in the newest test image: it needs Home Assistant's types.

    The files and flags are in pyproject.toml. The cache stays in the
    container, so the run writes nothing into the repository.
    """
    image = RELEASES["newest"][0]
    proc = sh(
        "docker",
        "run",
        "--rm",
        "-v",
        f"{ROOT}:/src",
        image,
        "mypy",
        "--cache-dir=/tmp/mypy",
    )
    return from_exit(proc)


def local_hassfest() -> dict:
    proc = sh(
        "docker", "run", "--rm", "-v", f"{ROOT}:/github/workspace", HASSFEST_IMAGE
    )
    text = proc.stdout + proc.stderr
    invalid = re.search(r"Invalid integrations: (\d+)", text)
    if invalid and invalid.group(1) == "0" and proc.returncode == 0:
        return check("pass", "valid")
    errors = re.findall(r"\* \[ERROR\].*", text)
    return check("fail", "; ".join(errors)[:300] or last_line(proc))


def npm(*args: str) -> subprocess.CompletedProcess:
    return sh("npm", *args, cwd=FRONTEND)


def npx(*args: str) -> subprocess.CompletedProcess:
    return sh("npx", "--no-install", *args, cwd=FRONTEND)


def local_frontend() -> tuple[dict, dict]:
    vitest: dict = {"ran": False, "error": "", "tests": []}
    tools: dict = {}
    installed = FRONTEND / "node_modules" / ".package-lock.json"
    lock = FRONTEND / "package-lock.json"
    # npm ci deletes node_modules first; skip it while the install matches the lock.
    if not installed.is_file() or installed.stat().st_mtime < lock.stat().st_mtime:
        ci = npm("ci", "--no-audit", "--no-fund")
        if ci.returncode != 0:
            failed = check("fail", f"npm ci failed: {last_line(ci)}")
            vitest["error"] = failed["detail"]
            return vitest, {k: failed for k in ("typecheck", "lint", "bundle")}

    tools["typecheck"] = from_exit(npm("run", "typecheck"), "no type errors")

    eslint = npx("eslint", ".", "--max-warnings=0")
    prettier = npx("prettier", "--check", ".")
    if eslint.returncode == 0 and prettier.returncode == 0:
        tools["lint"] = check(
            "pass", "eslint: no problems; prettier: all files formatted"
        )
    else:
        parts = [
            f"{name}: {last_line(proc)}"
            for name, proc in (("eslint", eslint), ("prettier", prettier))
            if proc.returncode != 0
        ]
        tools["lint"] = check("fail", "; ".join(parts))

    junit = BUILD / "vitest.xml"
    junit.unlink(missing_ok=True)
    npx(
        "vitest",
        "run",
        "--reporter=default",
        "--reporter=junit",
        f"--outputFile.junit={junit}",
    )
    if junit.is_file():
        vitest["ran"] = True
        vitest["tests"] = parse_vitest(junit)
    else:
        vitest["error"] = "vitest wrote no JUnit file"

    before = BUNDLE.read_bytes() if BUNDLE.is_file() else b""
    build = npm("run", "build")
    after = BUNDLE.read_bytes() if BUNDLE.is_file() else b""
    if build.returncode != 0:
        tools["bundle"] = check("fail", f"npm run build failed: {last_line(build)}")
    elif before == after:
        tools["bundle"] = check("pass", "the committed bundle equals a fresh build")
    else:
        tools["bundle"] = check(
            "fail", "the committed bundle differs from a fresh build; run npm run build"
        )
    # Collecting must not change tracked files; the developer rebuilds on purpose.
    # Restore only our own build output, never a bundle written meanwhile.
    if before != after and BUNDLE.read_bytes() == after:
        BUNDLE.write_bytes(before)
    return vitest, tools


def local_results() -> dict:
    docs = docstrings()
    # One container at a time: the images are large and share the machine.
    pytest = {release: local_pytest(release, docs) for release in RELEASES}
    vitest, tools = local_frontend()
    if pytest["newest"]["error"].startswith("docker build failed"):
        failed = check("not_run", "the test image did not build")
        tools.update(ruff_check=failed, ruff_format=failed, mypy=failed)
    else:
        tools.update(local_ruff())
        tools["mypy"] = local_mypy()
    tools["hassfest"] = local_hassfest()
    tools["hacs"] = check(
        "not_run", "not run locally: only CI runs it, in validate.yml"
    )
    return {
        "source": {"kind": "local", "label": "local Docker run"},
        "node": out("node", "--version"),
        "pytest": pytest,
        "vitest": vitest,
        "tools": tools,
    }


# --- CI run -------------------------------------------------------------------


def gh_json(*args: str):
    proc = sh("gh", *args)
    if proc.returncode != 0:
        sys.exit(f"gh {' '.join(args[:2])} failed: {last_line(proc)}")
    return json.loads(proc.stdout or "null")


def finished_run(workflow: str, sha: str) -> dict | None:
    runs = gh_json(
        "run",
        "list",
        "--workflow",
        workflow,
        "--commit",
        sha,
        "--json",
        "databaseId,status,conclusion,event,url,createdAt",
    )
    done = [
        r for r in runs if r["status"] == "completed" and r["conclusion"] != "cancelled"
    ]
    # Push and pull-request events both run on the same commit; prefer the push.
    done.sort(key=lambda r: (r["event"] == "push", r["createdAt"]), reverse=True)
    return done[0] if done else None


def jobs(run_id: int) -> dict[str, dict]:
    data = gh_json("run", "view", str(run_id), "--json", "jobs")
    return {job["name"]: job for job in data["jobs"]}


def conclusion(value: str | None, what: str) -> dict:
    if value == "success":
        return check("pass", f"{what}: success")
    if value in (None, "", "skipped"):
        return check("not_run", f"{what}: not run")
    return check("fail", f"{what}: {value}")


def step(job: dict | None, name: str) -> str | None:
    for s in (job or {}).get("steps", []):
        if s["name"] == name:
            return s["conclusion"]
    return None


def download(run_id: int, artifact: str) -> Path:
    target = BUILD / "ci" / artifact
    shutil.rmtree(target, ignore_errors=True)
    sh("gh", "run", "download", str(run_id), "-n", artifact, "-D", str(target))
    return target


def ci_results() -> dict:
    sha = out("git", "rev-parse", "HEAD")
    if not out("git", "branch", "-r", "--contains", sha):
        sys.exit(f"HEAD {sha[:7]} is not pushed; push it and wait for CI.")
    tests_run = finished_run("test.yml", sha)
    if not tests_run:
        sys.exit(f"The Tests run for {sha[:7]} has not finished yet.")
    run_id = tests_run["databaseId"]
    test_jobs = jobs(run_id)
    docs = docstrings()

    pytest = {}
    for release in RELEASES:
        entry = pytest_entry(release)
        folder = download(run_id, f"junit-{release}")
        junit, versions = folder / "junit.xml", folder / "versions.txt"
        if versions.is_file():
            read_versions(entry, versions.read_text("utf-8"))
        if junit.is_file():
            entry["ran"] = True
            entry["tests"] = parse_pytest(junit, docs)
        else:
            entry["error"] = f"the CI run has no junit-{release} artifact"
        pytest[release] = entry

    vitest: dict = {"ran": False, "error": "", "tests": []}
    junit = download(run_id, "junit-frontend") / "vitest.xml"
    if junit.is_file():
        vitest["ran"] = True
        vitest["tests"] = parse_vitest(junit)
    else:
        vitest["error"] = "the CI run has no junit-frontend artifact"

    frontend = test_jobs.get("frontend")
    build = step(frontend, "Build")
    current = step(frontend, "Check the committed bundle is current")
    ruff = (test_jobs.get("ruff") or {}).get("conclusion")
    tools = {
        "typecheck": conclusion(step(frontend, "Typecheck"), "Typecheck step"),
        "lint": conclusion(step(frontend, "Lint"), "Lint step (eslint and prettier)"),
        "bundle": conclusion(
            current if build == "success" else build,
            "Build and bundle check steps",
        ),
        # CI runs ruff check and ruff format in one step.
        "ruff_check": conclusion(ruff, "ruff job"),
        "ruff_format": conclusion(ruff, "ruff job"),
        "mypy": conclusion(
            step(test_jobs.get("pytest (newest)"), "Type check"), "Type check step"
        ),
    }
    validate = finished_run("validate.yml", sha)
    validate_jobs = jobs(validate["databaseId"]) if validate else {}
    for key, name in (("hassfest", "hassfest"), ("hacs", "HACS")):
        tools[key] = conclusion(
            (validate_jobs.get(name) or {}).get("conclusion"), f"{name} job"
        )
    return {
        "source": {"kind": "ci", "label": "GitHub Actions", "url": tests_run["url"]},
        "node": (FRONTEND / ".nvmrc").read_text("utf-8").strip(),
        "pytest": pytest,
        "vitest": vitest,
        "tools": tools,
    }


# --- main ---------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--ci", action="store_true", help="use the CI run of the pushed HEAD"
    )
    args = parser.parse_args()
    BUILD.mkdir(parents=True, exist_ok=True)
    results = ci_results() if args.ci else local_results()
    manifest = json.loads((INTEGRATION / "manifest.json").read_text("utf-8"))
    hacs = json.loads((ROOT / "hacs.json").read_text("utf-8"))
    now = datetime.now()
    data = {
        "generated": now.strftime("%d/%m/%Y %H:%M"),
        "date": now.strftime("%d/%m/%Y"),
        "version": manifest["version"],
        "min_homeassistant": hacs["homeassistant"],
        "branch": out("git", "branch", "--show-current"),
        "commit": out("git", "rev-parse", "--short", "HEAD"),
        # Only changes that can alter a result; docs and the report scripts cannot.
        "dirty": bool(
            out(
                "git",
                "status",
                "--porcelain",
                "--",
                "custom_components",
                "tests",
                "frontend-src",
                "scripts/ha-tests.Dockerfile",
                "scripts/ha-tests-oldest.Dockerfile",
                "requirements-dev.txt",
                "requirements-dev-oldest.txt",
                "pyproject.toml",
                "hacs.json",
            )
        ),
        **results,
    }
    (BUILD / "data.json").write_text(json.dumps(data, indent=1), "utf-8")
    for release, entry in data["pytest"].items():
        counts = [t["outcome"] for t in entry["tests"]]
        print(
            f"pytest {release} (HA {entry['homeassistant'] or '?'}):",
            f"{counts.count('passed')} passed, {counts.count('failed')} failed,",
            f"{counts.count('skipped')} skipped",
            entry["error"],
        )
    counts = [t["outcome"] for t in data["vitest"]["tests"]]
    print(f"vitest: {counts.count('passed')} passed, {counts.count('failed')} failed")
    for key, value in data["tools"].items():
        print(f"{key}: {value['status']} ({value['detail']})")
    print("source:", data["source"]["label"])


if __name__ == "__main__":
    main()
