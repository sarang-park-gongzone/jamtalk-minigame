import type { CountryData } from '../types';

// 초성 추출 함수
function getChosung(str: string): string {
  const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  return [...str].map(c => {
    const code = c.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return c;
    return CHO[Math.floor(code / 588)];
  }).join('');
}

const RAW_COUNTRIES: Omit<CountryData, 'hint'>[] = [
  { name: '대한민국', capital: '서울', flag: '🇰🇷' },
  { name: '일본', capital: '도쿄', flag: '🇯🇵' },
  { name: '중국', capital: '베이징', flag: '🇨🇳' },
  { name: '미국', capital: '워싱턴', flag: '🇺🇸' },
  { name: '영국', capital: '런던', flag: '🇬🇧' },
  { name: '프랑스', capital: '파리', flag: '🇫🇷' },
  { name: '독일', capital: '베를린', flag: '🇩🇪' },
  { name: '이탈리아', capital: '로마', flag: '🇮🇹' },
  { name: '스페인', capital: '마드리드', flag: '🇪🇸' },
  { name: '캐나다', capital: '오타와', flag: '🇨🇦' },
  { name: '호주', capital: '캔버라', flag: '🇦🇺' },
  { name: '브라질', capital: '브라질리아', flag: '🇧🇷' },
  { name: '인도', capital: '뉴델리', flag: '🇮🇳' },
  { name: '러시아', capital: '모스크바', flag: '🇷🇺' },
  { name: '멕시코', capital: '멕시코시티', flag: '🇲🇽' },
  { name: '태국', capital: '방콕', flag: '🇹🇭' },
  { name: '베트남', capital: '하노이', flag: '🇻🇳' },
  { name: '이집트', capital: '카이로', flag: '🇪🇬' },
  { name: '터키', capital: '앙카라', flag: '🇹🇷' },
  { name: '아르헨티나', capital: '부에노스아이레스', flag: '🇦🇷' },
];

export const COUNTRIES: CountryData[] = RAW_COUNTRIES.map(c => ({
  ...c,
  hint: getChosung(c.capital),
}));
