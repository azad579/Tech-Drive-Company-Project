// Bengali digits and calendar conversion
const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const banglaMonths = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
  'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
];

export function toBanglaNumber(num: number | string): string {
  return num
    .toString()
    .split('')
    .map(digit => {
      const parsed = parseInt(digit, 10);
      return !isNaN(parsed) ? banglaDigits[parsed] : digit;
    })
    .join('');
}

export function formatBDT(amount: number): string {
  return '৳ ' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Returns formatted string matching:
 * "Today, 24 Oct 2026 || আজ শনিবার, ৮ কার্তিক ১৪৩৩"
 */
export function getFormattedHeaderDate(): string {
  const now = new Date();

  // English part
  const day = now.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  const enDate = `Today, ${day} ${monthName} ${year}`;

  // Bengali part calculation approximation
  const dayOfWeek = banglaDays[now.getDay()];
  
  // Gregorian to Bangla Year conversion
  // Bangla new year starts April 14
  let banglaYear = year - 593;
  const isBeforeBoishakh = (now.getMonth() < 3) || (now.getMonth() === 3 && day < 14);
  if (isBeforeBoishakh) {
    banglaYear -= 1;
  }

  // Month and Day approximation for Bangladesh revised calendar
  // In October (Kortik starts ~Oct 17 or 18)
  let bMonth = 'কার্তিক';
  let bDay = 8;

  if (now.getMonth() === 9) { // Oct
    bMonth = 'কার্তিক';
    bDay = Math.max(1, day - 16);
  } else if (now.getMonth() === 10) { // Nov
    bMonth = day < 16 ? 'কার্তিক' : 'অগ্রহায়ণ';
    bDay = day < 16 ? day + 15 : day - 15;
  } else {
    bMonth = banglaMonths[now.getMonth()];
    bDay = day;
  }

  const bnDate = `আজ ${dayOfWeek}, ${toBanglaNumber(bDay)} ${bMonth} ${toBanglaNumber(banglaYear)}`;

  return `${enDate} || ${bnDate}`;
}
