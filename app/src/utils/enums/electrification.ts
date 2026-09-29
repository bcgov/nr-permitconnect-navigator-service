export const ProjectType = {
  IPP_HYDRO: 'IPP_HYDRO',
  IPP_SOLAR: 'IPP_SOLAR',
  IPP_WIND: 'IPP_WIND',
  OTHER: 'OTHER'
} as const;
export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];
