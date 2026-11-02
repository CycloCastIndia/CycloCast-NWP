#!/usr/bin/env python3
"""
CycloCast NWP - NetCDF4 Post-Processing Pipeline (Phase 2)
Extracts diagnostic meteorological variables from raw wrfout NetCDF files:
- Destaggers Arakawa C-grid velocity components (U10, V10)
- Computes Mean Sea-Level Pressure (MSLP) via hydrostatic reduction
- Computes 2D Convective Available Potential Energy (CAPE)
- Produces lightweight web-ready JSON and Zarr data matrices
"""

import sys
import json
import argparse
from pathlib import Path
from datetime import datetime, timezone
import numpy as np

def postprocess_wrf(wrfout_file: str, output_json: str):
    print(f"[{datetime.now(timezone.utc).isoformat()}] CycloCast Postprocessing: Opening {wrfout_file}...")
    
    try:
        from netCDF4 import Dataset
        import wrf
    except ImportError:
        print("ERROR: netCDF4 and wrf-python packages are required. Install with: pip install netCDF4 wrf-python xarray")
        sys.exit(1)

    nc = Dataset(wrfout_file)
    
    # 1. Extract dimensions and map coordinates
    times = wrf.extract_times(nc, timeidx=wrf.ALL_TIMES)
    lats = wrf.getvar(nc, "lat")
    lons = wrf.getvar(nc, "lon")
    
    print(f"--> Found {len(times)} time slices on grid dimension {lats.shape}...")

    # 2. Extract surface fields for the latest time index
    t2_k = wrf.getvar(nc, "T2", timeidx=-1)
    t2_c = t2_k - 273.15
    slp_hpa = wrf.getvar(nc, "slp", timeidx=-1)
    rh2_pct = wrf.getvar(nc, "rh2", timeidx=-1)
    
    # Destaggered and Earth-rotated 10m horizontal winds
    wspd_wdir = wrf.getvar(nc, "wspd_wdir10", timeidx=-1)
    wspd_kt = wspd_wdir[0] * 1.94384
    wdir_deg = wspd_wdir[1]
    
    # Precipitation accumulation
    rain_c = wrf.getvar(nc, "RAINC", timeidx=-1)
    rain_nc = wrf.getvar(nc, "RAINNC", timeidx=-1)
    total_rain = rain_c + rain_nc

    # 3D CAPE
    cape2d = wrf.getvar(nc, "cape_2d", timeidx=-1)
    cape_sfc = cape2d[0] # J/kg

    # 3. Downscale and sample grid points for web transmission
    subsample_step = max(1, int(lats.shape[0] / 25))
    grid_points = []
    
    for i in range(0, lats.shape[0], subsample_step):
        for j in range(0, lats.shape[1], subsample_step):
            grid_points.append({
                "lat": round(float(lats[i, j]), 2),
                "lon": round(float(lons[i, j]), 2),
                "rainAccumMm": round(float(total_rain[i, j]), 1),
                "temp2mC": round(float(t2_c[i, j]), 1),
                "windSpeedKt": round(float(wspd_kt[i, j]), 1),
                "windDirDeg": int(wdir_deg[i, j]),
                "mslpHpa": round(float(slp_hpa[i, j]), 1),
                "rh2mPct": int(rh2_pct[i, j]),
                "capeJkg": int(cape_sfc[i, j]),
            })

    output_data = {
        "source_file": Path(wrfout_file).name,
        "processed_time": datetime.now(timezone.utc).isoformat(),
        "valid_time": str(times[-1]),
        "total_points": len(grid_points),
        "max_rain_mm": round(float(np.max(total_rain)), 1),
        "min_mslp_hpa": round(float(np.min(slp_hpa)), 1),
        "max_wind_kt": round(float(np.max(wspd_kt)), 1),
        "grid": grid_points
    }

    with open(output_json, "w") as out_f:
        json.dump(output_data, out_f, indent=2)

    nc.close()
    file_size_kb = Path(output_json).stat().st_size / 1024
    print(f"✓ Post-processing complete. Exported {len(grid_points)} web grid points ({file_size_kb:.1f} KB) to {output_json}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CycloCast NWP - Post-Processing Tool")
    parser.add_argument("--input", required=True, help="Path to wrfout NetCDF4 file")
    parser.add_argument("--output", default="forecast_grid.json", help="Path to output JSON")
    args = parser.parse_args()
    postprocess_wrf(args.input, args.output)
