#!/usr/bin/env python3
"""
CycloCast NWP - WRF-ARW Execution Runner (Phase 2)
Coordinates real.exe boundary initialization and wrf.exe MPI integration.
Monitors Fortran stdout/stderr via rsl.out/rsl.error and checks CFL stability.
"""

import os
import sys
import subprocess
import time
from pathlib import Path
from datetime import datetime, timezone

class WRFPipeline:
    def __init__(self, wrf_dir: str, work_dir: str, num_cores: int = 16):
        self.wrf_dir = Path(wrf_dir)
        self.work_dir = Path(work_dir)
        self.num_cores = num_cores

    def log(self, message: str, level: str = "INFO"):
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
        print(f"[{now}] [{level}] [WRF-ARW] {message}")

    def link_tables(self):
        self.log("Linking WRF physical parameterization tables and radiation datasets...")
        tbl_patterns = ["*.TBL", "*DATA*", "ozone*", "tr49*", "tr67*", "tr96*"]
        for pat in tbl_patterns:
            os.system(f"ln -sf {self.wrf_dir}/run/{pat} {self.work_dir}/")
        os.system(f"ln -sf {self.wrf_dir}/main/real.exe {self.work_dir}/")
        os.system(f"ln -sf {self.wrf_dir}/main/wrf.exe {self.work_dir}/")

    def run_real(self) -> bool:
        self.log(f"Launching real.exe on {min(8, self.num_cores)} MPI ranks...")
        cmd = ["mpirun", "-np", str(min(8, self.num_cores)), "./real.exe"]
        result = subprocess.run(cmd, cwd=self.work_dir)
        if result.returncode != 0:
            self.log(f"real.exe aborted with exit code {result.returncode}", level="ERROR")
            return False

        # Inspect rsl.error.0000 for success confirmation
        rsl_err = self.work_dir / "rsl.error.0000"
        if rsl_err.exists():
            with open(rsl_err, "r") as f:
                content = f.read()
                if "SUCCESS COMPLETE REAL_EM" in content:
                    self.log("✓ real.exe completed successfully. Boundary conditions (wrfinput & wrfbdy) generated.", level="SUCCESS")
                    return True
        self.log("FATAL: real.exe did not report SUCCESS COMPLETE REAL_EM.", level="ERROR")
        return False

    def run_wrf(self) -> bool:
        self.log(f"Launching wrf.exe dynamical core on {self.num_cores} OpenMPI processes...")
        start_t = time.time()
        cmd = ["mpirun", "-np", str(self.num_cores), "./wrf.exe"]
        
        # Stream log monitor in non-blocking loop
        process = subprocess.Popen(cmd, cwd=self.work_dir)
        rsl_out = self.work_dir / "rsl.out.0000"
        
        while process.poll() is None:
            time.sleep(10)
            if rsl_out.exists():
                try:
                    with open(rsl_out, "r") as f:
                        lines = f.readlines()
                        # Output recent timing steps
                        timing_lines = [l.strip() for l in lines if "Timing for" in l]
                        if timing_lines:
                            self.log(f"WRF Status: {timing_lines[-1]}")
                except Exception:
                    pass

        elapsed = time.time() - start_t
        self.log(f"wrf.exe process terminated after {elapsed/60:.1f} minutes with return code {process.returncode}")

        # Final verification in rsl.error.0000
        rsl_err = self.work_dir / "rsl.error.0000"
        if rsl_err.exists():
            with open(rsl_err, "r") as f:
                content = f.read()
                if "SUCCESS COMPLETE WRF" in content:
                    self.log("✓ SUCCESS COMPLETE WRF: Simulation finished normally without CFL violation.", level="SUCCESS")
                    return True
                elif "cfl" in content.lower():
                    self.log("CRITICAL ERROR: CFL numerical instability detected. Reduce timestep in namelist.input.", level="ERROR")
                    return False

        self.log("ERROR: WRF execution failed to complete successfully.", level="ERROR")
        return False

    def execute(self) -> bool:
        self.link_tables()
        if not self.run_real(): return False
        if not self.run_wrf(): return False
        return True

if __name__ == "__main__":
    wrf = WRFPipeline(
        wrf_dir=os.environ.get("WRF_DIR", "/opt/cyclocast/WRF"),
        work_dir=os.environ.get("RUN_DIR", "/opt/cyclocast/runs/test_run"),
        num_cores=int(os.environ.get("CORES", "16"))
    )
    if not wrf.execute():
        sys.exit(1)
