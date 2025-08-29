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
 *   node scripts/auto-changeset.mjs [pr-url?] [branch-name]
 *   또는
 *   pnpm node scripts/auto-changeset.mjs [pr-url?] [branch-name]
 *
 * 인자
 * - pr-url (선택): GitHub PR URL. 제공 시 생성되는 Changeset 하단에 "관련 PR" 링크가 추가됩니다.
 *   예) https://github.com/your-org/your-repo/pull/123
 * - branch-name (필수): 분석할 브랜치 참조. git log <branch-name> 결과를 그대로 사용합니다.
 *   - 로컬 브랜치명 또는 원격 참조 모두 허용 (예: feature/my-work, origin/feature/my-work, origin/main 등)
 *
 * 실행 전제 조건
 * - 프로젝트 구조: packages/* 하위에 각 패키지가 있으며, 각 디렉터리에 package.json이 존재해야 합니다.
 * - .changeset 디렉터리가 존재하고 Changesets가 설정되어 있어야 합니다(@changesets/cli).
 * - Git 저장소 내부에서 실행해야 하며, 분석할 브랜치의 커밋들이 로컬에서 조회 가능해야 합니다(fetch 필요할 수 있음).
 * - Node.js 18+ 권장. 리포지토리 가이드라인의 런타임 버전을 따르십시오.
 *
 * 동작 개요
 * 1) packages/*를 스캔하여 패키지(name, path)를 수집합니다.
 * 2) git log <branch-name> --oneline --no-merges 로 커밋 목록을 가져옵니다.
 * 3) 각 커밋의 변경 파일(git show)을 조회하여, packages/<dir>/ 경로에 속한 변경만 패키지별로 매핑합니다.
 * 4) 패키지별 커밋을 Conventional Commits 기반으로 분류/요약하고, 한국어 요약을 포함한 Changeset markdown을 생성합니다.
 * 5) 파일 경로: .changeset/<timestamp>-<package-name-sanitized>.md 로 저장합니다.
 *
 * 주의사항
 * - 버전 추정은 커밋 메시지 규칙에 의존합니다. 팀의 커밋 규칙을 지키지 않으면 잘못된 bump가 발생할 수 있습니다.
 * - packages/* 외부(루트, .github 등)만 수정한 커밋은 무시됩니다. 공용 파일(shared)이라도 packages 경로 밖이면 감지되지 않습니다.
 * - branch-name은 git log에 직접 전달되며, 기준 비교(merge-base) 계산을 하지 않습니다. 원하는 범위가 맞는지 실행 전 확인하세요.
 * - 생성된 Changeset은 검토 후 필요 시 수동 수정/병합하세요(카테고리/요약, 버전 범위 등).
 * - 동일 패키지에 대해 여러 커밋이 있어도 하나의 Changeset 파일로 생성됩니다(실행 시점 기준). 이후 수동 분리가 필요할 수 있습니다.
 * - PR URL을 제공하면 하단에 "관련 PR" 링크가 추가됩니다.
 *
 * 예시
 * - 메인 브랜치에 머지될 기능 브랜치를 분석하고 PR 링크를 포함하여 Changeset 생성:
 *   node scripts/auto-changeset.mjs https://github.com/your-org/your-repo/pull/123 origin/feature/add-xyz
 *
 * - PR URL 없이 로컬 브랜치만 분석:
 *   node scripts/auto-changeset.mjs origin/feature/add-xyz
 *
 * - pnpm으로 실행:
 *   pnpm node scripts/auto-changeset.mjs origin/feature/add-xyz
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
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

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
 * 특정 브랜치에 있는 모든 커밋을 가져옵니다.
 *
 * 내부적으로 `git log <branchName> --oneline --no-merges`를 실행합니다.
 * 주의: merge-base 기준의 차등 비교가 아닌, 지정한 참조의 모든 히스토리를 그대로 나열합니다.
 *
 * @param {string} branchName 분석할 브랜치 이름 또는 원격 참조 (예: origin/feature/foo)
 * @returns {string[]} 커밋 요약 라인 배열 ("<hash> <subject>")
 */
function getCommitsSinceBranch(branchName) {
  try {
    const commits = execSync(`git log ${branchName} --oneline --no-merges`, {encoding: 'utf8'})
      .trim()
      .split('\n')
      .filter(line => line.length > 0);

    if (commits.length === 0) {
      console.log(`브랜치 '${branchName}'에 커밋이 없습니다.`);
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
 */
function main() {
  // 명령행 인수에서 PR URL과 브랜치 이름을 가져옵니다.
  const prUrl = process.argv[2] || null;
  const branchName = process.argv[3] || null;
  const prNumber = prUrl ? prUrl.split('/').pop() : null;

  if (!branchName) {
    console.error('오류: 분석할 브랜치 이름을 인자로 입력해주세요.');
    console.error('사용법: node your-script.js [pr-url] [branch-name]');
    process.exit(1);
  }

  console.log(`🔍 패키지별 커밋 분석을 시작합니다... ${prNumber ? `(PR #${prNumber})` : ''}\n`);
  console.log(`분석할 브랜치: ${branchName}\n`);

  // 패키지 목록 가져오기
  const packages = getPackages();
  if (packages.length === 0) {
    console.error('패키지를 찾을 수 없습니다.');
    process.exit(1);
  }

  console.log('📦 발견된 패키지들:');
  packages.forEach(pkg => {
    console.log(`  - ${pkg.name} (${pkg.path})`);
  });
  console.log('');

  // 특정 브랜치의 커밋들 가져오기
  const commits = getCommitsSinceBranch(branchName);
  if (commits.length === 0) {
    console.log('분석할 커밋이 없습니다.');
    return;
  }

  console.log(`📝 분석할 커밋 ${commits.length}개:`);
  commits.forEach(commit => {
    console.log(`  - ${commit}`);
  });
  console.log('');

  // 커밋을 패키지별로 분류
  const packageCommits = categorizeCommitsByPackage(commits, packages);

  if (Object.keys(packageCommits).length === 0) {
    console.log('패키지에 영향을 주는 커밋이 없습니다.');
    return;
  }

  console.log('📋 패키지별 커밋 분석 결과:\n');

  // 각 패키지에 대해 체인지셋 생성
  Object.entries(packageCommits).forEach(([packageName, commits]) => {
    console.log(`\n🔧 ${packageName}:`);
    console.log(`   커밋 ${commits.length}개 발견`);

    commits.forEach(commit => {
      console.log(`   - ${commit.hash.substring(0, 7)}: ${commit.message}`);
    });

    // 체인지셋 생성
    const changeset = generateChangeset(packageName, commits, prUrl);

    // 파일로 저장
    const timestamp = Date.now();
    const filename = `${timestamp}-${packageName.replace('@', '').replace('/', '-')}.md`;
    const changesetPath = path.join(__dirname, '..', '.changeset', filename);

    try {
      fs.writeFileSync(changesetPath, changeset);
      console.log(`   ✅ 체인지셋 생성됨: .changeset/${filename}`);
    } catch (error) {
      console.error(`   ❌ 체인지셋 생성 실패: ${error.message}`);
    }
  });

  console.log(`\n🎉 총 ${Object.keys(packageCommits).length}개 패키지의 체인지셋이 생성되었습니다.`);
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
