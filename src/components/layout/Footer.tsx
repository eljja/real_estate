import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 p-4 text-center">
      <p className="text-sm text-gray-500">
        본 시뮬레이터는 교육 및 연구 목적으로 제작되었으며, 투자 조언이 아닙니다. 실제 세금 계산은 세무사에게 문의하세요.
      </p>
    </footer>
  );
};

export default Footer;
