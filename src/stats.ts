/* eslint-disable arrow-body-style */
interface StatValue {
	min: number;
	max: number;
	value: number;
}

export interface StatSingle<Attribute> extends StatValue {
	attribute: Attribute;
}

export type Stats<Attribute> = Map<Attribute, StatValue>;

const emptyStats = <Attribute>(): Stats<Attribute> => {
	return new Map<Attribute, StatValue>();
};

const getStatValue = <Attribute>(
	stat: Stats<Attribute>,
	attribute: Attribute
): number => {
	if (stat.has(attribute)) {
		const properties = stat.get(attribute)!;
		return properties.value;
	}
	// @TODO should -1 be the default for a stat that doesn't exist???
	// this could lead to logic issues
	return -1;
};

const getStatRange = <Attribute>(
	stat: Stats<Attribute>,
	attribute: Attribute
): [number, number] => {
	if (stat.has(attribute)) {
		const properties = stat.get(attribute)!;
		return [properties.min, properties.max];
	}
	// @TODO should -1 be the default for a stat that doesn't exist???
	// this could lead to logic issues
	return [-1, -1];
};

const getStat = <Attribute>(
	stat: Stats<Attribute>,
	attribute: Attribute
): StatValue | undefined => {
	return stat.get(attribute);
};

const setStat = <Attribute>(
	stat: Stats<Attribute>,
	attribute: Attribute,
	property: StatValue
): Stats<Attribute> => {
	stat.set(attribute, property);
	return stat;
};

/**
 * Set the value for a stat with respects to its min and max bounds, calling this on an attribute
 * that doesn't exist will return in nothing happening
 *
 * @param stat
 * @param attribute
 * @param value
 * @returns
 */
const setStatValue = <Attribute>(
	stat: Stats<Attribute>,
	attribute: Attribute,
	value: number
): Stats<Attribute> => {
	// we only allow setting a value if that stat currently exist
	if (stat.has(attribute)) {
		const property = getStat(stat, attribute)!;
		// the value also has to be bounded, we will not let you set a stat below or above the min / max
		const newValue = Math.min(Math.max(value, property.min), property.max);
		stat.set(attribute, { ...property, value: newValue });
	}
	return stat;
};

const increaseStatValue = <Attribute>(
	stat: Stats<Attribute>,
	attribute: Attribute,
	value: number
): Stats<Attribute> => {
	const currentValue = getStatValue(stat, attribute);
	if (currentValue !== -1) {
		return setStatValue(stat, attribute, currentValue + value);
	}
	return stat;
};

const decreaseStatValue = <Attribute>(
	stat: Stats<Attribute>,
	attribute: Attribute,
	value: number
): Stats<Attribute> => {
	const currentValue = getStatValue(stat, attribute);
	if (currentValue !== -1) {
		return setStatValue(stat, attribute, currentValue - value);
	}
	return stat;
};

const listFromStats = <Attribute>(
	stats: Stats<Attribute>
): StatSingle<Attribute>[] => {
	const keys = Array.from(stats.keys());
	const list: StatSingle<Attribute>[] = keys.map((attribute) => ({
		attribute,
		...getStat(stats, attribute)!,
	}));
	return list;
};

const statsFromList = <Attribute>(
	attributes: StatSingle<Attribute>[]
): Stats<Attribute> => {
	let stats: Map<Attribute, StatValue> = emptyStats();
	for (const attribute of attributes) {
		stats = setStat(stats, attribute.attribute, {
			min: attribute.min,
			max: attribute.max,
			value: attribute.value,
		});
	}
	return stats;
};

interface StatsMethod {
	increase: typeof increaseStatValue;
	decrease: typeof decreaseStatValue;
	getValue: typeof getStatValue;
	getRange: typeof getStatRange;
	setAttribute: typeof setStat;
	initialize: typeof statsFromList;
	toList: typeof listFromStats;
}

export const Stats: StatsMethod = {
	increase: increaseStatValue,
	decrease: decreaseStatValue,
	getValue: getStatValue,
	getRange: getStatRange,
	setAttribute: setStat,
	initialize: statsFromList,
	toList: listFromStats,
};
