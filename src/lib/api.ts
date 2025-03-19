import axios from 'axios';

const fetchClient = axios.create({
  baseURL: 'https://ad-report-api.droom.workers.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

fetchClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 최신 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 동적으로 헤더 설정
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

fetchClient.interceptors.response.use(
  (response) => response, // 성공 시 그대로 반환
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default fetchClient;
