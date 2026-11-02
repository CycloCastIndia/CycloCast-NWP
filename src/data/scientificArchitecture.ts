/**
 * @license
 * CycloCast NWP - Scientific Architecture & Methodology Blueprint
 * Comprehensive architectural treatise addressing the 7 core NWP engineering questions
 */

export interface ArchitectureSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  technicalSpecs?: Record<string, string>;
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
}

export const METHODOLOGY_SECTIONS: ArchitectureSection[] = [
  {
    id: 'engine_separation',
    number: '01',
    title: 'Separation of Scientific Forecasting Engine and Frontend',
    summary: 'Decoupling heavy MPI atmospheric calculations from web presentation via an asynchronous orchestrator and REST/Zarr pipeline.',
    content: [
      'Numerical weather prediction cannot run in a browser, serverless edge function, or standard web application tier. A 72-hour WRF forecast over a 3 km convection-permitting regional domain solves 3D compressible Euler non-hydrostatic equations across ~2.5 million grid cells with 45 vertical terrain-following eta levels, demanding billions of floating-point operations per model minute.',
      'CycloCast NWP enforces a strict three-tier architecture: (1) The Scientific Compute Engine (HPC cluster, cloud spot nodes, or dedicated Linux workstation) running WRF-ARW compiled with Intel oneAPI / GNU Fortran + OpenMPI; (2) An Asynchronous Job & Pipeline Daemon (Python Celery / FastAPI worker daemon) that orchestrates WPS, monitors real.exe / wrf.exe status via rsl.error logs, and converts raw NetCDF4 files into optimized cloud-native formats (Zarr / GeoJSON / COG); and (3) The Lightweight Web Operations Platform (React + Vite + Tailwind CSS) which communicates strictly through authenticated REST endpoints and static tile stores without touching raw NetCDF files or holding open compute sockets.',
      'Under no circumstances does the frontend perform mock physics approximations or claim an active compute socket when the HPC daemon is idle. If the scientific compute engine is disconnected or offline, the interface explicitly reports "ENGINE OFFLINE / READY FOR DISPATCH" and allows operator configuration and benchmark inspection.'
    ],
    keyTakeaways: [
      'Zero compute overhead on frontend: Web client only ingests postprocessed lightweight GeoJSON, vector tiles, and JSON metadata.',
      'Asynchronous state machine: The Python orchestrator tracks 11 discrete pipeline states from GRIB2 ingestion to verification.',
      'Air-gapped security: Model cluster credentials and SSH keys never reach the client bundle.'
    ],
    technicalSpecs: {
      'Frontend Hosting': 'Cloudflare Pages / Vercel (Static Assets + Edge CDN)',
      'Backend Orchestration': 'Python 3.11 + FastAPI + Celery / Redis Queue',
      'Compute Engine': 'Linux Ubuntu 22.04 LTS, OpenMPI 4.1, NetCDF-Fortran 4.5.4, HDF5 1.12',
      'Data Interchange': 'Zarr v2 / NetCDF4 with Zstandard compression'
    },
    codeSnippet: {
      filename: 'cyclocast_daemon.py',
      language: 'python',
      code: `"""
CycloCast NWP - Asynchronous HPC Orchestrator Daemon
Manages WPS preprocessing, WRF execution, and postprocessing pipeline.
"""
import subprocess
import os
import time
from pathlib import Path

class CycloCastOrchestrator:
    def __init__(self, run_id: str, work_dir: str):
        self.run_id = run_id
        self.work_dir = Path(work_dir)
        self.log_file = self.work_dir / f"{run_id}.log"
        
    def execute_stage(self, stage_name: str, cmd: list[str]) -> bool:
        self.work_dir.mkdir(parents=True, exist_ok=True)
        with open(self.log_file, "a") as log:
            log.write(f"[{time.strftime('%Y-%m-%d %H:%M:%SZ')}] STAGE: {stage_name}\\n")
            log.flush()
            result = subprocess.run(cmd, cwd=self.work_dir, stdout=log, stderr=subprocess.STDOUT)
            if result.returncode != 0:
                log.write(f"ERROR: {stage_name} failed with returncode {result.returncode}\\n")
                return False
            log.write(f"SUCCESS: {stage_name} completed successfully.\\n")
            return True

    def run_pipeline(self):
        # 1. Geogrid (domain boundary setup)
        if not self.execute_stage("GEOGRID", ["./geogrid.exe"]): return False
        # 2. Ungrib (GRIB2 unpacking)
        if not self.execute_stage("UNGRIB", ["./ungrib.exe"]): return False
        # 3. Metgrid (horizontal/vertical interpolation)
        if not self.execute_stage("METGRID", ["./metgrid.exe"]): return False
        # 4. Real (boundary conditions)
        if not self.execute_stage("REAL_ARW", ["mpirun", "-np", "4", "./real.exe"]): return False
        # 5. WRF (dynamical core)
        if not self.execute_stage("WRF_ARW", ["mpirun", "-np", "32", "./wrf.exe"]): return False
        return True`
    }
  },
  {
    id: 'wrf_integration',
    number: '02',
    title: 'WRF-ARW Integration & Dynamical Core Mechanics',
    summary: 'Leveraging the proven WRF-ARW v4.5 dynamical core while developing CycloCast regional physics suites and nesting configurations.',
    content: [
      'Developing a new numerical dynamical core from scratch requires hundreds of person-years of fluid-dynamics verification. The scientifically responsible path for CycloCast NWP is to employ the world-standard Weather Research and Forecasting model (WRF-ARW v4.5), utilizing its advanced Euler non-hydrostatic dynamical core with 3rd-order Runge-Kutta time integration and 5th-order horizontal advection.',
      'The WRF integration workflow follows the canonical WPS + ARW chain: (1) geogrid.exe computes the map projection (Lambert Conformal), topographic height from USGS/SRTM 30-arc-second data, land use categories from MODIS, and soil properties; (2) ungrib.exe unpacks external meteorological boundary files (NOAA GFS 0.25° or ECMWF IFS) using Vtable.GFS into intermediate binary format; (3) metgrid.exe horizontally and vertically interpolates boundary data onto the CycloCast model grid; (4) real.exe computes vertical terrain-following hydrostatic pressure coordinates (eta levels) and generates wrfinput_d01 and wrfbdy_d01; (5) wrf.exe integrates the atmospheric governing equations across time.',
      'CycloCast distinguishes its intellectual contribution through: regional physics tuning tailored to the Indian Summer Monsoon; custom nesting grids matching Indian coastal topography (Western Ghats, Konkan, Malnad); high-resolution land-surface initialization using ISRO/MOSDAC satellite soil moisture; and post-processing machine-learning calibration.'
    ],
    keyTakeaways: [
      'Non-hydrostatic formulation: Essential for capturing explicit deep convection and steep Western Ghats orographic waves.',
      'Modular WPS toolchain: Clear boundaries between static geographic processing, GRIB2 decoding, and numerical integration.',
      'Transparent provenance: All output files preserve the exact namelist.input, boundary forcing timestamps, and compile flags.'
    ],
    technicalSpecs: {
      'Dynamical Core': 'WRF-ARW Version 4.5.1 (Advanced Research WRF)',
      'Time Integration': '3rd-Order Runge-Kutta (RK3) Split-Explicit Scheme',
      'Horizontal Advection': '5th-Order Upwind Horizontal / 3rd-Order Vertical',
      'Vertical Coordinate': 'Dry hydrostatic-pressure terrain-following vertical coordinate (eta)',
      'Grid Structure': 'Arakawa C-grid staggering (mass center, staggered normal velocities)'
    }
  },
  {
    id: 'input_datasets',
    number: '03',
    title: 'Input Atmospheric Datasets & Multi-Source Ingestion',
    summary: 'Ingesting, validating, and harmonizing NOAA GFS, ECMWF OpenData, IMD INSAT-3D/3DR satellite radiances, and ground stations.',
    content: [
      'An NWP regional model is an initial-boundary value problem (IBVP). The internal model fields will rapidly drift or develop boundary reflection errors without high-quality boundary condition updates every 3 hours.',
      'CycloCast NWP utilizes NOAA NCEP Global Forecast System (GFS) 0.25° GRIB2 files as its primary free, open-access initial and lateral boundary condition (LBC) provider. Automated Python ingestion workers query the NOAA NOMADS or AWS S3 public bucket (noaa-gfs-bdp-pds) four times daily (00Z, 06Z, 12Z, 18Z cycles). In parallel, ECMWF Open Data is parsed as an alternative high-resolution boundary forcing.',
      'For data assimilation and model verification, the platform integrates: (1) IMD INSAT-3D and INSAT-3DR geostationary satellite Atmospheric Motion Vectors (AMVs) and Thermal Infrared Brightness Temperatures (TIR1/TIR2) from MOSDAC; (2) IMD Automatic Weather Station (AWS) surface reports for surface temperature, pressure, and rain gauge accumulation; and (3) IMD upper-air Radiosonde/Rawinsonde (RS/RW) balloon soundings at 00Z and 12Z.',
      'Strict ingestion validation rules reject corrupt files before WPS execution: (1) MD5/SHA256 checksum verification; (2) GRIB2 section 7 bit-depth and message completeness checks; (3) Spatial bounding box sanity check (ensuring complete coverage of 60°-100°E, 0°-42°N); and (4) Strict unit standardization (Kelvin to Celsius, Pa to hPa, specific humidity kg/kg).'
    ],
    keyTakeaways: [
      'Zero-cost boundary data: NOAA GFS via AWS Open Data Sponsorship and ECMWF Open Data provide operational zero-budget inputs.',
      'Fail-safe fallback: If GFS 12Z is delayed, the pipeline gracefully falls back to GFS 06Z with shifted boundary offset hours.',
      'Scientific data integrity: Corrupt GRIB2 messages are quarantined with automated alerts.'
    ],
    technicalSpecs: {
      'Primary LBC Feed': 'NOAA GFS 0.25° via AWS S3 Open Data (s3://noaa-gfs-bdp-pds/)',
      'Secondary LBC Feed': 'ECMWF IFS Open Data via ecdata / open-data API',
      'Satellite Feed': 'ISRO MOSDAC INSAT-3D/3DR HDF5 Level-2/3',
      'Validation Tooling': 'wgrib2, eccodes (ecCodes 2.30+), pyproj, xarray-grib'
    }
  },
  {
    id: 'computing_resources',
    number: '04',
    title: 'Computational Requirements & Zero-Budget Staging Roadmap',
    summary: 'Realistic computational scaling path from local multi-core workstations to cloud spot instances, respecting zero-budget constraints.',
    content: [
      'Numerical weather prediction is computationally demanding. A common misconception is that WRF can run on web hosting platforms or free tier VMs. In reality, a full subcontinental 3 km grid across India would require a supercomputing cluster with over 512 modern CPU cores and 1 TB of RAM.',
      'To build CycloCast NWP under a strict zero-budget constraint, we implement a staged implementation strategy: (Phase 1) Architectural prototype, pipeline validator, and namelist generator on the web platform; (Phase 2) Single-domain experimental simulations on a local multi-core Linux workstation (e.g., 8–16 CPU cores, 32 GB RAM) focusing on a small, focused regional domain (such as Western Ghats or Konkan) for 24-hour lead times with a 9 km or 4.5 km grid; (Phase 3) Cloud spot compute (AWS c6i.16xlarge or GCP c2-standard-60 spot instances costing ~$0.60–$1.20 per simulation run) triggered only during active meteorological events (e.g., active monsoon depressions, severe Western Ghats cloudbursts, or cyclonic storms); (Phase 4) Dedicated institutional HPC grant or community-sponsored compute nodes for scheduled twice-daily operational runs.',
      'Grid sizing and timestep selection strictly observe the Courant-Friedrichs-Lewy (CFL) numerical stability condition: $\\Delta t \\le 6 \\times \\Delta x\\text{ (km)}$. For a 3 km grid, $\\Delta t = 18\\text{ s}$. This requires 4,800 numerical integration steps per 24 hours of simulated time.'
    ],
    keyTakeaways: [
      'Honest resource transparency: Never pretend to execute a 512-core WRF simulation on a free web worker.',
      'Staged roadmap: Begin with small regional domain experiments on available local workstation hardware.',
      'CFL-governed compute budget: Higher resolution increases core-hour requirements by a factor of 8 (doubling x, y, and time steps).'
    ],
    technicalSpecs: {
      'Phase 1 (Current)': 'Web operations console, namelist generation, benchmark verification.',
      'Phase 2 (Local Workstation)': '8–16 cores (AMD Ryzen / Intel Core i7/i9), 32 GB RAM, 500 GB NVMe SSD. Single domain (dx=9km).',
      'Phase 3 (Event Cloud Spot)': '64 cores (AWS c6a.16xlarge spot), 128 GB RAM. 24h run completes in ~35 minutes (~$0.95/run).',
      'Phase 4 (Full Operational)': '128+ cores distributed MPI cluster, 512 GB RAM, high-speed InfiniBand interconnect.'
    }
  },
  {
    id: 'domain_configuration',
    number: '05',
    title: 'Regional Domain Configuration & Nested Grid Dynamics',
    summary: 'Mathematical formulation of two-way nested domains, map projections, and orographic resolution for the Indian subcontinent.',
    content: [
      'India spans tropical and subtropical latitudes (8°N to 37°N) flanked by the Arabian Sea, the Bay of Bengal, and the Himalayan mountain barrier. Regional meteorological features are heavily modulated by complex terrain: the sharp 1,200m–2,000m Western Ghats escarpment, the Deccan plateau rainshadow, and the monsoon trough.',
      'CycloCast NWP configures domains using Lambert Conformal Conic (LCC) projection with true latitudes at 12°N and 28°N and standard central meridian at 80°E. For equatorial and Bay of Bengal maritime cyclogenesis tracking, Mercator projection is optionally supported.',
      'We adopt a two-way 1:3 nesting ratio: (d01) India Subcontinent mother domain at 27 km resolution providing synoptic boundary forcing; (d02) South Indian Peninsula or Bay of Bengal nested domain at 9 km resolution; and (d03) Convection-permitting fine nested domains at 3 km resolution covering specific high-impact regions (Western Ghats, Maharashtra & Konkan, Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana).',
      'At 3 km resolution, subgrid-scale cumulus parameterizations (such as Kain-Fritsch or Grell-Freitas) are deactivated (`cu_physics = 0`), allowing deep convective updrafts and precipitation microphysics to be resolved explicitly by the dynamical core.'
    ],
    keyTakeaways: [
      '1:3 Nesting Hierarchy: dx = 27 km -> 9 km -> 3 km preserves numerical wave dispersion properties without boundary shock.',
      'Convection-permitting d03: Disabling parameterized cumulus allows real atmospheric cloud microphysics to evolve explicitly.',
      'Terrain-following coordinates: 45 vertical eta levels concentrated densely in the lowest 2 km planetary boundary layer.'
    ],
    technicalSpecs: {
      'Map Projection': 'Lambert Conformal Conic (truelat1=12.0°, truelat2=28.0°, stand_lon=80.0°)',
      'Vertical Levels': '45 eta levels (p_top = 50 hPa, 18 levels in lowest 1.5 km)',
      'Nesting Mechanism': 'Two-way interactive nesting (feedback=1, smooth_option=0)',
      'High-Res Topography': 'USGS 30-arc-second / SRTM elevation with slope flow correction (topo_wind=1)'
    }
  },
  {
    id: 'storage_and_visualization',
    number: '06',
    title: 'Model Output Storage, Post-Processing & Visualisation',
    summary: 'Transforming raw multi-gigabyte NetCDF4 wrfout files into lightweight web-ready Zarr, GeoJSON, and vector tile assets.',
    content: [
      'A single 72-hour WRF run produces 15 to 40 GB of raw uncompressed NetCDF4 output containing 4D floating-point arrays across all diagnostic variables and time slices. Storing and serving these files directly to web users is impractical and bandwidth-prohibitive.',
      'The CycloCast post-processing pipeline uses Python (wrf-python, Xarray, NetCDF4, NumPy, SciPy) to perform: (1) Staggered grid de-staggering (interpolating U and V wind components from the Arakawa C-grid cell faces to cell centers); (2) Earth rotation of wind vectors from model projection coordinates to true geographic North/East; (3) Hydrostatic pressure reduction to Mean Sea-Level Pressure (MSLP); (4) Diagnostic calculation of derived indices (CAPE, CIN, Lifted Index, Dew Point, Helicity, Convective Rain Fraction); (5) Vertical interpolation from model eta levels to standard meteorological isobaric levels (1000, 925, 850, 700, 500, 300, 200 hPa).',
      'For web delivery: 2D surface fields are compressed into Cloud-Optimized GeoTIFFs (COGs) and GeoJSON contour polygons or gridded binary tiles. Sounding profiles at major cities are extracted into lightweight JSON documents (<50 KB). All data is cached on object storage (AWS S3 or Cloudflare R2 with zero egress fees).'
    ],
    keyTakeaways: [
      'Zero-egress object storage: Cloudflare R2 or MinIO S3 stores model outputs without incurring cloud egress bandwidth charges.',
      'Post-processing compression: Raw 25 GB wrfout file reduced to ~18 MB of web-optimized JSON/GeoJSON for client consumption.',
      'Publication-grade color scales: Meteorological color palettes strictly conform to WMO and IMD standard thresholds.'
    ],
    technicalSpecs: {
      'Post-Processing Tools': 'wrf-python 1.3.4, Xarray 2024+, rioxarray, Cartopy, geojson',
      'Web Delivery Format': 'Chunked Zarr arrays, GeoJSON contours, and vector wind field matrices',
      'Object Storage': 'Cloudflare R2 (S3-compatible, 0$ egress bandwidth fee)'
    },
    codeSnippet: {
      filename: 'postprocess_wrf.py',
      language: 'python',
      code: `"""
CycloCast NWP - Automated Post-Processing Script
Extracts meteorological variables from wrfout NetCDF files.
"""
from netCDF4 import Dataset
import wrf
import xarray as xr
import json

def process_wrfout(wrfout_path: str, output_json: str):
    ncfile = Dataset(wrfout_path)
    # Extract surface meteorological variables
    t2 = wrf.getvar(ncfile, "T2") - 273.15  # Kelvin to Celsius
    slp = wrf.getvar(ncfile, "slp")         # Mean Sea-Level Pressure (hPa)
    rh2 = wrf.getvar(ncfile, "rh2")         # 2m Relative Humidity (%)
    wspd_wdir = wrf.getvar(ncfile, "wspd_wdir10") # Wind speed (kt) & direction
    cape2d = wrf.getvar(ncfile, "cape_2d")  # 2D CAPE (J/kg) & CIN
    rain_c = wrf.getvar(ncfile, "RAINC")    # Convective rain (mm)
    rain_nc = wrf.getvar(ncfile, "RAINNC")  # Non-convective resolved rain (mm)
    total_rain = rain_c + rain_nc
    
    # Export downscaled grid points for web consumption
    data = {
        "init_time": str(wrf.extract_times(ncfile, timeidx=0)),
        "max_rain_mm": float(total_rain.max()),
        "min_mslp_hpa": float(slp.min()),
        "max_wind_kt": float(wspd_wdir[0].max())
    }
    with open(output_json, "w") as f:
        json.dump(data, f, indent=2)
    ncfile.close()`
    }
  },
  {
    id: 'cyclocast_evolution',
    number: '07',
    title: 'Evolution into CycloCast Proprietary Modelling System',
    summary: 'A 5-phase strategic engineering plan to evolve from standard WRF into an independent, ML-calibrated regional NWP platform.',
    content: [
      'True meteorological modeling independence is not achieved by building a toy atmospheric dynamical core; it is built through progressive scientific ownership of model configuration, domain physics suites, local data assimilation, regional calibration, and machine-learning-assisted bias correction.',
      'CycloCast India has established a clear 5-phase scientific evolution roadmap: (Phase 1) Foundation & Control Architecture — Establish the operational control platform, namelist generators, and verification suites; (Phase 2) Regional Parameterization Tuning — Conduct extensive seasonal hindcasts (comparing WSM6 vs Thompson microphysics, YSU vs MYNN PBL) against IMD AWS observations to derive optimal physics parameterization combinations for the Indian Monsoon; (Phase 3) CycloCast Data Assimilation Pipeline (Cyclo-DA) — Implement 3D-Var / EnKF data assimilation integrating INSAT-3D/3DR satellite radiances and local AWS observations directly into the initial conditions; (Phase 4) Hybrid Machine Learning Bias Correction — Train gradient-boosted and spatial convolutional neural networks on 5 years of CycloCast hindcasts vs ground-truth rain gauge data to remove systematic orographic over-prediction and coastal temperature biases; (Phase 5) Next-Generation Dynamical Core Evaluation — Progressively experiment with MPAS (Model for Prediction Across Scales) with Voronoi unstructured mesh grids, providing seamless variable-resolution forecasting over India.',
      'Throughout this evolution, CycloCast maintains total scientific transparency: every model forecast will state its dynamical core origin, physics suite version, boundary forcing dataset, and historical verification skill.'
    ],
    keyTakeaways: [
      'Empirical ownership: Moving from off-the-shelf WRF to tuned CycloCast physics suites with documented skill improvement.',
      'Data assimilation: Ingesting Indian geostationary satellite radiances to improve initial moisture fields over the Arabian Sea.',
      'Hybrid AI-physics: Coupling physical conservation laws with neural network post-processing corrections.'
    ],
    technicalSpecs: {
      'Phase 1': 'Operational Architecture & Verification Framework (Completed)',
      'Phase 2': 'Monsoon Physics Parameterization Sensitivity Benchmark',
      'Phase 3': 'WRFDA 3D-Var local data assimilation pipeline',
      'Phase 4': 'Regional XGBoost / U-Net spatial bias-correction layer',
      'Phase 5': 'MPAS unstructured global-to-regional multi-resolution dynamical core'
    }
  }
];
