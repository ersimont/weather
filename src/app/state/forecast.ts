import { Conditions } from './condition';

/** map from unix timestamp in millisconds to conditions */
export type Forecast = Record<number, Conditions>;
