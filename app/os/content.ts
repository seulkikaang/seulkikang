export type Lang = 'ko' | 'en';

type Titled = { title: string };
type NamedBody = { name: string; body: string };

export type OsContent = {
  lang: Lang;
  meta: { title: string; description: string };
  nav: { contact: string; switchLabel: string; switchHref: string };
  mailSubject: string;
  hero: { title: string; lead: string; status: string; cta: string };
  diagram: {
    source: string;
    sourceNote: string;
    channels: { name: string; format: string }[];
    caption: string;
  };
  problem: Titled & { items: { head: string; body: string }[] };
  system: Titled & {
    lead: string;
    inputsLabel: string;
    inputs: string[];
    core: { name: string; note: string };
    agents: NamedBody[];
    output: { name: string; note: string };
    checkpoint: string;
  };
  parts: Titled & {
    stopLabel: string;
    items: { name: string; body: string; stop: string }[];
  };
  screens: Titled & {
    lead: string;
    menu: { title: string; prompt: string; items: string[]; guard: string };
  };
  proof: Titled & {
    lead: string;
    loopTitle: string;
    loop: NamedBody[];
    loopReturn: string;
    reach: { title: string; note: string; rows: { channel: string; value: number }[]; unit: string };
    facts: { value: string; label: string }[];
  };
  fit: Titled & { items: { who: string; body: string }[] };
  steps: Titled & { items: NamedBody[] };
  founder: Titled & { name: string; role: string; paragraphs: string[] };
  footer: { company: string; rows: { label: string; value: string }[] };
};

const EMAIL = 'seulki.kang@experience.ai.kr';

export function contactHref(content: OsContent): string {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(content.mailSubject)}`;
}

// Monthly views per channel, October 2026. LinkedIn is impressions; the rest are views.
const REACH = {
  linkedin: 60000,
  instagram: 30000,
  youtube: 13000,
  brunch: 9000,
  newsletter: 5000,
  fieldnotes: 1000,
  naver: 400,
};

export const ko: OsContent = {
  lang: 'ko',
  meta: {
    title: 'AI 마케팅 OS | 커넥트에이엑스',
    description:
      '브랜드 맥락과 원본 콘텐츠를 한곳에 모으고, AI 에이전트가 채널별 제작과 발행, 점검까지 이어서 처리하게 만드는 마케팅 운영 체계.',
  },
  nav: { contact: '도입 문의', switchLabel: 'English', switchHref: '/os/en' },
  mailSubject: 'AI 마케팅 OS 문의',
  hero: {
    title: '마케팅을 매번 처음부터 하지 않게',
    lead:
      'AI 마케팅 OS는 브랜드 맥락, 원본 콘텐츠, 반복 업무를 한곳에 모아 두고 AI 에이전트가 채널별 제작과 발행, 점검까지 이어서 처리하게 만드는 운영 체계입니다. 1인 창업가와 작은 마케팅팀을 위해 만들고 있습니다.',
    status: '지금은 커넥트에이엑스의 채널 운영과 기업 AI 교육 현장에서 쓰고 있고, 팀 단위 도입을 준비하고 있습니다.',
    cta: '도입 문의하기',
  },
  diagram: {
    source: '원본 글 한 편',
    sourceNote: '지식 베이스에 저장',
    channels: [
      { name: '링크드인', format: '긴 글과 캐러셀' },
      { name: '뉴스레터', format: '주간 발송' },
      { name: '브런치', format: '블로그 원문' },
      { name: '네이버 블로그', format: '검색 키워드 맞춤' },
      { name: '스레드', format: '짧은 팁' },
      { name: '인스타그램', format: '3:4 카드뉴스' },
      { name: '숏폼', format: '글을 영상으로' },
    ],
    caption: '글은 한 번 씁니다. 채널마다 형식을 바꾸고 올리는 일은 대부분 OS가 맡습니다.',
  },
  problem: {
    title: 'AI를 써도 일이 줄지 않는 이유',
    items: [
      {
        head: '맥락이 매번 사라집니다',
        body: '대화창을 열 때마다 브랜드 소개, 말투, 지난 성과를 다시 붙여 넣습니다. AI를 쓰는데도 붙여 넣는 일이 하나 더 늘었습니다.',
      },
      {
        head: '채널이 늘면 일도 같이 늘어납니다',
        body: '링크드인, 뉴스레터, 블로그, 스레드를 따로 운영하면 만드는 시간이 채널 수만큼 늘어납니다. 작은 팀은 결국 채널을 줄이게 됩니다.',
      },
      {
        head: '팀 안에서 정보가 흐르지 않습니다',
        body: '세일즈가 들은 고객 이야기는 마케팅으로, 캠페인 정보는 CS로 가지 않습니다. 업무가 문서로 남아 있지 않으면 AI도 가져다 쓸 것이 없습니다.',
      },
    ],
  },
  system: {
    title: 'OS는 이렇게 연결됩니다',
    lead: '브랜드와 고객에 대한 모든 맥락은 지식 베이스 한곳에 쌓입니다. 에이전트는 매번 그곳에서 맥락을 꺼내 일하고, 사람은 정해 둔 지점에서만 확인합니다.',
    inputsLabel: '쌓이는 것',
    inputs: ['브랜드 설명과 말투', '원본 글과 강의 자료', '고객 반응과 성과 데이터'],
    core: { name: '지식 베이스', note: '원본은 그대로, 주제별 카드로 정리' },
    agents: [
      { name: '제작 에이전트', body: '주제 선정, 초안, 채널별 변환' },
      { name: '배포 에이전트', body: '로그인이 필요한 채널에 발행' },
      { name: '점검 에이전트', body: '형식 검수, 성과 수집' },
    ],
    output: { name: '7개 채널', note: '한국어와 영어' },
    checkpoint: '사람이 확인하는 지점',
  },
  parts: {
    title: 'OS를 이루는 네 부분',
    stopLabel: '그만해도 되는 일',
    items: [
      {
        name: '지식 베이스',
        body: '강의 자료, 블로그 글, 뉴스레터, 링크드인 글 같은 원본은 그대로 보관하고, AI가 주제별 카드와 목록을 만들어 둡니다. 새 글을 쓸 때 AI가 필요한 근거를 찾아 씁니다.',
        stop: '자료 찾기, 같은 설명 반복하기',
      },
      {
        name: '채널 파이프라인',
        body: '원본 한 편을 채널 형식에 맞게 바꿉니다. 카드뉴스, 블로그, 뉴스레터, 숏폼 영상까지. 검색 키워드 데이터로 주제를 고르고 발행까지 이어 갑니다.',
        stop: '채널마다 다시 쓰기',
      },
      {
        name: '브라우저 에이전트',
        body: '로그인이 필요한 사이트에서 사람이 하던 반복 작업을 맡깁니다. 글 이관, 링크 일괄 교체, 채널 설정, 매달 성과 수집 같은 일입니다.',
        stop: '복사해서 붙여 넣기, 월말에 숫자 모으기',
      },
      {
        name: '작업 메뉴와 검수',
        body: '팀이 자주 하는 요청을 메뉴로 만듭니다. 프로모션 기획안, 소재 변형, 콘텐츠 캘린더, 회의록 요약 같은 것들입니다. 실행 전에 확인을 받고, 끝나면 결과물을 점검합니다.',
        stop: '매번 프롬프트 새로 쓰기',
      },
    ],
  },
  screens: {
    title: '팀이 실제로 보는 화면',
    lead: '팀원은 프롬프트를 새로 쓰지 않습니다. 메뉴에서 할 일을 고르면 나머지는 시스템이 이어 받습니다.',
    menu: {
      title: '작업 메뉴',
      prompt: '오늘은 어떤 작업을 할까요?',
      items: ['프로모션 기획안', '이미지와 배너 시안', '콘텐츠 캘린더', '회의록, 보고서 요약', '광고 소재 변형', '직접 요청하기'],
      guard: '일정이나 발행이 걸린 작업은 실행 전에 한 번 더 묻습니다.',
    },
  },
  proof: {
    title: '커넥트에이엑스가 첫 번째 사용자입니다',
    lead: '이 OS는 설계도에서 시작하지 않았습니다. 대표 한 명이 기획, 제작, 배포, 측정을 모두 하면서 반복되는 일을 하나씩 시스템으로 옮겼고, 지금은 그 시스템이 한국어와 영어로 7개 채널을 돌립니다.',
    loopTitle: '한 달 동안 도는 순서',
    loop: [
      { name: '모으기', body: '링크드인, 스레드, 브런치, 뉴스레터에 쓴 원문 2,000여\u00a0편이 한곳에 쌓입니다.' },
      { name: '정리하기', body: '원본은 건드리지 않고 주제별 카드와 목록으로 묶습니다.' },
      { name: '만들기', body: '검색 키워드 데이터로 주제를 고르고 채널 형식에 맞춰 만듭니다.' },
      { name: '내보내기', body: '블로그, 뉴스레터, 카드뉴스, 영문 사이트로 나눠 발행합니다.' },
      { name: '측정하기', body: '매달 15일, 채널별 노출 수를 자동으로 모읍니다.' },
      { name: '다시 쓰기', body: '스레드에서 반응이 좋았던 팁을 링크드인과 뉴스레터용으로 다시 만듭니다.' },
    ],
    loopReturn: '다음 달 기획으로',
    reach: {
      title: '채널별 한 달 도달',
      note: '2026년 10월 기준. 링크드인은 노출 수, 나머지는 조회 수입니다.',
      unit: '회',
      rows: [
        { channel: '링크드인', value: REACH.linkedin },
        { channel: '인스타그램', value: REACH.instagram },
        { channel: '유튜브', value: REACH.youtube },
        { channel: '브런치', value: REACH.brunch },
        { channel: '뉴스레터', value: REACH.newsletter },
        { channel: 'Fieldnotes (영문)', value: REACH.fieldnotes },
        { channel: '네이버 블로그', value: REACH.naver },
      ],
    },
    facts: [
      { value: '1명', label: '운영하는 사람' },
      { value: '7개', label: '운영 채널' },
      { value: '2,000여\u00a0편', label: '지식 베이스의 원문' },
      { value: '2,100명', label: '커뮤니티 참여자' },
    ],
  },
  fit: {
    title: '이런 곳에 맞습니다',
    items: [
      {
        who: '1인 창업가와 크리에이터',
        body: '혼자서 여러 채널을 운영해야 하는데, 쓰는 시간보다 옮기고 고치는 시간이 더 긴 경우.',
      },
      {
        who: '작은 마케팅팀',
        body: '사람은 두세 명인데 채널과 캠페인은 계속 늘어나고, 팀원마다 AI 쓰는 방식이 다른 경우.',
      },
      {
        who: 'AI 도입을 시작하는 B2B 조직',
        body: '도구는 샀는데 업무에 붙지 않고, 마케팅과 세일즈와 CS의 정보가 따로 노는 경우.',
      },
    ],
  },
  steps: {
    title: '도입은 이렇게 진행합니다',
    items: [
      { name: '업무 지도 그리기', body: '어떤 채널에서 어떤 일을 누가 몇 시간씩 하고 있는지 먼저 적습니다.' },
      { name: '원본 모으기', body: '흩어진 글, 자료, 브랜드 설명을 지식 베이스 한곳으로 옮깁니다.' },
      { name: '연결하기', body: '자주 하는 일부터 파이프라인과 에이전트를 붙이고, 확인 단계를 넣습니다.' },
      { name: '팀에 넘기기', body: '팀원이 직접 메뉴를 쓰고 고칠 수 있도록 교육하고 운영 규칙을 남깁니다.' },
    ],
  },
  founder: {
    title: '만드는 사람',
    name: '강슬기',
    role: '커넥트에이엑스 대표',
    paragraphs: [
      '광고대행사 AE로 시작해 14년 동안 미디어 플래너, 매체 세일즈, 데이터 전략팀장을 거쳤습니다. 오길비와 레오버넷에서 디지털 마케팅을 했고, 측정 데이터가 없던 옥외광고 시장에서 효과 측정 솔루션을 만들며 정부 과제 1.6억 원을 따냈습니다.',
      '지금은 기업과 실무자에게 AI 업무 활용을 가르치고, 직접 만든 시스템으로 여러 채널을 혼자 운영합니다. 링크드인 팔로워 1.6만 명, 뉴스레터 구독자 1,500명과 함께 마케팅데이터커넥트, 퇴근후AI, DATA+WOMEN KOREA 커뮤니티를 운영하고 있습니다.',
    ],
  },
  footer: {
    company: '커넥트에이엑스',
    rows: [
      { label: '대표', value: '강슬기' },
      { label: '사업자등록번호', value: '158-36-00782' },
      { label: '주소', value: '경기도 구리시 갈매순환로166번길 45, H531호' },
      { label: '이메일', value: EMAIL },
    ],
  },
};

export const en: OsContent = {
  lang: 'en',
  meta: {
    title: 'AI Marketing OS | ConnectAX',
    description:
      'A marketing operating system that keeps brand context and source content in one place, so AI agents can produce, publish and check content for every channel.',
  },
  nav: { contact: 'Contact', switchLabel: '한국어', switchHref: '/os' },
  mailSubject: 'AI Marketing OS inquiry',
  hero: {
    title: 'Stop starting your marketing from scratch',
    lead:
      'AI Marketing OS keeps your brand context, source content and repeat tasks in one place, then lets AI agents carry the work through: adapting content for each channel, publishing it and checking the result. We are building it for solo founders and small marketing teams.',
    status: 'It currently runs ConnectAX’s own channels and is used in our corporate AI training. Team rollouts are in preparation.',
    cta: 'Get in touch',
  },
  diagram: {
    source: 'One source post',
    sourceNote: 'Stored in the knowledge base',
    channels: [
      { name: 'LinkedIn', format: 'Long posts and carousels' },
      { name: 'Newsletter', format: 'Weekly issue' },
      { name: 'Brunch', format: 'Original long-form post' },
      { name: 'Naver Blog', format: 'Tuned for search' },
      { name: 'Threads', format: 'Short tips' },
      { name: 'Instagram', format: '3:4 card posts' },
      { name: 'Short video', format: 'Posts turned into video' },
    ],
    caption: 'You write once. The OS handles most of the reformatting and posting for each channel.',
  },
  problem: {
    title: 'Why AI hasn’t made the work smaller',
    items: [
      {
        head: 'Context disappears every time',
        body: 'Every new chat starts with pasting the brand intro, tone of voice and past results again. So now there’s one more thing to paste every time.',
      },
      {
        head: 'More channels means more work',
        body: 'Running LinkedIn, a newsletter, a blog and Threads separately multiplies production time by the number of channels. Small teams end up dropping channels.',
      },
      {
        head: 'Information doesn’t move inside the team',
        body: 'What sales hears from customers never reaches marketing, and campaign details never reach support. If the work isn’t written down, AI has nothing to work from.',
      },
    ],
  },
  system: {
    title: 'How the OS fits together',
    lead: 'Everything known about the brand and its customers lives in one knowledge base. Agents pull context from it for every job, and people only step in at checkpoints you set.',
    inputsLabel: 'What goes in',
    inputs: ['Brand story and tone', 'Posts and lecture notes', 'Audience data'],
    core: { name: 'Knowledge base', note: 'Sources kept intact, organized as topic cards' },
    agents: [
      { name: 'Production agent', body: 'Topics, drafts, channel versions' },
      { name: 'Publishing agent', body: 'Posts to logged-in channels' },
      { name: 'Review agent', body: 'Format checks, metrics' },
    ],
    output: { name: '7 channels', note: 'Korean and English' },
    checkpoint: 'Human checkpoint',
  },
  parts: {
    title: 'Four parts of the OS',
    stopLabel: 'What you stop doing',
    items: [
      {
        name: 'Knowledge base',
        body: 'Source material such as lectures, blog posts, newsletters and LinkedIn posts is kept untouched, and AI builds topic cards and indexes on top. When you write, the AI finds the evidence it needs.',
        stop: 'Hunting for material, explaining the same thing again',
      },
      {
        name: 'Channel pipelines',
        body: 'One source piece is adapted to each channel’s format: card posts, blog, newsletter, short video. Keyword data helps choose topics, and the pipeline carries it through to publishing.',
        stop: 'Rewriting for every channel',
      },
      {
        name: 'Browser agents',
        body: 'Repetitive work on logged-in websites goes to agents: migrating posts, replacing links in bulk, setting up channels, collecting monthly metrics.',
        stop: 'Copy and paste, gathering numbers at month end',
      },
      {
        name: 'Task menus and review',
        body: 'Frequent team requests become a menu: promotion plans, creative variations, content calendars, meeting summaries. Each run asks for confirmation first and checks the output at the end.',
        stop: 'Writing a new prompt every time',
      },
    ],
  },
  screens: {
    title: 'What the team actually sees',
    lead: 'Nobody writes a new prompt. People pick a job from the menu and the system takes it from there.',
    menu: {
      title: 'Task menu',
      prompt: 'What are we working on today?',
      items: ['Promotion plan', 'Image and banner drafts', 'Content calendar', 'Meeting or report summary', 'Ad creative variations', 'Something else'],
      guard: 'Anything that touches a schedule or publishing asks once more before it runs.',
    },
  },
  proof: {
    title: 'ConnectAX is the first user',
    lead: 'The OS didn’t start as a blueprint. One founder handled planning, production, publishing and measurement herself, moved each repeated task into a system, and that system now runs seven channels in Korean and English.',
    loopTitle: 'How a month runs',
    loop: [
      { name: 'Collect', body: 'About 2,000 original posts from LinkedIn, Threads, Brunch and the newsletter live in one place.' },
      { name: 'Organize', body: 'Sources stay untouched and are grouped into topic cards and indexes.' },
      { name: 'Produce', body: 'Keyword data helps pick topics, and each piece is shaped for its channel.' },
      { name: 'Publish', body: 'Out to the blogs, newsletter, card posts and an English site.' },
      { name: 'Measure', body: 'On the 15th of every month, impressions per channel are collected automatically.' },
      { name: 'Rework', body: 'Tips that did well on Threads are rebuilt for LinkedIn and the newsletter.' },
    ],
    loopReturn: 'Back to next month’s plan',
    reach: {
      title: 'Monthly reach by channel',
      note: 'October 2026. LinkedIn counts impressions; the others count views.',
      unit: '',
      rows: [
        { channel: 'LinkedIn', value: REACH.linkedin },
        { channel: 'Instagram', value: REACH.instagram },
        { channel: 'YouTube', value: REACH.youtube },
        { channel: 'Brunch', value: REACH.brunch },
        { channel: 'Newsletter', value: REACH.newsletter },
        { channel: 'Fieldnotes (EN)', value: REACH.fieldnotes },
        { channel: 'Naver Blog', value: REACH.naver },
      ],
    },
    facts: [
      { value: '1', label: 'person running it' },
      { value: '7', label: 'channels' },
      { value: '~2,000', label: 'source posts in the knowledge base' },
      { value: '2,100', label: 'community members' },
    ],
  },
  fit: {
    title: 'Who it’s for',
    items: [
      {
        who: 'Solo founders and creators',
        body: 'You run several channels alone and spend more time moving and fixing content than writing it.',
      },
      {
        who: 'Small marketing teams',
        body: 'Two or three people, a growing list of channels and campaigns, and everyone uses AI differently.',
      },
      {
        who: 'B2B teams starting with AI',
        body: 'The tools are bought but don’t stick, and marketing, sales and support each keep their own information.',
      },
    ],
  },
  steps: {
    title: 'How a rollout works',
    items: [
      { name: 'Map the work', body: 'Write down which channels, which tasks, who does them and how many hours they take.' },
      { name: 'Gather the sources', body: 'Move scattered posts, documents and brand notes into one knowledge base.' },
      { name: 'Connect', body: 'Attach pipelines and agents to the most frequent tasks first, with a confirmation step.' },
      { name: 'Hand over', body: 'Train the team to use and edit the menus themselves, and leave written operating rules.' },
    ],
  },
  founder: {
    title: 'Who is building it',
    name: 'Seulki Kang',
    role: 'Founder, ConnectAX',
    paragraphs: [
      'Seulki started as an agency account executive and spent 14 years across media planning, media sales and leading a data strategy team, including digital marketing at Ogilvy and Leo Burnett. In an out-of-home advertising market with no measurement data, she built an effectiveness measurement solution and won a ₩160M (about US$115K) government grant.',
      'She now teaches companies and professionals how to work with AI, and runs multiple channels on her own using the system described here. She has 16K LinkedIn followers and 1.5K newsletter subscribers, and runs three communities: Marketing Data Connect, 퇴근후AI and DATA+WOMEN KOREA.',
    ],
  },
  footer: {
    company: 'ConnectAX (커넥트에이엑스)',
    rows: [
      { label: 'Founder', value: 'Seulki Kang' },
      { label: 'Business registration', value: '158-36-00782 (Republic of Korea)' },
      { label: 'Address', value: 'H531, 45 Galmaesunhwan-ro 166beon-gil, Guri-si, Gyeonggi-do, Korea' },
      { label: 'Email', value: EMAIL },
    ],
  },
};
