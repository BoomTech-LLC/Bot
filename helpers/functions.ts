import { load } from "cheerio";
import moment from "moment";

const getCRSF = (data: string) => {
    const $ = load(data);
    const metaTag = $('meta[name="csrf-token"]');

    const csrfToken = metaTag.toString().split('"').reverse()[1];

    return csrfToken;
};

const findSmallestDate = (dates: string[]): string => {
    const smallestDate = dates.reduce((min, current) =>
        moment(current).isBefore(moment(min)) ? current : min
    );

    return smallestDate;
};

export { getCRSF, findSmallestDate };
