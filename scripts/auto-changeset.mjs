#!/usr/bin/env node

/**
 * auto-changeset.mjs
 *
 * Changesets 보조 스크립트(모노레포용).
 *
 * 목적
 * - packages/* 하위 각 패키지에 영향을 준 커밋을 분석하여, 패키지별 Changeset 파일(.changeset/*.md)을 자동으로 생성합니다.
 * - 커밋 메시지 규칙(Conventional Commits)에 따라 버전 범위(major/minor/patch)를 추정합니다.
 *   - major: 메시지 본문에 "BREAKING CHANGE" 포함 또는 타입 접두사 뒤에 "!:" 사용 (예: feat!: ...)
 *   - minor: 메시지가 feat 로 시작
 *   - patch: 메시지가 fix 로 시작 (그 외 기본값도 patch 처리)
 *
 * 사용 방법 (CLI)
 *   node scripts/auto-changeset.mjs [pr-url?] <source-branch> [target-branch]
 *   또는
 *   pnpm node scripts/auto-changeset.mjs [pr-url?] <source-branch> [target-branch]
 *
 * 인자
 * - pr-url (선택): GitHub PR URL. 제공 시 생성되는 Changeset 하단에 "관련 PR" 링크가 추가됩니다.
 *   예) https://github.com/your-org/your-repo/pull/123
 * - source-branch (필수): 머지의 소스 브랜치(예: feature/my-work). 로컬/원격 참조 모두 허용.
 * - target-branch (선택): 머지 타겟 브랜치(예: origin/main). 기본값은 origin/main 자동 탐색(upstream 또는 main/master 후보).
 *
 * 실행 전제 조건
 * - 프로젝트 구조: packages/* 하위에 각 패키지가 있으며, 각 디렉터리에 package.json이 존재해야 합니다.
 * - .changeset 디렉터리가 존재하고 Changesets가 설정되어 있어야 합니다(@changesets/cli).
 * - Git 저장소 내부에서 실행해야 하며, 분석할 브랜치의 커밋들이 로컬에서 조회 가능해야 합니다(fetch 필요할 수 있음).
 * - Node.js 18+ 권장. 리포지토리 가이드라인의 런타임 버전을 따르십시오.
 *
 * 동작 개요
 * 1) packages/*를 스캔하여 패키지(name, path)를 수집합니다.
 * 2) 기준 브랜치(Upstream 또는 origin/main)와의 merge-base부터 대상 브랜치까지의 커밋만 수집합니다.
 * 3) 각 커밋의 변경 파일(git show)을 조회하여, packages/<dir>/ 경로에 속한 변경만 패키지별로 매핑합니다.
 * 4) 패키지별 커밋을 Conventional Commits 기반으로 분류/요약하고, 한국어 요약을 포함한 Changeset markdown을 생성합니다.
 * 5) 파일 경로: .changeset/<timestamp>-<package-name-sanitized>.md 로 저장합니다.
 *
 * 주의사항
 * - 버전 추정은 커밋 메시지 규칙에 의존합니다. 팀의 커밋 규칙을 지키지 않으면 잘못된 bump가 발생할 수 있습니다.
 * - packages/* 외부(루트, .github 등)만 수정한 커밋은 무시됩니다. 공용 파일(shared)이라도 packages 경로 밖이면 감지되지 않습니다.
 * - 기본적으로 <target-branch>와 <source-branch>의 merge-base를 기준으로 비교합니다. 원격 동기화(fetch)가 필요할 수 있습니다.
 * - 생성된 Changeset은 검토 후 필요 시 수동 수정/병합하세요(카테고리/요약, 버전 범위 등).
 * - 동일 패키지에 대해 여러 커밋이 있어도 하나의 Changeset 파일로 생성됩니다(실행 시점 기준). 이후 수동 분리가 필요할 수 있습니다.
 * - PR URL을 제공하면 하단에 "관련 PR" 링크가 추가됩니다.
 *
 * 예시
 * - 메인 브랜치에 머지될 기능 브랜치를 분석하고 PR 링크를 포함하여 Changeset 생성:
 *   node scripts/auto-changeset.mjs https://github.com/your-org/your-repo/pull/123 origin/feature/add-xyz origin/main
 *
 * - PR URL 없이 소스/타겟 지정:
 *   node scripts/auto-changeset.mjs origin/feature/add-xyz origin/main
 *
 * - 기존 방식과 호환(타겟 생략 시 자동 탐색):
 *   node scripts/auto-changeset.mjs origin/feature/add-xyz
 *
 * - pnpm으로 실행:
 *   pnpm node scripts/auto-changeset.mjs origin/feature/add-xyz origin/main
 *
 * 출력 및 종료 코드
 * - 콘솔 로그로 발견된 패키지/커밋/생성된 파일 경로를 안내합니다.
 * - 오류 상황(분석할 브랜치 누락, 패키지 없음 등)에서는 비정상 종료 코드(1)로 종료할 수 있습니다.
 *
 * Changesets와의 연동
 * - 본 스크립트로 .changeset/*.md를 생성한 뒤, 일반적인 배포 흐름을 따르십시오:
 *   pnpm changeset  (선택적 추가 편집)
 *   pnpm version-packages
 *   pnpm build
 *   pnpm release
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 패키지 목록을 가져옵니다.
 *
 * packages/* 하위를 스캔하여 package.json이 존재하는 디렉터리를 패키지로 간주합니다.
 * @returns {{name: string, path: string, directory: string}[]} 패키지 메타데이터 배열
 */
function getPackages() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  if (!fs.existsSync(packagesDir)) {
    return [];
  }

  return fs.readdirSync(packagesDir)
    .filter(dir => {
      const packageJsonPath = path.join(packagesDir, dir, 'package.json');
      return fs.existsSync(packageJsonPath);
    })
    .map(dir => {
      const packageJsonPath = path.join(packagesDir, dir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return {
        name: packageJson.name,
        path: `packages/${dir}`,
        directory: dir
      };
    });
}

/**
 * 브랜치의 변경분에 포함된 커밋들을 가져옵니다.
 *
 * 내부적으로 `git log <from>.. <to> --oneline --no-merges`를 실행합니다.
 * 기본적으로 <from>은 기준 브랜치와의 merge-base입니다.
 *
 * @param {string} fromRef 시작 기준(보통 merge-base)
 * @param {string} toRef 끝 기준(분석할 브랜치)
 * @returns {string[]} 커밋 요약 라인 배열 ("<hash> <subject>")
 */
function getCommitsInRange(fromRef, toRef) {
  try {
    const range = `${fromRef}..${toRef}`;
    const commits = execSync(`git log ${range} --oneline --no-merges`, {encoding: 'utf8'})
      .trim()
      .split('\n')
      .filter(line => line.length > 0);

    if (commits.length === 0) {
      console.log(`범위 '${range}'에 커밋이 없습니다.`);
      return [];
    }

    return commits;
  } catch (error) {
    console.error(`Git 커밋 정보를 가져오는 중 오류 발생: ${error.message}`);
    return [];
  }
}

/**
 * 특정 커밋에서 변경된 파일들을 가져옵니다.
 *
 * 내부적으로 `git show --name-only --format="" <hash>`를 실행하여 해당 커밋이 변경한 파일 목록을 반환합니다.
 * @param {string} commitHash 커밋 해시 (짧은/긴 해시 모두 허용)
 * @returns {string[]} 변경된 파일 경로 리스트
 */
function getChangedFilesInCommit(commitHash) {
  try {
    return execSync(`git show --name-only --format="" ${commitHash}`, {encoding: 'utf8'})
      .trim()
      .split('\n')
      .filter(line => line.length > 0);
  } catch (error) {
    console.error(`커밋 ${commitHash}의 변경된 파일을 가져오는 중 오류 발생:`, error.message);
    return [];
  }
}

/**
 * 커밋을 패키지별로 분류합니다.
 *
 * @param {string[]} commits `git log --oneline` 형식의 라인 배열
 * @param {{name: string, path: string, directory: string}[]} packages 패키지 메타데이터 배열
 * @returns {Record<string, {hash: string, message: string, files: string[]}[]>} 패키지명 => 커밋 정보 리스트
 */
function categorizeCommitsByPackage(commits, packages) {
  const packageCommits = {};

  // 각 패키지에 대해 빈 배열 초기화
  packages.forEach(pkg => {
    packageCommits[pkg.name] = [];
  });

  commits.forEach(commitLine => {
    const [commitHash, ...messageParts] = commitLine.split(' ');
    const message = messageParts.join(' ');

    // 이 커밋에서 변경된 파일들을 가져옵니다
    const changedFiles = getChangedFilesInCommit(commitHash);

    // 각 패키지에 대해 해당 패키지의 파일이 변경되었는지 확인
    packages.forEach(pkg => {
      const hasPackageChanges = changedFiles.some(file =>
        file.startsWith(pkg.path + '/')
      );

      if (hasPackageChanges) {
        packageCommits[pkg.name].push({
          hash: commitHash,
          message: message,
          files: changedFiles.filter(file => file.startsWith(pkg.path + '/'))
        });
      }
    });
  });

  // 빈 배열인 패키지는 제거
  Object.keys(packageCommits).forEach(packageName => {
    if (packageCommits[packageName].length === 0) {
      delete packageCommits[packageName];
    }
  });

  return packageCommits;
}

/**
 * 커밋 메시지를 분석하여 버전 타입을 결정합니다.
 *
 * 규칙
 * - 'BREAKING CHANGE' 문자열 포함 또는 타입 뒤 '!:' 존재 시 major
 * - 'feat'로 시작 시 minor
 * - 'fix'로 시작 시 patch
 * - 그 외 기본 patch
 *
 * @param {{message: string}[]} commits 커밋 정보 배열
 * @returns {'major'|'minor'|'patch'} 추정된 버전 범위
 */
function determineVersionType(commits) {
  const messages = commits.map(commit => commit.message);

  // BREAKING CHANGE가 있는지 확인
  const hasBreakingChange = messages.some(msg =>
    msg.includes('BREAKING CHANGE') || msg.includes('!:')
  );

  if (hasBreakingChange) {
    return 'major';
  }

  // feat 접두사가 있는지 확인
  const hasFeat = messages.some(msg =>
    msg.trim().toLowerCase().startsWith('feat')
  );

  if (hasFeat) {
    return 'minor';
  }

  // fix 접두사가 있는지 확인
  const hasFix = messages.some(msg =>
    msg.trim().toLowerCase().startsWith('fix')
  );

  if (hasFix) {
    return 'patch';
  }

  // 다른 접두사들
  return 'patch';
}

/**
 * 커밋들을 카테고리별로 분류합니다.
 *
 * features/bugFixes/refactoring/performance/documentation/chores/others 카테고리로 분류하고,
 * 각 항목은 '<원문 또는 접두사 제거 메시지> (<short-hash>)' 형태로 포맷합니다.
 *
 * @param {{hash: string, message: string}[]} commits 커밋 정보 배열
 * @returns {{features: string[], bugFixes: string[], refactoring: string[], performance: string[], documentation: string[], chores: string[], others: string[]}}
 */
function categorizeCommits(commits) {
  const categories = {
    features: [],
    bugFixes: [],
    refactoring: [],
    performance: [],
    documentation: [],
    chores: [],
    others: []
  };

  commits.forEach(commit => {
    const msg = commit.message.trim();
    const lowerMsg = msg.toLowerCase();
    const hash = commit.hash.substring(0, 7);

    if (lowerMsg.startsWith('feat')) {
      categories.features.push(`${msg.replace(/^feat:\s*/i, '')} (${hash})`);
    } else if (lowerMsg.startsWith('fix')) {
      categories.bugFixes.push(`${msg.replace(/^fix:\s*/i, '')} (${hash})`);
    } else if (lowerMsg.startsWith('refactor')) {
      categories.refactoring.push(`${msg.replace(/^refactor:\s*/i, '')} (${hash})`);
    } else if (lowerMsg.startsWith('perf')) {
      categories.performance.push(`${msg.replace(/^perf:\s*/i, '')} (${hash})`);
    } else if (lowerMsg.startsWith('docs')) {
      categories.documentation.push(`${msg.replace(/^docs:\s*/i, '')} (${hash})`);
    } else if (lowerMsg.startsWith('chore')) {
      categories.chores.push(`${msg.replace(/^chore:\s*/i, '')} (${hash})`);
    } else {
      categories.others.push(`${msg} (${hash})`);
    }
  });

  return categories;
}

/**
 * 한국어 요약을 생성합니다.
 *
 * @param {{features: string[], bugFixes: string[], refactoring: string[], performance: string[], documentation: string[], chores: string[], others: string[]}} categories
 * @returns {string} 마크다운 요약 문자열
 */
function generateKoreanSummary(categories) {
  let summary = '';

  if (categories.features.length > 0) {
    summary += '-   **새로운 기능**\n';
    categories.features.forEach(feat => {
      summary += `    -   ${feat}\n`;
    });
  }

  if (categories.bugFixes.length > 0) {
    summary += '-   **버그 수정**\n';
    categories.bugFixes.forEach(fix => {
      summary += `    -   ${fix}\n`;
    });
  }

  if (categories.refactoring.length > 0) {
    summary += '-   **리팩토링**\n';
    categories.refactoring.forEach(refactor => {
      summary += `    -   ${refactor}\n`;
    });
  }

  if (categories.performance.length > 0) {
    summary += '-   **성능 개선**\n';
    categories.performance.forEach(perf => {
      summary += `    -   ${perf}\n`;
    });
  }

  if (categories.documentation.length > 0) {
    summary += '-   **문서**\n';
    categories.documentation.forEach(doc => {
      summary += `    -   ${doc}\n`;
    });
  }

  if (categories.chores.length > 0) {
    summary += '-   **기타**\n';
    categories.chores.forEach(chore => {
      summary += `    -   ${chore}\n`;
    });
  }

  if (categories.others.length > 0) {
    summary += '-   **기타 변경사항**\n';
    categories.others.forEach(other => {
      summary += `    -   ${other}\n`;
    });
  }

  return summary.trim();
}

/**
 * 체인지셋 파일 내용을 생성합니다.
 *
 * frontmatter에 { "<packageName>": <versionType> } 형식과 본문 요약, 선택적 PR 링크를 포함합니다.
 *
 * @param {string} packageName 패키지 이름 (package.json name)
 * @param {{hash: string, message: string, files: string[]}[]} commits 패키지에 해당하는 커밋 목록
 * @param {string|null} [prUrl] 관련 PR URL (선택)
 * @returns {string} changeset markdown 문자열
 */
function generateChangeset(packageName, commits, prUrl = null) {
  const versionType = determineVersionType(commits);
  const categories = categorizeCommits(commits);
  const summary = generateKoreanSummary(categories);

  let changeset = `---
"${packageName}": ${versionType}
---

${summary}
`;

  // PR 링크 추가
  if (prUrl) {
    // Extract PR number from URL for display
    const prNumber = prUrl.split('/').pop();
    changeset += `\n**관련 PR**: [#${prNumber}](${prUrl})\n`;
  }

  return changeset;
}

/**
 * 메인 함수
 *
 * Changesets 보조 스크립트의 진입점으로, CLI 인수를 파싱하고 비교 대상 브랜치 범위를 계산한 뒤
 * packages/* 하위 패키지별 변경 커밋을 분석하여 .changeset/*.md 파일을 생성합니다.
 *
 * 사용 방법 (CLI)
 * - node scripts/auto-changeset.mjs [pr-url?] <source-branch> [target-branch]
 * - pnpm node scripts/auto-changeset.mjs [pr-url?] <source-branch> [target-branch]
 *
 * 인수 설명
 * - pr-url (선택): GitHub PR URL. 제공 시 생성된 Changeset 하단에 관련 PR 링크가 포함됩니다.
 *   예) https://github.com/your-org/your-repo/pull/123
 * - source-branch (필수): 머지의 소스 브랜치(예: feature/my-work, origin/feature/my-work 등)
 * - target-branch (선택): 머지 타겟 브랜치(예: origin/main). 생략 시 자동 탐색(upstream → origin/main → main → origin/master → master)
 *
 * 동작 개요
 * 1) target-branch와 source-branch 간 merge-base를 계산합니다.
 * 2) merge-base..source-branch 범위의 커밋을 수집합니다.
 * 3) 각 커밋의 변경 파일 중 packages/<pkg>/ 경로만 매핑하여 패키지별로 분류합니다.
 * 4) Conventional Commits 규칙을 바탕으로 버전 범위(major/minor/patch)를 추정하고 요약을 생성합니다.
 * 5) .changeset/<timestamp>-<package>.md 파일을 생성합니다.
 *
 * 사용 예시
 * - PR 링크 포함 + 명시적 타겟 브랜치:
 *   node scripts/auto-changeset.mjs https://github.com/your-org/your-repo/pull/123 origin/feature/add-xyz origin/main
 *
 * - PR 링크 없이 소스/타겟 지정:
 *   node scripts/auto-changeset.mjs origin/feature/add-xyz origin/main
 *
 * - 타겟 생략(자동 탐색):
 *   node scripts/auto-changeset.mjs origin/feature/add-xyz
 *
 * 종료/부작용
 * - 분석 결과에 따라 .changeset 디렉터리에 Markdown 파일을 생성합니다.
 * - 필수 인수 누락이나 패키지 미발견 시 프로세스를 종료 코드 1로 종료할 수 있습니다.
 */
function main() {
  // 명령행 인수 파싱 개선: [pr-url?] <source-branch> [target-branch] [pr-number]
  const args = process.argv.slice(2); // node와 스크립트 경로 제외
  const prUrl = args.find(arg => /^https?:\/\//i.test(arg)) || null;
  const nonUrlArgs = args.filter(arg => !/^https?:\/\//i.test(arg));

  const sourceBranch = nonUrlArgs[0] || null;
  const targetArg = nonUrlArgs[1] || null;
  const prNumber = nonUrlArgs[2] || (prUrl ? prUrl.split('/').pop() : null);

  if (!sourceBranch) {
    console.error('오류: 소스 브랜치 이름을 인자로 입력해주세요.');
    console.error('사용법: node scripts/auto-changeset.mjs [pr-url] <source-branch> [target-branch] [pr-number]');
    process.exit(1);
  }

  if (!prNumber) {
    console.error('오류: PR 번호가 필요합니다. 마지막 인자로 전달해주세요.');
    process.exit(1);
  }

  console.log(`🔍 패키지별 커밋 분석을 시작합니다... (PR #${prNumber})\n`);
  console.log(`소스 브랜치: ${sourceBranch}`);
  if (targetArg) {
    console.log(`타겟 브랜치: ${targetArg}\n`);
  } else {
    console.log(`타겟 브랜치: (자동 탐색)\n`);
  }

  // 기준 브랜치 탐색 함수
  function getDefaultBaseRef(branch) {
    try {
      const upstream = execSync(`git rev-parse --abbrev-ref --symbolic-full-name ${branch}@{upstream}`, { encoding: 'utf8' }).trim();
      if (upstream) return upstream;
    } catch {
      // ignore
    }
    const candidates = ['origin/main', 'main', 'origin/master', 'master'];
    for (const c of candidates) {
      try {
        execSync(`git rev-parse --verify ${c}`, { stdio: 'ignore' });
        return c;
      } catch {
      }
    }
    return 'origin/main';
  }

  const targetBranch = targetArg || getDefaultBaseRef(sourceBranch);
  let mergeBase;
  try {
    mergeBase = execSync(`git merge-base ${targetBranch} ${sourceBranch}`, { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn(`merge-base 계산 실패, targetBranch(${targetBranch})를 사용합니다: ${e.message}`);
    mergeBase = targetBranch;
  }

  // [버그 수정] mergeBase 변수가 할당된 이후에 로그를 출력하도록 위치 변경
  console.log(`대상 비교: merge-base(${targetBranch}..${sourceBranch}) = ${mergeBase}`);

  const packages = getPackages();
  if (packages.length === 0) {
    console.error('패키지를 찾을 수 없습니다.');
    process.exit(1);
  }

  console.log('📦 발견된 패키지들:');
  packages.forEach(pkg => console.log(`  - ${pkg.name} (${pkg.path})`));
  console.log('');

  const commits = getCommitsInRange(mergeBase, sourceBranch);
  if (commits.length === 0) {
    console.log('분석할 커밋이 없습니다.');
    return;
  }

  console.log(`📝 분석 범위: ${mergeBase}..${sourceBranch}`);
  console.log(`📝 분석할 커밋 ${commits.length}개:`);
  commits.forEach(commit => console.log(`  - ${commit}`));
  console.log('');

  const packageCommits = categorizeCommitsByPackage(commits, packages);

  if (Object.keys(packageCommits).length === 0) {
    console.log('패키지에 영향을 주는 커밋이 없습니다.');
    return;
  }

  console.log('📋 패키지별 커밋 분석 결과:\n');

  Object.entries(packageCommits).forEach(([packageName, commits]) => {
    console.log(`\n🔧 ${packageName}:`);
    console.log(`   커밋 ${commits.length}개 발견`);
    commits.forEach(commit => console.log(`   - ${commit.hash.substring(0, 7)}: ${commit.message}`));

    const changeset = generateChangeset(packageName, commits, prUrl);

    // 고정된 파일 이름 사용
    const safePackageName = packageName.replace('@', '').replace('/', '-');
    const filename = `auto-pr-${prNumber}-${safePackageName}.md`;
    const changesetPath = path.join(__dirname, '..', '.changeset', filename);

    try {
      fs.writeFileSync(changesetPath, changeset);
      console.log(`   ✅ 체인지셋 생성/덮어쓰기 완료: .changeset/${filename}`);
    } catch (error) {
      console.error(`   ❌ 체인지셋 생성 실패: ${error.message}`);
    }
  });

  console.log(`\n🎉 총 ${Object.keys(packageCommits).length}개 패키지의 체인지셋이 생성되었습니다.`);
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}