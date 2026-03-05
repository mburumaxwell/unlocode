import { z } from 'zod';

export const UnlocodeFunctionCodeSchema = z.enum([
  'port',
  'rail_terminal',
  'road_terminal',
  'airport',
  'postal_exchange',
  'multimodal',
  'fixed_transport',
  'border_crossing',
]);
export type UnlocodeFunctionCode = z.infer<typeof UnlocodeFunctionCodeSchema>;

export const UnlocodeStatusCodeSchema = z.enum([
  'AA',
  'AC',
  'AF',
  'AI',
  'AM',
  'AQ',
  'AS',
  'RL',
  'RN',
  'RQ',
  'RR',
  'QQ',
  'UR',
  'XX',
]);
export type UnlocodeStatusCode = z.infer<typeof UnlocodeStatusCodeSchema>;

export type UnlocodeFunction = {
  code: UnlocodeFunctionCode;
  label: string;
  description: string;
};
export const UNLOCODE_FUNCTIONS: UnlocodeFunction[] = [
  { code: 'port', label: 'Port', description: 'Maritime port' }, // 1
  { code: 'rail_terminal', label: 'Rail Terminal', description: 'Rail terminal' }, // 2
  { code: 'road_terminal', label: 'Road Terminal', description: 'Road terminal' }, // 3
  { code: 'airport', label: 'Airport', description: 'Airport' }, // 4
  { code: 'postal_exchange', label: 'Postal Exchange', description: 'Postal exchange office' }, // 5
  { code: 'multimodal', label: 'Multimodal', description: 'Multimodal functions (ICDs, etc.)' }, // 6
  { code: 'fixed_transport', label: 'Fixed Transport', description: 'Fixed transport functions (e.g. pipeline)' }, // 7
  { code: 'border_crossing', label: 'Border Crossing', description: 'Border crossing function' }, // B
];

export const UnlocodeEntrySchema = z.object({
  code: z.string(), // e.g. "USNYC"
  country: z.string(), // e.g. "US"
  location: z.string(), // e.g. "NYC"
  name: z.string(), // e.g. "New York" (ASCII, no diacritics)
  name_native: z.string().optional(), // e.g. "Łódź" — original name with diacritics; omitted when identical to `name`
  subdivision: z.string(), // e.g. "NY"
  functions: UnlocodeFunctionCodeSchema.array(), // e.g. ["port", "airport", "postal_exchange"]
  status: UnlocodeStatusCodeSchema, // e.g. "AA"
  iata: z.string().optional(), // e.g. "ABZ" — IATA location code; omitted when absent in source data
  coordinates: z.object({ lat: z.number(), lon: z.number() }).nullable(), // e.g. { lat: 40.7, lon: -74.0 }
});
export type UnlocodeEntry = z.infer<typeof UnlocodeEntrySchema>;
