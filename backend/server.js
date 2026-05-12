const express = require('express');
const cors = require('cors');
const next = require('next');
const path = require('path');
const fs = require('fs/promises');
require('dotenv').config();

const app = express();
const PORT = Number.parseInt(process.env.PORT || '5000', 10);
const isDevelopment = process.env.NODE_ENV === 'development';
const frontendRoot = path.join(__dirname, '..', 'frontend');
const buildOutput = path.join(__dirname, 'dist');
const host = process.env.HOST || '0.0.0.0';
const publicHost = host === '0.0.0.0' ? 'localhost' : host;
const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || `http://${publicHost}:${PORT}`;
const siteDataPath = path.join(__dirname, 'storage', 'site-data.json');
const nextApp = next({
  dev: isDevelopment,
  dir: frontendRoot,
  conf: {
    distDir: buildOutput,
  },
});
const handle = nextApp.getRequestHandler();
const defaultSiteData = {
  authorProfile: {
    blocks: [
      {
        id: 'profile-1',
        type: 'heading',
        content: '작가 소개',
        order: 0,
      },
      {
        id: 'profile-2',
        type: 'text',
        content: '작가 프로필을 입력해주세요. 관리자로 로그인하여 수정할 수 있습니다.',
        order: 1,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  works: [],
  activities: [],
  mainPage: {
    banners: [],
    blocks: [],
    updatedAt: new Date().toISOString(),
  },
};

let cachedSiteData = null;

async function readSiteData() {
  if (cachedSiteData) {
    return cachedSiteData;
  }

  try {
    const raw = await fs.readFile(siteDataPath, 'utf8');
    cachedSiteData = JSON.parse(raw);
    return cachedSiteData;
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.warn('site data could not be read, using defaults:', error);
    }

    cachedSiteData = defaultSiteData;
    return cachedSiteData;
  }
}

async function writeSiteData(nextSiteData) {
  await fs.mkdir(path.dirname(siteDataPath), { recursive: true });
  await fs.writeFile(siteDataPath, `${JSON.stringify(nextSiteData, null, 2)}\n`, 'utf8');
  cachedSiteData = nextSiteData;
}

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.disable('x-powered-by');

// 기본 라우팅
app.get('/health', (req, res) => {
  res.json({ ok: true, environment: process.env.NODE_ENV || 'development' });
});

// 샘플 API 엔드포인트
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!', publicUrl });
});

app.get('/api/site-data', async (req, res, nextMiddleware) => {
  try {
    const siteData = await readSiteData();
    res.json(siteData);
  } catch (error) {
    nextMiddleware(error);
  }
});

app.put('/api/site-data', async (req, res, nextMiddleware) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid site data' });
    }

    await writeSiteData(req.body);
    res.json({ ok: true });
  } catch (error) {
    nextMiddleware(error);
  }
});

// 서버 시작
nextApp.prepare().then(() => {
  app.use(async (req, res, nextMiddleware) => {
    try {
      await Promise.resolve(handle(req, res));
    } catch (error) {
      nextMiddleware(error);
    }
  });

  app.use((error, req, res, nextMiddleware) => {
    console.error(error);
    if (res.headersSent) {
      return nextMiddleware(error);
    }

    res.status(500).json({
      error: 'Internal Server Error',
    });
  });

  app.listen(PORT, host, () => {
    console.log(`서버가 ${host}:${PORT}에서 실행 중입니다.`);
    console.log(`공개 주소: ${publicUrl}`);
  });
});
