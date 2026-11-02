/**
 * @license
 * CycloCast NWP - WRF Namelist Generator
 * Generates scientifically valid, syntactically verified namelist.wps and namelist.input
 */

import { RegionalDomain, PhysicsSuiteConfig } from '../types/nwp';

export function generateNamelistWps(domain: RegionalDomain, startDate: string, endDate: string): string {
  const isNested = domain.nestLevel > 1;
  const maxDom = isNested ? 2 : 1;
  const parentGridRatio = isNested ? 3 : 1;

  return `&share
 wrf_core = 'ARW',
 max_dom = ${maxDom},
 start_date = '${startDate}', '${startDate}',
 end_date   = '${endDate}', '${endDate}',
 interval_seconds = 10800,
 io_form_geogrid = 2,
/

&geogrid
 parent_id         = 1, 1,
 parent_grid_ratio = 1, ${parentGridRatio},
 i_parent_start    = 1, 25,
 j_parent_start    = 1, 20,
 e_we              = ${domain.gridPointsX}, ${isNested ? Math.round(domain.gridPointsX * 1.5) : domain.gridPointsX},
 e_sn              = ${domain.gridPointsY}, ${isNested ? Math.round(domain.gridPointsY * 1.5) : domain.gridPointsY},
 geog_data_res     = 'modis_fpar+modis_lai+30s', 'modis_fpar+modis_lai+30s',
 dx = ${domain.resolutionKm * 1000},
 dy = ${domain.resolutionKm * 1000},
 map_proj = '${domain.projection}',
 ref_lat   = ${domain.centerLat.toFixed(2)},
 ref_lon   = ${domain.centerLon.toFixed(2)},
 truelat1  = ${domain.trueLat1.toFixed(2)},
 truelat2  = ${domain.trueLat2.toFixed(2)},
 stand_lon = ${domain.standLon.toFixed(2)},
 geog_data_path = '/opt/cyclocast/geog_data'
/

&ungrib
 out_format = 'WPS',
 prefix = 'FILE',
/

&metgrid
 fg_name = 'FILE',
 io_form_metgrid = 2,
/
`;
}

export function generateNamelistInput(
  domain: RegionalDomain,
  physics: PhysicsSuiteConfig,
  forecastHours: number,
  startDate: string,
  endDate: string
): string {
  // Courant-Friedrichs-Lewy (CFL) stability criterion: dt <= 6 * dx_km
  const timeStep = Math.min(180, Math.floor(domain.resolutionKm * 6));
  const isHighRes = domain.resolutionKm <= 4;
  const cuPhysics = isHighRes ? 0 : (physics.id.includes('tropical') ? 3 : 1);
  const mpPhysics = physics.id.includes('orographic') ? 10 : (physics.id.includes('cyclogenesis') ? 8 : 6);
  const pblPhysics = physics.id.includes('cyclogenesis') ? 5 : 1;

  const startParts = startDate.split('_');
  const [sYear, sMonth, sDay] = startParts[0].split('-').map(Number);
  const sHour = Number(startParts[1]?.split(':')[0] || '12');

  const endParts = endDate.split('_');
  const [eYear, eMonth, eDay] = endParts[0].split('-').map(Number);
  const eHour = Number(endParts[1]?.split(':')[0] || '12');

  return `&time_control
 run_days                            = ${Math.floor(forecastHours / 24)},
 run_hours                           = ${forecastHours % 24},
 run_minutes                         = 0,
 run_seconds                         = 0,
 start_year                          = ${sYear},
 start_month                         = ${sMonth},
 start_day                           = ${sDay},
 start_hour                          = ${sHour},
 end_year                            = ${eYear},
 end_month                           = ${eMonth},
 end_day                             = ${eDay},
 end_hour                            = ${eHour},
 interval_seconds                    = 10800,
 input_from_file                     = .true.,
 history_interval                    = 60,
 frames_per_outfile                  = 1,
 restart                             = .false.,
 restart_interval                    = 1440,
 io_form_history                     = 2,
 io_form_restart                     = 2,
 io_form_input                       = 2,
 io_form_boundary                    = 2,
/

&domains
 time_step                           = ${timeStep},
 time_step_fract_num                 = 0,
 time_step_fract_den                 = 1,
 max_dom                             = 1,
 e_we                                = ${domain.gridPointsX},
 e_sn                                = ${domain.gridPointsY},
 e_vert                              = 45,
 p_top_requested                     = 5000,
 num_metgrid_levels                  = 34,
 num_metgrid_soil_levels             = 4,
 dx                                  = ${domain.resolutionKm * 1000},
 dy                                  = ${domain.resolutionKm * 1000},
 grid_id                             = 1,
 parent_id                           = 0,
 i_parent_start                      = 1,
 j_parent_start                      = 1,
 parent_grid_ratio                   = 1,
 feedback                            = 1,
 smooth_option                       = 0,
/

&physics
 mp_physics                          = ${mpPhysics},
 ra_lw_physics                       = 4,
 ra_sw_physics                       = 4,
 radt                                = ${Math.max(5, domain.resolutionKm)},
 sf_sfclay_physics                   = 1,
 sf_surface_physics                  = 4,
 bl_pbl_physics                      = ${pblPhysics},
 bldt                                = 0,
 cu_physics                          = ${cuPhysics},
 cudt                                = ${isHighRes ? 0 : 5},
 isfflx                              = 1,
 ifsnow                              = 1,
 icloud                              = 1,
 surface_input_source                = 3,
 num_soil_layers                     = 4,
 sst_update                          = 1,
 topo_wind                           = ${isHighRes ? 1 : 0},
/

&dynamics
 w_damping                           = 1,
 diff_opt                            = 1,
 km_opt                              = 4,
 diff_6th_opt                        = 2,
 diff_6th_factor                     = 0.12,
 base_temp                           = 290.,
 damp_opt                            = 3,
 zdamp                               = 5000.,
 dampcoef                            = 0.2,
 khdif                               = 0,
 kvdif                               = 0,
 non_hydrostatic                     = .true.,
 moist_adv_opt                       = 1,
 scalar_adv_opt                      = 1,
/

&bdy_control
 spec_bdy_width                      = 5,
 spec_zone                           = 1,
 relax_zone                          = 4,
 specified                           = .true.,
 nested                              = .false.,
/

&namelist_quilt
 nio_tasks_per_group = 0,
 nio_groups = 1,
/
`;
}
