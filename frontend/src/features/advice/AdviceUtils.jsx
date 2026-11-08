//  Bank Name Shortener
export const getBankShortName = (fullName) => {
  if (!fullName) return '';
  const map = {
    'state bank of india': 'SBI',
    'punjab national bank': 'PNB',
    'bank of india': 'BOI',
    'bank of baroda': 'BOB',
    'canara bank': 'Canara',
    'union bank of india': 'UBI',
    'indian bank': 'Indian Bank',
    'hdfc bank': 'HDFC',
    'icici bank': 'ICICI',
    'axis bank': 'Axis',
    'jharkhand rajya gramin bank': 'JRGB',
    'jharkhand gramin bank': 'JGB',
  };
  return map[fullName.toLowerCase().trim()] || fullName;
};

//  Amount to Words Converter (e.g. 1000 -> One Thousand Rupees Only)
export const formatAmountInWords = (num) => {
  if (!num || num === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const numToWords = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
  };

  return numToWords(Math.floor(num)) + ' Rupees Only';
};

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];