#!/usr/bin/env node

import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 패키지 목록을 가져옵니다.
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
 * main 브랜치와 현재 상태 사이의 커밋을 가져옵니다.
 */
function getCommitsSinceMain() {
  try {
    // main 브랜치와 현재 HEAD 사이의 커밋을 가져옵니다
    const commits = execSync('git log main..HEAD --oneline --no-merges', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(line => line.length > 0);

    if (commits.length === 0) {
      // HEAD가 main과 같거나 뒤에 있는 경우, 최근 커밋들을 가져옵니다
      const recentCommits = execSync('git log --oneline -10 --no-merges', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(line => line.length > 0);

      console.log('현재 브랜치가 main과 동일하거나 뒤에 있습니다. 최근 10개 커밋을 분석합니다.');
      return recentCommits;
    }

    return commits;
  } catch (error) {
    console.error('Git 커밋 정보를 가져오는 중 오류 발생:', error.message);
    return [];
  }
}

/**
 * 특정 커밋에서 변경된 파일들을 가져옵니다.
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
 * 체인지셋 파일을 생성합니다.
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
  // 명령행 인수에서 PR URL을 가져오기
  const prUrl = process.argv[2] || null;
  const prNumber = prUrl ? prUrl.split('/').pop() : null;
  console.log(`🔍 패키지별 커밋 분석을 시작합니다... ${prNumber ? `(PR #${prNumber})` : ''}\n`);

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

  // main 이후의 커밋들 가져오기
  const commits = getCommitsSinceMain();
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
