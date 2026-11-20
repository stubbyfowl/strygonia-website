/* Shipping from Phoenix, AZ, at USPS retail postage, so the fee is what the label costs.
   US addresses: USPS Ground Advantage, priced by zone, and USPS zones grow with distance
   from Phoenix. Everywhere else: First-Class Package International Service, priced by the
   country's USPS price group (that's how USPS prices hard-to-reach places).
   Sources, to update when USPS changes prices (usually January and July):
   - Prices: USPS Notice 123, effective Oct 4, 2026 (pe.usps.com/text/dmm300/Notice123.htm)
   - Zones: USPS domestic zone chart for ZIP 850, effective Nov 1, 2026 (postcalc.usps.com/DomesticZoneChart)
   Shared by the Purchase page (live quote) and api/create-payment-intent.js (the charge). */

// ponytail: estimated packed weights, not weighed; weigh a real packed order and update these.
export const WEIGHT_OZ = { blackbox: 6, "case-white": 1, "case-black": 1 };
const BOX_OZ = 4; // box and padding, once per package

// US territories and Freely Associated States use US ZIP codes and domestic postage.
export const DOMESTIC = new Set(["US", "PR", "VI", "GU", "AS", "MP", "FM", "MH", "PW"]);

// Zone from Phoenix by destination ZIP3: [first, last, zone]. A ZIP3 USPS doesn't list prices as zone 8.
const ZONES = [
  [5, 212, 8], [214, 239, 8], [240, 240, 7], [241, 241, 8], [242, 243, 7], [244, 245, 8], [246, 253, 7],
  [254, 254, 8], [255, 261, 7], [262, 262, 8], [263, 264, 7], [265, 265, 8], [266, 266, 7], [267, 268, 8],
  [270, 270, 7], [271, 279, 8], [280, 280, 7], [281, 281, 8], [282, 282, 7], [283, 285, 8], [286, 290, 7],
  [291, 291, 8], [292, 293, 7], [294, 295, 8], [296, 326, 7], [327, 335, 8], [336, 337, 7], [338, 342, 8],
  [344, 344, 7], [346, 346, 7], [347, 347, 8], [349, 349, 8], [350, 352, 7], [354, 355, 6], [356, 368, 7],
  [369, 369, 6], [370, 374, 7], [375, 375, 6], [376, 379, 7], [380, 383, 6], [384, 385, 7], [386, 397, 6],
  [398, 418, 7], [420, 420, 6], [421, 423, 7], [424, 424, 6], [425, 427, 7], [430, 499, 7], [500, 516, 6],
  [520, 528, 6], [530, 532, 7], [534, 534, 7], [535, 535, 6], [537, 540, 6], [541, 545, 7], [546, 548, 6],
  [549, 549, 7], [550, 551, 6], [553, 555, 6], [556, 556, 7], [557, 567, 6], [570, 574, 6], [575, 577, 5],
  [580, 588, 6], [590, 591, 5], [592, 592, 6], [593, 594, 5], [595, 595, 6], [596, 598, 5], [599, 599, 6],
  [600, 604, 7], [605, 605, 6], [606, 609, 7], [610, 620, 6], [622, 631, 6], [633, 641, 6], [644, 658, 6],
  [660, 662, 6], [664, 679, 5], [680, 681, 6], [683, 693, 5], [700, 701, 6], [703, 708, 6], [710, 714, 6],
  [716, 729, 6], [730, 731, 5], [733, 741, 5], [743, 754, 5], [755, 756, 6], [757, 758, 5], [759, 759, 6],
  [760, 769, 5], [770, 770, 6], [772, 773, 6], [774, 774, 5], [775, 777, 6], [778, 789, 5], [790, 791, 4],
  [792, 793, 5], [794, 794, 4], [795, 798, 5], [799, 804, 4], [805, 808, 5], [809, 816, 4], [820, 838, 5],
  [840, 846, 4], [847, 847, 3], [850, 850, 1], [851, 851, 2], [852, 852, 1], [853, 853, 2], [855, 855, 2],
  [856, 856, 3], [857, 857, 2], [859, 859, 2], [860, 860, 3], [863, 863, 2], [864, 865, 3], [870, 870, 3],
  [871, 871, 4], [873, 874, 3], [875, 875, 4], [876, 876, 3], [877, 877, 4], [878, 880, 3], [881, 885, 4],
  [889, 891, 3], [893, 893, 4], [894, 895, 5], [897, 898, 4], [900, 908, 4], [910, 918, 4], [919, 923, 3],
  [924, 924, 4], [925, 925, 3], [926, 928, 4], [930, 939, 4], [940, 949, 5], [950, 950, 4], [951, 951, 5],
  [952, 953, 4], [954, 966, 5], [967, 968, 8], [969, 969, 9], [970, 970, 5], [971, 971, 6], [972, 979, 5],
  [980, 985, 6], [986, 986, 5], [988, 988, 6], [989, 990, 5], [991, 992, 6], [993, 994, 5], [995, 998, 8],
  [999, 999, 7],
];
// 5-digit exceptions: [first, last, zone, only under this many oz]. Military APO/FPO under 1 lb,
// and the Pacific islands under 969 that USPS prices as zone 8.
const ZONES_5 = [[9000, 9999, 7, 16], [96200, 96699, 7, 16], [96900, 96938, 8], [96945, 96959, 8], [96961, 96969, 8], [96971, 96999, 8]];

// USPS Ground Advantage retail, cents: [weight not over (oz), zone 1, ..., zone 9].
const GROUND = [
  [8, 840, 855, 865, 880, 935, 950, 970, 1020, 1020],
  [16, 1005, 1045, 1070, 1110, 1170, 1210, 1270, 1365, 1365],
  [32, 1130, 1200, 1270, 1350, 1485, 1585, 1720, 1980, 1980],
  [48, 1180, 1250, 1315, 1420, 1570, 1720, 1970, 2315, 2315],
  [64, 1305, 1355, 1445, 1565, 1780, 1970, 2230, 2565, 2565],
  [80, 1375, 1435, 1535, 1660, 1885, 2100, 2380, 2745, 2745],
  [96, 1430, 1470, 1565, 1715, 1980, 2245, 2575, 2975, 2975],
  [112, 1480, 1520, 1620, 1790, 2085, 2395, 2765, 3200, 3200],
  [128, 1540, 1565, 1660, 1845, 2180, 2550, 2985, 3455, 3455],
  [144, 1590, 1620, 1705, 1910, 2280, 2695, 3215, 3710, 3710],
  [160, 1675, 1710, 1805, 2020, 2425, 2890, 3470, 4085, 4085],
];

// First-Class Package International Service retail, cents: [weight not over (oz), price group 1, ..., 20].
const INTL = [
  [8, 1940, 2015, 2265, 2205, 2195, 2140, 2185, 2350, 2570, 2225, 2660, 2480, 2775, 2240, 2460, 2180, 2415, 2305, 2320, 2305],
  [16, 2600, 2660, 3735, 3835, 3830, 3425, 2995, 3115, 3590, 3115, 4045, 4125, 3740, 3205, 2940, 2995, 3395, 3205, 3180, 3195],
  [32, 2905, 2970, 4170, 4280, 4275, 3830, 3345, 3480, 4020, 3480, 4515, 4605, 4175, 3515, 3285, 3285, 3790, 3515, 3550, 3570],
  [48, 3850, 3900, 6170, 5975, 5730, 5695, 4890, 5010, 5830, 5015, 6315, 6525, 5640, 4880, 4775, 4860, 5645, 5165, 5070, 4925],
  [64, 4760, 5105, 7435, 7830, 7260, 6985, 6625, 6750, 7555, 6865, 8085, 7910, 7570, 6670, 6505, 6625, 7190, 6730, 7000, 6425],
];

// USPS First-Class Package International price group by country. Left out: Somalia (no service),
// and countries under US sanctions or export controls on electronics (Cuba, Iran, North Korea,
// Syria, Russia, Belarus). Ascension and Tristan da Cunha ship as St. Helena (SH).
const GROUP = {
  AD: 3, AE: 10, AF: 4, AG: 6, AI: 6, AL: 3, AM: 3, AO: 5, AR: 11, AT: 9, AU: 12, AW: 6, AZ: 3, BA: 3, BB: 6,
  BD: 4, BE: 9, BF: 5, BG: 3, BH: 4, BI: 5, BJ: 5, BM: 6, BN: 4, BO: 6, BQ: 6, BR: 13, BS: 6, BT: 4, BW: 5,
  BZ: 6, CA: 1, CD: 5, CF: 5, CG: 5, CH: 9, CI: 5, CL: 11, CM: 5, CN: 14, CO: 6, CR: 6, CV: 5, CW: 6, CY: 4,
  CZ: 7, DE: 16, DJ: 5, DK: 9, DM: 6, DO: 6, DZ: 5, EC: 6, EE: 9, EG: 5, ER: 5, ES: 8, ET: 5, FI: 9, FJ: 4,
  FK: 6, FO: 9, FR: 15, GA: 5, GB: 20, GD: 6, GE: 3, GF: 15, GH: 5, GI: 7, GL: 9, GM: 5, GN: 5, GP: 15,
  GQ: 5, GR: 8, GT: 6, GW: 5, GY: 6, HK: 18, HN: 6, HR: 8, HT: 6, HU: 7, ID: 4, IE: 9, IL: 8, IN: 10, IQ: 4,
  IS: 7, IT: 9, JM: 6, JO: 4, JP: 17, KE: 5, KG: 4, KH: 4, KI: 4, KM: 5, KN: 6, KR: 18, KW: 4, KY: 6, KZ: 4,
  LA: 4, LB: 4, LC: 6, LI: 7, LK: 4, LR: 5, LS: 5, LT: 7, LU: 8, LV: 3, LY: 5, MA: 5, MD: 3, ME: 3, MG: 5,
  MK: 3, ML: 5, MM: 4, MN: 4, MO: 4, MQ: 15, MR: 5, MS: 6, MT: 3, MU: 5, MV: 4, MW: 5, MX: 2, MY: 10, MZ: 5,
  NA: 5, NC: 4, NE: 5, NG: 5, NI: 6, NL: 9, NO: 9, NP: 4, NR: 4, NZ: 12, OM: 4, PA: 6, PE: 6, PF: 4, PG: 4,
  PH: 4, PK: 4, PL: 7, PM: 15, PN: 4, PT: 7, PY: 6, QA: 4, RE: 15, RO: 3, RS: 3, RW: 5, SA: 4, SB: 4, SC: 5,
  SD: 5, SE: 8, SG: 10, SH: 5, SI: 8, SK: 3, SL: 5, SM: 8, SN: 5, SR: 6, SS: 5, ST: 5, SV: 6, SX: 6, SZ: 5,
  TC: 6, TD: 5, TG: 5, TH: 10, TJ: 4, TL: 4, TM: 4, TN: 5, TO: 4, TR: 3, TT: 6, TV: 4, TW: 10, TZ: 5, UA: 3,
  UG: 5, UY: 6, UZ: 4, VA: 9, VC: 6, VE: 11, VG: 6, VN: 4, VU: 4, WF: 4, WS: 4, XK: 3, YE: 4, ZA: 5, ZM: 5,
  ZW: 5,
};

export const SHIP_COUNTRIES = [...DOMESTIC, ...Object.keys(GROUP)];

function zoneFor(zip, oz) {
  const exception = ZONES_5.find(([first, last, , under]) => zip >= first && zip <= last && (!under || oz < under));
  if (exception) return exception[2];
  const zip3 = Math.floor(zip / 100);
  return ZONES.find(([first, last]) => zip3 >= first && zip3 <= last)?.[2] ?? 8;
}

/* Splits into as few packages as the price table allows, each with its own box. */
function postage(itemsOz, table, column) {
  const maxOz = table[table.length - 1][0];
  const packages = Math.max(1, Math.ceil(itemsOz / (maxOz - BOX_OZ)));
  const oz = itemsOz / packages + BOX_OZ;
  const col = column(oz);
  return { cents: packages * table.find(([max]) => oz <= max)[col], packages, col };
}

/* Postage for a cart ({ sku: qty }) to an address ({ country, postal_code }), or null if we
   don't ship there. `service` is for the order record, e.g. "USPS Ground Advantage, zone 5". */
export function quoteShipping(qty, address) {
  const itemsOz = Object.entries(qty).reduce((n, [sku, q]) => n + WEIGHT_OZ[sku] * q, 0);
  const country = String(address?.country ?? "").trim().toUpperCase();
  let q, service;
  if (DOMESTIC.has(country)) {
    const zip = /^\d{5}/.exec(String(address?.postal_code ?? "").trim())?.[0];
    if (!zip) return null;
    q = postage(itemsOz, GROUND, (oz) => zoneFor(Number(zip), oz));
    service = `USPS Ground Advantage, zone ${q.col}`;
  } else if (GROUP[country]) {
    q = postage(itemsOz, INTL, () => GROUP[country]);
    service = `USPS First-Class Package International, price group ${q.col}`;
  } else return null;
  return { cents: q.cents, service: q.packages > 1 ? `${service}, ${q.packages} packages` : service };
}
