/**
 * @license
 * CycloCast NWP - Atmospheric Physics Parameterization Suites
 */

import { PhysicsSuiteConfig } from '../types/nwp';

export const PHYSICS_SUITES: PhysicsSuiteConfig[] = [
  {
    id: 'cyclocast_tropical_convection_v1',
    name: 'CycloCast Tropical Convection Suite (V1 Operational)',
    description: 'Tuned specifically for Indian Summer Monsoon convection, Western Ghats orographic triggering, and heavy rainband kinematics.',
    microphysics: 'WSM6 (WRF Single-Moment 6-Class with graupel/ice)',
    cumulus: 'Grell-Freitas ensemble (d01/d02) / Explicit Resolved (d03 convection-permitting)',
    pbl: 'YSU (Yonsei University non-local K-profile scheme)',
    radiationLongwave: 'RRTMG (Rapid Radiative Transfer Model)',
    radiationShortwave: 'RRTMG (Monte-Carlo Independent Column Approximation)',
    surfaceLayer: 'Revised MM5 scheme (Jiménez et al.)',
    landSurface: 'Noah-MP (Multi-Physics Land Surface Model with dynamic vegetation)',
    recommendedDx: '3 km – 27 km',
    monsoonSuitability: 'High',
  },
  {
    id: 'cyclocast_cyclogenesis_marine_v1',
    name: 'CycloCast Marine & Cyclogenesis Suite',
    description: 'Optimized for air-sea surface flux exchange, boundary layer vortex intensification, and Bay of Bengal tropical cyclone outer rainbands.',
    microphysics: 'Thompson aerosol-aware scheme',
    cumulus: 'Kain-Fritsch with moisture advection trigger (d01/d02) / OFF (d03)',
    pbl: 'MYNN 2.5 (Mellor-Yamada-Nakanishi-Niino 2.5 level TKE closure)',
    radiationLongwave: 'RRTMG LW',
    radiationShortwave: 'RRTMG SW',
    surfaceLayer: 'MYNN surface layer (surface roughness length tuned for high ocean wind)',
    landSurface: 'Unified Noah LSM with sea surface temperature update (sst_update=1)',
    recommendedDx: '3 km – 9 km',
    monsoonSuitability: 'High',
  },
  {
    id: 'cyclocast_orographic_extreme_v1',
    name: 'CycloCast High-Resolution Orographic Suite',
    description: 'Designed specifically for steep escarpments in Western Ghats, Malnad, and Konkan to arrest spurious ridge-top drying and simulate leeward rainshadows.',
    microphysics: 'Morrison 2-moment scheme (predicts both mass mixing ratio and number concentration)',
    cumulus: 'Explicit Resolved (cu_physics = 0, fully resolved convection)',
    pbl: 'Shin-Hong scale-aware diagnostic PBL scheme',
    radiationLongwave: 'RRTMG LW',
    radiationShortwave: 'RRTMG SW',
    surfaceLayer: 'Monin-Obukhov with Carlson-Boland viscous sublayer',
    landSurface: 'Noah-MP with slope solar radiation correction (topo_wind=1)',
    recommendedDx: '1.5 km – 3 km',
    monsoonSuitability: 'High',
  },
  {
    id: 'cyclocast_fast_research_baseline',
    name: 'Research Benchmark (Low Computational Footprint)',
    description: 'Lightweight parameterization configuration designed for fast test cycles and development servers with limited compute budgets.',
    microphysics: 'WSM3 (WRF Single-Moment 3-Class simple ice)',
    cumulus: 'Betts-Miller-Janjic (BMJ) convective adjustment',
    pbl: 'Mellor-Yamada-Janjic (MYJ) local closure',
    radiationLongwave: 'CAM (Community Atmosphere Model) LW',
    radiationShortwave: 'Dudhia simple shortwave',
    surfaceLayer: 'Eta similarity scheme',
    landSurface: 'Thermal 5-layer diffusion',
    recommendedDx: '9 km – 27 km',
    monsoonSuitability: 'Moderate',
  },
];
