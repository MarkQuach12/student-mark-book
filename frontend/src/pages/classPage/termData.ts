export interface WeekInfo {
  label: string;
  dateRange: string;
}

export interface TermPeriod {
  key: string;
  label: string;
  weeks: WeekInfo[];
}

export const TERMS: TermPeriod[] = [
  {
    key: "term1",
    label: "Term 1",
    weeks: [
      { label: "Week 1", dateRange: "2 Feb – 8 Feb" },
      { label: "Week 2", dateRange: "9 Feb – 15 Feb" },
      { label: "Week 3", dateRange: "16 Feb – 22 Feb" },
      { label: "Week 4", dateRange: "23 Feb – 1 Mar" },
      { label: "Week 5", dateRange: "2 Mar – 8 Mar" },
      { label: "Week 6", dateRange: "9 Mar – 15 Mar" },
      { label: "Week 7", dateRange: "16 Mar – 22 Mar" },
      { label: "Week 8", dateRange: "23 Mar – 29 Mar" },
      { label: "Week 9", dateRange: "30 Mar – 5 Apr" },
    ],
  },
  {
    key: "term1Holiday",
    label: "Term 1 Holiday",
    weeks: [
      { label: "Holiday Week 1", dateRange: "6 Apr – 12 Apr" },
      { label: "Holiday Week 2", dateRange: "13 Apr – 19 Apr" },
    ],
  },
  {
    key: "term2",
    label: "Term 2",
    weeks: [
      { label: "Week 1",  dateRange: "20 Apr – 26 Apr" },
      { label: "Week 2",  dateRange: "27 Apr – 3 May" },
      { label: "Week 3",  dateRange: "4 May – 10 May" },
      { label: "Week 4",  dateRange: "11 May – 17 May" },
      { label: "Week 5",  dateRange: "18 May – 24 May" },
      { label: "Week 6",  dateRange: "25 May – 31 May" },
      { label: "Week 7",  dateRange: "1 Jun – 7 Jun" },
      { label: "Week 8",  dateRange: "8 Jun – 14 Jun" },
      { label: "Week 9",  dateRange: "15 Jun – 21 Jun" },
      { label: "Week 10", dateRange: "22 Jun – 28 Jun" },
      { label: "Week 11", dateRange: "29 Jun – 5 Jul" },
    ],
  },
  {
    key: "term2Holiday",
    label: "Term 2 Holiday",
    weeks: [
      { label: "Holiday Week 1", dateRange: "6 Jul – 12 Jul" },
      { label: "Holiday Week 2", dateRange: "13 Jul – 19 Jul" },
    ],
  },
  {
    key: "term3",
    label: "Term 3",
    weeks: [
      { label: "Week 1",  dateRange: "20 Jul – 26 Jul" },
      { label: "Week 2",  dateRange: "27 Jul – 2 Aug" },
      { label: "Week 3",  dateRange: "3 Aug – 9 Aug" },
      { label: "Week 4",  dateRange: "10 Aug – 16 Aug" },
      { label: "Week 5",  dateRange: "17 Aug – 23 Aug" },
      { label: "Week 6",  dateRange: "24 Aug – 30 Aug" },
      { label: "Week 7",  dateRange: "31 Aug – 6 Sep" },
      { label: "Week 8",  dateRange: "7 Sep – 13 Sep" },
      { label: "Week 9",  dateRange: "14 Sep – 20 Sep" },
      { label: "Week 10", dateRange: "21 Sep – 27 Sep" },
    ],
  },
  {
    key: "term3Holiday",
    label: "Term 3 Holiday",
    weeks: [
      { label: "Holiday Week 1", dateRange: "28 Sep – 4 Oct" },
      { label: "Holiday Week 2", dateRange: "5 Oct – 11 Oct" },
    ],
  },
  {
    key: "term4",
    label: "Term 4",
    weeks: [
      { label: "Week 1",  dateRange: "12 Oct – 18 Oct" },
      { label: "Week 2",  dateRange: "19 Oct – 25 Oct" },
      { label: "Week 3",  dateRange: "26 Oct – 1 Nov" },
      { label: "Week 4",  dateRange: "2 Nov – 8 Nov" },
      { label: "Week 5",  dateRange: "9 Nov – 15 Nov" },
      { label: "Week 6",  dateRange: "16 Nov – 22 Nov" },
      { label: "Week 7",  dateRange: "23 Nov – 29 Nov" },
      { label: "Week 8",  dateRange: "30 Nov – 6 Dec" },
      { label: "Week 9",  dateRange: "7 Dec – 13 Dec" },
      { label: "Week 10", dateRange: "14 Dec – 20 Dec" },
    ],
  },
];

export const getTermByKey = (key: string): TermPeriod | undefined =>
  TERMS.find((t) => t.key === key);
