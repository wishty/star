# 개발 환경 (Docker 적용)

  <br>
 
  ## 기술스택

- 백엔드서버 (port: 3000)

  - 프레임워크: nest.js

  - 적용스택

    - TypeScript
    - prettier, eslint
    - typeORM
    - Swagger
    - husky

  <br>

- DB 서버

  - MySQL (port: 3306)

  <br>

## 특징

- 프레임워크가 제공하는 객체지향 개발적 구조를 활용하기 위해 NestJS 를 선택

- 제시된 요구사항 중 2건을 제외하고 전체 개발 완료

  (제외 기능: 이모티콘 기능, 댓글, 제외 사유: 개인일정 상 개발기간 부족)

- 포인트 기능, 헬스 체크 기능 추가

- filfer 및 message 파일을 통해 error handling 표준화

- enum type, decorator 활용으로 공통요소 적용

- jwt, cookie, passport, guard 적용으로 인증 강화

- 환경설정 파일, 도커 파일 별도 분리

- api document swagger, postman 동시 제공

## 단점

- 관리자 기능 없음

- 시간 상 jest 테스트 구현 못 함

  <br>

  <br>

## 데이터 구성

![erd](/docker/mysql/erd.png)

# 상세기능

<br>

## 회원

- 가입 (이메일, 비밀번호, 이름)

  이메일 중복 체크, 비밀번호 암호화(bcrypt), 가입 시 '가입축하 적립금' 부여

- 로그인 (이메일, 비밀번호)

  암호화된 비밀번호화 비교, Cookie에 jwt 저장 (JWT Authority, Guard, Strategy 사용, 유효기간 5분)

- 로그아웃

  쿠키 삭제 및 유효기간 0으로 설정

- 비밀번호 변경

  이전 비밀번호와 같으면 에러

- 탈퇴

  탈퇴사유는 enum으로 저장, 상세사유 추가 저장 가능, 탈퇴한 계정은 로그인 및 검색되지 않음, 적립금 소멸

- 검색

  이메일 일부로 검색

- 회원 인증, 관리자 권한 확인

  Header의 Authorization 값(Bearer +jwt)으로 인증

## 관계

- 팔로우 (다른 유저의 이메일)

- 언팔로우 (다른 유저의 이메일)

- 차단

  - 유저는 팔로우한 친구를 차단할 수 있으며

  - 차단된 친구는 차단한 친구를 다시 팔로우할 수 없음

## 포스트

- 작성자만 수정하거나 삭제

- 공개권한 설정 (공개/친구 공개/비공개)

- 제목 검색

## 포인트

- 회원별 적립금 합계 조회

- 회원별 적립금 적립/사용 내역 조회

  - 페이징 처리

- 회원별 적립금 적립

  - 적립금의 유효기간 구현 (1년)

- 회원별 적립금 사용

  - 적립금 사용시 우선순위는 먼저 적립된 순서로 사용(FIFO)

- 회원별 적립금 사용취소

  - 적립금 사용 API 호출하는 쪽에서 Rollback 처리를 위한 용도

## 기타

- 헬스 체크

<br><br>

# 개발환경 구축 가이드

## 설치 및 구성

```bash
# 1. 프로젝트 생성
git clone git@github.com:bmmaker/star.git

# 2. 프로젝트 폴더로 이동
cd star

# 3. 의존성 설치
npm install
```

설치가 끝났으면 `.env.example` 파일명을 `.env`로 수정합니다.

```
# NODE SERVER
APP_PORT=3000
APP_HOST=localhost

# DATABASE
DB_TYPE=mysql
DB_HOST=db
DB_PORT=3306
DB_ROOT_PASSWORD=rootpass
DB_NAME=test
DB_USERNAME=test
DB_PASSWORD=test

# JWT
JWT_SECRET=secret
JWT_EXPIRATION_TIME=300
```

`.env`를 본인이 사용하려는 DB 연결 정보에 맞게 수정하면 됩니다. 
예시 `.env`를 사용하게 되면 `DB_HOST`가 Docker 컨테이너에서 올라가는 데이터베이스를 사용하도록 설정했습니다.

<br>

## Docker 설치

- https://www.docker.com \
  운영체제에 맞는 docker 다운로드 및 설치

- 터미널(cmd 등)에서 정상 설치 확인

```
$ docker -v
Docker version 20.10.22, build 3a2c30b
```

## Docker 환경 실행

```bash
# 실행
$ docker-compose up -d

# 재시작
$ docker-compose restart

# 중지
$ docker-compose down

# 중지 (도커 볼륨 삭제)
$ docker-compose down -v
```

## 백엔드 실행

```bash
# 실행 (디버그)
$ npm run start:debug




## API Documents

- http://localhost:3000/api-docs

- [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/17580924-a13ac17e-0235-43c8-b894-61433abf80df?action=collection%2Ffork&collection-url=entityId%3D17580924-a13ac17e-0235-43c8-b894-61433abf80df%26entityType%3Dcollection%26workspaceId%3Daefa633a-e7e3-46e9-8a90-30c62422a3c1)
