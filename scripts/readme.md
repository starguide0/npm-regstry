# auto changeset

## 0. 용어정리
- changeset md 파일: 변경이력을 만들게 되면 changeset 에 의해서 별도 변경이력에 대한 md 파일을 만든다. 여기서는 commit 마다의 이력이 쌓인다.
- version md 파일 : changeset 으로 만들어진 md 파일을 각 폴더의 changelog.md 파일에 기록하는데 이를 version md 파일이다.

해당 방법은 기본 commit 메시지를 기반으로 changelog 를 생성하는 방법이다.
기존 changelog 를 생성하는 changeset 은 다음 단계를 거친다.
- changeset 실행 : 변경된 이력을 수기로 기록하고 마치면 .changeset 에 md 파일로 생성된다.
- changeset version 실행 : .changeset 에 md 파일를 바탕으로 package.json 에 버전을 수정하고 CHANGELOG.MD 파일을 생성한다. 

이떄 changeset 을 수기로 기록하다보면 기억이 잘 나지 않거나 누락되거나 잘못된 내용을 기입할 수가 있다.<br>
이를 보완하기 위해서 매 commit 메시지를 활용한다.

해당 방법은 최초 생성된 commit 메시지만을 기록하고 commit 메시지에 생성된 PR 번호를 통해 추가 commit 된 내용을 찾는데 목적이 있다.

## 1. 설정방법
PR 일 때 changeset 을 자동으로 실행해서 만들고 merge 할 때 version 을 생성하는 방식으로 나뉜다.
### github action 설정
##### github bot commit message
PR 이 생성되거나 코드 리뷰로 인한 추가 commit 이 PR 에 추가 되면서 changeset 자동으로 만들어주는 ci 가
실행될 수 있다. 이를 위해 사용자가 추가한 커밋인지 봇이 추가한 커밋인지 구분을 위해서 봇의 커밋은 실행되지 않게 해야한다.
이를 위해 github variables 에 전역 사용되는 값을 설정한다.
- github repository -> settion -> Secrets and veriables -> actions -> variables -> Repository variables
  - BOT_COMMIT_MESSAGE 에 bot 만이 사용하는 키워드 정의
  - PR ci 파일에 vars.BOT_COMMIT_MESSAGE 를 통해 실행여부 정의

#### github workflow permission
github 로봇이 changeset 의 version 파일(changelog.md)들을 브랜치에 PR 머지하기 위해서 권한이 있어야 한다.
- github repository -> setting -> actions -> general -> Workflow permissions
  - Read and write permissions 선택
  - Allow GitHub Actions to create and approve pull requests 체크
  
### 2. changeset 생성 CI
```yaml
name: Add Changeset on PR

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  get-commit-message:
    runs-on: ubuntu-latest
    outputs:
      message: ${{ steps.get_message.outputs.message }}
    steps:
      - name: Checkout PR branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}

      - name: Get REAL latest commit message
        id: get_message
        run: |
          COMMIT_MESSAGE=$(git log -1 --pretty=%s HEAD)
          echo "message=${COMMIT_MESSAGE}" >> $GITHUB_OUTPUT

  add-changeset:
    needs: get-commit-message
    if: "!contains(needs.get-commit-message.outputs.message, vars.BOT_COMMIT_MESSAGE)"
    permissions:
      contents: write
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js and pnpm
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Clean up old auto-changeset files for this PR
        run: rm -f .changeset/auto-pr-${{ github.event.pull_request.number }}-*.md

      - name: Generate Auto Changesets
        run: |
          TARGET_BRANCH="origin/${{ github.base_ref }}"
          pnpm changeset:auto ${{ github.event.pull_request.html_url }} ${{ github.head_ref }} $TARGET_BRANCH ${{ github.event.pull_request.number }}

      - name: Commit and Push Changeset File
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          
          if [[ -n $(git status --porcelain .changeset) ]]; then
            git add .changeset
            git commit -m "${{vars.BOT_COMMIT_MESSAGE}}"
            git push
          else
            echo "No changes in changeset files to commit."
          fi
```
### version
```yaml
name: Version Packages

on:
  push:
    branches:
      - main

jobs:
  version:
    # 봇이 생성한 버전 커밋("ci: version packages...")에 대해서는 실행되지 않도록 하여 중복 실행 방지
    if: github.actor != 'github-actions[bot]'
    runs-on: ubuntu-latest
    permissions:
      # 액션이 main 브랜치에 커밋을 푸시하기 위해 contents: write 권한이 필요합니다.
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          # GITHUB_TOKEN을 사용하여 main 브랜치에 푸시할 수 있도록 설정합니다.
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js and pnpm
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create Version & Update Changelogs
        run: pnpm changeset version
          # 이 명령어가 package.json 버전 업데이트와 CHANGELOG.md 파일을 생성/수정합니다.

      - name: Commit & Push version changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          
          # 'changeset version' 실행 후 변경된 파일이 있는지 확인합니다.
          if [[ -n $(git status --porcelain) ]]; then
            git add .
            git commit -m "ci: version packages and update changelogs"
            git push
          else
            echo "No version changes to commit."
          fi
```
로봇을 통해 main 에 merge 를 하는데 이를 간단하게 해결해주는 플러그인이 있다.
`Create Version & Update Changelogs`과 `Commit & Push version changes`
이 두 부분을 제거하고 하기 코드를 넣으면 된다.
```yaml
      - name: Create Version Commit
        id: changesets
        uses: changesets/action@v1
        with:
          # .changeset/*.md 파일을 소모하여 버전 업데이트 후 main 브랜치에 바로 커밋합니다.
          commit: "ci: version packages and update changelogs"
        env:
          # 커밋 푸시를 위해 GITHUB_TOKEN이 필요합니다.
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
이렇게 할 경우 changeset-release/main 이라는 브랜치로 version md 파일들이 생성된다.
그럼 별도로 PR merge 를 진행해야 하는데 여러 기능 branch PR 머지가 있으면 overwrap 이 되기는 하지만 충돌이 발생할 수 있으므로
브랜치의 changeset-release/main 가 있는 머지 되도록 룰로 정해야 한다.