export interface DistrictGeo {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  svgPath: string; // SVG path data for the district shape
}

// These SVG paths are highly simplified approximations for a 500x600 viewBox
export const seoulGeoData: DistrictGeo[] = [
  { id: 'dobong', name: '도봉구', center: [37.6688, 127.0471], svgPath: 'M300 50 L340 30 L360 80 L320 120 L280 100 Z' },
  { id: 'gangbuk', name: '강북구', center: [37.6397, 127.0255], svgPath: 'M280 100 L320 120 L310 160 L260 170 L250 130 Z' },
  { id: 'nowon', name: '노원구', center: [37.6542, 127.0568], svgPath: 'M320 120 L360 80 L400 130 L380 180 L310 160 Z' },
  { id: 'eunpyeong', name: '은평구', center: [37.6177, 126.9227], svgPath: 'M180 140 L250 130 L260 170 L210 220 L160 200 Z' },
  { id: 'seongbuk', name: '성북구', center: [37.5894, 127.0167], svgPath: 'M260 170 L310 160 L330 210 L280 230 L240 210 Z' },
  { id: 'jungnang', name: '중랑구', center: [37.6063, 127.0928], svgPath: 'M310 160 L380 180 L400 230 L350 260 L330 210 Z' },
  { id: 'seodaemun', name: '서대문구', center: [37.5791, 126.9368], svgPath: 'M160 200 L210 220 L220 270 L170 280 L140 240 Z' },
  { id: 'jongno', name: '종로구', center: [37.5735, 126.9790], svgPath: 'M210 220 L240 210 L280 230 L270 280 L220 270 Z' },
  { id: 'dongdaemun', name: '동대문구', center: [37.5744, 127.0396], svgPath: 'M280 230 L330 210 L350 260 L310 280 L270 280 Z' },
  { id: 'mapo', name: '마포구', center: [37.5637, 126.9084], svgPath: 'M130 260 L170 280 L200 320 L150 340 L100 300 Z' },
  { id: 'jung', name: '중구', center: [37.5636, 126.9976], svgPath: 'M220 270 L270 280 L260 320 L210 310 Z' },
  { id: 'seongdong', name: '성동구', center: [37.5633, 127.0371], svgPath: 'M270 280 L310 280 L320 330 L260 320 Z' },
  { id: 'gwangjin', name: '광진구', center: [37.5385, 127.0823], svgPath: 'M310 280 L350 260 L380 310 L340 350 L320 330 Z' },
  { id: 'gangdong', name: '강동구', center: [37.5301, 127.1238], svgPath: 'M380 310 L430 280 L460 330 L410 370 L380 340 Z' },
  { id: 'yongsan', name: '용산구', center: [37.5326, 126.9908], svgPath: 'M210 310 L260 320 L250 370 L190 350 Z' },
  { id: 'gangseo', name: '강서구', center: [37.5510, 126.8495], svgPath: 'M40 280 L100 300 L90 360 L30 340 Z' },
  { id: 'yangcheon', name: '양천구', center: [37.5170, 126.8666], svgPath: 'M90 360 L130 340 L150 400 L80 410 Z' },
  { id: 'yeongdeungpo', name: '영등포구', center: [37.5264, 126.8963], svgPath: 'M130 340 L190 350 L180 410 L150 400 Z' },
  { id: 'dongjak', name: '동작구', center: [37.5120, 126.9396], svgPath: 'M190 350 L250 370 L240 430 L180 410 Z' },
  { id: 'guro', name: '구로구', center: [37.4954, 126.8874], svgPath: 'M80 410 L150 400 L140 460 L60 450 Z' },
  { id: 'geumcheon', name: '금천구', center: [37.4568, 126.8954], svgPath: 'M140 460 L180 450 L170 510 L110 500 Z' },
  { id: 'gwanak', name: '관악구', center: [37.4784, 126.9516], svgPath: 'M180 410 L240 430 L220 490 L160 470 L180 450 Z' },
  { id: 'seocho', name: '서초구', center: [37.4837, 127.0324], svgPath: 'M250 370 L300 380 L320 460 L260 480 L240 430 Z' },
  { id: 'gangnam', name: '강남구', center: [37.5172, 127.0473], svgPath: 'M300 380 L350 390 L360 470 L320 460 Z' },
  { id: 'songpa', name: '송파구', center: [37.5145, 127.1059], svgPath: 'M350 390 L410 370 L430 440 L360 470 Z' }
];
