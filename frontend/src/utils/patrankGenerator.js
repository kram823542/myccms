// src/utils/patrankGenerator.js

export const generatePatrankPrefix = (clfName) => {
  if (!clfName) return 'CLF';

  const hindiMap = {
    'क':'K','ख':'KH','ग':'G','घ':'GH','ङ':'N','च':'C','छ':'CH','ज':'J','झ':'JH','ञ':'N',
    'ट':'T','ठ':'TH','ड':'D','ढ':'DH','ण':'N','त':'T','थ':'TH','द':'D','ध':'DH','न':'N',
    'प':'P','फ':'F','ब':'B','भ':'BH','म':'M','य':'Y','र':'R','ल':'L','व':'V','श':'SH',
    'ष':'SH','स':'S','ह':'H','ळ':'L','क्ष':'KSH','ज्ञ':'GY',
    'अ':'A','आ':'AA','इ':'I','ई':'EE','उ':'U','ऊ':'OO','ए':'E','ऐ':'AI','ओ':'O','औ':'AU',
    'ा':'A','ि':'I','ी':'I','ु':'U','ू':'U','े':'E','ै':'AI','ो':'O','ौ':'AU','ं':'N','ः':'H','्':''
  };

  let translated = '';
  for (let i = 0; i < clfName.length; i++) {
    const char = clfName[i];
    if (hindiMap[char]) {
      translated += hindiMap[char];
    } else if (/[A-Za-z]/.test(char)) {
      translated += char.toUpperCase();
    }
  }

  return translated.length >= 3 
    ? translated.substring(0, 3).toUpperCase() 
    : translated.padEnd(3, 'X').toUpperCase();
};