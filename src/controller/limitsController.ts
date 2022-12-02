import { ValueOf, ValuationTile, MapFilter } from '../../types/types';
import { typedKeys } from '../utilities/typedKeys';

export const getMax = (array: (number | undefined)[]) => {
	let max = 0;
	array.forEach((number) => {
		number && number > max && (max = number);
	});
	return max;
};

const CalculateMaxPriceOnHistoryDependGivenDays = (
    landFromAtlas: ValuationTile,
    givenDays: number
  ) => {
    let maxPrice = 0
    let now = new Date()
    let deathLine = now.setDate(now.getDate() - givenDays)
    landFromAtlas.history?.map((historyPoint: any) => {
      let historyTime = new Date(historyPoint.timestamp).getTime()
      if (historyTime > deathLine) {
        historyPoint
          ? (maxPrice =
            historyPoint.eth_price > maxPrice
              ? historyPoint.eth_price
              : maxPrice)
          : 0
      }
    })
  
    return maxPrice
  }
  

export const getLimits = (array: (number | undefined)[]) => {
	let arr: number[] = [];
	for (let value of array) if (value) arr.push(value);
	arr.sort(function (a, b) {
		return a - b;
	});
	let values: number[] = [],
		minimum = Number.MAX_VALUE,
		maximum = 0;
	for (let i = 30; i < arr.length - 30; i++) {
		values.push(arr[i]);
		maximum = arr[i] > maximum ? arr[i] : maximum;
		minimum = arr[i] < minimum ? arr[i] : minimum;
	}
	let mid = Math.floor(values.length - 1);
	let median =
		values.length % 2 == 0
			? (values[mid] + values[mid - 1]) / 2.0
			: values[mid];
	let distance = Math.min(
		Math.abs(minimum - median),
		Math.abs(maximum - median)
	);
	return { minimum: minimum, maximum: median + distance };
};

export const getPercentage = (
	partialValue: number | undefined,
	totalValue: number | undefined,
	limits: { minimum: number; maximum: number } | undefined
) => {
	if (!partialValue || !totalValue || !limits) return 0;
	let percentage = Math.ceil(
		((partialValue - limits.minimum) * 100) / (limits.maximum - limits.minimum)
	);
	return percentage > 0 ? (percentage < 100 ? percentage : 100) : 0;
};

export const setColours = (
	valuationAtlas: Record<string, any>,
	element: MapFilter
) => {
	const getLandDependingOnGivenNumberOfDays = (
		valuation: any,
		givenDays: number
	) => {
		let counter = 0;
		let now = new Date();
		let deathLine = now.setDate(now.getDate() - givenDays);
		valuationAtlas[valuation].history?.map((dataHistory: any) => {
			let historyTime = new Date(dataHistory.timestamp).getTime();
			if (historyTime > deathLine) counter = counter + 1;
		});
		return counter;
	};

	/**
    * Some Lands are listed for way too high prices.
    * To keep the price_difference filter consistent, we will consider
    that have a price difference of less than the number below
    */
	const MAX_DIFF = 400;

	// GENERATE MAX
	const elementOptions = {
		transfers: {
			predictions: typedKeys(valuationAtlas).map(
				(valuation) => valuationAtlas[valuation].history?.length
			),
		},
		price_difference: {
			predictions: typedKeys(valuationAtlas).map((valuation) => {
				if (typeof valuationAtlas[valuation].current_price_eth === 'undefined')
					return;
				const landPercentage = getPercentage(
					valuationAtlas[valuation].current_price_eth,
					valuationAtlas[valuation].eth_predicted_price,
					limits
				);
				if (landPercentage < MAX_DIFF) {
					return landPercentage;
				}
			}),
		},
		listed_lands: {
			predictions: typedKeys(valuationAtlas).map(
				(valuation) => valuationAtlas[valuation].eth_predicted_price
			),
		},
		basic: { predictions: [] },
		floor_adjusted_predicted_price: {
			predictions: typedKeys(valuationAtlas).map(
				(valuation) => valuationAtlas[valuation]?.floor_adjusted_predicted_price
			),
		},
		last_month_sells: {
			predictions: typedKeys(valuationAtlas).map((valuation) => {
				if (getLandDependingOnGivenNumberOfDays(valuation, 30) > 0)
					return CalculateMaxPriceOnHistoryDependGivenDays(
						valuationAtlas[valuation],
						30
					);
				return 0;
			}),
		},
	};
	let predictions: (number | undefined)[];

	// I would prefer to use typedKeys(elementOptions) here but typescript complains so using Object.keys instead
	if (Object.keys(elementOptions).includes(element)) {
		predictions =
			elementOptions[element as keyof typeof elementOptions].predictions;
	} else {
		predictions = typedKeys(valuationAtlas).map(
			(valuation) =>
				valuationAtlas[valuation][
					element as keyof ValueOf<typeof valuationAtlas> & MapFilter
				]
		);
	}
	let max = NaN,
		limits: any = undefined;

	max = getMax(predictions);
	limits = getLimits(predictions);

    return { max, limits }
};

export const getLimitsController = async (req: any, res: any) => {
	//let { max, limits } = setColours(req.valuationAtlas, req.element)
	return res.send('Working.');
};